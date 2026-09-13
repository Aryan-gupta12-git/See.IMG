import type { ImageAspectRatio } from '../types';

export interface ImageOptimizationResult {
  optimizedUrl: string;
  width: number;
  height: number;
  aspectRatio: ImageAspectRatio;
  originalSize: number;
  optimizedSize: number;
}

/**
 * Optimizes an uploaded image on the client side using HTML5 Canvas
 * Downscales large images to maximum bounds and outputs lightweight WebP/JPEG data.
 */
export async function optimizeClientImage(
  file: File,
  maxDimension = 1600,
  quality = 0.85
): Promise<ImageOptimizationResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Failed to read image file'));

    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        return reject(new Error('Invalid image result'));
      }

      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image in canvas'));

      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Calculate aspect ratio category
        const ratio = width / height;
        let aspectRatio: ImageAspectRatio = 'portrait';
        if (ratio > 1.2) {
          aspectRatio = 'landscape';
        } else if (ratio < 0.72) {
          aspectRatio = 'tall';
        } else if (ratio >= 0.92 && ratio <= 1.08) {
          aspectRatio = 'square';
        } else {
          aspectRatio = 'portrait';
        }

        // Scale down if exceeding maxDimension
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Could not get 2D canvas context'));
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Export as WebP if supported, fallback to JPEG
        let mimeType = 'image/webp';
        let optimizedData = canvas.toDataURL(mimeType, quality);

        if (!optimizedData.startsWith('data:image/webp')) {
          mimeType = 'image/jpeg';
          optimizedData = canvas.toDataURL(mimeType, quality);
        }

        const optimizedSize = Math.round((optimizedData.length * 3) / 4);

        resolve({
          optimizedUrl: optimizedData,
          width,
          height,
          aspectRatio,
          originalSize: file.size,
          optimizedSize,
        });
      };

      img.src = reader.result;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Cloudinary & CDN responsive image delivery utility
 * Automatically injects responsive widths and optimal compression format.
 */
export function getOptimizedImageUrl(url: string, width?: number): string {
  if (!url) return '';

  // Handle Cloudinary upload URLs
  if (url.includes('res.cloudinary.com')) {
    const insertIdx = url.indexOf('/upload/') + 8;
    const transform = width ? `f_auto,q_auto,fl_strip_profile,w_${width}/` : 'f_auto,q_auto,fl_strip_profile/';
    return `${url.slice(0, insertIdx)}${transform}${url.slice(insertIdx)}`;
  }

  return url;
}

/**
 * Format bytes into human-readable size
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
