'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useDocumentStore, useEditorStore } from '@/stores';
import { Plus, Copy, Trash2, MoreVertical, Lock, Unlock, ArrowUp, ArrowDown, ChevronsUp, ChevronsDown, AlignLeft, AlignCenter, AlignRight, Layers, Share2, Presentation, Grid3x3, ChevronDown } from 'lucide-react';
import * as ContextMenu from '@radix-ui/react-context-menu';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { cn } from '@/lib/utils/cn';
import type { CanvasElement, TextElement as TextElementType, ShapeElement as ShapeElementType, LineElement as LineElementType } from '@/types/document';

// Use explicit pixel values to avoid design system spacing conflicts
const styles = {
  panel: { width: 208 },
  icon: { width: 16, height: 16 },
  iconSm: { width: 12, height: 12 },
  input: { height: 32 },
  colorInput: { width: 32, height: 32 },
  button: { height: 32 },
  padding: { padding: 16 },
  paddingSm: { padding: 12 },
  gap: { gap: 8 },
  gapSm: { gap: 4 },
};

export function RightPanel() {
  const selectedElementIds = useEditorStore((state) => state.selectedElementIds);
  const hasSelection = selectedElementIds.length > 0;

  // State for resizable sections
  const [slidesHeight, setSlidesHeight] = useState(300); // Default height for slides section
  const [isDragging, setIsDragging] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);

  const minSlidesHeight = 150;
  const minLayersHeight = 100;

  const handleDividerMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startYRef.current = e.clientY;
    startHeightRef.current = slidesHeight;
  }, [slidesHeight]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !panelRef.current) return;

    const panelRect = panelRef.current.getBoundingClientRect();
    const maxSlidesHeight = panelRect.height - minLayersHeight - 40; // 40px for headers/divider

    const delta = e.clientY - startYRef.current;
    const newHeight = Math.max(
      minSlidesHeight,
      Math.min(maxSlidesHeight, startHeightRef.current + delta)
    );
    setSlidesHeight(newHeight);
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add global mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Show properties view when element selected, otherwise show slides + layers
  if (hasSelection) {
    return (
      <div
        ref={panelRef}
        className="bg-[#F2F3F5] p-2 flex flex-col overflow-hidden rounded-2xl "
        style={{ ...styles.panel, height: 'calc(100vh - 16px)' }}
      >
        <div className="bg-white rounded-lg h-full overflow-hidden flex flex-col">
          <PropertiesView />
        </div>
      </div>
    );
  }

  return (
    <div
      ref={panelRef}
      className="bg-[#F2F3F5] p-2 flex flex-col overflow-hidden rounded-2xl"
      style={{ ...styles.panel, height: 'calc(100vh - 16px)' }}
      onMouseMove={isDragging ? (e) => handleMouseMove(e.nativeEvent) : undefined}
      onMouseUp={isDragging ? handleMouseUp : undefined}
      onMouseLeave={isDragging ? handleMouseUp : undefined}
    >
      {/* Users Section */}
      <div className="bg-white/50 border border-white rounded-t-2xl rounded-b-sm mb-1 p-4">
        <div className="flex items-center justify-between gap-2 px-3 py-3">
          {/* Overlapping user badges */}
          <div className="flex items-center">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xs font-normal"
              style={{ backgroundColor: '#1B81B0' }}
            >
              A
            </div>
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xs font-normal -ml-2"
              style={{ backgroundColor: '#B01B4F' }}
            >
              M
            </div>
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xs font-normal -ml-2"
              style={{ backgroundColor: '#651BB0' }}
            >
              Z
            </div>
          </div>
          {/* Action buttons */}
          <div className="flex items-center rounded-full bg-white border border-[#F2F3F5] overflow-hidden">
            <button
              className="w-[32px] h-[32px] flex items-center justify-center transition-colors border-r border-[#F2F3F5] hover:bg-primary/10 group"
              title="Present"
            >
              <Presentation className="w-6 h-6 text-text-tertiary group-hover:text-primary" />
            </button>
            <button
              className="w-[32px] h-[32px] flex items-center justify-center transition-colors border-r border-[#F2F3F5] hover:bg-primary/10 group"
              title="Share"
            >
              <Share2 className="w-6 h-6 text-text-tertiary group-hover:text-primary" />
            </button>
            <button
              className="w-[32px] h-[32px] flex items-center justify-center transition-colors hover:bg-primary/10 group"
              title="Show All"
            >
              <ChevronDown className="w-6 h-6 text-text-tertiary group-hover:text-primary" />
            </button>
          </div>
        </div>
      </div>

      {/* Slides Section */}
      <div style={{ height: slidesHeight, minHeight: minSlidesHeight }} className="flex flex-col overflow-hidden bg-white/50 border border-white rounded-sm ">
        <SlidesView />
      </div>

      {/* Resizable Divider */}
      <div
        className={cn(
          'h-2 cursor-row-resize flex items-center justify-center hover:bg-neutral-100 transition-colors',
          isDragging && 'bg-neutral-200'
        )}
        onMouseDown={handleDividerMouseDown}
      >
        <div className="w-8 h-1 rounded-full bg-neutral-300" />
      </div>

      {/* Layers Section */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white/50 bg-white/50 border border-white rounded-b-xl rounded-t-sm" style={{ minHeight: minLayersHeight }}>
        <LayersView />
      </div>
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
  const updateSlideBackground = useDocumentStore((state) => state.updateSlideBackground);

  const slides = document?.slides ?? [];

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-[12px] pt-[12px] pb-[8px]">
        <span style={{ fontSize: 14, fontWeight: 600 }} className="text-text-tertiary font-semibold">Slides</span>
        <button
          onClick={() => addSlide(currentSlideId ?? undefined)}
          className="hover:bg-primary/10 rounded-lg transition-colors group"
          title="Add Slide"
          style={{ padding: 6 }}
        >
          <Plus style={styles.icon} className="text-text-tertiary group-hover:text-primary" />
        </button>
      </div>

      {/* Slides list */}
      <div className="flex-1 overflow-y-auto" style={{ padding: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {slides.map((slide, index) => {
            const backgroundValue =
              slide.backgroundColor ||
              document?.settings.backgroundColor ||
              '#ffffff';

            const MenuContent = ({ as }: { as: typeof ContextMenu | typeof DropdownMenu }) => {
              const Item = as.Item;
              const Separator = as.Separator;
              const Content = as.Content;

              return (
                <Content className="bg-[#F2F3F5] p-1 rounded-[16px] shadow-lg z-50 overflow-hidden" style={{ minWidth: 180}}>
                  <Item
                    className="flex items-center hover:bg-neutral-100 cursor-pointer outline-none text-text-secondary bg-white rounded-t-[14px] rounded-b-sm mb-1" 
                    style={{ gap: 8, padding: '12px 12px', fontSize: 14, fontWeight: 500 }}
                    onSelect={(e) => e.preventDefault()}
                  >
                    <div className="flex items-center w-full gap-3">
                      <div className="relative">
                        <div
                          className="w-8 h-8 rounded-full cursor-pointer border border-[#CACACC]"
                          style={{ backgroundColor: backgroundValue }}
                          onClick={(e) => {
                            e.stopPropagation();
                            const colorInput = e.currentTarget.nextElementSibling as HTMLInputElement;
                            colorInput?.click();
                          }}
                        />
                        <input
                          type="color"
                          aria-label="Slide background color"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          value={backgroundValue}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => updateSlideBackground(slide.id, e.target.value)}
                        />
                      </div>
                      <span>Background</span>
                    </div>
                  </Item>
                  <Item
                    className="flex items-center hover:bg-neutral-100 cursor-pointer outline-none text-text-secondary bg-white border border-white rounded-sm mb-1"
                    style={{ gap: 8, padding: '12px 12px', fontSize: 14, fontWeight: 500 }}
                    onClick={() => duplicateSlide(slide.id)}
                  >
                    <Copy style={styles.icon} />
                    Duplicate
                  </Item>
                  <Item
                    className="flex items-center text-red-600 hover:bg-red-50 cursor-pointer outline-none text-text-secondary bg-white border border-white rounded-t-sm rounded-b-[14px]"
                    style={{ gap: 8, padding: '12px 12px', fontSize: 14, fontWeight: 500 }}
                    onClick={() => deleteSlide(slide.id)}
                    disabled={slides.length <= 1}
                  >
                    <Trash2 style={styles.icon} className="text-red-600 group-hover:text-red-600" />
                    Delete
                  </Item>
                </Content>
              );
            };

            return (
              <div key={slide.id} className="relative">
                <ContextMenu.Root>
                  <ContextMenu.Trigger asChild>
                    <div className="flex items-start" style={{ gap: 4 }}>
                      <span 
                        style={{ fontSize: 12, marginTop: 4, width: 16 }} 
                        className={currentSlideId === slide.id ? 'text-text-primary font-bold' : 'text-text-secondary'}
                      >
                        {index + 1}.
                      </span>
                      <div className="flex-1 relative group">
                        <button
                          onClick={() => setCurrentSlide(slide.id)}
                          className={cn(
                            'w-full aspect-video rounded-lg border-1 overflow-hidden transition-all',
                            currentSlideId === slide.id
                              ? 'border-primary shadow-lg'
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
                                backgroundColor: backgroundValue,
                              }}
                            />
                          )}
                        </button>
                        
                        {/* Action button (dropdown) - positioned outside to avoid nested buttons */}
                        <DropdownMenu.Root modal={false}>
                          <DropdownMenu.Trigger asChild>
                            <div
                              role="button"
                              tabIndex={0}
                              className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-white/90 rounded cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                              }}
                              onPointerDown={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }
                              }}
                            >
                              <MoreVertical style={styles.iconSm} className="text-neutral-600" />
                            </div>
                          </DropdownMenu.Trigger>
                          <DropdownMenu.Portal>
                            <MenuContent as={DropdownMenu} />
                          </DropdownMenu.Portal>
                        </DropdownMenu.Root>
                      </div>
                    </div>
                  </ContextMenu.Trigger>

                  <ContextMenu.Portal>
                    <MenuContent as={ContextMenu} />
                  </ContextMenu.Portal>
                </ContextMenu.Root>
              </div>
            );
          })}
        </div>
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
      <div style={styles.padding}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 14, fontWeight: 500 }}>
            {selectedElements.length} elements selected
          </p>
          <div className="flex" style={{ gap: 8 }}>
            <button
              onClick={handleDelete}
              className="flex items-center text-red-600 hover:bg-red-50 rounded-lg"
              style={{ gap: 8, padding: '8px 12px', fontSize: 14 }}
            >
              <Trash2 style={styles.icon} />
              Delete
            </button>
            <button
              onClick={handleDuplicate}
              className="flex items-center hover:bg-neutral-100 rounded-lg"
              style={{ gap: 8, padding: '8px 12px', fontSize: 14 }}
            >
              <Copy style={styles.icon} />
              Duplicate
            </button>
          </div>
        </div>
      </div>
    );
  }

  const element = selectedElement!;

  const inputStyle = {
    width: '100%',
    height: 32,
    padding: '0 8px',
    fontSize: 14,
    border: '1px solid #e5e5e5',
    borderRadius: 8,
    backgroundColor: 'white',
  };

  const labelStyle = {
    fontSize: 11,
    fontWeight: 500,
    color: '#737373',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  };

  const smallLabelStyle = {
    fontSize: 11,
    color: '#a3a3a3',
  };

  return (
    <div className="overflow-y-auto">
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <span style={{ fontSize: 14, fontWeight: 500, textTransform: 'capitalize' }} className="text-neutral-700">
            {element.type}
          </span>
          <div className="flex" style={{ gap: 4 }}>
            <button
              onClick={() => handleUpdate({ locked: !element.locked })}
              className="hover:bg-neutral-100 rounded-lg"
              title={element.locked ? 'Unlock' : 'Lock'}
              style={{ padding: 6 }}
            >
              {element.locked ? (
                <Lock style={styles.icon} className="text-neutral-600" />
              ) : (
                <Unlock style={styles.icon} className="text-neutral-600" />
              )}
            </button>
            <button
              onClick={handleDelete}
              className="hover:bg-red-50 text-red-600 rounded-lg"
              title="Delete"
              style={{ padding: 6 }}
            >
              <Trash2 style={styles.icon} />
            </button>
          </div>
        </div>

        {/* Position */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={labelStyle}>Position</label>
          <div className="grid grid-cols-2" style={{ gap: 8 }}>
            <div>
              <label style={smallLabelStyle}>X</label>
              <input
                type="number"
                value={Math.round(element.x)}
                onChange={(e) => handleUpdate({ x: parseFloat(e.target.value) || 0 })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={smallLabelStyle}>Y</label>
              <input
                type="number"
                value={Math.round(element.y)}
                onChange={(e) => handleUpdate({ y: parseFloat(e.target.value) || 0 })}
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Size */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={labelStyle}>Size</label>
          <div className="grid grid-cols-2" style={{ gap: 8 }}>
            <div>
              <label style={smallLabelStyle}>W</label>
              <input
                type="number"
                value={Math.round(element.width)}
                onChange={(e) => handleUpdate({ width: parseFloat(e.target.value) || 1 })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={smallLabelStyle}>H</label>
              <input
                type="number"
                value={Math.round(element.height)}
                onChange={(e) => handleUpdate({ height: parseFloat(e.target.value) || 1 })}
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Rotation & Opacity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="grid grid-cols-2" style={{ gap: 8 }}>
            <div>
              <label style={smallLabelStyle}>Rotation</label>
              <input
                type="number"
                value={Math.round(element.rotation)}
                onChange={(e) => handleUpdate({ rotation: parseFloat(e.target.value) || 0 })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={smallLabelStyle}>Opacity</label>
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
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Layer controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={labelStyle}>Layer</label>
          <div className="flex" style={{ gap: 4 }}>
            {[
              { icon: ChevronsUp, action: 'top' as const, title: 'Bring to Front' },
              { icon: ArrowUp, action: 'up' as const, title: 'Bring Forward' },
              { icon: ArrowDown, action: 'down' as const, title: 'Send Backward' },
              { icon: ChevronsDown, action: 'bottom' as const, title: 'Send to Back' },
            ].map(({ icon: Icon, action, title }) => (
              <button
                key={action}
                onClick={() => reorderElement(element.id, action)}
                className="flex-1 flex items-center justify-center hover:bg-neutral-100 rounded-lg border border-neutral-200"
                title={title}
                style={{ height: 32 }}
              >
                <Icon style={styles.icon} />
              </button>
            ))}
          </div>
        </div>

        {/* Type-specific properties */}
        {element.type === 'shape' && (
          <ShapeProperties element={element as ShapeElementType} onUpdate={handleUpdate} />
        )}

        {element.type === 'text' && (
          <TextProperties element={element as TextElementType} onUpdate={handleUpdate} />
        )}

        {element.type === 'line' && (
          <LineProperties element={element as LineElementType} onUpdate={handleUpdate} />
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
  const inputStyle = {
    width: '100%',
    height: 32,
    padding: '0 8px',
    fontSize: 14,
    border: '1px solid #e5e5e5',
    borderRadius: 8,
    backgroundColor: 'white',
  };

  const labelStyle = {
    fontSize: 11,
    fontWeight: 500,
    color: '#737373',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  };

  const smallLabelStyle = {
    fontSize: 11,
    color: '#a3a3a3',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={labelStyle}>Fill</label>
        <div className="flex items-center" style={{ gap: 8 }}>
          <input
            type="color"
            value={element.fill}
            onChange={(e) => onUpdate({ fill: e.target.value })}
            className="rounded-lg cursor-pointer border border-neutral-200"
            style={{ width: 32, height: 32 }}
          />
          <input
            type="text"
            value={element.fill}
            onChange={(e) => onUpdate({ fill: e.target.value })}
            className="flex-1 font-mono"
            style={inputStyle}
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={labelStyle}>Stroke</label>
        <div className="flex items-center" style={{ gap: 8 }}>
          <input
            type="color"
            value={element.stroke}
            onChange={(e) => onUpdate({ stroke: e.target.value })}
            className="rounded-lg cursor-pointer border border-neutral-200"
            style={{ width: 32, height: 32 }}
          />
          <input
            type="text"
            value={element.stroke}
            onChange={(e) => onUpdate({ stroke: e.target.value })}
            className="flex-1 font-mono"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={smallLabelStyle}>Stroke Width</label>
          <input
            type="number"
            min={0}
            max={50}
            value={element.strokeWidth}
            onChange={(e) => onUpdate({ strokeWidth: parseFloat(e.target.value) || 0 })}
            style={inputStyle}
          />
        </div>
      </div>

      {element.shapeType === 'rectangle' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={labelStyle}>Corner Radius</label>
          <input
            type="number"
            min={0}
            value={element.cornerRadius ?? 0}
            onChange={(e) => onUpdate({ cornerRadius: parseFloat(e.target.value) || 0 })}
            style={inputStyle}
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
  const inputStyle = {
    width: '100%',
    height: 32,
    padding: '0 8px',
    fontSize: 14,
    border: '1px solid #e5e5e5',
    borderRadius: 8,
    backgroundColor: 'white',
  };

  const labelStyle = {
    fontSize: 11,
    fontWeight: 500,
    color: '#737373',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  };

  const smallLabelStyle = {
    fontSize: 11,
    color: '#a3a3a3',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={labelStyle}>Font</label>
        <select
          value={element.fontFamily}
          onChange={(e) => onUpdate({ fontFamily: e.target.value })}
          style={inputStyle}
        >
          <option value="Inter">Inter</option>
          <option value="Arial">Arial</option>
          <option value="Georgia">Georgia</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Courier New">Courier New</option>
        </select>

        <div className="grid grid-cols-2" style={{ gap: 8 }}>
          <div>
            <label style={smallLabelStyle}>Size</label>
            <input
              type="number"
              min={8}
              max={200}
              value={element.fontSize}
              onChange={(e) => onUpdate({ fontSize: parseFloat(e.target.value) || 16 })}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={smallLabelStyle}>Weight</label>
            <select
              value={element.fontWeight}
              onChange={(e) => onUpdate({ fontWeight: parseInt(e.target.value) })}
              style={inputStyle}
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={labelStyle}>Alignment</label>
        <div className="flex" style={{ gap: 4 }}>
          {(['left', 'center', 'right'] as const).map((align) => (
            <button
              key={align}
              onClick={() => onUpdate({ textAlign: align })}
              className={cn(
                'flex-1 flex items-center justify-center rounded-lg border',
                element.textAlign === align
                  ? 'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-600'
                  : 'border-neutral-200 hover:bg-neutral-50'
              )}
              style={{ height: 32 }}
            >
              {align === 'left' && <AlignLeft style={styles.icon} />}
              {align === 'center' && <AlignCenter style={styles.icon} />}
              {align === 'right' && <AlignRight style={styles.icon} />}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={labelStyle}>Color</label>
        <div className="flex items-center" style={{ gap: 8 }}>
          <input
            type="color"
            value={element.fill}
            onChange={(e) => onUpdate({ fill: e.target.value })}
            className="rounded-lg cursor-pointer border border-neutral-200"
            style={{ width: 32, height: 32 }}
          />
          <input
            type="text"
            value={element.fill}
            onChange={(e) => onUpdate({ fill: e.target.value })}
            className="flex-1 font-mono"
            style={inputStyle}
          />
        </div>
      </div>
    </div>
  );
}

interface LinePropertiesProps {
  element: LineElementType;
  onUpdate: (updates: Partial<LineElementType>) => void;
}

function LineProperties({ element, onUpdate }: LinePropertiesProps) {
  const inputStyle = {
    width: '100%',
    height: 32,
    padding: '0 8px',
    fontSize: 14,
    border: '1px solid #e5e5e5',
    borderRadius: 8,
    backgroundColor: 'white',
  };

  const labelStyle = {
    fontSize: 11,
    fontWeight: 500,
    color: '#737373',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  };

  const smallLabelStyle = {
    fontSize: 11,
    color: '#a3a3a3',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={labelStyle}>Stroke</label>
        <div className="flex items-center" style={{ gap: 8 }}>
          <input
            type="color"
            value={element.stroke}
            onChange={(e) => onUpdate({ stroke: e.target.value })}
            className="rounded-lg cursor-pointer border border-neutral-200"
            style={{ width: 32, height: 32 }}
          />
          <input
            type="text"
            value={element.stroke}
            onChange={(e) => onUpdate({ stroke: e.target.value })}
            className="flex-1 font-mono"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={smallLabelStyle}>Stroke Width</label>
          <input
            type="number"
            min={1}
            max={50}
            value={element.strokeWidth}
            onChange={(e) => onUpdate({ strokeWidth: parseFloat(e.target.value) || 1 })}
            style={inputStyle}
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={labelStyle}>Line Cap</label>
        <select
          value={element.lineCap}
          onChange={(e) => onUpdate({ lineCap: e.target.value as 'butt' | 'round' | 'square' })}
          style={inputStyle}
        >
          <option value="round">Round</option>
          <option value="butt">Butt</option>
          <option value="square">Square</option>
        </select>
      </div>
    </div>
  );
}

// Layers view - placeholder for future implementation
function LayersView() {
  const document = useDocumentStore((state) => state.document);
  const currentSlideId = useDocumentStore((state) => state.currentSlideId);
  const selectedElementIds = useEditorStore((state) => state.selectedElementIds);
  const selectElement = useEditorStore((state) => state.selectElement);

  const currentSlide = document?.slides.find((s) => s.id === currentSlideId);
  const elements = currentSlide?.elements ?? [];

  // Sort elements by zIndex in descending order (highest on top)
  const sortedElements = [...elements].sort((a, b) => b.zIndex - a.zIndex);

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-[12px] pt-[12px] pb-[8px]">
        <span style={{ fontSize: 14, fontWeight: 600 }} className="text-text-tertiary font-semibold">Elements</span>
      </div>

      {/* Layers list */}
      <div className="flex-1 overflow-y-auto" style={{ padding: 8 }}>
        {sortedElements.length === 0 ? (
          <div className="flex items-center font-medium justify-center h-full text-neutral-400" style={{ fontSize: 13 }}>
            The possibilities are endless
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {sortedElements.map((element) => {
              const isSelected = selectedElementIds.includes(element.id);
              const getElementLabel = () => {
                switch (element.type) {
                  case 'text':
                    return `Text: "${(element as TextElementType).content.substring(0, 15)}${(element as TextElementType).content.length > 15 ? '...' : ''}"`;
                  case 'image':
                    return 'Image';
                  case 'shape':
                    return `Shape: ${(element as ShapeElementType).shapeType}`;
                  case 'line':
                    return 'Line';
                  default:
                    return 'Element';
                }
              };

              return (
                <button
                  key={element.id}
                  onClick={() => selectElement(element.id)}
                  className={cn(
                    'w-full text-left rounded-lg transition-colors truncate',
                    isSelected
                      ? 'bg-fuchsia-50 text-fuchsia-700'
                      : 'hover:bg-neutral-100 text-neutral-600'
                  )}
                  style={{ padding: '8px 12px', fontSize: 13 }}
                >
                  {getElementLabel()}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
