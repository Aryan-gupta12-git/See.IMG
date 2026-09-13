export type ImageAspectRatio = 'portrait' | 'landscape' | 'square' | 'tall';

export interface ImageItem {
  id: string;
  title: string;
  url: string;
  cloudinaryPublicId?: string;
  thumbnailUrl?: string;
  aspectRatio: ImageAspectRatio;
  width: number;
  height: number;
  medium?: string;
  location?: string;
  createdAt: string;
}

export type ViewTab = 'discover' | 'upload';
