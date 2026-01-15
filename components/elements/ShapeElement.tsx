'use client';

import { useRef, useEffect } from 'react';
import { Rect, Ellipse, RegularPolygon, Star, Group } from 'react-konva';
import type Konva from 'konva';
import type { ShapeElement as ShapeElementType, CanvasElement } from '@/types/document';

interface ShapeElementProps {
  element: ShapeElementType;
  isSelected: boolean;
  onSelect: (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => void;
  onTransform: (newAttrs: Partial<CanvasElement>) => void;
  onTransformEnd: () => void;
  onHover: () => void;
  onHoverEnd: () => void;
}

export function ShapeElement({
  element,
  isSelected,
  onSelect,
  onTransform,
  onTransformEnd,
  onHover,
  onHoverEnd,
}: ShapeElementProps) {
  const shapeRef = useRef<Konva.Shape>(null);

  // Track if middle mouse was pressed to prevent dragging
  const middleMouseRef = useRef(false);

  // Prevent dragging when middle mouse button is pressed (for canvas panning)
  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.evt.button === 1) {
      middleMouseRef.current = true;
    } else {
      middleMouseRef.current = false;
    }
  };

  const handleDragStart = (e: Konva.KonvaEventObject<DragEvent>) => {
    if (middleMouseRef.current) {
      e.target.stopDrag();
    }
  };

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    onTransform({
      x: e.target.x(),
      y: e.target.y(),
    });
    onTransformEnd();
  };

  const handleTransformEnd = (e: Konva.KonvaEventObject<Event>) => {
    const node = shapeRef.current;
    if (!node) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    // Reset scale and apply to dimensions
    node.scaleX(1);
    node.scaleY(1);

    onTransform({
      x: node.x(),
      y: node.y(),
      width: Math.max(5, node.width() * scaleX),
      height: Math.max(5, node.height() * scaleY),
      rotation: node.rotation(),
    });
    onTransformEnd();
  };

  const commonProps = {
    id: element.id,
    ref: shapeRef as any,
    x: element.x,
    y: element.y,
    rotation: element.rotation,
    opacity: element.opacity,
    fill: element.fill,
    stroke: element.stroke,
    strokeWidth: element.strokeWidth,
    draggable: !element.locked,
    onClick: onSelect as (e: Konva.KonvaEventObject<MouseEvent>) => void,
    onTap: onSelect as (e: Konva.KonvaEventObject<TouchEvent>) => void,
    onMouseDown: handleMouseDown,
    onDragStart: handleDragStart,
    onDragEnd: handleDragEnd,
    onTransformEnd: handleTransformEnd,
    onMouseEnter: onHover as (e: Konva.KonvaEventObject<MouseEvent>) => void,
    onMouseLeave: onHoverEnd as (e: Konva.KonvaEventObject<MouseEvent>) => void,
    // Apply shadow if enabled - Konva uses shadowOffset as an object
    ...(element.shadow?.enabled && {
      shadowColor: element.shadow.color,
      shadowBlur: element.shadow.blur,
      shadowOffset: { x: element.shadow.offsetX, y: element.shadow.offsetY },
      shadowOpacity: 1,
    }),
  };

  switch (element.shapeType) {
    case 'rectangle':
      return (
        <Rect
          {...commonProps}
          width={element.width}
          height={element.height}
          cornerRadius={element.cornerRadius ?? 0}
        />
      );

    case 'ellipse':
      return (
        <Ellipse
          {...commonProps}
          // Ellipse uses radius, not width/height
          // Offset to position correctly
          offsetX={-element.width / 2}
          offsetY={-element.height / 2}
          radiusX={element.width / 2}
          radiusY={element.height / 2}
        />
      );

    case 'triangle':
      return (
        <RegularPolygon
          {...commonProps}
          sides={3}
          radius={Math.min(element.width, element.height) / 2}
          offsetX={-element.width / 2}
          offsetY={-element.height / 2}
        />
      );

    case 'polygon':
      return (
        <RegularPolygon
          {...commonProps}
          sides={element.sides ?? 6}
          radius={Math.min(element.width, element.height) / 2}
          offsetX={-element.width / 2}
          offsetY={-element.height / 2}
        />
      );

    case 'star':
      return (
        <Star
          {...commonProps}
          numPoints={5}
          innerRadius={Math.min(element.width, element.height) / 4}
          outerRadius={Math.min(element.width, element.height) / 2}
          offsetX={-element.width / 2}
          offsetY={-element.height / 2}
        />
      );

    default:
      return (
        <Rect
          {...commonProps}
          width={element.width}
          height={element.height}
        />
      );
  }
}
