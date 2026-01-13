import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { nanoid } from 'nanoid';
import {
  DEFAULT_DOCUMENT_SETTINGS,
} from '@/types/document';
import type {
  Document,
  Slide,
  CanvasElement,
  DocumentSettings,
} from '@/types/document';

interface DocumentState {
  // Document data
  document: Document | null;
  currentSlideId: string | null;
  isLoading: boolean;
  isSaving: boolean;
  lastSaved: string | null;
  hasUnsavedChanges: boolean;

  // Actions
  initializeDocument: (doc: Document) => void;
  createNewDocument: (name?: string) => Document;
  updateDocumentName: (name: string) => void;
  updateDocumentSettings: (settings: Partial<DocumentSettings>) => void;

  // Slide actions
  addSlide: (afterSlideId?: string) => string;
  deleteSlide: (slideId: string) => void;
  duplicateSlide: (slideId: string) => string;
  reorderSlides: (fromIndex: number, toIndex: number) => void;
  setCurrentSlide: (slideId: string) => void;
  updateSlideBackground: (slideId: string, color: string) => void;
  updateSlideThumbnail: (slideId: string, thumbnail: string) => void;

  // Element actions
  addElement: (element: CanvasElement, slideId?: string) => void;
  updateElement: (elementId: string, updates: Partial<CanvasElement>, slideId?: string) => void;
  deleteElements: (elementIds: string[], slideId?: string) => void;
  duplicateElements: (elementIds: string[], slideId?: string) => string[];
  reorderElement: (elementId: string, direction: 'up' | 'down' | 'top' | 'bottom', slideId?: string) => void;

  // Helpers
  getCurrentSlide: () => Slide | null;
  getElement: (elementId: string, slideId?: string) => CanvasElement | null;
  getElements: (slideId?: string) => CanvasElement[];

  // Save state
  setSaving: (saving: boolean) => void;
  setLastSaved: (date: string) => void;
  markAsChanged: () => void;
  markAsSaved: () => void;
}

