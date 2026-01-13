'use client';

import { useRef, useEffect, useState } from 'react';
import { Text, Group } from 'react-konva';
import type Konva from 'konva';
import type { TextElement as TextElementType, CanvasElement } from '@/types/document';

interface TextElementProps {
  element: TextElementType;
  isSelected: boolean;
  onSelect: (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => void;
  onTransform: (newAttrs: Partial<CanvasElement>) => void;
  onTransformEnd: () => void;
}

export function TextElement({
  element,
  isSelected,
  onSelect,
  onTransform,
  onTransformEnd,
}: TextElementProps) {
  const textRef = useRef<Konva.Text>(null);
  const [isEditing, setIsEditing] = useState(false);

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
    const node = textRef.current;
    if (!node) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    node.scaleX(1);
    node.scaleY(1);

    onTransform({
      x: node.x(),
      y: node.y(),
      width: Math.max(20, node.width() * scaleX),
      height: Math.max(20, node.height() * scaleY),
      rotation: node.rotation(),
      fontSize: Math.max(8, element.fontSize * scaleY),
    });
    onTransformEnd();
  };

  const handleDblClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // Get stage and text node
    const textNode = textRef.current;
    const stage = textNode?.getStage();
    if (!textNode || !stage) return;

    setIsEditing(true);

    // Hide text node temporarily
    textNode.hide();

    // Get position of text node
    const textPosition = textNode.absolutePosition();
    const stageBox = stage.container().getBoundingClientRect();

    // Create textarea element
    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);

    // Position and style textarea
    textarea.value = element.content;
    textarea.style.position = 'absolute';
    textarea.style.top = `${stageBox.top + textPosition.y}px`;
    textarea.style.left = `${stageBox.left + textPosition.x}px`;
    textarea.style.width = `${textNode.width() * textNode.getAbsoluteScale().x}px`;
    textarea.style.height = `${textNode.height() * textNode.getAbsoluteScale().y}px`;
    textarea.style.fontSize = `${element.fontSize * textNode.getAbsoluteScale().y}px`;
    textarea.style.fontFamily = element.fontFamily;
    textarea.style.fontWeight = String(element.fontWeight);
    textarea.style.fontStyle = element.fontStyle;
    textarea.style.textAlign = element.textAlign;
    textarea.style.color = element.fill;
    textarea.style.border = '2px solid #3b82f6';
    textarea.style.borderRadius = '4px';
    textarea.style.padding = '4px';
    textarea.style.margin = '0';
    textarea.style.overflow = 'hidden';
    textarea.style.background = 'white';
    textarea.style.outline = 'none';
    textarea.style.resize = 'none';
    textarea.style.lineHeight = String(element.lineHeight ?? 1.2);
    textarea.style.transformOrigin = 'left top';
    textarea.style.transform = `rotate(${element.rotation}deg)`;
    textarea.style.zIndex = '10000';

    textarea.focus();

    const removeTextarea = () => {
      if (textarea.parentNode) {
        textarea.parentNode.removeChild(textarea);
      }
      textNode.show();
      setIsEditing(false);
    };

    textarea.addEventListener('keydown', (e) => {
      // Exit on Escape
      if (e.key === 'Escape') {
        removeTextarea();
        return;
      }
      // Submit on Enter without shift
      if (e.key === 'Enter' && !e.shiftKey) {
        onTransform({ content: textarea.value });
        onTransformEnd();
        removeTextarea();
        return;
      }
    });

    textarea.addEventListener('blur', () => {
      onTransform({ content: textarea.value });
      onTransformEnd();
      removeTextarea();
    });
  };

  return (
    <Text
      id={element.id}
      ref={textRef}
      x={element.x}
      y={element.y}
      width={element.width}
      height={element.height}
      rotation={element.rotation}
      opacity={element.opacity}
      text={element.content}
      fontFamily={element.fontFamily}
      fontSize={element.fontSize}
      fontStyle={element.fontStyle === 'italic' ? 'italic' : 'normal'}
      fontVariant={element.fontWeight >= 600 ? 'bold' : 'normal'}
      align={element.textAlign}
      fill={element.fill}
      stroke={element.stroke}
      strokeWidth={element.strokeWidth ?? 0}
      draggable={!element.locked}
      onClick={onSelect as (e: Konva.KonvaEventObject<MouseEvent>) => void}
      onTap={onSelect as (e: Konva.KonvaEventObject<TouchEvent>) => void}
      onMouseDown={handleMouseDown}
      onDblClick={handleDblClick}
      onDblTap={handleDblClick as any}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onTransformEnd={handleTransformEnd}
    />
  );
}
