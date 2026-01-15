'use client';

import type { StrokeLayer } from '@/types/stroke';

/**
 * Get stroke props for rendering strokes on a Konva shape
 * Returns props to be spread onto a Konva shape
 *
 * Note: Konva doesn't natively support multiple strokes, so we return
 * the topmost enabled stroke for now. In the future, we could render
 * multiple shapes stacked to achieve multi-stroke effect.
 */
export function useStrokeProps(strokes?: StrokeLayer[]) {
  if (!strokes || strokes.length === 0) {
    return {
      stroke: undefined,
      strokeWidth: 0,
    };
  }

  // Get enabled strokes
  const enabledStrokes = strokes.filter(s => s.enabled);

  if (enabledStrokes.length === 0) {
    return {
      stroke: undefined,
      strokeWidth: 0,
    };
  }

  // Use the topmost stroke (last in array)
  const topStroke = enabledStrokes[enabledStrokes.length - 1];

  return {
    stroke: topStroke.color,
    strokeWidth: topStroke.width,
    opacity: topStroke.opacity,
    lineCap: topStroke.lineCap,
    lineJoin: topStroke.lineJoin,
    dash: topStroke.dashPattern,
  };
}

/**
 * Get enabled strokes from an element
 */
export function getEnabledStrokes(strokes?: StrokeLayer[]): StrokeLayer[] {
  if (!strokes || strokes.length === 0) return [];
  return strokes.filter(s => s.enabled);
}

/**
 * Check if element has any enabled strokes
 */
export function hasStrokes(strokes?: StrokeLayer[]): boolean {
  return getEnabledStrokes(strokes).length > 0;
}
