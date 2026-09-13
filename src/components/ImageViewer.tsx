import React, { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ImageViewer: React.FC = () => {
  const {
    selectedImage,
    closeImageViewer,
    nextImage,
    prevImage,
  } = useApp();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!selectedImage) return;
      if (e.key === 'Escape') {
        closeImageViewer();
      } else if (e.key === 'ArrowRight') {
        nextImage();
      } else if (e.key === 'ArrowLeft') {
        prevImage();
      }
    },
    [selectedImage, closeImageViewer, nextImage, prevImage]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!selectedImage) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#f5f3f1]/98 backdrop-blur-xl animate-fade-in overflow-y-auto">
      {/* Top Quiet Bar */}
      <div className="w-full max-w-[1600px] mx-auto px-3.5 sm:px-6 md:px-12 h-14 sm:h-16 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="type-label text-[#766f6a] hidden sm:inline">
            Exhibition View
          </span>
          <span className="text-[#bfb8b2] text-[11px] hidden sm:inline">/</span>
          <span className="type-metadata text-[#0f0e0d]">
            {selectedImage.aspectRatio.toUpperCase()}
          </span>
        </div>

        {/* Minimal Navigation & Close Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={prevImage}
            aria-label="Previous photograph"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#766f6a] hover:text-[#0f0e0d] hover:bg-black/[0.04] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={nextImage}
            aria-label="Next photograph"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#766f6a] hover:text-[#0f0e0d] hover:bg-black/[0.04] transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-black/10 mx-0.5 sm:mx-1" />
          <button
            type="button"
            onClick={closeImageViewer}
            aria-label="Close viewer"
            className="h-8 px-2.5 sm:px-3 rounded-full flex items-center gap-1.5 type-button text-[#0f0e0d] hover:bg-black/[0.04] transition-colors"
          >
            <X className="w-3.5 h-3.5 stroke-[2]" />
            <span className="type-metadata text-[#766f6a] hidden sm:inline">Esc</span>
          </button>
        </div>
      </div>

      {/* Primary Exhibition Frame — Immense Negative Space */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 lg:p-12 min-h-0">
        <div className="relative max-w-full flex flex-col items-center">
          {/* Main High-Res Photograph */}
          <div className="relative overflow-hidden rounded-[12px] shadow-[0_12px_36px_-12px_rgba(15,14,13,0.1)] bg-[#edeae7]">
            <img
              src={selectedImage.url}
              alt={selectedImage.title}
              className="max-h-[72vh] md:max-h-[78vh] max-w-[94vw] md:max-w-[85vw] object-contain select-none"
            />
          </div>

          {/* Photographic Provenance */}
          <div className="w-full mt-5 px-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="type-h2 text-[#0f0e0d]">
                {selectedImage.title}
              </h2>
              <div className="flex items-center gap-2 type-metadata text-[#766f6a] mt-1 tracking-wider uppercase">
                {selectedImage.location && selectedImage.location !== 'Unspecified' && (
                  <span>{selectedImage.location}</span>
                )}
                {selectedImage.medium && selectedImage.medium !== 'Digital Archive' && (
                  <>
                    {selectedImage.location && selectedImage.location !== 'Unspecified' && <span>•</span>}
                    <span>{selectedImage.medium}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
