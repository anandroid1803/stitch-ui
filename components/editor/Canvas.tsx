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
import type { CanvasElement, ShapeElement as ShapeElementType, LineElement as LineElementType } from '@/types/document';

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
  const hoveredElementId = useEditorStore((state) => state.hoveredElementId);
  const selectElement = useEditorStore((state) => state.selectElement);
  const selectElements = useEditorStore((state) => state.selectElements);
  const deselectAll = useEditorStore((state) => state.deselectAll);
  const setHoveredElement = useEditorStore((state) => state.setHoveredElement);
  const clearHoveredElement = useEditorStore((state) => state.clearHoveredElement);
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

  // Marquee selection state
  const [isMarqueeSelecting, setIsMarqueeSelecting] = useState(false);
  const [marqueeStart, setMarqueeStart] = useState<{ x: number; y: number } | null>(null);
  const [marqueeEnd, setMarqueeEnd] = useState<{ x: number; y: number } | null>(null);
  // Store selection state at start of marquee for Shift+marquee additive behavior
  const marqueeInitialSelectionRef = useRef<string[]>([]);
  const marqueeShiftKeyRef = useRef(false);
  // Track if marquee just completed to prevent click handler from deselecting
  const marqueeJustCompletedRef = useRef(false);

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

  // Update transformer when selection or hover changes
  useEffect(() => {
    if (!transformerRef.current || !stageRef.current) return;

    const stage = stageRef.current;
    const transformer = transformerRef.current;

    const targetIds =
      selectedElementIds.length > 0
        ? selectedElementIds
        : hoveredElementId
        ? [hoveredElementId]
        : [];

    // Use requestAnimationFrame to ensure nodes are rendered before attaching transformer
    requestAnimationFrame(() => {
      if (!transformer || !stage) return;

      if (targetIds.length === 0) {
        transformer.nodes([]);
        transformer.getLayer()?.batchDraw();
        return;
      }

      const targetNodes = targetIds
        .map((id) => stage.findOne(`#${id}`))
        .filter((node): node is Konva.Node => node != null && node.getLayer() != null);

      transformer.nodes(targetNodes);
      transformer.getLayer()?.batchDraw();
    });
  }, [selectedElementIds, hoveredElementId]);

  // Use a ref to track middle mouse state that can be checked synchronously by elements
  const isMiddleMousePanningRef = useRef(false);

  // Handle middle mouse down at capture phase (before elements receive events)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleCaptureMouseDown = (e: MouseEvent) => {
      if (e.button === 1) {
        // Middle mouse button - set state immediately at capture phase
        // Stop propagation to prevent Konva elements from receiving the event
        isMiddleMousePanningRef.current = true;
        setIsMiddleMousePanning(true);
        setIsPanning(true);
        setLastPanPosition({ x: e.clientX, y: e.clientY });
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // Use capture phase to intercept before Konva elements
    container.addEventListener('mousedown', handleCaptureMouseDown, true);
    return () => container.removeEventListener('mousedown', handleCaptureMouseDown, true);
  }, [setIsPanning]);

  // Handle global mouse up for panning (in case mouse is released outside canvas)
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isMiddleMousePanning || isMiddleMousePanningRef.current) {
        isMiddleMousePanningRef.current = false;
        setIsMiddleMousePanning(false);
        setIsPanning(false);
        setLastPanPosition(null);
      }
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [isMiddleMousePanning, setIsPanning]);

  // Handle clipboard paste (Cmd+V for images)
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        // Check if the item is an image
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const blob = item.getAsFile();
          if (!blob) continue;

          const reader = new FileReader();
          reader.onload = (event) => {
            const dataUrl = event.target?.result as string;

            // Create image to get dimensions
            const img = new Image();
            img.onload = () => {
              // Scale down if too large
              const maxSize = 800;
              let width = img.width;
              let height = img.height;

              if (width > maxSize || height > maxSize) {
                const scale = maxSize / Math.max(width, height);
                width = width * scale;
                height = height * scale;
              }

              // Get center of viewport for placement
              const centerX = (dimensions.width / 2 - viewport.x) / viewport.scale;
              const centerY = (dimensions.height / 2 - viewport.y) / viewport.scale;

              const newElement: CanvasElement = {
                id: nanoid(),
                type: 'image',
                x: centerX - width / 2,
                y: centerY - height / 2,
                width,
                height,
                rotation: 0,
                opacity: 1,
                locked: false,
                zIndex: elements.length,
                src: dataUrl,
                originalSrc: dataUrl,
              };
              addElement(newElement);
              pushStateNow();
              selectElement(newElement.id);
              setActiveTool('select');
            };
            img.src = dataUrl;
          };
          reader.readAsDataURL(blob);
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [dimensions, viewport, elements.length, addElement, selectElement, setActiveTool]);

  // Generate slide thumbnail when elements change
  const updateSlideThumbnail = useDocumentStore((state) => state.updateSlideThumbnail);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !currentSlideId) return;

    // Debounce thumbnail generation
    const timeout = setTimeout(() => {
      try {
        // Temporarily hide transformer for clean thumbnail
        const transformer = transformerRef.current;
        if (transformer) transformer.hide();

        // Generate thumbnail of just the slide area, accounting for viewport zoom/pan
        const scale = stage.scaleX() || 1; // scaleX/scaleY are the same
        const dataUrl = stage.toDataURL({
          x: stage.x(),
          y: stage.y(),
          width: docSettings.width * scale,
          height: docSettings.height * scale,
          pixelRatio: 0.15 / scale, // keep final size consistent regardless of zoom
          mimeType: 'image/jpeg',
          quality: 0.7,
        });

        if (transformer) transformer.show();

        // Update slide thumbnail in store
        updateSlideThumbnail(currentSlideId, dataUrl);
      } catch (err) {
        console.warn('Failed to generate thumbnail:', err);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [elements, currentSlideId, updateSlideThumbnail, docSettings.width, docSettings.height]);

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

  const clientToCanvasPoint = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } | null => {
      const container = containerRef.current;
      if (!container) return null;
      const rect = container.getBoundingClientRect();
      return {
        x: (clientX - rect.left - viewport.x) / viewport.scale,
        y: (clientY - rect.top - viewport.y) / viewport.scale,
      };
    },
    [viewport]
  );

  // Handle stage click
  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // Skip if marquee selection just completed (click fires after mouseup)
    if (marqueeJustCompletedRef.current) {
      marqueeJustCompletedRef.current = false;
      return;
    }

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
    // Middle mouse button is handled at capture phase, so skip here
    if (e.evt.button === 1) {
      return;
    }

    // Handle pan tool with left click
    if (activeTool === 'pan' && e.evt.button === 0) {
      isMiddleMousePanningRef.current = true;
      setIsMiddleMousePanning(true);
      setIsPanning(true);
      setLastPanPosition({ x: e.evt.clientX, y: e.evt.clientY });
      return;
    }

    // Handle select tool - start marquee selection when clicking on empty area
    if (activeTool === 'select' && e.evt.button === 0) {
      // Only start marquee if clicking on stage or background
      if (e.target === e.target.getStage() || e.target.name() === 'background') {
        const point = clientToCanvasPoint(e.evt.clientX, e.evt.clientY);
        if (!point) return;

        // Store current state for Shift+marquee additive behavior
        marqueeShiftKeyRef.current = e.evt.shiftKey;
        marqueeInitialSelectionRef.current = e.evt.shiftKey ? [...selectedElementIds] : [];

        setIsMarqueeSelecting(true);
        setMarqueeStart(point);
        setMarqueeEnd(point);
        // Don't deselect yet - wait to see if this is a click or drag
      }
      return;
    }

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
    } else if (activeTool === 'line') {
      // Create line element - stroke only, no fill
      const newElement: LineElementType = {
        id: `temp_${nanoid()}`,
        type: 'line',
        x: point.x,
        y: point.y,
        width: 0,
        height: 0,
        rotation: 0,
        opacity: 1,
        locked: false,
        zIndex: elements.length,
        points: [0, 0, 0, 0], // Start and end points relative to x,y
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        lineCap: 'round',
        lineJoin: 'round',
      };
      setTempElement(newElement);
    }
  };

  // Handle mouse move for drawing and panning
  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // Handle middle mouse / pan tool panning (check both state and ref)
    if ((isMiddleMousePanning || isMiddleMousePanningRef.current) && lastPanPosition) {
      const deltaX = e.evt.clientX - lastPanPosition.x;
      const deltaY = e.evt.clientY - lastPanPosition.y;
      panBy(deltaX, deltaY);
      setLastPanPosition({ x: e.evt.clientX, y: e.evt.clientY });
      return;
    }

    // Handle marquee selection - update selection in real-time as marquee intersects elements
    if (isMarqueeSelecting && marqueeStart) {
      const point = clientToCanvasPoint(e.evt.clientX, e.evt.clientY);
      if (!point) return;
      setMarqueeEnd(point);

      // Calculate marquee bounds
      const x1 = Math.min(marqueeStart.x, point.x);
      const y1 = Math.min(marqueeStart.y, point.y);
      const x2 = Math.max(marqueeStart.x, point.x);
      const y2 = Math.max(marqueeStart.y, point.y);

      // Find all elements that intersect with the marquee
      const intersectingIds = elements
        .filter((el) => !el.locked && el.opacity > 0)
        .filter((el) => {
          const elX1 = el.x;
          const elY1 = el.y;
          const elX2 = el.x + el.width;
          const elY2 = el.y + el.height;
          // Check intersection (any overlap)
          return elX1 < x2 && elX2 > x1 && elY1 < y2 && elY2 > y1;
        })
        .map((el) => el.id);

      // Update selection in real-time
      if (marqueeShiftKeyRef.current) {
        // Additive mode: merge initial selection with currently intersecting
        const merged = [...new Set([...marqueeInitialSelectionRef.current, ...intersectingIds])];
        selectElements(merged);
      } else {
        // Replace mode: select exactly what's intersecting now
        selectElements(intersectingIds);
      }
      return;
    }

    if (!isDrawing || !drawStart || !tempElement) return;

    const stage = stageRef.current;
    if (!stage) return;

    const point = getCanvasPoint(stage);
    if (!point) return;

    // Handle line tool differently
    if (tempElement.type === 'line') {
      const endX = point.x - drawStart.x;
      const endY = point.y - drawStart.y;

      // Shift key constrains to 45-degree angles
      let finalEndX = endX;
      let finalEndY = endY;

      if (e.evt.shiftKey) {
        const angle = Math.atan2(endY, endX);
        const distance = Math.sqrt(endX * endX + endY * endY);
        const snappedAngle = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4);
        finalEndX = Math.cos(snappedAngle) * distance;
        finalEndY = Math.sin(snappedAngle) * distance;
      }

      setTempElement({
        ...tempElement,
        points: [0, 0, finalEndX, finalEndY],
        width: Math.abs(finalEndX),
        height: Math.abs(finalEndY),
      });
      return;
    }

    // Calculate dimensions for shapes
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
    if (isMiddleMousePanning || isMiddleMousePanningRef.current) {
      isMiddleMousePanningRef.current = false;
      setIsMiddleMousePanning(false);
      setIsPanning(false);
      setLastPanPosition(null);
      return;
    }

    // Finalize marquee selection
    if (isMarqueeSelecting) {
      // Check if it was just a click (no significant drag)
      if (marqueeStart && marqueeEnd) {
        const marqueeWidth = Math.abs(marqueeEnd.x - marqueeStart.x);
        const marqueeHeight = Math.abs(marqueeEnd.y - marqueeStart.y);
        const wasDrag = marqueeWidth > 3 || marqueeHeight > 3;

        if (wasDrag) {
          // Mark that marquee just completed to prevent click handler from deselecting
          marqueeJustCompletedRef.current = true;
        } else {
          // It was just a click - deselect all (unless Shift was held)
          if (!marqueeShiftKeyRef.current) {
            deselectAll();
          }
        }
        // If it was a drag, selection is already updated in real-time via handleMouseMove
      }

      // Clean up marquee state
      setIsMarqueeSelecting(false);
      setMarqueeStart(null);
      setMarqueeEnd(null);
      marqueeInitialSelectionRef.current = [];
      marqueeShiftKeyRef.current = false;
      return;
    }

    if (!isDrawing || !tempElement) {
      setDrawingState(false);
      setIsDrawing(false);
      return;
    }

    // Check if element is valid to add
    let isValidElement = false;

    if (tempElement.type === 'line') {
      // For lines, check if the line has any length
      const lineElement = tempElement as LineElementType;
      const dx = lineElement.points[2] - lineElement.points[0];
      const dy = lineElement.points[3] - lineElement.points[1];
      const lineLength = Math.sqrt(dx * dx + dy * dy);
      isValidElement = lineLength > 5;
    } else {
      // For shapes, check width and height
      isValidElement = tempElement.width > 5 && tempElement.height > 5;
    }

    if (isValidElement) {
      const finalElement: CanvasElement = {
        ...tempElement,
        id: nanoid(),
      };
      addElement(finalElement);
      pushStateNow();
      selectElement(finalElement.id);
      setActiveTool('select'); // Reset to select tool after adding element
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

  const handleElementHover = useCallback(
    (elementId: string) => {
      if (activeTool !== 'select') return;
      setHoveredElement(elementId);
    },
    [activeTool, setHoveredElement]
  );

  const handleElementHoverEnd = useCallback(() => {
    if (activeTool !== 'select') return;
    clearHoveredElement();
  }, [activeTool, clearHoveredElement]);

  // Render element based on type
  const renderElement = (element: CanvasElement) => {
    const isSelected = selectedElementIds.includes(element.id);
    const commonProps = {
      element,
      isSelected,
      onSelect: (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => handleElementSelect(element.id, e),
      onTransform: (newAttrs: Partial<CanvasElement>) => handleElementTransform(element.id, newAttrs),
      onTransformEnd: handleTransformEnd,
      onHover: () => handleElementHover(element.id),
      onHoverEnd: handleElementHoverEnd,
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
    
    // Show crosshair when doing marquee selection
    if (isMarqueeSelecting) {
      return 'crosshair';
    }

    switch (activeTool) {
      case 'select':
        // Custom move cursor for select tool (Figma-style)
        return 'default';
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
      className="flex-1 bg-[#F7F8FA] overflow-hidden"
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
        onMouseLeave={(e) => {
          // Clean up marquee state - selection is already updated in real-time
          if (isMarqueeSelecting) {
            setIsMarqueeSelecting(false);
            setMarqueeStart(null);
            setMarqueeEnd(null);
            marqueeInitialSelectionRef.current = [];
            marqueeShiftKeyRef.current = false;
          } else {
            handleMouseUp(e);
          }
          handleElementHoverEnd();
        }}
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

          {/* Elements - disable listening when drawing or middle-mouse panning */}
          <Group listening={(activeTool === 'select' || activeTool === 'pan') && !isMiddleMousePanning}>
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
              onHover={() => {}}
              onHoverEnd={() => {}}
            />
          )}
          {tempElement && tempElement.type === 'line' && (
            <LineElement
              element={tempElement as LineElementType}
              isSelected={false}
              onSelect={() => {}}
              onTransform={() => {}}
              onTransformEnd={() => {}}
              onHover={() => {}}
              onHoverEnd={() => {}}
            />
          )}

          {/* Marquee selection box */}
          {isMarqueeSelecting && marqueeStart && marqueeEnd && (
            <Rect
              x={Math.min(marqueeStart.x, marqueeEnd.x)}
              y={Math.min(marqueeStart.y, marqueeEnd.y)}
              width={Math.abs(marqueeEnd.x - marqueeStart.x)}
              height={Math.abs(marqueeEnd.y - marqueeStart.y)}
              fill="rgba(91, 33, 101, .1)"
              stroke="rgba(91, 33, 101, 1)"
              strokeWidth={1 / viewport.scale}
              listening={false}
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
