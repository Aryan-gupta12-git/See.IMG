import React from 'react';
import type { ImageAspectRatio } from '../types';

interface ImageTileSkeletonProps {
  aspectRatio?: ImageAspectRatio;
}

export const ImageTileSkeleton: React.FC<ImageTileSkeletonProps> = ({
  aspectRatio = 'portrait',
}) => {
  const aspectRatioClass = {
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[16/10]',
    square: 'aspect-square',
    tall: 'aspect-[9/14]',
  }[aspectRatio] || 'aspect-[3/4]';

  return (
    <div
      className="relative w-full select-none overflow-hidden rounded-[10px] bg-[#edeae7]"
      aria-hidden="true"
    >
      {/* Aspect Ratio Container matching real ImageTile */}
      <div className={`relative w-full ${aspectRatioClass} skeleton-shimmer overflow-hidden`}>
        {/* Subtle Bottom Metadata Reservation to prevent layout shift */}
        <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3.5 flex items-center justify-between gap-2 pointer-events-none opacity-40">
          {/* Title bar silhouette */}
          <div className="h-3 w-1/3 rounded-full bg-black/10" />
          {/* Download button silhouette */}
          <div className="h-6 w-14 rounded-full bg-black/10 shrink-0" />
        </div>
      </div>
    </div>
  );
};
