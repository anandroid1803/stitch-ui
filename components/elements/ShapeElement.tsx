'use client';

import { useRef, useEffect, useState } from 'react';
import { Rect, Ellipse, RegularPolygon, Star, Group } from 'react-konva';
import type Konva from 'konva';
import type { ShapeElement as ShapeElementType, CanvasElement } from '@/types/document';
import type { FillLayer, ImageFillLayer } from '@/types/fill';
import { isImageFill } from '@/types/fill';

interface ShapeElementProps {
  element: ShapeElementType;
  isSelected: boolean;
  onSelect: (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => void;
  onTransform: (newAttrs: Partial<CanvasElement>) => void;
  onTransformEnd: () => void;
  onHover: () => void;
  onHoverEnd: () => void;
}

/**
 * Calculate scale and offset for image fill with "cover" behavior
 * Maintains aspect ratio and fills entire shape, cropping if needed
 * @param offsetXPercent - 0 (left), 0.5 (center), 1 (right)
 * @param offsetYPercent - 0 (top), 0.5 (center), 1 (bottom)
 * @param shapeOffsetX - Shape's own offset (for ellipse, triangle, etc.)
 * @param shapeOffsetY - Shape's own offset (for ellipse, triangle, etc.)
 */
function calculateCoverTransform(
  containerWidth: number,
  containerHeight: number,
  imageWidth: number,
  imageHeight: number,
  offsetXPercent = 0.5,
  offsetYPercent = 0.5,
  shapeOffsetX = 0,
  shapeOffsetY = 0
) {
  const containerRatio = containerWidth / containerHeight;
  const imageRatio = imageWidth / imageHeight;

  // Calculate scale to cover container while maintaining aspect ratio
  let scale: { x: number; y: number };
  if (imageRatio > containerRatio) {
    // Image is wider - scale to height, image will overflow horizontally
    const scaleFactor = containerHeight / imageHeight;
    scale = { x: scaleFactor, y: scaleFactor };
  } else {
    // Image is taller - scale to width, image will overflow vertically
    const scaleFactor = containerWidth / imageWidth;
    scale = { x: scaleFactor, y: scaleFactor };
  }

  // Calculate overflow (how much the scaled image exceeds container)
  const scaledWidth = imageWidth * scale.x;
  const scaledHeight = imageHeight * scale.y;
  const overflowX = scaledWidth - containerWidth;
  const overflowY = scaledHeight - containerHeight;

  // Position based on offset percentage
  // Negative offset to move the pattern (moves image left/up inside the shape)
  // Also account for shape's own offset (for centered shapes like ellipse/triangle)
  const offset = {
    x: shapeOffsetX - overflowX * offsetXPercent,
    y: shapeOffsetY - overflowY * offsetYPercent,
  };

  return { scale, offset };
}

/**
 * Get shape offset based on shape type
 * Some shapes (ellipse, triangle, etc.) are centered using offsetX/offsetY
 */
function getShapeOffset(shapeType: string, width: number, height: number) {
  switch (shapeType) {
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

/**
 * Hook to load and cache image for fillPattern
 */
function useImageFillPattern(fillLayer: ImageFillLayer | null) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Reset state if no fill layer or empty src
    if (!fillLayer || !fillLayer.src) {
      setImage(null);
      setIsLoading(false);
      setError(false);
      return;
    }

    setIsLoading(true);
    setError(false);

    const img = new window.Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      setImage(img);
      setIsLoading(false);
    };

    img.onerror = () => {
      setError(true);
      setIsLoading(false);
      console.error('Failed to load image fill:', fillLayer.src);
    };

    img.src = fillLayer.src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [fillLayer?.src]);

  return { image, isLoading, error };
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
  const groupRef = useRef<Konva.Group>(null);

  // Track if middle mouse was pressed to prevent dragging
  const middleMouseRef = useRef(false);

  // Determine which fills to use
  const fills = element.fills && element.fills.length > 0
    ? element.fills
    : [{ id: 'legacy', type: 'solid' as const, color: element.fill, enabled: true, opacity: 1 }];

  // Only render enabled fills
  const enabledFills = fills.filter(f => f.enabled);

