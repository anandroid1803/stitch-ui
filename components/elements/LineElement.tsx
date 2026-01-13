'use client';

import { useRef } from 'react';
import { Line, Circle, Group } from 'react-konva';
import type Konva from 'konva';
import type { LineElement as LineElementType, CanvasElement } from '@/types/document';

interface LineElementProps {
  element: LineElementType;
  isSelected: boolean;
  onSelect: (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => void;
  onTransform: (newAttrs: Partial<CanvasElement>) => void;
  onTransformEnd: () => void;
  onHover: () => void;
  onHoverEnd: () => void;
}

export function LineElement({
  element,
  isSelected,
  onSelect,
  onTransform,
  onTransformEnd,
  onHover,
  onHoverEnd,
}: LineElementProps) {
  const lineRef = useRef<Konva.Line>(null);
  const groupRef = useRef<Konva.Group>(null);

  // Track if middle mouse was pressed to prevent dragging
  const middleMouseRef = useRef(false);

  // Get start and end points from the points array
  const startX = element.points[0] ?? 0;
  const startY = element.points[1] ?? 0;
  const endX = element.points[2] ?? 0;
  const endY = element.points[3] ?? 0;

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

  // Handle dragging the entire line (from the line itself, not endpoints)
  const handleLineDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    const group = groupRef.current;
    if (!group) return;

    onTransform({
      x: group.x(),
      y: group.y(),
    });
    onTransformEnd();
  };

  // Handle dragging the start endpoint
  const handleStartDrag = (e: Konva.KonvaEventObject<DragEvent>) => {
    if (middleMouseRef.current) {
      e.target.stopDrag();
      return;
    }

    const node = e.target;
    const newStartX = node.x();
    const newStartY = node.y();

    // Update points array with new start position
    onTransform({
      points: [newStartX, newStartY, endX, endY],
    });
  };

  const handleStartDragEnd = () => {
    onTransformEnd();
  };

  // Handle dragging the end endpoint
  const handleEndDrag = (e: Konva.KonvaEventObject<DragEvent>) => {
    if (middleMouseRef.current) {
      e.target.stopDrag();
      return;
    }

    const node = e.target;
    const newEndX = node.x();
    const newEndY = node.y();

    // Update points array with new end position
    onTransform({
      points: [startX, startY, newEndX, newEndY],
    });
  };

  const handleEndDragEnd = () => {
    onTransformEnd();
  };

  // Endpoint handle size (radius)
  const handleRadius = 6;
  const handleStrokeWidth = 2;

  return (
    <Group
      id={element.id}
      ref={groupRef}
      x={element.x}
      y={element.y}
      rotation={element.rotation}
      opacity={element.opacity}
      draggable={!element.locked && !isSelected} // Only drag whole line when not selected (when selected, use endpoints)
      onMouseDown={handleMouseDown}
      onDragStart={handleDragStart}
      onDragEnd={handleLineDragEnd}
      onMouseEnter={onHover as (e: Konva.KonvaEventObject<MouseEvent>) => void}
      onMouseLeave={onHoverEnd as (e: Konva.KonvaEventObject<MouseEvent>) => void}
    >
      {/* The line itself */}
      <Line
        ref={lineRef}
        points={element.points}
        stroke={element.stroke}
        strokeWidth={element.strokeWidth}
        lineCap={element.lineCap}
        lineJoin={element.lineJoin}
        dash={element.dash}
        hitStrokeWidth={20}
        onClick={onSelect as (e: Konva.KonvaEventObject<MouseEvent>) => void}
        onTap={onSelect as (e: Konva.KonvaEventObject<TouchEvent>) => void}
      />

      {/* Endpoint handles - only show when selected */}
      {isSelected && !element.locked && (
        <>
          {/* Start point handle */}
          <Circle
            x={startX}
            y={startY}
            radius={handleRadius}
            fill="white"
            stroke="#0ea5e9"
            strokeWidth={handleStrokeWidth}
            draggable
            onMouseDown={handleMouseDown}
            onDragStart={handleDragStart}
            onDragMove={handleStartDrag}
            onDragEnd={handleStartDragEnd}
            hitStrokeWidth={10}
          />

          {/* End point handle */}
          <Circle
            x={endX}
            y={endY}
            radius={handleRadius}
            fill="white"
            stroke="#0ea5e9"
            strokeWidth={handleStrokeWidth}
            draggable
            onMouseDown={handleMouseDown}
            onDragStart={handleDragStart}
            onDragMove={handleEndDrag}
            onDragEnd={handleEndDragEnd}
            hitStrokeWidth={10}
          />
        </>
      )}
    </Group>
  );
}
