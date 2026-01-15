'use client';

import { useRef, useEffect, useState } from 'react';
import { Text, Group } from 'react-konva';
import type Konva from 'konva';
import type { TextElement as TextElementType, CanvasElement } from '@/types/document';
import { getEnabledFills, useFillProps } from '@/components/renderers/FillRenderer';
import { useStrokeProps } from '@/components/renderers/StrokeRenderer';
import { useEffectProps } from '@/components/renderers/EffectRenderer';

interface TextElementProps {
  element: TextElementType;
  isSelected: boolean;
  onSelect: (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => void;
  onTransform: (newAttrs: Partial<CanvasElement>) => void;
  onTransformEnd: () => void;
  onHover: () => void;
  onHoverEnd: () => void;
}

export function TextElement({
  element,
  isSelected,
  onSelect,
  onTransform,
  onTransformEnd,
  onHover,
  onHoverEnd,
}: TextElementProps) {
  const textRef = useRef<Konva.Text>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Track if middle mouse was pressed to prevent dragging
  const middleMouseRef = useRef(false);

  // Get fills (with backward compatibility)
  const fills = element.fills && element.fills.length > 0
    ? element.fills
    : element.fill
    ? [{ id: 'legacy', type: 'solid' as const, color: element.fill, enabled: true, opacity: 1 }]
    : [];

  const enabledFills = getEnabledFills(fills);

  // For text, we use the first enabled fill
  // Note: Konva Text doesn't support multiple fills natively like shapes do
  const firstFill = enabledFills[0];

  // Get fill props using shared renderer
  // Note: For text, we pass 0 for shape offset since text is not centered
  const fillProps = useFillProps(firstFill, element.width, element.height, 0, 0);

  // Get stroke props (from new system or legacy)
  const strokeProps = element.strokes
    ? useStrokeProps(element.strokes)
    : {
        stroke: element.stroke,
        strokeWidth: element.strokeWidth ?? 0,
      };

  // Get effect props (from new system or legacy)
  const effectProps = element.effects
    ? useEffectProps(element.effects)
    : element.shadow?.enabled
    ? {
        shadowColor: element.shadow.color,
        shadowBlur: element.shadow.blur,
        shadowOffset: { x: element.shadow.offsetX, y: element.shadow.offsetY },
        shadowOpacity: 1,
      }
    : {};

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
    textarea.style.color = element.fill || '#000000';
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

    let textareaRemoved = false;
    const handleKeydown = (e: KeyboardEvent) => {
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
    };

    const handleBlur = () => {
      onTransform({ content: textarea.value });
      onTransformEnd();
      removeTextarea();
    };

    const cleanupListeners = () => {
      textarea.removeEventListener('keydown', handleKeydown);
      textarea.removeEventListener('blur', handleBlur);
    };

    const removeTextarea = () => {
      if (textareaRemoved) return;
      textareaRemoved = true;
      cleanupListeners();
      if (textarea.parentNode) {
        textarea.parentNode.removeChild(textarea);
      }
      textNode.show();
      setIsEditing(false);
    };

    textarea.addEventListener('keydown', handleKeydown);
    textarea.addEventListener('blur', handleBlur);
  };

  // Combine element opacity with fill opacity
  const combinedOpacity = element.opacity * (fillProps.opacity || 1);

  return (
    <Text
      id={element.id}
      ref={textRef}
      x={element.x}
      y={element.y}
      width={element.width}
      height={element.height}
      rotation={element.rotation}
      text={element.content}
      fontFamily={element.fontFamily}
      fontSize={element.fontSize}
      fontStyle={element.fontStyle === 'italic' ? 'italic' : 'normal'}
      fontVariant={element.fontWeight >= 600 ? 'bold' : 'normal'}
      align={element.textAlign}
      {...fillProps}
      {...strokeProps}
      {...effectProps}
      opacity={combinedOpacity}
      draggable={!element.locked}
      onClick={onSelect as (e: Konva.KonvaEventObject<MouseEvent>) => void}
      onTap={onSelect as (e: Konva.KonvaEventObject<TouchEvent>) => void}
      onMouseDown={handleMouseDown}
      onDblClick={handleDblClick}
      onDblTap={handleDblClick as any}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onTransformEnd={handleTransformEnd}
      onMouseEnter={onHover as (e: Konva.KonvaEventObject<MouseEvent>) => void}
      onMouseLeave={onHoverEnd as (e: Konva.KonvaEventObject<MouseEvent>) => void}
    />
  );
}
