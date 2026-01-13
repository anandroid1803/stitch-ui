'use client';

import { useRef, useEffect, useState } from 'react';
import { Image, Group } from 'react-konva';
import type Konva from 'konva';
import type { ImageElement as ImageElementType, CanvasElement } from '@/types/document';

interface ImageElementProps {
  element: ImageElementType;
  isSelected: boolean;
  onSelect: (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => void;
  onTransform: (newAttrs: Partial<CanvasElement>) => void;
  onTransformEnd: () => void;
}

export function ImageElement({
  element,
  isSelected,
  onSelect,
  onTransform,
  onTransformEnd,
}: ImageElementProps) {
  const imageRef = useRef<Konva.Image>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Load image
  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      setImage(img);
      setIsLoading(false);
      setError(false);
    };

    img.onerror = () => {
      setIsLoading(false);
      setError(true);
    };

    img.src = element.src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [element.src]);

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
    const node = imageRef.current;
    if (!node) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    node.scaleX(1);
    node.scaleY(1);

    onTransform({
      x: node.x(),
      y: node.y(),
      width: Math.max(10, node.width() * scaleX),
      height: Math.max(10, node.height() * scaleY),
      rotation: node.rotation(),
    });
    onTransformEnd();
  };

  if (isLoading || !image) {
    // Render placeholder while loading
    return (
      <Group
        x={element.x}
        y={element.y}
        width={element.width}
        height={element.height}
        rotation={element.rotation}
        opacity={element.opacity}
        draggable={!element.locked}
        onClick={onSelect as (e: Konva.KonvaEventObject<MouseEvent>) => void}
        onTap={onSelect as (e: Konva.KonvaEventObject<TouchEvent>) => void}
      >
        {/* Placeholder rect */}
      </Group>
    );
  }

  if (error) {
    // Render error state
    return (
      <Group
        x={element.x}
        y={element.y}
        width={element.width}
        height={element.height}
        rotation={element.rotation}
        opacity={element.opacity}
        draggable={!element.locked}
        onClick={onSelect as (e: Konva.KonvaEventObject<MouseEvent>) => void}
        onTap={onSelect as (e: Konva.KonvaEventObject<TouchEvent>) => void}
      >
        {/* Error placeholder */}
      </Group>
    );
  }

  return (
    <Image
      id={element.id}
      ref={imageRef}
      x={element.x}
      y={element.y}
      width={element.width}
      height={element.height}
      rotation={element.rotation}
      opacity={element.opacity}
      image={image}
      draggable={!element.locked}
      onClick={onSelect as (e: Konva.KonvaEventObject<MouseEvent>) => void}
      onTap={onSelect as (e: Konva.KonvaEventObject<TouchEvent>) => void}
      onMouseDown={handleMouseDown}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onTransformEnd={handleTransformEnd}
    />
  );
}