export const useDocumentStore = create<DocumentState>()(
  immer((set, get) => ({
    document: null,
    currentSlideId: null,
    isLoading: false,
    isSaving: false,
    lastSaved: null,
    hasUnsavedChanges: false,

    initializeDocument: (doc) => {
      set((state) => {
        state.document = doc;
        state.currentSlideId = doc.slides[0]?.id ?? null;
        state.hasUnsavedChanges = false;
      });
    },

    createNewDocument: (name = 'Untitled Board') => {
      const slideId = nanoid();
      const newDoc: Document = {
        id: nanoid(),
        name,
        userId: '',
        slides: [
          {
            id: slideId,
            order: 0,
            name: 'Slide 1',
            elements: [],
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        settings: { ...DEFAULT_DOCUMENT_SETTINGS },
      };

      set((state) => {
        state.document = newDoc;
        state.currentSlideId = slideId;
        state.hasUnsavedChanges = false;
      });

      return newDoc;
    },

    updateDocumentName: (name) => {
      set((state) => {
        if (state.document) {
          state.document.name = name;
          state.document.updatedAt = new Date().toISOString();
          state.hasUnsavedChanges = true;
        }
      });
    },

    updateDocumentSettings: (settings) => {
      set((state) => {
        if (state.document) {
          state.document.settings = { ...state.document.settings, ...settings };
          state.document.updatedAt = new Date().toISOString();
          state.hasUnsavedChanges = true;
        }
      });
    },

    // Slide actions
    addSlide: (afterSlideId) => {
      const newSlideId = nanoid();
      set((state) => {
        if (!state.document) return;

        const slideCount = state.document.slides.length;
        let insertIndex = slideCount;

        if (afterSlideId) {
          const afterIndex = state.document.slides.findIndex((s) => s.id === afterSlideId);
          if (afterIndex !== -1) {
            insertIndex = afterIndex + 1;
          }
        }

        const newSlide: Slide = {
          id: newSlideId,
          order: insertIndex,
          name: `Slide ${slideCount + 1}`,
          elements: [],
        };

        state.document.slides.splice(insertIndex, 0, newSlide);

        // Update order for all slides
        state.document.slides.forEach((slide, index) => {
          slide.order = index;
        });

        state.currentSlideId = newSlideId;
        state.document.updatedAt = new Date().toISOString();
        state.hasUnsavedChanges = true;
      });

      return newSlideId;
    },

    deleteSlide: (slideId) => {
      set((state) => {
        if (!state.document || state.document.slides.length <= 1) return;

        const slideIndex = state.document.slides.findIndex((s) => s.id === slideId);
        if (slideIndex === -1) return;

        state.document.slides.splice(slideIndex, 1);

        // Update order
        state.document.slides.forEach((slide, index) => {
          slide.order = index;
        });

        // Update current slide if needed
        if (state.currentSlideId === slideId) {
          const newIndex = Math.min(slideIndex, state.document.slides.length - 1);
          state.currentSlideId = state.document.slides[newIndex].id;
        }

        state.document.updatedAt = new Date().toISOString();
        state.hasUnsavedChanges = true;
      });
    },

    duplicateSlide: (slideId) => {
      const newSlideId = nanoid();
      set((state) => {
        if (!state.document) return;

        const slideIndex = state.document.slides.findIndex((s) => s.id === slideId);
        if (slideIndex === -1) return;

        const originalSlide = state.document.slides[slideIndex];
        const duplicatedSlide: Slide = {
          ...JSON.parse(JSON.stringify(originalSlide)),
          id: newSlideId,
          name: `${originalSlide.name} (Copy)`,
          elements: originalSlide.elements.map((el) => ({
            ...JSON.parse(JSON.stringify(el)),
            id: nanoid(),
          })),
        };

        state.document.slides.splice(slideIndex + 1, 0, duplicatedSlide);

        // Update order
        state.document.slides.forEach((slide, index) => {
          slide.order = index;
        });

        state.currentSlideId = newSlideId;
        state.document.updatedAt = new Date().toISOString();
        state.hasUnsavedChanges = true;
      });

      return newSlideId;
    },

    reorderSlides: (fromIndex, toIndex) => {
      set((state) => {
        if (!state.document) return;

        const [removed] = state.document.slides.splice(fromIndex, 1);
        state.document.slides.splice(toIndex, 0, removed);

        // Update order
        state.document.slides.forEach((slide, index) => {
          slide.order = index;
        });

        state.document.updatedAt = new Date().toISOString();
        state.hasUnsavedChanges = true;
      });
    },

    setCurrentSlide: (slideId) => {
      set((state) => {
        state.currentSlideId = slideId;
      });
    },

    updateSlideBackground: (slideId, color) => {
      set((state) => {
        if (!state.document) return;
        const slide = state.document.slides.find((s) => s.id === slideId);
        if (slide) {
          slide.backgroundColor = color;
          state.document.updatedAt = new Date().toISOString();
          state.hasUnsavedChanges = true;
        }
      });
    },

    updateSlideThumbnail: (slideId, thumbnail) => {
      set((state) => {
        if (!state.document) return;
        const slide = state.document.slides.find((s) => s.id === slideId);
        if (slide) {
          slide.thumbnail = thumbnail;
        }
      });
    },

    // Element actions
    addElement: (element, slideId) => {
      set((state) => {
        if (!state.document) return;
        const targetSlideId = slideId ?? state.currentSlideId;
        const slide = state.document.slides.find((s) => s.id === targetSlideId);
        if (slide) {
          // Set zIndex to be highest
          const maxZIndex = slide.elements.reduce((max, el) => Math.max(max, el.zIndex), -1);
          element.zIndex = maxZIndex + 1;
          slide.elements.push(element);
          state.document.updatedAt = new Date().toISOString();
          state.hasUnsavedChanges = true;
        }
      });
    },

    updateElement: (elementId, updates, slideId) => {
      set((state) => {
        if (!state.document) return;
        const targetSlideId = slideId ?? state.currentSlideId;
        const slide = state.document.slides.find((s) => s.id === targetSlideId);
        if (slide) {
          const elementIndex = slide.elements.findIndex((el) => el.id === elementId);
          if (elementIndex !== -1) {
            slide.elements[elementIndex] = {
              ...slide.elements[elementIndex],
              ...updates,
            } as CanvasElement;
            state.document.updatedAt = new Date().toISOString();
            state.hasUnsavedChanges = true;
          }
        }
      });
    },

    deleteElements: (elementIds, slideId) => {
      set((state) => {
        if (!state.document) return;
        const targetSlideId = slideId ?? state.currentSlideId;
        const slide = state.document.slides.find((s) => s.id === targetSlideId);
        if (slide) {
          slide.elements = slide.elements.filter((el) => !elementIds.includes(el.id));
          state.document.updatedAt = new Date().toISOString();
          state.hasUnsavedChanges = true;
        }
      });
    },

    duplicateElements: (elementIds, slideId) => {
      const newIds: string[] = [];
      set((state) => {
        if (!state.document) return;
        const targetSlideId = slideId ?? state.currentSlideId;
        const slide = state.document.slides.find((s) => s.id === targetSlideId);
        if (slide) {
          const elementsToDuplicate = slide.elements.filter((el) => elementIds.includes(el.id));
          const maxZIndex = slide.elements.reduce((max, el) => Math.max(max, el.zIndex), -1);

          elementsToDuplicate.forEach((el, index) => {
            const newId = nanoid();
            newIds.push(newId);
            const duplicated: CanvasElement = {
              ...JSON.parse(JSON.stringify(el)),
              id: newId,
              x: el.x + 20,
              y: el.y + 20,
              zIndex: maxZIndex + index + 1,
            };
            slide.elements.push(duplicated);
          });

          state.document.updatedAt = new Date().toISOString();
          state.hasUnsavedChanges = true;
        }
      });
      return newIds;
    },

    reorderElement: (elementId, direction, slideId) => {
      set((state) => {
        if (!state.document) return;
        const targetSlideId = slideId ?? state.currentSlideId;
        const slide = state.document.slides.find((s) => s.id === targetSlideId);
        if (!slide) return;

        const element = slide.elements.find((el) => el.id === elementId);
        if (!element) return;

        const sortedByZIndex = [...slide.elements].sort((a, b) => a.zIndex - b.zIndex);
        const currentIndex = sortedByZIndex.findIndex((el) => el.id === elementId);

        switch (direction) {
          case 'up': {
            if (currentIndex < sortedByZIndex.length - 1) {
              const nextElement = sortedByZIndex[currentIndex + 1];
              const tempZIndex = element.zIndex;
              element.zIndex = nextElement.zIndex;
              nextElement.zIndex = tempZIndex;
            }
            break;
          }
          case 'down': {
            if (currentIndex > 0) {
              const prevElement = sortedByZIndex[currentIndex - 1];
              const tempZIndex = element.zIndex;
              element.zIndex = prevElement.zIndex;
              prevElement.zIndex = tempZIndex;
            }
            break;
          }
          case 'top': {
            const maxZIndex = Math.max(...sortedByZIndex.map((el) => el.zIndex));
            element.zIndex = maxZIndex + 1;
            break;
          }
          case 'bottom': {
            const minZIndex = Math.min(...sortedByZIndex.map((el) => el.zIndex));
            element.zIndex = minZIndex - 1;
            break;
          }
        }

        state.document.updatedAt = new Date().toISOString();
        state.hasUnsavedChanges = true;
      });
    },

    // Helpers
    getCurrentSlide: () => {
      const state = get();
      if (!state.document || !state.currentSlideId) return null;
      return state.document.slides.find((s) => s.id === state.currentSlideId) ?? null;
    },

    getElement: (elementId, slideId) => {
      const state = get();
      if (!state.document) return null;
      const targetSlideId = slideId ?? state.currentSlideId;
      const slide = state.document.slides.find((s) => s.id === targetSlideId);
      return slide?.elements.find((el) => el.id === elementId) ?? null;
    },

    getElements: (slideId) => {
      const state = get();
      if (!state.document) return [];
      const targetSlideId = slideId ?? state.currentSlideId;
      const slide = state.document.slides.find((s) => s.id === targetSlideId);
      return slide?.elements ?? [];
    },

    // Save state
    setSaving: (saving) => {
      set((state) => {
        state.isSaving = saving;
      });
    },

    setLastSaved: (date) => {
      set((state) => {
        state.lastSaved = date;
      });
    },

    markAsChanged: () => {
      set((state) => {
        state.hasUnsavedChanges = true;
      });
    },

    markAsSaved: () => {
      set((state) => {
        state.hasUnsavedChanges = false;
        state.lastSaved = new Date().toISOString();
      });
    },
  }))
);

