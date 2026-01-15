// Fill Layer Types for Multi-Layer Fill System

export type FillType = 'solid' | 'image';
export type ScaleMode = 'cover' | 'fit' | 'fill';

export interface BaseFillLayer {
  id: string;
  type: FillType;
  enabled: boolean;
  opacity: number; // 0-1
}

export interface SolidFillLayer extends BaseFillLayer {
  type: 'solid';
  color: string; // Hex color with optional alpha (e.g., "#3b82f6" or "#3b82f680")
}

export interface ImageFillLayer extends BaseFillLayer {
  type: 'image';
  src: string; // Data URL or image path
  scaleMode: ScaleMode;
  // Image dimensions - used for cover calculation
  imageWidth?: number;
  imageHeight?: number;
  // Position offset for image (like Figma's crop mode) - values between 0-1
  offsetX?: number; // 0 = left, 0.5 = center, 1 = right
  offsetY?: number; // 0 = top, 0.5 = center, 1 = bottom
}

export type FillLayer = SolidFillLayer | ImageFillLayer;

// Type guards
export function isSolidFill(layer: FillLayer): layer is SolidFillLayer {
  return layer.type === 'solid';
}

export function isImageFill(layer: FillLayer): layer is ImageFillLayer {
  return layer.type === 'image';
}

// Factory functions
export function createSolidFill(color: string, opacity = 1): SolidFillLayer {
  return {
    id: Math.random().toString(36).substr(2, 9), // Simple ID generation
    type: 'solid',
    color,
    enabled: true,
    opacity,
  };
}

export function createImageFill(
  src: string,
  imageWidth?: number,
  imageHeight?: number,
  opacity = 1
): ImageFillLayer {
  return {
    id: Math.random().toString(36).substr(2, 9),
    type: 'image',
    src,
    enabled: true,
    opacity,
    scaleMode: 'cover',
    imageWidth,
    imageHeight,
    offsetX: 0.5, // Center by default
    offsetY: 0.5, // Center by default
  };
}
