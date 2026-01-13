'use client';

import { useDocumentStore, useEditorStore } from '@/stores';
import { Plus, ChevronDown, Copy, Trash2, MoreVertical, Lock, Unlock, ArrowUp, ArrowDown, ChevronsUp, ChevronsDown, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import * as ContextMenu from '@radix-ui/react-context-menu';
import { cn } from '@/lib/utils/cn';
import type { CanvasElement, TextElement as TextElementType, ShapeElement as ShapeElementType } from '@/types/document';

export function RightPanel() {
  const selectedElementIds = useEditorStore((state) => state.selectedElementIds);
  const hasSelection = selectedElementIds.length > 0;

  return (
    <div className="w-72 bg-neutral-50 rounded-2xl shadow-lg border border-neutral-200 flex flex-col overflow-hidden max-h-[calc(100vh-120px)]">
      {hasSelection ? <PropertiesView /> : <SlidesView />}
    </div>
  );
}

function SlidesView() {
  const document = useDocumentStore((state) => state.document);
  const currentSlideId = useDocumentStore((state) => state.currentSlideId);
  const setCurrentSlide = useDocumentStore((state) => state.setCurrentSlide);
  const addSlide = useDocumentStore((state) => state.addSlide);
  const deleteSlide = useDocumentStore((state) => state.deleteSlide);
  const duplicateSlide = useDocumentStore((state) => state.duplicateSlide);

  const slides = document?.slides ?? [];

  return (
    <>
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-neutral-200">
        <span className="text-sm font-medium text-neutral-700">Slides</span>
        <button
          onClick={() => addSlide(currentSlideId ?? undefined)}
          className="p-1.5 hover:bg-neutral-200 rounded-lg transition-colors"
          title="Add Slide"
        >
          <Plus className="w-4 h-4 text-neutral-600" />
        </button>
      </div>

      {/* Slides list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {slides.map((slide, index) => (
          <ContextMenu.Root key={slide.id}>
            <ContextMenu.Trigger asChild>
              <div className="flex items-start gap-2">
                <span className="text-xs text-neutral-400 mt-1 w-4">{index + 1}.</span>
                <button
                  onClick={() => setCurrentSlide(slide.id)}
                  className={cn(
                    'flex-1 aspect-video rounded-lg border-2 overflow-hidden transition-all relative group',
                    currentSlideId === slide.id
                      ? 'border-fuchsia-500 shadow-md'
                      : 'border-neutral-200 hover:border-neutral-300'
                  )}
                >
                  {/* Thumbnail or placeholder */}
                  {slide.thumbnail ? (
                    <img
                      src={slide.thumbnail}
                      alt={slide.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{
                        backgroundColor:
                          slide.backgroundColor ||
                          document?.settings.backgroundColor ||
                          '#ffffff',
                      }}
                    >
                      {/* Show mini preview of elements */}
                      {slide.elements.length > 0 && (
                        <div className="absolute inset-0 p-1">
                          {/* Mini element indicators */}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action button (on hover) */}
                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="p-1 bg-white/90 rounded shadow-sm">
                      <MoreVertical className="w-3 h-3 text-neutral-600" />
                    </div>
                  </div>
                </button>
              </div>
            </ContextMenu.Trigger>

            <ContextMenu.Portal>
              <ContextMenu.Content className="bg-white rounded-lg shadow-lg border border-neutral-200 py-1 min-w-[160px] z-50">
                <ContextMenu.Item
                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-neutral-100 cursor-pointer outline-none"
                  onClick={() => duplicateSlide(slide.id)}
                >
                  <Copy className="w-4 h-4" />
                  Duplicate
                </ContextMenu.Item>
                <ContextMenu.Separator className="h-px bg-neutral-200 my-1" />
                <ContextMenu.Item
                  className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer outline-none"
                  onClick={() => deleteSlide(slide.id)}
                  disabled={slides.length <= 1}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </ContextMenu.Item>
              </ContextMenu.Content>
            </ContextMenu.Portal>
          </ContextMenu.Root>
        ))}
      </div>

      {/* Templates dropdown at bottom */}
      <div className="p-3 border-t border-neutral-200">
        <button className="w-full px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100 rounded-lg flex items-center justify-between transition-colors">
          <span>Templates</span>
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
    </>
  );
}

function PropertiesView() {
  const selectedElementIds = useEditorStore((state) => state.selectedElementIds);
  const document = useDocumentStore((state) => state.document);
  const currentSlideId = useDocumentStore((state) => state.currentSlideId);
  const updateElement = useDocumentStore((state) => state.updateElement);
  const deleteElements = useDocumentStore((state) => state.deleteElements);
  const duplicateElements = useDocumentStore((state) => state.duplicateElements);
  const reorderElement = useDocumentStore((state) => state.reorderElement);
  const deselectAll = useEditorStore((state) => state.deselectAll);
  const selectElements = useEditorStore((state) => state.selectElements);

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

  if (selectedElements.length > 1) {
    return (
      <div className="p-4">
        <div className="space-y-4">
          <p className="text-sm font-medium">
            {selectedElements.length} elements selected
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
            <button
              onClick={handleDuplicate}
              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-neutral-100 rounded-lg"
            >
              <Copy className="w-4 h-4" />
              Duplicate
            </button>
          </div>
        </div>
      </div>
    );
  }

  const element = selectedElement!;

  return (
    <div className="overflow-y-auto">
      <div className="p-4 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium capitalize text-neutral-700">
            {element.type}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => handleUpdate({ locked: !element.locked })}
              className="p-1.5 hover:bg-neutral-100 rounded-lg"
              title={element.locked ? 'Unlock' : 'Lock'}
            >
              {element.locked ? (
                <Lock className="w-4 h-4 text-neutral-600" />
              ) : (
                <Unlock className="w-4 h-4 text-neutral-600" />
              )}
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Position */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
            Position
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-neutral-400">X</label>
              <input
                type="number"
                value={Math.round(element.x)}
                onChange={(e) => handleUpdate({ x: parseFloat(e.target.value) || 0 })}
                className="w-full h-8 px-2 text-sm border border-neutral-200 rounded-lg bg-white"
              />
            </div>
            <div>
              <label className="text-xs text-neutral-400">Y</label>
              <input
                type="number"
                value={Math.round(element.y)}
                onChange={(e) => handleUpdate({ y: parseFloat(e.target.value) || 0 })}
                className="w-full h-8 px-2 text-sm border border-neutral-200 rounded-lg bg-white"
              />
            </div>
          </div>
        </div>

        {/* Size */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
            Size
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-neutral-400">W</label>
              <input
                type="number"
                value={Math.round(element.width)}
                onChange={(e) => handleUpdate({ width: parseFloat(e.target.value) || 1 })}
                className="w-full h-8 px-2 text-sm border border-neutral-200 rounded-lg bg-white"
              />
            </div>
            <div>
              <label className="text-xs text-neutral-400">H</label>
              <input
                type="number"
                value={Math.round(element.height)}
                onChange={(e) => handleUpdate({ height: parseFloat(e.target.value) || 1 })}
                className="w-full h-8 px-2 text-sm border border-neutral-200 rounded-lg bg-white"
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
                onChange={(e) => handleUpdate({ rotation: parseFloat(e.target.value) || 0 })}
                className="w-full h-8 px-2 text-sm border border-neutral-200 rounded-lg bg-white"
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
                className="w-full h-8 px-2 text-sm border border-neutral-200 rounded-lg bg-white"
              />
            </div>
          </div>
        </div>

        {/* Layer controls */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
            Layer
          </label>
          <div className="flex gap-1">
            <button
              onClick={() => reorderElement(element.id, 'top')}
              className="flex-1 h-8 flex items-center justify-center hover:bg-neutral-100 rounded-lg border border-neutral-200"
              title="Bring to Front"
            >
              <ChevronsUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => reorderElement(element.id, 'up')}
              className="flex-1 h-8 flex items-center justify-center hover:bg-neutral-100 rounded-lg border border-neutral-200"
              title="Bring Forward"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => reorderElement(element.id, 'down')}
              className="flex-1 h-8 flex items-center justify-center hover:bg-neutral-100 rounded-lg border border-neutral-200"
              title="Send Backward"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
            <button
              onClick={() => reorderElement(element.id, 'bottom')}
              className="flex-1 h-8 flex items-center justify-center hover:bg-neutral-100 rounded-lg border border-neutral-200"
              title="Send to Back"
            >
              <ChevronsDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Type-specific properties */}
        {element.type === 'shape' && (
          <ShapeProperties element={element as ShapeElementType} onUpdate={handleUpdate} />
        )}

        {element.type === 'text' && (
          <TextProperties element={element as TextElementType} onUpdate={handleUpdate} />
        )}
      </div>
    </div>
  );
}

