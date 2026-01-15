'use client';

import { useRef, useEffect } from 'react';
import { Rect, Ellipse, RegularPolygon, Star, Group } from 'react-konva';
import type Konva from 'konva';
import type { VectorElement as VectorElementType, CanvasElement } from '@/types/document';
import type { FillLayer } from '@/types/fill';
import { getEnabledFills, useFillProps } from '@/components/renderers/FillRenderer';
import { useStrokeProps } from '@/components/renderers/StrokeRenderer';
import { useEffectProps } from '@/components/renderers/EffectRenderer';

interface VectorElementProps {
  element: VectorElementType;
  isSelected: boolean;
  onSelect: (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => void;
  onTransform: (newAttrs: Partial<CanvasElement>) => void;
  onTransformEnd: () => void;
  onHover: () => void;
  onHoverEnd: () => void;
}

/**
 * Get vector offset based on vector type
 * Some vectors (ellipse, triangle, etc.) are centered using offsetX/offsetY
 */
function getVectorOffset(vectorType: string, width: number, height: number) {
  switch (vectorType) {
    case 'ellipse':
    case 'triangle':
    case 'polygon':
    case 'star':
      return {
        offsetX: -width / 2,
        offsetY: -height / 2,
      };
    case 'rectangle':
    default:
      return {
        offsetX: 0,
        offsetY: 0,
      };
  }
}

export function VectorElement({
  element,
  isSelected,
  onSelect,
  onTransform,
  onTransformEnd,
  onHover,
  onHoverEnd,
}: VectorElementProps) {
  const shapeRef = useRef<Konva.Shape>(null);
  const groupRef = useRef<Konva.Group>(null);

  // Track if middle mouse was pressed to prevent dragging
  const middleMouseRef = useRef(false);

  // Get fills (with backward compatibility)
  const fills = element.fills && element.fills.length > 0
    ? element.fills
    : element.fill
    ? [{ id: 'legacy', type: 'solid' as const, color: element.fill, enabled: true, opacity: 1 }]
    : [];

  // Get enabled fills
  const enabledFills = getEnabledFills(fills);

  // Get shape offset for centered shapes
  const vectorOffset = getVectorOffset(element.vectorType, element.width, element.height);

  // Get fill props for single fill (must be called unconditionally for hooks rule)
  const singleFillProps = useFillProps(
    enabledFills.length === 1 ? enabledFills[0] : null,
    element.width,
    element.height,
    vectorOffset.offsetX,
    vectorOffset.offsetY
  );

  // Get stroke props (from new system or legacy)
  const strokeProps = element.strokes
    ? useStrokeProps(element.strokes)
    : {
        stroke: element.stroke,
        strokeWidth: element.strokeWidth || 0,
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
    const target = groupRef.current || e.target;
    onTransform({
      x: target.x(),
      y: target.y(),
    });
    onTransformEnd();
  };

  const handleTransformEnd = (e: Konva.KonvaEventObject<Event>) => {
    const node = groupRef.current || shapeRef.current;
    if (!node) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    // Reset scale and apply to dimensions
    node.scaleX(1);
    node.scaleY(1);

    onTransform({
      x: node.x(),
      y: node.y(),
      width: Math.max(5, element.width * scaleX),
      height: Math.max(5, element.height * scaleY),
      rotation: node.rotation(),
    });
    onTransformEnd();
  };

  // Base props shared by all shapes (position, rotation, events)
  const baseProps = {
    id: element.id,
    x: element.x,
    y: element.y,
    rotation: element.rotation,
    opacity: element.opacity,
    draggable: !element.locked,
    onClick: onSelect as (e: Konva.KonvaEventObject<MouseEvent>) => void,
    onTap: onSelect as (e: Konva.KonvaEventObject<TouchEvent>) => void,
    onMouseDown: handleMouseDown,
    onDragStart: handleDragStart,
    onDragEnd: handleDragEnd,
    onTransformEnd: handleTransformEnd,
    onMouseEnter: onHover as (e: Konva.KonvaEventObject<MouseEvent>) => void,
    onMouseLeave: onHoverEnd as (e: Konva.KonvaEventObject<MouseEvent>) => void,
  };

  // Single fill - optimized path (no Group needed)
  if (enabledFills.length <= 1) {
    const shapeProps = {
      ...baseProps,
      ref: shapeRef as any,
      ...singleFillProps,
      ...strokeProps,
      ...effectProps,
    };

    return renderVector(element, shapeProps);
  }

  // Multiple fills - use Group with stacked shapes
  return (
    <Group
      {...baseProps}
      ref={groupRef as any}
    >
      {enabledFills.map((fillLayer, index) => {
        const isTopLayer = index === enabledFills.length - 1;

        return (
          <FillLayerShape
            key={fillLayer.id}
            element={element}
            fillLayer={fillLayer}
            isTopLayer={isTopLayer}
          />
        );
      })}
    </Group>
  );
}

/**
 * Individual fill layer vector component
 */
function FillLayerShape({
  element,
  fillLayer,
  isTopLayer,
}: {
  element: VectorElementType;
  fillLayer: FillLayer;
  isTopLayer: boolean;
}) {
  // Get shape offset for centered shapes
  const vectorOffset = getVectorOffset(element.vectorType, element.width, element.height);

  // Get fill props using shared renderer
  const fillProps = useFillProps(
    fillLayer,
    element.width,
    element.height,
    vectorOffset.offsetX,
    vectorOffset.offsetY
  );

  // Get stroke props (from new system or legacy) - only apply to top layer
  const strokeProps = isTopLayer && element.strokes
    ? useStrokeProps(element.strokes)
    : isTopLayer
    ? {
        stroke: element.stroke,
        strokeWidth: element.strokeWidth || 0,
      }
    : { stroke: undefined, strokeWidth: 0 };

  // Get effect props (from new system or legacy) - only apply to top layer
  const effectProps = isTopLayer && element.effects
    ? useEffectProps(element.effects)
    : isTopLayer && element.shadow?.enabled
    ? {
        shadowColor: element.shadow.color,
        shadowBlur: element.shadow.blur,
        shadowOffset: { x: element.shadow.offsetX, y: element.shadow.offsetY },
        shadowOpacity: 1,
      }
    : {};

  // Combine all props
  const allProps = {
    listening: isTopLayer,
    ...fillProps,
    ...strokeProps,
    ...effectProps,
  };

  return renderVector(element, allProps);
}

/**
 * Render the appropriate Konva shape based on vectorType
 */
function renderVector(element: VectorElementType, props: any) {
  switch (element.vectorType) {
    case 'rectangle':
      return (
        <Rect
          {...props}
          width={element.width}
          height={element.height}
          cornerRadius={element.cornerRadius ?? 0}
        />
      );

    case 'ellipse':
      return (
        <Ellipse
          {...props}
          offsetX={-element.width / 2}
          offsetY={-element.height / 2}
          radiusX={element.width / 2}
          radiusY={element.height / 2}
        />
      );

    case 'triangle':
      return (
        <RegularPolygon
          {...props}
          sides={3}
          radius={Math.min(element.width, element.height) / 2}
          offsetX={-element.width / 2}
          offsetY={-element.height / 2}
        />
      );

    case 'polygon':
      return (
        <RegularPolygon
          {...props}
          sides={element.sides ?? 6}
          radius={Math.min(element.width, element.height) / 2}
          offsetX={-element.width / 2}
          offsetY={-element.height / 2}
        />
      );

    case 'star':
      return (
        <Star
          {...props}
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
          {...props}
          width={element.width}
          height={element.height}
        />
      );
  }
}

// Legacy export for backward compatibility
export { VectorElement as ShapeElement };
