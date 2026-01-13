'use client';

import { useDocumentStore, useEditorStore, useCanUndo, useCanRedo, useHistoryStore } from '@/stores';
import { Button } from '@/components/ui';
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Download,
  Save,
  MousePointer2,
  Hand,
  Square,
  Circle,
  Type,
  Image,
  Minus,
  ChevronDown,
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { cn } from '@/lib/utils/cn';
import type { Tool } from '@/types/editor';

export function Toolbar() {
  const document = useDocumentStore((state) => state.document);
  const updateDocumentName = useDocumentStore((state) => state.updateDocumentName);
  const isSaving = useDocumentStore((state) => state.isSaving);
  const hasUnsavedChanges = useDocumentStore((state) => state.hasUnsavedChanges);

  const activeTool = useEditorStore((state) => state.activeTool);
  const setActiveTool = useEditorStore((state) => state.setActiveTool);
  const viewport = useEditorStore((state) => state.viewport);
  const zoomIn = useEditorStore((state) => state.zoomIn);
  const zoomOut = useEditorStore((state) => state.zoomOut);
  const resetZoom = useEditorStore((state) => state.resetZoom);

  const canUndo = useCanUndo();
  const canRedo = useCanRedo();
  const undo = useHistoryStore((state) => state.undo);
  const redo = useHistoryStore((state) => state.redo);

  const tools: { id: Tool; icon: typeof MousePointer2; label: string; shortcut: string }[] = [
    { id: 'select', icon: MousePointer2, label: 'Select', shortcut: 'V' },
    { id: 'pan', icon: Hand, label: 'Pan', shortcut: 'H' },
    { id: 'rectangle', icon: Square, label: 'Rectangle', shortcut: 'R' },
    { id: 'ellipse', icon: Circle, label: 'Ellipse', shortcut: 'O' },
    { id: 'line', icon: Minus, label: 'Line', shortcut: 'L' },
    { id: 'text', icon: Type, label: 'Text', shortcut: 'T' },
    { id: 'image', icon: Image, label: 'Image', shortcut: 'I' },
  ];

  const zoomPercentage = Math.round(viewport.scale * 100);

  return (
    <div className="h-14 bg-white border-b border-neutral-200 flex items-center justify-between px-4">
      {/* Left section - Document name */}
      <div className="flex items-center gap-4">
        <input
          type="text"
          value={document?.name ?? 'Untitled Board'}
          onChange={(e) => updateDocumentName(e.target.value)}
          className="text-sm font-medium bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
        />
        <div className="flex items-center gap-1 text-xs text-neutral-400">
          {isSaving ? (
            <span>Saving...</span>
          ) : hasUnsavedChanges ? (
            <span>Unsaved changes</span>
          ) : (
            <span>Saved</span>
          )}
        </div>
      </div>

      {/* Center section - Tools */}
      <div className="flex items-center gap-1 bg-neutral-100 rounded-lg p-1">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className={cn(
              'p-2 rounded-md transition-colors',
              activeTool === tool.id
                ? 'bg-white shadow-sm text-blue-600'
                : 'text-neutral-600 hover:bg-neutral-200'
            )}
            title={`${tool.label} (${tool.shortcut})`}
          >
            <tool.icon className="w-5 h-5" />
          </button>
        ))}
      </div>

      {/* Right section - Actions */}
      <div className="flex items-center gap-2">
        {/* Undo/Redo */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={undo}
            disabled={!canUndo}
            title="Undo (Cmd+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={redo}
            disabled={!canRedo}
            title="Redo (Cmd+Shift+Z)"
          >
            <Redo2 className="w-4 h-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-neutral-200" />

        {/* Zoom controls */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={zoomOut} title="Zoom Out">
            <ZoomOut className="w-4 h-4" />
          </Button>

          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="flex items-center gap-1 px-2 py-1 text-sm hover:bg-neutral-100 rounded">
                {zoomPercentage}%
                <ChevronDown className="w-3 h-3" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="bg-white rounded-lg shadow-lg border border-neutral-200 py-1 z-50 min-w-[120px]"
                sideOffset={5}
              >
                {[50, 75, 100, 125, 150, 200].map((zoom) => (
                  <DropdownMenu.Item
                    key={zoom}
                    className="px-3 py-2 text-sm hover:bg-neutral-100 cursor-pointer outline-none"
                    onClick={() =>
                      useEditorStore.getState().setViewport({ scale: zoom / 100 })
                    }
                  >
                    {zoom}%
                  </DropdownMenu.Item>
                ))}
                <DropdownMenu.Separator className="h-px bg-neutral-200 my-1" />
                <DropdownMenu.Item
                  className="px-3 py-2 text-sm hover:bg-neutral-100 cursor-pointer outline-none"
                  onClick={resetZoom}
                >
                  Reset to 100%
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          <Button variant="ghost" size="icon" onClick={zoomIn} title="Zoom In">
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-neutral-200" />

        {/* Export */}
        <Button variant="ghost" size="icon" title="Export">
          <Download className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
