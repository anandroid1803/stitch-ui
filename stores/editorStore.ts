import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type {
  Tool,
  ShapeTool,
  Viewport,
  SnapGuide,
  EditorState,
  DEFAULT_EDITOR_STATE,
} from '@/types/editor';
import { MIN_ZOOM, MAX_ZOOM, ZOOM_STEP } from '@/types/editor';

interface EditorActions {
  // Tool actions
  setActiveTool: (tool: Tool) => void;
  setActiveShapeTool: (shapeTool: ShapeTool) => void;

  // Selection actions
  selectElement: (elementId: string, addToSelection?: boolean) => void;
  selectElements: (elementIds: string[]) => void;
  deselectAll: () => void;
  toggleElementSelection: (elementId: string) => void;
  setHoveredElement: (elementId: string | null) => void;
  clearHoveredElement: () => void;

  // Viewport actions
  setViewport: (viewport: Partial<Viewport>) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomToFit: (canvasWidth: number, canvasHeight: number) => void;
  resetZoom: () => void;
  panBy: (dx: number, dy: number) => void;
  centerViewport: (canvasWidth: number, canvasHeight: number) => void;

  // State flags
  setIsPanning: (isPanning: boolean) => void;
  setIsDrawing: (isDrawing: boolean) => void;
  setIsTransforming: (isTransforming: boolean) => void;

  // Grid & snapping
  setShowGrid: (show: boolean) => void;
  setSnapToGrid: (snap: boolean) => void;
  setGridSize: (size: number) => void;
  setSnapGuides: (guides: SnapGuide[]) => void;
  clearSnapGuides: () => void;

  // Colors
  setFillColor: (color: string) => void;
  setStrokeColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;

  // Reset
  resetEditor: () => void;
}

type EditorStore = EditorState & EditorActions;

const initialState: EditorState = {
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

export const useEditorStore = create<EditorStore>()(
  immer((set, get) => ({
    ...initialState,

    // Tool actions
    setActiveTool: (tool) => {
      set((state) => {
        state.activeTool = tool;
        // Deselect when switching to certain tools
        if (tool !== 'select') {
          state.selectedElementIds = [];
        }
      });
    },

    setActiveShapeTool: (shapeTool) => {
      set((state) => {
        state.activeShapeTool = shapeTool;
      });
    },

    // Selection actions
    selectElement: (elementId, addToSelection = false) => {
      set((state) => {
        if (addToSelection) {
          if (!state.selectedElementIds.includes(elementId)) {
            state.selectedElementIds.push(elementId);
          }
        } else {
          state.selectedElementIds = [elementId];
        }
      });
    },

    selectElements: (elementIds) => {
      set((state) => {
        state.selectedElementIds = elementIds;
      });
    },

    deselectAll: () => {
      set((state) => {
        state.selectedElementIds = [];
      });
    },

    toggleElementSelection: (elementId) => {
      set((state) => {
        const index = state.selectedElementIds.indexOf(elementId);
        if (index === -1) {
          state.selectedElementIds.push(elementId);
        } else {
          state.selectedElementIds.splice(index, 1);
        }
      });
    },

    setHoveredElement: (elementId) => {
      set((state) => {
        state.hoveredElementId = elementId;
      });
    },

    clearHoveredElement: () => {
      set((state) => {
        state.hoveredElementId = null;
      });
    },

    // Viewport actions
    setViewport: (viewport) => {
      set((state) => {
        state.viewport = { ...state.viewport, ...viewport };
      });
    },

    zoomIn: () => {
      set((state) => {
        const newScale = Math.min(state.viewport.scale + ZOOM_STEP, MAX_ZOOM);
        state.viewport.scale = Math.round(newScale * 100) / 100;
      });
    },

    zoomOut: () => {
      set((state) => {
        const newScale = Math.max(state.viewport.scale - ZOOM_STEP, MIN_ZOOM);
        state.viewport.scale = Math.round(newScale * 100) / 100;
      });
    },

    zoomToFit: (canvasWidth, canvasHeight) => {
      set((state) => {
        // This will be called with container dimensions
        // Assume document size from settings (1920x1080 default)
        const docWidth = 1920;
        const docHeight = 1080;
        const padding = 100;

        const scaleX = (canvasWidth - padding * 2) / docWidth;
        const scaleY = (canvasHeight - padding * 2) / docHeight;
        const scale = Math.min(scaleX, scaleY, 1);

        state.viewport.scale = Math.round(scale * 100) / 100;
        state.viewport.x = (canvasWidth - docWidth * scale) / 2;
        state.viewport.y = (canvasHeight - docHeight * scale) / 2;
      });
    },

    resetZoom: () => {
      set((state) => {
        state.viewport.scale = 1;
      });
    },

    panBy: (dx, dy) => {
      set((state) => {
        state.viewport.x += dx;
        state.viewport.y += dy;
      });
    },

    centerViewport: (canvasWidth, canvasHeight) => {
      set((state) => {
        const docWidth = 1920;
        const docHeight = 1080;
        const scale = state.viewport.scale;

        state.viewport.x = (canvasWidth - docWidth * scale) / 2;
        state.viewport.y = (canvasHeight - docHeight * scale) / 2;
      });
    },

    // State flags
    setIsPanning: (isPanning) => {
      set((state) => {
        state.isPanning = isPanning;
      });
    },

    setIsDrawing: (isDrawing) => {
      set((state) => {
        state.isDrawing = isDrawing;
      });
    },

    setIsTransforming: (isTransforming) => {
      set((state) => {
        state.isTransforming = isTransforming;
      });
    },

    // Grid & snapping
    setShowGrid: (show) => {
      set((state) => {
        state.showGrid = show;
      });
    },

    setSnapToGrid: (snap) => {
      set((state) => {
        state.snapToGrid = snap;
      });
    },

    setGridSize: (size) => {
      set((state) => {
        state.gridSize = size;
      });
    },

    setSnapGuides: (guides) => {
      set((state) => {
        state.snapGuides = guides;
      });
    },

    clearSnapGuides: () => {
      set((state) => {
        state.snapGuides = [];
      });
    },

    // Colors
    setFillColor: (color) => {
      set((state) => {
        state.fillColor = color;
      });
    },

    setStrokeColor: (color) => {
      set((state) => {
        state.strokeColor = color;
      });
    },

    setStrokeWidth: (width) => {
      set((state) => {
        state.strokeWidth = width;
      });
    },

    // Reset
    resetEditor: () => {
      set(() => ({ ...initialState }));
    },
  }))
);

// Selector hooks for common use cases
export const useSelectedElementIds = () =>
  useEditorStore((state) => state.selectedElementIds);

export const useActiveTool = () =>
  useEditorStore((state) => state.activeTool);

export const useViewport = () =>
  useEditorStore((state) => state.viewport);

export const useIsTransforming = () =>
  useEditorStore((state) => state.isTransforming);
