// Document Types for Stitch Moodboard Platform

import type { FillLayer } from './fill';
import type { StrokeLayer } from './stroke';
import type { Effect } from './effects';

export interface Document {
  id: string;
  name: string;
  userId: string;
  slides: Slide[];
  createdAt: string;
  updatedAt: string;
  settings: DocumentSettings;
}

export interface DocumentSettings {
  width: number;
  height: number;
  backgroundColor: string;
}

export interface Slide {
  id: string;
  order: number;
  name: string;
  elements: CanvasElement[];
  backgroundColor?: string;
  thumbnail?: string;
}

// Union type for all canvas elements
export type CanvasElement =
  | ImageElement
  | TextElement
  | VectorElement
  | LineElement;

export type ElementType = 'image' | 'text' | 'vector' | 'line';

export interface Shadow {
  offsetX: number;
  offsetY: number;
  blur: number;
  color: string;
  enabled: boolean;
}

export interface BaseElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  locked: boolean;
  zIndex: number;
  name?: string;

  // Universal properties (Figma-style)
  fills?: FillLayer[];
  strokes?: StrokeLayer[];
  effects?: Effect[];

  // Legacy (deprecated, kept for backward compatibility)
  shadow?: Shadow;
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
  originalSrc: string;
  filters?: ImageFilters;
  cropData?: CropData;
}

export interface ImageFilters {
  brightness?: number;
  contrast?: number;
  saturation?: number;
  blur?: number;
}

export interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TextElement extends BaseElement {
  type: 'text';
  content: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  fontStyle: 'normal' | 'italic';
  textAlign: 'left' | 'center' | 'right';
  lineHeight?: number;
  letterSpacing?: number;

  // Legacy (deprecated, kept for backward compatibility)
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

export type VectorType = 'rectangle' | 'ellipse' | 'triangle' | 'polygon' | 'star';

export interface VectorElement extends BaseElement {
  type: 'vector';
  vectorType: VectorType;
  cornerRadius?: number;
  sides?: number;

  // Legacy (deprecated, kept for backward compatibility)
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

// Legacy type alias for backward compatibility
export type ShapeType = VectorType;
export type ShapeElement = VectorElement;

export interface LineElement extends BaseElement {
  type: 'line';
  points: number[];
  stroke: string;
  strokeWidth: number;
  lineCap: 'butt' | 'round' | 'square';
  lineJoin: 'miter' | 'round' | 'bevel';
  dash?: number[];
  arrowStart?: boolean;
  arrowEnd?: boolean;
}

// Default values for creating new elements
export const DEFAULT_DOCUMENT_SETTINGS: DocumentSettings = {
  width: 1920,
  height: 1080,
  backgroundColor: '#ffffff',
};

export const DEFAULT_TEXT_STYLE = {
  content: 'Double-click to edit',
  fontFamily: 'Inter',
  fontSize: 24,
  fontWeight: 400,
  fontStyle: 'normal' as const,
  textAlign: 'left' as const,
  fills: [
    {
      id: 'default-text-fill',
      type: 'solid' as const,
      color: '#000000',
      enabled: true,
      opacity: 1,
    },
  ],
  strokes: [],
  effects: [],
  // Legacy
  fill: '#000000',
};

export const DEFAULT_VECTOR_STYLE = {
  fills: [
    {
      id: 'default-vector-fill',
      type: 'solid' as const,
      color: '#3b82f6',
      enabled: true,
      opacity: 1,
    },
  ],
  strokes: [
    {
      id: 'default-vector-stroke',
      enabled: true,
      color: '#1d4ed8',
      width: 2,
      opacity: 1,
      lineCap: 'butt' as const,
      lineJoin: 'miter' as const,
    },
  ],
  effects: [],
  cornerRadius: 0,
  // Legacy
  fill: '#3b82f6',
  stroke: '#1d4ed8',
  strokeWidth: 2,
};

// Legacy alias
export const DEFAULT_SHAPE_STYLE = DEFAULT_VECTOR_STYLE;

export const DEFAULT_LINE_STYLE = {
  strokes: [
    {
      id: 'default-line-stroke',
      enabled: true,
      color: '#000000',
      width: 2,
      opacity: 1,
      lineCap: 'round' as const,
      lineJoin: 'round' as const,
    },
  ],
  effects: [],
  // Legacy
  stroke: '#000000',
  strokeWidth: 2,
  lineCap: 'round' as const,
  lineJoin: 'round' as const,
};

export const DEFAULT_IMAGE_STYLE = {
  fills: [],
  strokes: [],
  effects: [],
};