interface ShapePropertiesProps {
  element: ShapeElementType;
  onUpdate: (updates: Partial<ShapeElementType>) => void;
}

function ShapeProperties({ element, onUpdate }: ShapePropertiesProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
          Fill
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={element.fill}
            onChange={(e) => onUpdate({ fill: e.target.value })}
            className="w-8 h-8 rounded-lg cursor-pointer border border-neutral-200"
          />
          <input
            type="text"
            value={element.fill}
            onChange={(e) => onUpdate({ fill: e.target.value })}
            className="flex-1 h-8 px-2 text-sm font-mono border border-neutral-200 rounded-lg bg-white"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
          Stroke
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={element.stroke}
            onChange={(e) => onUpdate({ stroke: e.target.value })}
            className="w-8 h-8 rounded-lg cursor-pointer border border-neutral-200"
          />
          <input
            type="text"
            value={element.stroke}
            onChange={(e) => onUpdate({ stroke: e.target.value })}
            className="flex-1 h-8 px-2 text-sm font-mono border border-neutral-200 rounded-lg bg-white"
          />
        </div>
        <div>
          <label className="text-xs text-neutral-400">Stroke Width</label>
          <input
            type="number"
            min={0}
            max={50}
            value={element.strokeWidth}
            onChange={(e) => onUpdate({ strokeWidth: parseFloat(e.target.value) || 0 })}
            className="w-full h-8 px-2 text-sm border border-neutral-200 rounded-lg bg-white"
          />
        </div>
      </div>

      {element.shapeType === 'rectangle' && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
            Corner Radius
          </label>
          <input
            type="number"
            min={0}
            value={element.cornerRadius ?? 0}
            onChange={(e) => onUpdate({ cornerRadius: parseFloat(e.target.value) || 0 })}
            className="w-full h-8 px-2 text-sm border border-neutral-200 rounded-lg bg-white"
          />
        </div>
      )}
    </div>
  );
}

