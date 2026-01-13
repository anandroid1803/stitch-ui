import { create } from 'zustand';
import { useDocumentStore } from './documentStore';
import type { Document } from '@/types/document';

interface HistoryState {
  past: string[];
  future: string[];
  isUndoing: boolean;
  isRedoing: boolean;
  maxHistory: number;
}

interface HistoryActions {
  // Core actions
  pushState: () => void;
  undo: () => void;
  redo: () => void;
  clear: () => void;

  // Getters
  canUndo: () => boolean;
  canRedo: () => boolean;
}

type HistoryStore = HistoryState & HistoryActions;

const MAX_HISTORY = 50;

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  past: [],
  future: [],
  isUndoing: false,
  isRedoing: false,
  maxHistory: MAX_HISTORY,

  pushState: () => {
    const document = useDocumentStore.getState().document;
    if (!document) return;

    // Don't push if we're in the middle of undo/redo
    if (get().isUndoing || get().isRedoing) return;

    const currentState = JSON.stringify(document);
    const past = get().past;

    // Don't push if the state hasn't changed
    if (past.length > 0 && past[past.length - 1] === currentState) {
      return;
    }

    set((state) => ({
      past: [...state.past.slice(-state.maxHistory + 1), currentState],
      future: [], // Clear future when new action is taken
    }));
  },

  undo: () => {
    const { past, future } = get();
    if (past.length === 0) return;

    const document = useDocumentStore.getState().document;
    if (!document) return;

    set({ isUndoing: true });

    // Save current state to future
    const currentState = JSON.stringify(document);
    const previousState = past[past.length - 1];

    // Restore previous state
    const restoredDocument: Document = JSON.parse(previousState);
    useDocumentStore.getState().initializeDocument(restoredDocument);

    set({
      past: past.slice(0, -1),
      future: [currentState, ...future],
      isUndoing: false,
    });
  },

  redo: () => {
    const { past, future } = get();
    if (future.length === 0) return;

    const document = useDocumentStore.getState().document;
    if (!document) return;

    set({ isRedoing: true });

    // Save current state to past
    const currentState = JSON.stringify(document);
    const nextState = future[0];

    // Restore next state
    const restoredDocument: Document = JSON.parse(nextState);
    useDocumentStore.getState().initializeDocument(restoredDocument);

    set({
      past: [...past, currentState],
      future: future.slice(1),
      isRedoing: false,
    });
  },

  clear: () => {
    set({
      past: [],
      future: [],
    });
  },

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,
}));

// Create a debounced version of pushState for use in components
let pushTimeout: ReturnType<typeof setTimeout> | null = null;

export const debouncedPushState = (delay = 300) => {
  if (pushTimeout) {
    clearTimeout(pushTimeout);
  }
  pushTimeout = setTimeout(() => {
    useHistoryStore.getState().pushState();
    pushTimeout = null;
  }, delay);
};

// Push state immediately (for discrete actions like adding/deleting elements)
export const pushStateNow = () => {
  if (pushTimeout) {
    clearTimeout(pushTimeout);
    pushTimeout = null;
  }
  useHistoryStore.getState().pushState();
};

// Selector hooks
export const useCanUndo = () => useHistoryStore((state) => state.past.length > 0);
export const useCanRedo = () => useHistoryStore((state) => state.future.length > 0);
