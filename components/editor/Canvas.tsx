'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { Stage, Layer, Rect, Transformer, Group } from 'react-konva';
import type Konva from 'konva';
import { useDocumentStore, useEditorStore, pushStateNow } from '@/stores';
import { ImageElement } from '@/components/elements/ImageElement';
import { TextElement } from '@/components/elements/TextElement';
import { ShapeElement } from '@/components/elements/ShapeElement';
import { LineElement } from '@/components/elements/LineElement';
import { nanoid } from 'nanoid';
import type { CanvasElement, ShapeElement as ShapeElementType } from '@/types/document';

export function Canvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Store state
  const document = useDocumentStore((state) => state.document);
  const currentSlideId = useDocumentStore((state) => state.currentSlideId);
  const addElement = useDocumentStore((state) => state.addElement);
  const updateElement = useDocumentStore((state) => state.updateElement);

  const selectedElementIds = useEditorStore((state) => state.selectedElementIds);
  const selectElement = useEditorStore((state) => state.selectElement);
  const selectElements = useEditorStore((state) => state.selectElements);
  const deselectAll = useEditorStore((state) => state.deselectAll);
  const activeTool = useEditorStore((state) => state.activeTool);
  const setActiveTool = useEditorStore((state) => state.setActiveTool);
  const activeShapeTool = useEditorStore((state) => state.activeShapeTool);
  const viewport = useEditorStore((state) => state.viewport);
  const setViewport = useEditorStore((state) => state.setViewport);
  const panBy = useEditorStore((state) => state.panBy);
  const fillColor = useEditorStore((state) => state.fillColor);
  const strokeColor = useEditorStore((state) => state.strokeColor);
  const strokeWidth = useEditorStore((state) => state.strokeWidth);
  const setIsPanning = useEditorStore((state) => state.setIsPanning);
  const setIsDrawing = useEditorStore((state) => state.setIsDrawing);

  // Get current slide
  const currentSlide = document?.slides.find((s) => s.id === currentSlideId);
  const elements = currentSlide?.elements ?? [];
  const docSettings = document?.settings ?? { width: 1920, height: 1080, backgroundColor: '#ffffff' };

  // Drawing state
  const [isDrawing, setDrawingState] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [tempElement, setTempElement] = useState<CanvasElement | null>(null);

  // Middle mouse button panning state
  const [isMiddleMousePanning, setIsMiddleMousePanning] = useState(false);
  const [lastPanPosition, setLastPanPosition] = useState<{ x: number; y: number } | null>(null);

  // Handle container resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Update transformer when selection changes
  useEffect(() => {
    if (!transformerRef.current || !stageRef.current) return;

    const stage = stageRef.current;
    const transformer = transformerRef.current;

    // Use requestAnimationFrame to ensure nodes are rendered before attaching transformer
    requestAnimationFrame(() => {
      if (!transformer || !stage) return;

      const selectedNodes = selectedElementIds
        .map((id) => stage.findOne(`#${id}`))
        .filter((node): node is Konva.Node => node != null && node.getLayer() != null);

      transformer.nodes(selectedNodes);
      transformer.getLayer()?.batchDraw();
    });
  }, [selectedElementIds]);

  // Handle global mouse up for panning (in case mouse is released outside canvas)
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isMiddleMousePanning) {
        setIsMiddleMousePanning(false);
        setIsPanning(false);
        setLastPanPosition(null);
      }
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [isMiddleMousePanning, setIsPanning]);

  // Handle wheel for pan/zoom
  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();

      const stage = stageRef.current;
      if (!stage) return;

      // Cmd/Ctrl + scroll = zoom
      if (e.evt.metaKey || e.evt.ctrlKey) {
      const oldScale = viewport.scale;
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const mousePointTo = {
        x: (pointer.x - viewport.x) / oldScale,
        y: (pointer.y - viewport.y) / oldScale,
      };

      // Lower scaleBy for smoother zoom (1.03 instead of 1.1)
      const scaleBy = 1.03;
      const direction = e.evt.deltaY > 0 ? -1 : 1;
      let newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
      newScale = Math.max(0.1, Math.min(4, newScale));

      setViewport({
        scale: newScale,
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      });
      } else {
        // Normal scroll = pan up/down
        // Shift + scroll = horizontal pan
        const evt = e.evt;
        let deltaX = evt.deltaX;
        let deltaY = evt.deltaY;

        // If shift is held, use vertical scroll delta for horizontal panning
        if (evt.shiftKey) {
          // Use the dominant scroll direction for horizontal movement
          const dominant = Math.abs(evt.deltaY) > Math.abs(evt.deltaX) ? evt.deltaY : evt.deltaX;
          deltaX = dominant;
          deltaY = 0;
        }

        // Use panBy to only update position, preserving scale
        panBy(-deltaX, -deltaY);
      }
    },
    [viewport, setViewport, panBy]
  );

  // Handle middle mouse button down for panning
  const handleMiddleMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      // Middle mouse button is button 1
      if (e.evt.button === 1) {
        e.evt.preventDefault();
        setIsMiddleMousePanning(true);
        setIsPanning(true);
        setLastPanPosition({ x: e.evt.clientX, y: e.evt.clientY });
      }
    },
    [setIsPanning]
  );

  // Handle middle mouse button move for panning
  const handleMiddleMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!isMiddleMousePanning || !lastPanPosition) return;

      const deltaX = e.evt.clientX - lastPanPosition.x;
      const deltaY = e.evt.clientY - lastPanPosition.y;

      panBy(deltaX, deltaY);
      setLastPanPosition({ x: e.evt.clientX, y: e.evt.clientY });
    },
    [isMiddleMousePanning, lastPanPosition, panBy]
  );

  // Handle middle mouse button up
  const handleMiddleMouseUp = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (e.evt.button === 1 || isMiddleMousePanning) {
        setIsMiddleMousePanning(false);
        setIsPanning(false);
        setLastPanPosition(null);
      }
    },
    [isMiddleMousePanning, setIsPanning]
  );

  // Convert stage coordinates to canvas coordinates
  const getCanvasPoint = (stage: Konva.Stage): { x: number; y: number } | null => {
    const pointer = stage.getPointerPosition();
    if (!pointer) return null;

    return {
      x: (pointer.x - viewport.x) / viewport.scale,
      y: (pointer.y - viewport.y) / viewport.scale,
    };
  };

  // Handle stage click
  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // If clicking on empty area
    if (e.target === e.target.getStage()) {
      deselectAll();
      return;
    }

    // If clicking on the background rect
    if (e.target.name() === 'background') {
      deselectAll();
      return;
    }
  };

  // Handle mouse down for drawing
  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // Handle middle mouse button for panning
    if (e.evt.button === 1) {
      handleMiddleMouseDown(e);
      return;
    }

    // Handle pan tool with left click
    if (activeTool === 'pan' && e.evt.button === 0) {
      setIsMiddleMousePanning(true);
      setIsPanning(true);
      setLastPanPosition({ x: e.evt.clientX, y: e.evt.clientY });
      return;
    }

    if (activeTool === 'select') return;

    const stage = stageRef.current;
    if (!stage) return;

    const point = getCanvasPoint(stage);
    if (!point) return;

    // Allow drawing anywhere on the canvas (including on top of other elements)

    setDrawingState(true);
    setIsDrawing(true);
    setDrawStart(point);

    // Create temporary element based on tool
    if (activeTool === 'rectangle' || activeTool === 'ellipse') {
      const shapeType = activeTool === 'rectangle' ? activeShapeTool : 'ellipse';
      const newElement: ShapeElementType = {
        id: `temp_${nanoid()}`,
        type: 'shape',
        shapeType: shapeType === 'ellipse' ? 'ellipse' : shapeType,
        x: point.x,
        y: point.y,
        width: 0,
        height: 0,
        rotation: 0,
        opacity: 1,
        locked: false,
        zIndex: elements.length,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        cornerRadius: 0,
      };
      setTempElement(newElement);
    } else if (activeTool === 'text') {
      // Add text element immediately on click
      const newElement: CanvasElement = {
        id: nanoid(),
        type: 'text',
        x: point.x,
        y: point.y,
        width: 200,
        height: 50,
        rotation: 0,
        opacity: 1,
        locked: false,
        zIndex: elements.length,
        content: 'Double-click to edit',
        fontFamily: 'Inter',
        fontSize: 24,
        fontWeight: 400,
        fontStyle: 'normal',
        textAlign: 'left',
        fill: '#000000',
      };
      addElement(newElement);
      pushStateNow();
      selectElement(newElement.id);
      setActiveTool('select'); // Reset to select tool after adding text
      setDrawingState(false);
      setIsDrawing(false);
    }
  };

  // Handle mouse move for drawing and panning
  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // Handle middle mouse / pan tool panning
    if (isMiddleMousePanning && lastPanPosition) {
      const deltaX = e.evt.clientX - lastPanPosition.x;
      const deltaY = e.evt.clientY - lastPanPosition.y;
      panBy(deltaX, deltaY);
      setLastPanPosition({ x: e.evt.clientX, y: e.evt.clientY });
      return;
    }

    if (!isDrawing || !drawStart || !tempElement) return;

    const stage = stageRef.current;
    if (!stage) return;

    const point = getCanvasPoint(stage);
    if (!point) return;

    // Calculate dimensions
    const width = point.x - drawStart.x;
    const height = point.y - drawStart.y;

    // Handle shift key for constrained proportions
    let finalWidth = width;
    let finalHeight = height;

    if (e.evt.shiftKey) {
      const maxDim = Math.max(Math.abs(width), Math.abs(height));
      finalWidth = width >= 0 ? maxDim : -maxDim;
      finalHeight = height >= 0 ? maxDim : -maxDim;
    }

    setTempElement({
      ...tempElement,
      x: finalWidth >= 0 ? drawStart.x : drawStart.x + finalWidth,
      y: finalHeight >= 0 ? drawStart.y : drawStart.y + finalHeight,
      width: Math.abs(finalWidth),
      height: Math.abs(finalHeight),
    });
  };

  // Handle mouse up for drawing and panning
  const handleMouseUp = (e?: Konva.KonvaEventObject<MouseEvent>) => {
    // Stop middle mouse / pan tool panning
    if (isMiddleMousePanning) {
      setIsMiddleMousePanning(false);
      setIsPanning(false);
      setLastPanPosition(null);
      return;
    }

    if (!isDrawing || !tempElement) {
      setDrawingState(false);
      setIsDrawing(false);
      return;
    }

    // Only add if element has size
    if (tempElement.width > 5 && tempElement.height > 5) {
      const finalElement: CanvasElement = {
        ...tempElement,
        id: nanoid(),
      };
      addElement(finalElement);
      pushStateNow();
      selectElement(finalElement.id);
      setActiveTool('select'); // Reset to select tool after adding shape
    }

    setDrawingState(false);
    setIsDrawing(false);
    setDrawStart(null);
    setTempElement(null);
  };

  // Handle element selection
  const handleElementSelect = (elementId: string, e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (activeTool !== 'select') return;

    const shiftKey = 'shiftKey' in e.evt ? e.evt.shiftKey : false;
    if (shiftKey) {
      // Toggle selection with shift
      if (selectedElementIds.includes(elementId)) {
        selectElements(selectedElementIds.filter((id) => id !== elementId));
      } else {
        selectElements([...selectedElementIds, elementId]);
      }
    } else {
      selectElement(elementId);
    }
  };

  // Handle element transform
  const handleElementTransform = (elementId: string, newAttrs: Partial<CanvasElement>) => {
    updateElement(elementId, newAttrs);
  };

  // Handle element transform end
  const handleTransformEnd = () => {
    pushStateNow();
  };

  // Render element based on type
  const renderElement = (element: CanvasElement) => {
    const isSelected = selectedElementIds.includes(element.id);
    const commonProps = {
      element,
      isSelected,
      onSelect: (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => handleElementSelect(element.id, e),
      onTransform: (newAttrs: Partial<CanvasElement>) => handleElementTransform(element.id, newAttrs),
      onTransformEnd: handleTransformEnd,
    };

    switch (element.type) {
      case 'image':
        return <ImageElement key={element.id} {...commonProps} element={element} />;
      case 'text':
        return <TextElement key={element.id} {...commonProps} element={element} />;
      case 'shape':
        return <ShapeElement key={element.id} {...commonProps} element={element} />;
      case 'line':
        return <LineElement key={element.id} {...commonProps} element={element} />;
      default:
        return null;
    }
  };

  // Handle drag over for file drop
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // Handle file drop (images and SVGs)
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      const stage = stageRef.current;
      if (!stage) return;

      // Get drop position relative to canvas
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return;

      const dropX = e.clientX - containerRect.left;
      const dropY = e.clientY - containerRect.top;

      // Convert to canvas coordinates
      const canvasX = (dropX - viewport.x) / viewport.scale;
      const canvasY = (dropY - viewport.y) / viewport.scale;

      // Handle files
      const files = Array.from(e.dataTransfer.files);
      const imageFiles = files.filter((file) =>
        file.type.startsWith('image/') || file.type === 'image/svg+xml'
      );

      // Handle dropped URLs (e.g., dragging images from browser)
      const droppedUrl = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');

      if (imageFiles.length > 0) {
        // Process each image file
        imageFiles.forEach((file, index) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const dataUrl = event.target?.result as string;

            // Create image to get dimensions
            const img = new Image();
            img.onload = () => {
              // Scale down if too large (max 800px width or height)
              const maxSize = 800;
              let width = img.width;
              let height = img.height;

              if (width > maxSize || height > maxSize) {
                const scale = maxSize / Math.max(width, height);
                width = width * scale;
                height = height * scale;
              }

              const newElement: CanvasElement = {
                id: nanoid(),
                type: 'image',
                x: canvasX + index * 20,
                y: canvasY + index * 20,
                width,
                height,
                rotation: 0,
                opacity: 1,
                locked: false,
                zIndex: elements.length + index,
                src: dataUrl,
                originalSrc: dataUrl,
              };
              addElement(newElement);
              pushStateNow();
              selectElement(newElement.id);
            };
            img.src = dataUrl;
          };
          reader.readAsDataURL(file);
        });
        setActiveTool('select');
      } else if (droppedUrl && (droppedUrl.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i) || droppedUrl.startsWith('data:image'))) {
        // Handle URL drops
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const maxSize = 800;
          let width = img.width;
          let height = img.height;

          if (width > maxSize || height > maxSize) {
            const scale = maxSize / Math.max(width, height);
            width = width * scale;
            height = height * scale;
          }

          const newElement: CanvasElement = {
            id: nanoid(),
            type: 'image',
            x: canvasX,
            y: canvasY,
            width,
            height,
            rotation: 0,
            opacity: 1,
            locked: false,
            zIndex: elements.length,
            src: droppedUrl,
            originalSrc: droppedUrl,
          };
          addElement(newElement);
          pushStateNow();
          selectElement(newElement.id);
        };
        img.onerror = () => {
          console.error('Failed to load image from URL:', droppedUrl);
        };
        img.src = droppedUrl;
        setActiveTool('select');
      }
    },
    [viewport, elements, addElement, selectElement, setActiveTool]
  );

  // Get cursor based on tool and state
  const getCursor = () => {
    // Show grabbing cursor when actively panning
    if (isMiddleMousePanning) {
      return 'grabbing';
    }

    switch (activeTool) {
      case 'pan':
        return 'grab';
      case 'text':
        return 'text';
      case 'rectangle':
      case 'ellipse':
      case 'line':
        return 'crosshair';
      default:
        return 'default';
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 bg-neutral-100 overflow-hidden"
      style={{ cursor: getCursor() }}
      onContextMenu={(e) => {
        // Prevent context menu when middle-clicking
        if (isMiddleMousePanning) {
          e.preventDefault();
        }
      }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        onWheel={handleWheel}
        onClick={handleStageClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        scaleX={viewport.scale}
        scaleY={viewport.scale}
        x={viewport.x}
        y={viewport.y}
      >
        <Layer>
          {/* Canvas background */}
          <Rect
            name="background"
            x={0}
            y={0}
            width={docSettings.width}
            height={docSettings.height}
            fill={currentSlide?.backgroundColor || docSettings.backgroundColor}
            shadowColor="rgba(0,0,0,0.1)"
            shadowBlur={20}
            shadowOffset={{ x: 0, y: 4 }}
          />

          {/* Elements - disable listening when drawing to allow drawing on top */}
          <Group listening={activeTool === 'select' || activeTool === 'pan'}>
            {[...elements]
              .sort((a, b) => a.zIndex - b.zIndex)
              .map(renderElement)}
          </Group>

          {/* Temporary element while drawing */}
          {tempElement && tempElement.type === 'shape' && (
            <ShapeElement
              element={tempElement as ShapeElementType}
              isSelected={false}
              onSelect={() => {}}
              onTransform={() => {}}
              onTransformEnd={() => {}}
            />
          )}

          {/* Selection transformer */}
          <Transformer
            ref={transformerRef}
            boundBoxFunc={(oldBox, newBox) => {
              // Limit minimum size
              if (newBox.width < 5 || newBox.height < 5) {
                return oldBox;
              }
              return newBox;
            }}
            rotateEnabled={true}
            enabledAnchors={[
              'top-left',
              'top-right',
              'bottom-left',
              'bottom-right',
              'top-center',
              'bottom-center',
              'middle-left',
              'middle-right',
            ]}
          />
        </Layer>
      </Stage>
    </div>
  );
}
