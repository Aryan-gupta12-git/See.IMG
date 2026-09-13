import React from 'react';
import type { ImageItem } from '../types';
import { ImageTile } from './ImageTile';

interface ImageGridProps {
  images: ImageItem[];
}

export const ImageGrid: React.FC<ImageGridProps> = ({ images }) => {

  return (
    <div className="w-full">
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