interface TextPropertiesProps {
  element: TextElementType;
  onUpdate: (updates: Partial<TextElementType>) => void;
}

function TextProperties({ element, onUpdate }: TextPropertiesProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
          Font
        </label>
        <select
          value={element.fontFamily}
          onChange={(e) => onUpdate({ fontFamily: e.target.value })}
          className="w-full h-8 px-2 text-sm border border-neutral-200 rounded-lg bg-white"
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
              onChange={(e) => onUpdate({ fontSize: parseFloat(e.target.value) || 16 })}
              className="w-full h-8 px-2 text-sm border border-neutral-200 rounded-lg bg-white"
            />
          </div>
          <div>
            <label className="text-xs text-neutral-400">Weight</label>
            <select
              value={element.fontWeight}
              onChange={(e) => onUpdate({ fontWeight: parseInt(e.target.value) })}
              className="w-full h-8 px-2 text-sm border border-neutral-200 rounded-lg bg-white"
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
        <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
          Alignment
        </label>
        <div className="flex gap-1">
          {(['left', 'center', 'right'] as const).map((align) => (
            <button
              key={align}
              onClick={() => onUpdate({ textAlign: align })}
              className={cn(
                'flex-1 h-8 flex items-center justify-center rounded-lg border',
                element.textAlign === align
                  ? 'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-600'
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
        <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
          Color
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={element.fill}
            onChange={(e) => onUpdate({ fill: e.target.value })}
            className="w-8 h-8 rounded-lg cursor-pointer border border-neutral-200"
          />
          <input
            type="text"
            value={element.fill}
            onChange={(e) => onUpdate({ fill: e.target.value })}
            className="flex-1 h-8 px-2 text-sm font-mono border border-neutral-200 rounded-lg bg-white"
          />
        </div>
      </div>
    </div>
  );
}
