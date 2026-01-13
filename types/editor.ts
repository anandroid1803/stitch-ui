// Editor State Types

export type Tool =
  | 'select'
  | 'pan'
  | 'rectangle'
  | 'ellipse'
  | 'line'
  | 'text'
  | 'image';

export type ShapeTool = 'rectangle' | 'ellipse' | 'triangle' | 'polygon' | 'star';

export interface Viewport {
  x: number;
  y: number;
  scale: number;
}

export interface SelectionBounds {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export interface SnapGuide {
  type: 'horizontal' | 'vertical';
  position: number;
  start: number;
  end: number;
}

export interface EditorState {
  // Current tool
  activeTool: Tool;
  activeShapeTool: ShapeTool;

  // Selection
  selectedElementIds: string[];
  hoveredElementId: string | null;

  // Viewport
  viewport: Viewport;

  // UI State
  isPanning: boolean;
  isDrawing: boolean;
  isTransforming: boolean;

  // Guides
  snapGuides: SnapGuide[];
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;

  // Colors (for new elements)
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
}

export interface HistoryState {
  past: string[];      // JSON snapshots
  future: string[];    // For redo
  canUndo: boolean;
  canRedo: boolean;
}

// Clipboard types
export interface ClipboardData {
  type: 'stitch-elements';
  elements: string; // JSON stringified elements
}

// Keyboard shortcut context
export type ShortcutContext = 'canvas' | 'text-editing' | 'global';

export interface KeyboardShortcut {
  key: string;
  modifiers: {
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean;
  };
  action: string;
  context: ShortcutContext;
}

// Canvas event types
export interface CanvasPointerEvent {
  x: number;
  y: number;
  pressure?: number;
  shiftKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
  metaKey: boolean;
}

// Transform types
export type TransformAnchor =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'middle-left'
  | 'middle-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'
  | 'rotation';

export interface TransformState {
  anchor: TransformAnchor | null;
  initialBounds: SelectionBounds | null;
  initialPointer: { x: number; y: number } | null;
}

// Zoom presets
export const ZOOM_LEVELS = [0.1, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4] as const;
export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 4;
export const ZOOM_STEP = 0.1;

// Default editor state
export const DEFAULT_EDITOR_STATE: EditorState = {
  activeTool: 'select',
  activeShapeTool: 'rectangle',
  selectedElementIds: [],
  hoveredElementId: null,
  viewport: { x: 0, y: 0, scale: 1 },
  isPanning: false,
  isDrawing: false,
  isTransforming: false,
  snapGuides: [],
  showGrid: false,
  snapToGrid: true,
  gridSize: 20,
  fillColor: '#3b82f6',
  strokeColor: '#1d4ed8',
  strokeWidth: 2,
};
