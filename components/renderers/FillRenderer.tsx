'use client';

import { useState, useEffect } from 'react';
import type { FillLayer, ImageFillLayer } from '@/types/fill';
import { isImageFill } from '@/types/fill';

/**
 * Hook to load and cache image for fillPattern
 */
function useImageFillPattern(fillLayer: ImageFillLayer | null) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!fillLayer) {
      setImage(null);
      setIsLoading(false);
      setError(false);
      return;
    }

    setIsLoading(true);
    setError(false);

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      setImage(img);
      setIsLoading(false);
    };

    img.onerror = () => {
      setError(true);
      setIsLoading(false);
    };

    img.src = fillLayer.src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [fillLayer?.src]);

  return { image, isLoading, error };
}

/**
 * Calculate scale and offset for image fill with "cover" behavior
 * Maintains aspect ratio and fills entire container, cropping if needed
 */
export function calculateCoverTransform(
  containerWidth: number,
  containerHeight: number,
  imageWidth: number,
  imageHeight: number,
  offsetXPercent = 0.5,
  offsetYPercent = 0.5,
  shapeOffsetX = 0,
  shapeOffsetY = 0
) {
  const containerRatio = containerWidth / containerHeight;
  const imageRatio = imageWidth / imageHeight;

  // Calculate scale to cover container while maintaining aspect ratio
  let scale: { x: number; y: number };
  if (imageRatio > containerRatio) {
    // Image is wider - scale to height, image will overflow horizontally
    const scaleFactor = containerHeight / imageHeight;
    scale = { x: scaleFactor, y: scaleFactor };
  } else {
    // Image is taller - scale to width, image will overflow vertically
    const scaleFactor = containerWidth / imageWidth;
    scale = { x: scaleFactor, y: scaleFactor };
  }

  // Calculate overflow (how much the scaled image exceeds container)
  const scaledWidth = imageWidth * scale.x;
  const scaledHeight = imageHeight * scale.y;
  const overflowX = scaledWidth - containerWidth;
  const overflowY = scaledHeight - containerHeight;

  // Position based on offset percentage
  const offset = {
    x: shapeOffsetX - overflowX * offsetXPercent,
    y: shapeOffsetY - overflowY * offsetYPercent,
  };

  return { scale, offset };
}

/**
 * Get fill props for a single fill layer
 * Returns props to be spread onto a Konva shape
 */
export function useFillProps(
  fillLayer: FillLayer | null | undefined,
  containerWidth: number,
  containerHeight: number,
  shapeOffsetX = 0,
  shapeOffsetY = 0
) {
  const imageFill = fillLayer && isImageFill(fillLayer) ? fillLayer : null;
  const { image } = useImageFillPattern(imageFill);

  if (!fillLayer || !fillLayer.enabled) {
    return { fill: undefined, opacity: 1 };
  }

  if (isImageFill(fillLayer)) {
    if (image) {
      const { scale, offset } = calculateCoverTransform(
        containerWidth,
        containerHeight,
        fillLayer.imageWidth || image.width,
        fillLayer.imageHeight || image.height,
        fillLayer.offsetX ?? 0.5,
        fillLayer.offsetY ?? 0.5,
        shapeOffsetX,
        shapeOffsetY
      );

      return {
        fillPatternImage: image,
        fillPatternScale: scale,
        fillPatternOffset: offset,
        opacity: fillLayer.opacity,
      };
    } else {
      // Image not loaded yet
      return { fill: undefined, opacity: fillLayer.opacity };
    }
  } else {
    // Solid fill
    return {
      fill: fillLayer.color,
      opacity: fillLayer.opacity,
    };
  }
}

/**
 * Get enabled fills from an element
 */
export function getEnabledFills(fills?: FillLayer[]): FillLayer[] {
  if (!fills || fills.length === 0) return [];
  return fills.filter(f => f.enabled);
}
