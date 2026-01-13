'use client';

import { useRef } from 'react';
import { Line } from 'react-konva';
import type Konva from 'konva';
import type { LineElement as LineElementType, CanvasElement } from '@/types/document';

interface LineElementProps {
  element: LineElementType;
  isSelected: boolean;
  onSelect: (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => void;
  onTransform: (newAttrs: Partial<CanvasElement>) => void;
  onTransformEnd: () => void;
}

export function LineElement({
  element,
  isSelected,
  onSelect,
  onTransform,
  onTransformEnd,
}: LineElementProps) {
  const lineRef = useRef<Konva.Line>(null);

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

  const handleTransformEnd = () => {
    const node = lineRef.current;
    if (!node) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    // Scale points
    const scaledPoints = element.points.map((p, i) =>
      i % 2 === 0 ? p * scaleX : p * scaleY
    );

    node.scaleX(1);
    node.scaleY(1);

    onTransform({
      x: node.x(),
      y: node.y(),
      points: scaledPoints,
      rotation: node.rotation(),
    });
    onTransformEnd();
  };

  return (
    <Line
      id={element.id}
      ref={lineRef}
      x={element.x}
      y={element.y}
      points={element.points}
      rotation={element.rotation}
      opacity={element.opacity}
      stroke={element.stroke}
      strokeWidth={element.strokeWidth}
      lineCap={element.lineCap}
      lineJoin={element.lineJoin}
      dash={element.dash}
      draggable={!element.locked}
      onClick={onSelect as (e: Konva.KonvaEventObject<MouseEvent>) => void}
      onTap={onSelect as (e: Konva.KonvaEventObject<TouchEvent>) => void}
      onMouseDown={handleMouseDown}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onTransformEnd={handleTransformEnd}
      hitStrokeWidth={20} // Make line easier to click
    />
  );
}
