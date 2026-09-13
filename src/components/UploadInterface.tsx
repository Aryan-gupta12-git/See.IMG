import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { uploadToCloudinary } from '../services/cloudinaryService';

export const UploadInterface: React.FC = () => {
  const { uploadImage, setActiveTab } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleProcessFile = async (file: File) => {
    setErrorMessage(null);
    setIsUploading(true);

    try {
      // Direct unsigned upload to Cloudinary
      const result = await uploadToCloudinary(file);

      // Clean default title from original filename
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      const formattedTitle = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

      // Persist confirmed Cloudinary metadata to Neon PostgreSQL
      await uploadImage({
        title: formattedTitle || 'Untitled Study',
        url: result.secure_url,
        cloudinaryPublicId: result.public_id,
        aspectRatio: result.aspectRatio,
        width: result.width,
        height: result.height,
      });

      setActiveTab('discover');
    } catch (error: unknown) {
      setIsUploading(false);
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Failed to upload image. Please try again.');
      }
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  return (
    <div className="relative w-full max-w-[1560px] mx-auto px-4 sm:px-6 md:px-12 py-16 sm:py-28 md:py-40 min-h-[calc(100svh-3.5rem-5rem)] sm:min-h-[calc(100svh-4rem-5rem)] flex flex-col items-center justify-center animate-fade-in">
      {/* Hidden Native File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Subtle Error Feedback */}
      {errorMessage && (
        <div className="absolute top-8 sm:top-12 max-w-[92vw] px-4 py-2 rounded-full bg-red-50 border border-red-200/80 type-body-sm text-red-800 flex items-center gap-3 animate-fade-in shadow-sm">
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-red-700 hover:text-red-900 type-button text-[12px] underline shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ONLY visible action: Choose Files button */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="type-button text-[#0f0e0d] bg-white border border-[#e5e3df] hover:border-black/25 hover:bg-[#faf9f7] active:bg-[#f5f3f1] active:scale-[0.98] rounded-full px-6 py-2.5 sm:px-5 sm:py-2 text-[13px] sm:text-[14px] min-h-[44px] transition-all duration-150 shadow-sm select-none disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isUploading ? 'Uploading...' : 'Choose Files'}
      </button>
    </div>
  );
};
