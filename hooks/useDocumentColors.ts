'use client';

import { useMemo } from 'react';
import { useDocumentStore } from '@/stores';
import type { CanvasElement, TextElement, ShapeElement, LineElement } from '@/types/document';

/**
 * Hook to extract all unique colors used in the current document/slide
 * Returns an array of hex color strings
 */
export function useDocumentColors(): string[] {
  const document = useDocumentStore((state) => state.document);
  const currentSlideId = useDocumentStore((state) => state.currentSlideId);

  return useMemo(() => {
    if (!document) return [];

    const colors = new Set<string>();

    // Get current slide elements, or all slides if no current slide
    const slidesToCheck = currentSlideId
      ? document.slides.filter((s) => s.id === currentSlideId)
      : document.slides;

    for (const slide of slidesToCheck) {
      // Add slide background color if set
      if (slide.backgroundColor) {
        colors.add(slide.backgroundColor.toLowerCase());
      }

      // Extract colors from elements
      for (const element of slide.elements) {
        extractColorsFromElement(element, colors);
      }
    }

    // Add document background color
    if (document.settings.backgroundColor) {
      colors.add(document.settings.backgroundColor.toLowerCase());
    }

    // Convert set to array and sort (light to dark based on brightness)
    return Array.from(colors).sort((a, b) => {
      const brightnessA = getColorBrightness(a);
      const brightnessB = getColorBrightness(b);
      return brightnessB - brightnessA;
    });
  }, [document, currentSlideId]);
}

/**
 * Extract colors from a canvas element
 */
function extractColorsFromElement(element: CanvasElement, colors: Set<string>): void {
  switch (element.type) {
    case 'text': {
      const textEl = element as TextElement;
      if (textEl.fill) {
        colors.add(textEl.fill.toLowerCase());
      }
      if (textEl.stroke) {
        colors.add(textEl.stroke.toLowerCase());
      }
      break;
    }

    case 'shape': {
      const shapeEl = element as ShapeElement;
      if (shapeEl.fill) {
        colors.add(shapeEl.fill.toLowerCase());
      }
      if (shapeEl.stroke) {
        colors.add(shapeEl.stroke.toLowerCase());
      }
      break;
    }

    case 'line': {
      const lineEl = element as LineElement;
      if (lineEl.stroke) {
        colors.add(lineEl.stroke.toLowerCase());
      }
      break;
    }

    // Images don't have fill/stroke colors
    case 'image':
    default:
      break;
  }
}

/**
 * Calculate perceived brightness of a hex color (0-255)
 * Uses the relative luminance formula
 */
function getColorBrightness(hex: string): number {
  // Remove # if present
  const cleanHex = hex.replace(/^#/, '');

  // Handle shorthand hex
  const fullHex = cleanHex.length === 3
    ? cleanHex.split('').map((c) => c + c).join('')
    : cleanHex;

  const r = parseInt(fullHex.slice(0, 2), 16);
  const g = parseInt(fullHex.slice(2, 4), 16);
  const b = parseInt(fullHex.slice(4, 6), 16);

  // Perceived brightness formula
  return (r * 299 + g * 587 + b * 114) / 1000;
}

/**
 * Hook to get all unique colors from the entire document (all slides)
 */
export function useAllDocumentColors(): string[] {
  const document = useDocumentStore((state) => state.document);

  return useMemo(() => {
    if (!document) return [];

    const colors = new Set<string>();

    for (const slide of document.slides) {
      if (slide.backgroundColor) {
        colors.add(slide.backgroundColor.toLowerCase());
      }

      for (const element of slide.elements) {
        extractColorsFromElement(element, colors);
      }
    }

    if (document.settings.backgroundColor) {
      colors.add(document.settings.backgroundColor.toLowerCase());
    }

    return Array.from(colors).sort((a, b) => {
      const brightnessA = getColorBrightness(a);
      const brightnessB = getColorBrightness(b);
      return brightnessB - brightnessA;
    });
  }, [document]);
}
