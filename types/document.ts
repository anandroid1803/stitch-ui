// Document Types for Stitch Moodboard Platform

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
  | ShapeElement
  | LineElement;

export type ElementType = 'image' | 'text' | 'shape' | 'line';

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
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  lineHeight?: number;
  letterSpacing?: number;
}

export type ShapeType = 'rectangle' | 'ellipse' | 'triangle' | 'polygon' | 'star';

export interface ShapeElement extends BaseElement {
  type: 'shape';
  shapeType: ShapeType;
  fill: string;
  stroke: string;
  strokeWidth: number;
  cornerRadius?: number;
  sides?: number;
}

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
  fill: '#000000',
};

export const DEFAULT_SHAPE_STYLE = {
  fill: '#3b82f6',
  stroke: '#1d4ed8',
  strokeWidth: 2,
  cornerRadius: 0,
};

export const DEFAULT_LINE_STYLE = {
  stroke: '#000000',
  strokeWidth: 2,
  lineCap: 'round' as const,
  lineJoin: 'round' as const,
};
