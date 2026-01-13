'use client';

import { useEffect, useCallback } from 'react';
import {
  useDocumentStore,
  useEditorStore,
  useHistoryStore,
  pushStateNow,
} from '@/stores';
import type { Tool } from '@/types/editor';

export function useKeyboardShortcuts() {
  const activeTool = useEditorStore((state) => state.activeTool);
  const setActiveTool = useEditorStore((state) => state.setActiveTool);
  const selectedElementIds = useEditorStore((state) => state.selectedElementIds);
  const deselectAll = useEditorStore((state) => state.deselectAll);
  const selectElements = useEditorStore((state) => state.selectElements);
  const zoomIn = useEditorStore((state) => state.zoomIn);
  const zoomOut = useEditorStore((state) => state.zoomOut);
  const resetZoom = useEditorStore((state) => state.resetZoom);

  const deleteElements = useDocumentStore((state) => state.deleteElements);
  const duplicateElements = useDocumentStore((state) => state.duplicateElements);
  const getCurrentSlide = useDocumentStore((state) => state.getCurrentSlide);

  const undo = useHistoryStore((state) => state.undo);
  const redo = useHistoryStore((state) => state.redo);
  const canUndo = useHistoryStore((state) => state.past.length > 0);
  const canRedo = useHistoryStore((state) => state.future.length > 0);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdKey = isMac ? e.metaKey : e.ctrlKey;

      // Tool shortcuts (no modifiers)
      if (!cmdKey && !e.altKey) {
        const toolMap: Record<string, Tool> = {
          v: 'select',
          h: 'pan',
          r: 'rectangle',
          o: 'ellipse',
          l: 'line',
          t: 'text',
          i: 'image',
        };

        const tool = toolMap[e.key.toLowerCase()];
        if (tool) {
          e.preventDefault();
          setActiveTool(tool);
          return;
        }
      }

      // Escape - deselect
      if (e.key === 'Escape') {
        e.preventDefault();
        deselectAll();
        return;
      }

      // Delete/Backspace - delete selected
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElementIds.length > 0) {
          e.preventDefault();
          deleteElements(selectedElementIds);
          pushStateNow();
          deselectAll();
          return;
        }
      }

      // Cmd/Ctrl + Z - Undo
      if (cmdKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) {
          undo();
        }
        return;
      }

      // Cmd/Ctrl + Shift + Z - Redo
      if (cmdKey && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        if (canRedo) {
          redo();
        }
        return;
      }

      // Cmd/Ctrl + Y - Redo (alternative)
      if (cmdKey && e.key === 'y') {
        e.preventDefault();
        if (canRedo) {
          redo();
        }
        return;
      }

      // Cmd/Ctrl + D - Duplicate
      if (cmdKey && e.key === 'd') {
        if (selectedElementIds.length > 0) {
          e.preventDefault();
          const newIds = duplicateElements(selectedElementIds);
          pushStateNow();
          selectElements(newIds);
          return;
        }
      }

      // Cmd/Ctrl + A - Select all
      if (cmdKey && e.key === 'a') {
        e.preventDefault();
        const currentSlide = getCurrentSlide();
        if (currentSlide) {
          selectElements(currentSlide.elements.map((el) => el.id));
        }
        return;
      }

      // Cmd/Ctrl + = or + - Zoom in
      if (cmdKey && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        zoomIn();
        return;
      }

      // Cmd/Ctrl + - - Zoom out
      if (cmdKey && e.key === '-') {
        e.preventDefault();
        zoomOut();
        return;
      }

      // Cmd/Ctrl + 0 - Reset zoom
      if (cmdKey && e.key === '0') {
        e.preventDefault();
        resetZoom();
        return;
      }

      // Arrow keys - nudge selected elements
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        if (selectedElementIds.length > 0) {
          e.preventDefault();
          const nudgeAmount = e.shiftKey ? 10 : 1;
          const updateElement = useDocumentStore.getState().updateElement;

          selectedElementIds.forEach((id) => {
            const element = useDocumentStore.getState().getElement(id);
            if (element && !element.locked) {
              let dx = 0;
              let dy = 0;

              switch (e.key) {
                case 'ArrowUp':
                  dy = -nudgeAmount;
                  break;
                case 'ArrowDown':
                  dy = nudgeAmount;
                  break;
                case 'ArrowLeft':
                  dx = -nudgeAmount;
                  break;
                case 'ArrowRight':
                  dx = nudgeAmount;
                  break;
              }

              updateElement(id, {
                x: element.x + dx,
                y: element.y + dy,
              });
            }
          });
          return;
        }
      }

      // Space - temporarily switch to pan tool
      if (e.key === ' ' && !e.repeat) {
        e.preventDefault();
        // Store current tool and switch to pan
        // This would need additional state to remember previous tool
        setActiveTool('pan');
        return;
      }
    },
    [
      activeTool,
      setActiveTool,
      selectedElementIds,
      deselectAll,
      selectElements,
      deleteElements,
      duplicateElements,
      getCurrentSlide,
      undo,
      redo,
      canUndo,
      canRedo,
      zoomIn,
      zoomOut,
      resetZoom,
    ]
  );

  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      // Space released - switch back to select
      if (e.key === ' ') {
        e.preventDefault();
        setActiveTool('select');
      }
    },
    [setActiveTool]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);
}
