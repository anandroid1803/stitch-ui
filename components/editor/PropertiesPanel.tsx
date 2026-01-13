'use client';

import { useDocumentStore, useEditorStore } from '@/stores';
import { Input, ColorPicker } from '@/components/ui';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  Lock,
  Unlock,
  Trash2,
  Copy,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { CanvasElement, TextElement, ShapeElement } from '@/types/document';

export function PropertiesPanel() {
  const selectedElementIds = useEditorStore((state) => state.selectedElementIds);
  const document = useDocumentStore((state) => state.document);
  const currentSlideId = useDocumentStore((state) => state.currentSlideId);
  const updateElement = useDocumentStore((state) => state.updateElement);
  const deleteElements = useDocumentStore((state) => state.deleteElements);
  const duplicateElements = useDocumentStore((state) => state.duplicateElements);
  const reorderElement = useDocumentStore((state) => state.reorderElement);
  const deselectAll = useEditorStore((state) => state.deselectAll);
  const selectElements = useEditorStore((state) => state.selectElements);

  // Get selected elements
  const currentSlide = document?.slides.find((s) => s.id === currentSlideId);
  const selectedElements = currentSlide?.elements.filter((el) =>
    selectedElementIds.includes(el.id)
  ) ?? [];

  const selectedElement = selectedElements.length === 1 ? selectedElements[0] : null;

  const handleDelete = () => {
    deleteElements(selectedElementIds);
    deselectAll();
  };

  const handleDuplicate = () => {
    const newIds = duplicateElements(selectedElementIds);
    selectElements(newIds);
  };

  const handleUpdate = (updates: Partial<CanvasElement>) => {
    if (selectedElement) {
      updateElement(selectedElement.id, updates);
    }
  };

  if (selectedElements.length === 0) {
    return (
      <div className="w-64 bg-white border-l border-neutral-200 p-4">
        <p className="text-sm text-neutral-500 text-center">
          Select an element to view its properties
        </p>
      </div>
    );
  }

  if (selectedElements.length > 1) {
    return (
      <div className="w-64 bg-white border-l border-neutral-200 p-4">
        <div className="space-y-4">
          <p className="text-sm font-medium">
            {selectedElements.length} elements selected
          </p>

          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
            <button
              onClick={handleDuplicate}
              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-neutral-100 rounded"
            >
              <Copy className="w-4 h-4" />
              Duplicate
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Single element selected - TypeScript needs reassurance after the length checks above
  const element = selectedElement!;

  return (
    <div className="w-64 bg-white border-l border-neutral-200 overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium capitalize">
            {element.type}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() =>
                handleUpdate({ locked: !element.locked })
              }
              className="p-1 hover:bg-neutral-100 rounded"
              title={element.locked ? 'Unlock' : 'Lock'}
            >
              {element.locked ? (
                <Lock className="w-4 h-4" />
              ) : (
                <Unlock className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={handleDelete}
              className="p-1 hover:bg-red-50 text-red-600 rounded"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Position */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-neutral-500 uppercase">
            Position
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-neutral-400">X</label>
              <input
                type="number"
                value={Math.round(element.x)}
                onChange={(e) =>
                  handleUpdate({ x: parseFloat(e.target.value) || 0 })
                }
                className="w-full h-8 px-2 text-sm border border-neutral-200 rounded"
              />
            </div>
            <div>
              <label className="text-xs text-neutral-400">Y</label>
              <input
                type="number"
                value={Math.round(element.y)}
                onChange={(e) =>
                  handleUpdate({ y: parseFloat(e.target.value) || 0 })
                }
                className="w-full h-8 px-2 text-sm border border-neutral-200 rounded"
              />
            </div>
          </div>
        </div>

        {/* Size */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-neutral-500 uppercase">
            Size
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-neutral-400">W</label>
              <input
                type="number"
                value={Math.round(element.width)}
                onChange={(e) =>
                  handleUpdate({ width: parseFloat(e.target.value) || 1 })
                }
                className="w-full h-8 px-2 text-sm border border-neutral-200 rounded"
              />
            </div>
            <div>
              <label className="text-xs text-neutral-400">H</label>
              <input
                type="number"
                value={Math.round(element.height)}
                onChange={(e) =>
                  handleUpdate({ height: parseFloat(e.target.value) || 1 })
                }
                className="w-full h-8 px-2 text-sm border border-neutral-200 rounded"
              />
            </div>
          </div>
        </div>

        {/* Rotation & Opacity */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-neutral-400">Rotation</label>
              <input
                type="number"
                value={Math.round(element.rotation)}
                onChange={(e) =>
                  handleUpdate({ rotation: parseFloat(e.target.value) || 0 })
                }
                className="w-full h-8 px-2 text-sm border border-neutral-200 rounded"
              />
            </div>
            <div>
              <label className="text-xs text-neutral-400">Opacity</label>
              <input
                type="number"
                min={0}
                max={100}
                value={Math.round(element.opacity * 100)}
                onChange={(e) =>
                  handleUpdate({
                    opacity: Math.min(1, Math.max(0, parseFloat(e.target.value) / 100)) || 1,
                  })
                }
                className="w-full h-8 px-2 text-sm border border-neutral-200 rounded"
              />
            </div>
          </div>
        </div>

        {/* Layer controls */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-neutral-500 uppercase">
            Layer
          </label>
          <div className="flex gap-1">
            <button
              onClick={() => reorderElement(element.id, 'top')}
              className="flex-1 h-8 flex items-center justify-center hover:bg-neutral-100 rounded border border-neutral-200"
              title="Bring to Front"
            >
              <ChevronsUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => reorderElement(element.id, 'up')}
              className="flex-1 h-8 flex items-center justify-center hover:bg-neutral-100 rounded border border-neutral-200"
              title="Bring Forward"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => reorderElement(element.id, 'down')}
              className="flex-1 h-8 flex items-center justify-center hover:bg-neutral-100 rounded border border-neutral-200"
              title="Send Backward"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
            <button
              onClick={() => reorderElement(element.id, 'bottom')}
              className="flex-1 h-8 flex items-center justify-center hover:bg-neutral-100 rounded border border-neutral-200"
              title="Send to Back"
            >
              <ChevronsDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Type-specific properties */}
        {element.type === 'shape' && (
          <ShapeProperties
            element={element as ShapeElement}
            onUpdate={handleUpdate}
          />
        )}

        {element.type === 'text' && (
          <TextProperties
            element={element as TextElement}
            onUpdate={handleUpdate}
          />
        )}
      </div>
    </div>
  );
}

interface ShapePropertiesProps {
  element: ShapeElement;
  onUpdate: (updates: Partial<ShapeElement>) => void;
}

function ShapeProperties({ element, onUpdate }: ShapePropertiesProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-medium text-neutral-500 uppercase">
          Fill
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={element.fill}
            onChange={(e) => onUpdate({ fill: e.target.value })}
            className="w-8 h-8 rounded cursor-pointer"
          />
          <input
            type="text"
            value={element.fill}
            onChange={(e) => onUpdate({ fill: e.target.value })}
            className="flex-1 h-8 px-2 text-sm font-mono border border-neutral-200 rounded"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-neutral-500 uppercase">
          Stroke
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={element.stroke}
            onChange={(e) => onUpdate({ stroke: e.target.value })}
            className="w-8 h-8 rounded cursor-pointer"
          />
          <input
            type="text"
            value={element.stroke}
            onChange={(e) => onUpdate({ stroke: e.target.value })}
            className="flex-1 h-8 px-2 text-sm font-mono border border-neutral-200 rounded"
          />
        </div>
        <div>
          <label className="text-xs text-neutral-400">Stroke Width</label>
          <input
            type="number"
            min={0}
            max={50}
            value={element.strokeWidth}
            onChange={(e) =>
              onUpdate({ strokeWidth: parseFloat(e.target.value) || 0 })
            }
            className="w-full h-8 px-2 text-sm border border-neutral-200 rounded"
          />
        </div>
      </div>

      {element.shapeType === 'rectangle' && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-neutral-500 uppercase">
            Corner Radius
          </label>
          <input
            type="number"
            min={0}
            value={element.cornerRadius ?? 0}
            onChange={(e) =>
              onUpdate({ cornerRadius: parseFloat(e.target.value) || 0 })
            }
            className="w-full h-8 px-2 text-sm border border-neutral-200 rounded"
          />
        </div>
      )}
    </div>
  );
}

interface TextPropertiesProps {
  element: TextElement;
  onUpdate: (updates: Partial<TextElement>) => void;
}

function TextProperties({ element, onUpdate }: TextPropertiesProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-medium text-neutral-500 uppercase">
          Font
        </label>
        <select
          value={element.fontFamily}
          onChange={(e) => onUpdate({ fontFamily: e.target.value })}
          className="w-full h-8 px-2 text-sm border border-neutral-200 rounded"
        >
          <option value="Inter">Inter</option>
          <option value="Arial">Arial</option>
          <option value="Georgia">Georgia</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Courier New">Courier New</option>
        </select>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-neutral-400">Size</label>
            <input
              type="number"
              min={8}
              max={200}
              value={element.fontSize}
              onChange={(e) =>
                onUpdate({ fontSize: parseFloat(e.target.value) || 16 })
              }
              className="w-full h-8 px-2 text-sm border border-neutral-200 rounded"
            />
          </div>
          <div>
            <label className="text-xs text-neutral-400">Weight</label>
            <select
              value={element.fontWeight}
              onChange={(e) =>
                onUpdate({ fontWeight: parseInt(e.target.value) })
              }
              className="w-full h-8 px-2 text-sm border border-neutral-200 rounded"
            >
              <option value={300}>Light</option>
              <option value={400}>Regular</option>
              <option value={500}>Medium</option>
              <option value={600}>Semibold</option>
              <option value={700}>Bold</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-neutral-500 uppercase">
          Alignment
        </label>
        <div className="flex gap-1">
          {(['left', 'center', 'right'] as const).map((align) => (
            <button
              key={align}
              onClick={() => onUpdate({ textAlign: align })}
              className={cn(
                'flex-1 h-8 flex items-center justify-center rounded border',
                element.textAlign === align
                  ? 'bg-blue-50 border-blue-200 text-blue-600'
                  : 'border-neutral-200 hover:bg-neutral-50'
              )}
            >
              {align === 'left' && <AlignLeft className="w-4 h-4" />}
              {align === 'center' && <AlignCenter className="w-4 h-4" />}
              {align === 'right' && <AlignRight className="w-4 h-4" />}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-neutral-500 uppercase">
          Color
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={element.fill}
            onChange={(e) => onUpdate({ fill: e.target.value })}
            className="w-8 h-8 rounded cursor-pointer"
          />
          <input
            type="text"
            value={element.fill}
            onChange={(e) => onUpdate({ fill: e.target.value })}
            className="flex-1 h-8 px-2 text-sm font-mono border border-neutral-200 rounded"
          />
        </div>
      </div>
    </div>
  );
}
