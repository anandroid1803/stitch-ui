// Stroke Layer Types for Multi-Layer Stroke System

export interface StrokeLayer {
  id: string;
  enabled: boolean;
  color: string;         // Hex color with optional alpha (e.g., "#1d4ed8" or "#1d4ed880")
  width: number;         // Stroke width in pixels
  opacity: number;       // 0-1

  // Line styling
  lineCap?: 'butt' | 'round' | 'square';
  lineJoin?: 'miter' | 'round' | 'bevel';
  dashPattern?: number[];  // [dash, gap, dash, gap, ...]
}

// Factory function
export function createStroke(
  color: string,
  width: number,
  opacity = 1
): StrokeLayer {
  return {
    id: Math.random().toString(36).substr(2, 9), // Simple ID generation
    enabled: true,
    color,
    width,
    opacity,
    lineCap: 'butt',
    lineJoin: 'miter',
  };
}
