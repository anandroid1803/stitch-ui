'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { Text, Group } from 'react-konva';
import { Html } from 'react-konva-utils';
import type Konva from 'konva';
import type { TextElement as TextElementType, CanvasElement } from '@/types/document';
import { getEnabledFills, useFillProps } from '@/components/renderers/FillRenderer';
import { useStrokeProps } from '@/components/renderers/StrokeRenderer';
import { useEffectProps } from '@/components/renderers/EffectRenderer';
import { measureTextHeight } from '@/lib/utils/text';

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
  const groupRef = useRef<Konva.Group>(null);
  const isTransformingRef = useRef(false);
  const transformRafRef = useRef<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(element.content);

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

  // Derive text color from fill props or legacy fill
  const textColor = fillProps.fill || element.fill || '#000000';

  // Auto-grow height when content/width/font properties change externally
  // (e.g., from the properties panel)
  const prevHeightRef = useRef(element.height);
  useEffect(() => {
    // Skip if currently editing (handled by commitEdit)
    if (isEditing || isTransformingRef.current) return;

    const expectedHeight = measureTextHeight({
      text: element.content,
      fontSize: element.fontSize,
      fontFamily: element.fontFamily,
      fontWeight: element.fontWeight,
      fontStyle: element.fontStyle,
      lineHeight: element.lineHeight ?? 1.2,
      letterSpacing: element.letterSpacing ?? 0,
      width: element.width,
    });

    // Only update if height needs to grow (content overflow) or shrink significantly
    // Use a small threshold to avoid infinite update loops from rounding
    const heightDiff = Math.abs(expectedHeight - element.height);
    if (heightDiff > 2 && expectedHeight !== prevHeightRef.current) {
      prevHeightRef.current = expectedHeight;
      onTransform({ height: expectedHeight });
    }
  }, [
    element.content,
    element.width,
    element.fontSize,
    element.fontFamily,
    element.fontWeight,
    element.fontStyle,
    element.lineHeight,
    element.letterSpacing,
    isEditing,
    onTransform,
  ]);

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
    const node = groupRef.current ?? e.target;
    onTransform({ x: node.x(), y: node.y() });
    onTransformEnd();
  };

  const handleTransformEnd = () => {
    const groupNode = groupRef.current;
    const textNode = textRef.current;
    if (!groupNode || !textNode) return;

    isTransformingRef.current = false;

    const scaleX = groupNode.scaleX();

    groupNode.scaleX(1);
    groupNode.scaleY(1);

    const currentWidth = textNode.width() || element.width;
    const newWidth = Math.max(20, currentWidth * scaleX);
    textNode.width(newWidth);
    const newFontSize = element.fontSize;

    // Recalculate height based on new width and current font size
    const newHeight = measureTextHeight({
      text: element.content,
      fontSize: newFontSize,
      fontFamily: element.fontFamily,
      fontWeight: element.fontWeight,
      fontStyle: element.fontStyle,
      lineHeight: element.lineHeight ?? 1.2,
      letterSpacing: element.letterSpacing ?? 0,
      width: newWidth,
    });

    onTransform({
      x: groupNode.x(),
      y: groupNode.y(),
      width: newWidth,
      height: newHeight,
      rotation: groupNode.rotation(),
      fontSize: newFontSize,
    });
    onTransformEnd();
  };

  const handleTransformStart = () => {
    isTransformingRef.current = true;
  };

  const handleTransform = () => {
    const groupNode = groupRef.current;
    const textNode = textRef.current;
    if (!groupNode || !textNode) return;

    if (transformRafRef.current != null) return;
    transformRafRef.current = window.requestAnimationFrame(() => {
      transformRafRef.current = null;

      const scaleX = groupNode.scaleX();
      const scaleY = groupNode.scaleY();

      // Prevent live stretching while resizing
      if (scaleY !== 1) {
        groupNode.scaleY(1);
      }

      const currentWidth = textNode.width() || element.width;
      const newWidth = Math.max(20, currentWidth * scaleX);
      groupNode.scaleX(1);
      textNode.width(newWidth);
    });
  };

  const handleDblClick = useCallback(() => {
    setEditValue(element.content);
    setIsEditing(true);
  }, [element.content]);

  const commitEdit = useCallback(() => {
    if (!isEditing) return;

    // Calculate new height based on content
    const newHeight = measureTextHeight({
      text: editValue,
      fontSize: element.fontSize,
      fontFamily: element.fontFamily,
      fontWeight: element.fontWeight,
      fontStyle: element.fontStyle,
      lineHeight: element.lineHeight ?? 1.2,
      letterSpacing: element.letterSpacing ?? 0,
      width: element.width,
    });

    onTransform({ content: editValue, height: newHeight });
    onTransformEnd();
    setIsEditing(false);
  }, [isEditing, editValue, element, onTransform, onTransformEnd]);

  const cancelEdit = useCallback(() => {
    setEditValue(element.content);
    setIsEditing(false);
  }, [element.content]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      cancelEdit();
      return;
    }
    // Submit on Enter without shift
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      commitEdit();
      return;
    }
  }, [cancelEdit, commitEdit]);

  const handleTextareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditValue(e.target.value);
  }, []);

  const handleBlur = useCallback(() => {
    commitEdit();
  }, [commitEdit]);

  // Combine element opacity with fill opacity
  const combinedOpacity = element.opacity * (fillProps.opacity || 1);

  // Calculate line height in pixels for textarea
  const lineHeightValue = element.lineHeight ?? 1.2;

  // Build textarea styles to match Konva text rendering
  const getTextareaStyle = (): React.CSSProperties => {
    return {
      width: `${element.width}px`,
      minHeight: `${element.height}px`,
      border: 'none',
      padding: '0px',
      margin: '0px',
      background: 'none',
      outline: 'none',
      resize: 'none',
      overflow: 'hidden',
      color: typeof textColor === 'string' ? textColor : '#000000',
      fontSize: `${element.fontSize}px`,
      fontFamily: element.fontFamily,
      fontWeight: element.fontWeight,
      fontStyle: element.fontStyle,
      textAlign: element.textAlign,
      lineHeight: lineHeightValue,
      letterSpacing: element.letterSpacing ? `${element.letterSpacing}px` : undefined,
      whiteSpace: 'pre-wrap',
      wordWrap: 'break-word',
    };
  };

  return (
    <Group
      id={element.id}
      ref={groupRef}
      x={element.x}
      y={element.y}
      rotation={element.rotation}
      draggable={!element.locked && !isEditing}
      onClick={onSelect as (e: Konva.KonvaEventObject<MouseEvent>) => void}
      onTap={onSelect as (e: Konva.KonvaEventObject<TouchEvent>) => void}
      onMouseDown={handleMouseDown}
      onDblClick={handleDblClick}
      onDblTap={handleDblClick as unknown as (e: Konva.KonvaEventObject<TouchEvent>) => void}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onTransformStart={handleTransformStart}
      onTransform={handleTransform}
      onTransformEnd={handleTransformEnd}
      onMouseEnter={onHover as (e: Konva.KonvaEventObject<MouseEvent>) => void}
      onMouseLeave={onHoverEnd as (e: Konva.KonvaEventObject<MouseEvent>) => void}
    >
      {/* Render the Konva Text when not editing */}
      {!isEditing && (
        <Text
          ref={textRef}
          x={0}
          y={0}
          width={element.width}
          height={element.height}
          text={element.content}
          fontFamily={element.fontFamily}
          fontSize={element.fontSize}
          fontStyle={element.fontStyle === 'italic' ? 'italic' : 'normal'}
          fontVariant={element.fontWeight >= 600 ? 'bold' : 'normal'}
          align={element.textAlign}
          lineHeight={lineHeightValue}
          letterSpacing={element.letterSpacing ?? 0}
          {...fillProps}
          {...strokeProps}
          {...effectProps}
          opacity={combinedOpacity}
        />
      )}

      {/* Render Html textarea overlay when editing */}
      {isEditing && (
        <Html
          groupProps={{ x: 0, y: 0 }}
          divProps={{ style: { opacity: 1 } }}
        >
          <textarea
            value={editValue}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            style={getTextareaStyle()}
            autoFocus
          />
        </Html>
      )}
    </Group>
  );
}