  // Load image for single fill path (must be called unconditionally for hooks rule)
  const singleFillImageLayer = enabledFills.length === 1 && enabledFills[0] && isImageFill(enabledFills[0])
    ? (enabledFills[0] as ImageFillLayer)
    : null;
  const singleFillImage = useImageFillPattern(singleFillImageLayer);

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

  // Single fill - backward compatibility path (no Group needed)
  if (enabledFills.length <= 1) {
    const fillLayer = enabledFills[0];
    const { image } = singleFillImage;

    // Props for single shape with stroke and shadow
    const shapeProps = {
      ...baseProps,
      ref: shapeRef as any,
      stroke: element.stroke,
      strokeWidth: element.strokeWidth,
      ...(element.shadow?.enabled && {
        shadowColor: element.shadow.color,
        shadowBlur: element.shadow.blur,
        shadowOffset: { x: element.shadow.offsetX, y: element.shadow.offsetY },
        shadowOpacity: 1,
      }),
    };

    // Add fill or pattern
    let fillProps = {};
    if (fillLayer) {
      if (isImageFill(fillLayer) && image) {
        const shapeOffset = getShapeOffset(element.shapeType, element.width, element.height);
        const { scale, offset } = calculateCoverTransform(
          element.width,
          element.height,
          fillLayer.imageWidth || image.width,
          fillLayer.imageHeight || image.height,
          fillLayer.offsetX ?? 0.5,
          fillLayer.offsetY ?? 0.5,
          shapeOffset.offsetX,
          shapeOffset.offsetY
        );
        fillProps = {
          fillPatternImage: image,
          fillPatternScale: scale,
          fillPatternOffset: offset,
          opacity: fillLayer.opacity,
        };
      } else if (!isImageFill(fillLayer)) {
        fillProps = {
          fill: fillLayer.color,
          opacity: fillLayer.opacity,
        };
      }
    }

    return renderShape(element, { ...shapeProps, ...fillProps });
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
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
            shadow={element.shadow}
          />
        );
      })}
    </Group>
  );
}

/**
 * Individual fill layer shape component
 */
function FillLayerShape({
  element,
  fillLayer,
  isTopLayer,
  stroke,
  strokeWidth,
  shadow,
}: {
  element: ShapeElementType;
  fillLayer: FillLayer;
  isTopLayer: boolean;
  stroke: string;
  strokeWidth: number;
  shadow?: any;
}) {
  const { image } = useImageFillPattern(isImageFill(fillLayer) ? fillLayer : null);

  // Props for fill layer (no position, as it's inside Group)
  const layerProps = {
    listening: isTopLayer, // Top layer handles events (Group also listens)
    // Only apply stroke and shadow to top layer
    ...(isTopLayer && {
      stroke,
      strokeWidth,
      ...(shadow?.enabled && {
        shadowColor: shadow.color,
        shadowBlur: shadow.blur,
        shadowOffset: { x: shadow.offsetX, y: shadow.offsetY },
        shadowOpacity: 1,
      }),
    }),
  };

  // Add fill or pattern
  let fillProps = {};
  if (isImageFill(fillLayer) && image) {
    const shapeOffset = getShapeOffset(element.shapeType, element.width, element.height);
    const { scale, offset } = calculateCoverTransform(
      element.width,
      element.height,
      fillLayer.imageWidth || image.width,
      fillLayer.imageHeight || image.height,
      fillLayer.offsetX ?? 0.5,
      fillLayer.offsetY ?? 0.5,
      shapeOffset.offsetX,
      shapeOffset.offsetY
    );
    fillProps = {
      fillPatternImage: image,
      fillPatternScale: scale,
      fillPatternOffset: offset,
      opacity: fillLayer.opacity,
    };
  } else if (!isImageFill(fillLayer)) {
    fillProps = {
      fill: fillLayer.color,
      opacity: fillLayer.opacity,
    };
  }

  return renderShape(element, { ...layerProps, ...fillProps });
}

/**
 * Render the appropriate Konva shape based on shapeType
 */
function renderShape(element: ShapeElementType, props: any) {
  switch (element.shapeType) {
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
