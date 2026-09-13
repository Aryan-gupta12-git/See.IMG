import React, { createContext, useContext, useState } from 'react';
import type { ImageItem, ViewTab, ImageAspectRatio } from '../types';

interface AppContextType {
  images: ImageItem[];
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  selectedImage: ImageItem | null;
  openImageViewer: (image: ImageItem) => void;
  closeImageViewer: () => void;
  nextImage: () => void;
  prevImage: () => void;
  uploadImage: (params: {
    title: string;
    url: string;
    aspectRatio: ImageAspectRatio;
    medium?: string;
    location?: string;
    width?: number;
    height?: number;
  }) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_CUSTOM_IMAGES = 'seeimg_custom_images';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [images, setImages] = useState<ImageItem[]>(() => {
    try {
      const savedCustom = localStorage.getItem(STORAGE_KEY_CUSTOM_IMAGES);
      if (savedCustom) {
        const parsed: ImageItem[] = JSON.parse(savedCustom);
        if (Array.isArray(parsed)) {
          return parsed
            .filter((img) => img && typeof img.url === 'string' && img.id?.startsWith('img-user-'))
            .map((img) => ({
              ...img,
              location: img.location === 'Unspecified' ? undefined : img.location,
              medium: img.medium === 'Digital Archive' ? undefined : img.medium,
            }));
        }
      }
    } catch {
      // Fallback
    }
    return [];
  });

  const [activeTab, setActiveTabState] = useState<ViewTab>('discover');
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);

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

  const uploadImage = ({
    title,
    url,
    aspectRatio,
    medium,
    location,
    width,
    height,
  }: {
    title: string;
    url: string;
    aspectRatio: ImageAspectRatio;
    medium?: string;
    location?: string;
    width?: number;
    height?: number;
  }) => {
    const defaultWidth = aspectRatio === 'landscape' ? 1400 : 1000;
    const defaultHeight = aspectRatio === 'landscape' ? 900 : 1400;

    const newImage: ImageItem = {
      id: `img-user-${Date.now()}`,
      title,
      url,
      aspectRatio,
      width: width || defaultWidth,
      height: height || defaultHeight,
      medium,
      location,
      createdAt: 'Just now',
    };

    setImages((prev) => {
      const updated = [newImage, ...prev];
      try {
        const customOnly = updated.filter((img) => img.id.startsWith('img-user-'));
        localStorage.setItem(STORAGE_KEY_CUSTOM_IMAGES, JSON.stringify(customOnly));
      } catch {
        // Fallback
      }
      return updated;
    });

    setActiveTab('discover');
  };

  return (
    <AppContext.Provider
      value={{
        images,
        activeTab,
        setActiveTab,
        selectedImage,
        openImageViewer,
        closeImageViewer,
        nextImage,
        prevImage,
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
