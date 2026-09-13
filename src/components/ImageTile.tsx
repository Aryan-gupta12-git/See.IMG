import React, { useState } from 'react';
import type { ImageItem } from '../types';
import { useApp } from '../context/AppContext';

interface ImageTileProps {
  image: ImageItem;
  priority?: boolean;
}

export const ImageTile: React.FC<ImageTileProps> = ({ image, priority = false }) => {
  const { openImageViewer } = useApp();
  const [isLoaded, setIsLoaded] = useState(false);

  const aspectRatioClass = {
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[16/10]',
    square: 'aspect-square',
    tall: 'aspect-[9/14]',
  }[image.aspectRatio] || 'aspect-[3/4]';

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const filename = `${(image.title || 'photograph').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.jpg`;

    // 1. Direct Cloudinary attachment url (forces browser download header)
    if (image.url.includes('cloudinary.com') && image.url.includes('/upload/')) {
      const attachmentUrl = image.url.replace(
        '/upload/',
        `/upload/fl_attachment:${encodeURIComponent(filename.replace(/\.jpg$/, ''))},fl_strip_profile/`
      );
      const link = document.createElement('a');
      link.href = attachmentUrl;
      link.download = filename;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // 2. Fetch blob fallback for cross-origin CORS images
    try {
      const response = await fetch(image.url, { mode: 'cors' });
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      // 3. Fallback direct link
      const link = document.createElement('a');
      link.href = image.url;
      link.download = filename;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <article
      onClick={() => openImageViewer(image)}
      className="group relative cursor-pointer select-none overflow-hidden rounded-[10px] bg-[#edeae7] transition-all duration-200"
    >
      {/* Aspect Ratio Container & Image */}
      <div className={`relative w-full ${aspectRatioClass} overflow-hidden`}>
        <img
          src={image.url}
          alt={image.title}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          className={`h-full w-full object-cover transition-all duration-300 ease-out group-hover:scale-[1.015] ${
            isLoaded ? 'opacity-100 img-loaded' : 'opacity-0 img-blur-load'
          }`}
        />

        {/* Quiet Editorial Overlay on Hover / Touch */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200" />

        {/* Bottom Metadata & Download Button */}
        <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3.5 flex items-center justify-between gap-2 opacity-100 sm:opacity-0 translate-y-0 sm:translate-y-1 sm:group-hover:opacity-100 sm:group-hover:translate-y-0 transition-all duration-200">
          <p className="type-h3 text-white drop-shadow-sm truncate min-w-0 flex-1 pr-1">
            {image.title}
          </p>
          <button
            type="button"
            onClick={handleDownload}
            className="type-button text-[#0f0e0d] bg-white border border-[#e5e3df] hover:border-black/25 hover:bg-[#faf9f7] active:bg-[#f5f3f1] active:scale-[0.98] rounded-full px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-[11px] sm:text-[13px] transition-all duration-150 shadow-sm shrink-0 select-none"
          >
            Download
          </button>
        </div>
      </div>
    </article>
  );
};
