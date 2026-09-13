import type { ImageAspectRatio } from '../types';

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  aspectRatio: ImageAspectRatio;
}

export interface CloudinaryErrorResponse {
  error: {
    message: string;
  };
}

/**
 * Validates whether Cloudinary environment variables are present and configured.
 */
export function getCloudinaryConfig(): { cloudName: string; uploadPreset: string } {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME?.trim();
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET?.trim();

  if (!cloudName || cloudName === 'your_cloud_name') {
    throw new Error('Cloudinary Cloud Name is not configured in environment variables (VITE_CLOUDINARY_CLOUD_NAME).');
  }

  if (!uploadPreset || uploadPreset === 'your_upload_preset') {
    throw new Error('Cloudinary Upload Preset is not configured in environment variables (VITE_CLOUDINARY_UPLOAD_PRESET).');
  }

  return { cloudName, uploadPreset };
}

/**
 * Calculates the standard aspect ratio category from width and height.
 */
export function calculateAspectRatio(width: number, height: number): ImageAspectRatio {
  if (!width || !height) return 'portrait';
  const ratio = width / height;

  if (ratio > 1.2) {
    return 'landscape';
  }
  if (ratio < 0.72) {
    return 'tall';
  }
  if (ratio >= 0.92 && ratio <= 1.08) {
    return 'square';
  }
  return 'portrait';
}

/**
 * Validates an image file before upload.
 */
export function validateImageFile(file: File, maxSizeBytes = 10 * 1024 * 1024): void {
  if (!file) {
    throw new Error('No file selected.');
  }

  if (!file.type.startsWith('image/')) {
    throw new Error('Invalid file type. Please select a valid image (JPEG, PNG, WebP, or AVIF).');
  }

  if (file.size > maxSizeBytes) {
    const sizeMb = (maxSizeBytes / (1024 * 1024)).toFixed(0);
    throw new Error(`File is too large. Maximum allowed size is ${sizeMb} MB.`);
  }
}

/**
 * Uploads an image file directly to Cloudinary using an unsigned upload preset.
 * No backend or API secret required.
 */
export async function uploadToCloudinary(file: File): Promise<CloudinaryUploadResponse> {
  // 1. Validate image format and size
  validateImageFile(file);

  // 2. Validate environment configuration
  const { cloudName, uploadPreset } = getCloudinaryConfig();

  // 3. Prepare multipart form data for direct unsigned upload
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  const endpoint = `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      const errorData = data as CloudinaryErrorResponse;
      const message = errorData?.error?.message || `Upload failed with HTTP status ${response.status}`;
      throw new Error(`Cloudinary: ${message}`);
    }

    const { secure_url, public_id, width, height, format, bytes } = data;

    if (!secure_url) {
      throw new Error('Unexpected response: Cloudinary did not return a secure_url.');
    }

    const aspectRatio = calculateAspectRatio(width, height);

    return {
      secure_url,
      public_id,
      width,
      height,
      format,
      bytes,
      aspectRatio,
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      // Re-throw known validation / API errors
      throw error;
    }
    throw new Error('Network error occurred while uploading to Cloudinary.');
  }
}
