import React from 'react';
import type { ImageItem, ImageAspectRatio } from '../types';
import { ImageTile } from './ImageTile';
import { ImageTileSkeleton } from './ImageTileSkeleton';
import { useApp } from '../context/AppContext';

interface ImageGridProps {
  images: ImageItem[];
}

// Sensible distribution of photographic aspect ratios matching the masonry layout
const SKELETON_LAYOUT: Array<{ id: string; aspectRatio: ImageAspectRatio }> = [
  { id: 'sk-1', aspectRatio: 'portrait' },
  { id: 'sk-2', aspectRatio: 'landscape' },
  { id: 'sk-3', aspectRatio: 'tall' },
  { id: 'sk-4', aspectRatio: 'portrait' },
  { id: 'sk-5', aspectRatio: 'square' },
  { id: 'sk-6', aspectRatio: 'portrait' },
  { id: 'sk-7', aspectRatio: 'landscape' },
  { id: 'sk-8', aspectRatio: 'tall' },
];

export const ImageGrid: React.FC<ImageGridProps> = ({ images }) => {
  const { isLoadingImages, loadError, refreshImages } = useApp();

  // 1. Loading state: render understated skeletons matching masonry columns
  if (isLoadingImages) {
    return (
      <div
        className="w-full"
        role="status"
        aria-label="Loading gallery images"
      >
        <div className="columns-2 md:columns-3 lg:columns-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8 space-y-3 sm:space-y-4 md:space-y-6 lg:space-y-8 animate-fade-in">
          {SKELETON_LAYOUT.map((skeleton) => (
            <div key={skeleton.id} className="break-inside-avoid">
              <ImageTileSkeleton aspectRatio={skeleton.aspectRatio} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2. Error state: quiet feedback with clean retry option
  if (loadError && images.length === 0) {
    return (
      <div className="w-full py-24 flex flex-col items-center justify-center text-center animate-fade-in">
        <p className="type-h3 text-[#0f0e0d] mb-1.5">
          Unable to connect to archive
        </p>
        <p className="type-subtitle text-[#766f6a] mb-5 max-w-sm text-[13px]">
          {loadError}
        </p>
        <button
          type="button"
          onClick={() => refreshImages()}
          className="type-button text-[#0f0e0d] bg-white border border-[#e5e3df] hover:border-black/25 hover:bg-[#faf9f7] active:bg-[#f5f3f1] active:scale-[0.98] rounded-full px-5 py-2 text-[13px] transition-all duration-150 shadow-sm"
        >
          Try again
        </button>
      </div>
    );
  }

  // 3. Empty gallery state: clean and minimal (zero images)
  if (images.length === 0) {
    return null;
  }

  // 4. Populated gallery: render actual images with smooth fade-in
  return (
    <div className="w-full animate-fade-in">
      {/* Editorial Masonry Columns */}
      <div className="columns-2 md:columns-3 lg:columns-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8 space-y-3 sm:space-y-4 md:space-y-6 lg:space-y-8">
        {images.map((image, index) => (
          <div key={image.id} className="break-inside-avoid">
            <ImageTile image={image} priority={index < 4} />
          </div>
        ))}
      </div>
    </div>
  );
};
