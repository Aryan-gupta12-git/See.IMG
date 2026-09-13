import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ImageItem, ViewTab, ImageAspectRatio } from '../types';

interface AppContextType {
  images: ImageItem[];
  isLoadingImages: boolean;
  loadError: string | null;
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  selectedImage: ImageItem | null;
  openImageViewer: (image: ImageItem) => void;
  closeImageViewer: () => void;
  nextImage: () => void;
  prevImage: () => void;
  refreshImages: () => Promise<void>;
  uploadImage: (params: {
    title: string;
    url: string;
    cloudinaryPublicId?: string;
    aspectRatio: ImageAspectRatio;
    medium?: string;
    location?: string;
    width?: number;
    height?: number;
  }) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LEGACY_STORAGE_KEY = 'seeimg_custom_images';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [activeTab, setActiveTabState] = useState<ViewTab>('discover');
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);

  // Clean up legacy localStorage gallery data to avoid stale duplicate collisions
  useEffect(() => {
    try {
      if (localStorage.getItem(LEGACY_STORAGE_KEY)) {
        localStorage.removeItem(LEGACY_STORAGE_KEY);
      }
    } catch {
      // Safe fallback if localStorage is disabled
    }
  }, []);

  // Fetch shared public gallery images from Neon PostgreSQL via /api/images
  const fetchImages = useCallback(async () => {
    setIsLoadingImages(true);
    setLoadError(null);
    try {
      const response = await fetch('/api/images');
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      const data = await response.json();
      if (Array.isArray(data.images)) {
        setImages(data.images);
      }
    } catch (err: any) {
      console.error('Failed to load gallery images from server:', err);
      setLoadError(err.message || 'Failed to load gallery images.');
    } finally {
      setIsLoadingImages(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const setActiveTab = (tab: ViewTab) => {
    setActiveTabState(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openImageViewer = (image: ImageItem) => {
    setSelectedImage(image);
    document.body.style.overflow = 'hidden';
  };

  const closeImageViewer = () => {
    setSelectedImage(null);
    document.body.style.overflow = '';
  };

  const nextImage = () => {
    if (!selectedImage) return;
    const currentIndex = images.findIndex((img) => img.id === selectedImage.id);
    if (currentIndex !== -1 && currentIndex < images.length - 1) {
      setSelectedImage(images[currentIndex + 1]);
    } else if (images.length > 0) {
      setSelectedImage(images[0]);
    }
  };

  const prevImage = () => {
    if (!selectedImage) return;
    const currentIndex = images.findIndex((img) => img.id === selectedImage.id);
    if (currentIndex > 0) {
      setSelectedImage(images[currentIndex - 1]);
    } else if (images.length > 0) {
      setSelectedImage(images[images.length - 1]);
    }
  };

  // Persists confirmed Cloudinary image metadata to Neon PostgreSQL
  const uploadImage = async ({
    title,
    url,
    cloudinaryPublicId,
    aspectRatio,
    width,
    height,
  }: {
    title: string;
    url: string;
    cloudinaryPublicId?: string;
    aspectRatio: ImageAspectRatio;
    medium?: string;
    location?: string;
    width?: number;
    height?: number;
  }) => {
    const response = await fetch('/api/images', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        url,
        cloudinaryPublicId,
        aspectRatio,
        width,
        height,
      }),
    });

    if (!response.ok) {
      let message = 'Failed to persist image metadata in the database.';
      try {
        const errJson = await response.json();
        if (errJson.error) {
          message = errJson.error;
        }
      } catch {
        // Fallback
      }
      throw new Error(message);
    }

    const data = await response.json();
    if (data.image) {
      // Prepend confirmed database record to gallery state
      setImages((prev) => [data.image, ...prev.filter((img) => img.id !== data.image.id)]);
    }
  };

  return (
    <AppContext.Provider
      value={{
        images,
        isLoadingImages,
        loadError,
        activeTab,
        setActiveTab,
        selectedImage,
        openImageViewer,
        closeImageViewer,
        nextImage,
        prevImage,
        refreshImages: fetchImages,
        uploadImage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
