'use client';

import { Minus, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { AdvancedColorPicker, type FillPickerMode } from '@/components/ui/AdvancedColorPicker';
import type { FillLayer, SolidFillLayer, ImageFillLayer } from '@/types/fill';
import { isSolidFill, isImageFill } from '@/types/fill';

interface FillLayerItemProps {
  layer: FillLayer;
  index: number;
  onUpdate: (updates: Partial<FillLayer>) => void;
  onDelete: () => void;
  documentColors?: string[];
}

export function FillLayerItem({
  layer,
  index,
  onUpdate,
  onDelete,
  documentColors = [],
}: FillLayerItemProps) {

  const handleFillTypeChange = (newType: FillPickerMode) => {
    // Don't do anything if already this type
    if (layer.type === newType) return;

    // Preserve common properties
    const commonProps = {
      id: layer.id,
      enabled: layer.enabled,
      opacity: layer.opacity,
    };

    if (newType === 'solid') {
      // Convert to solid fill
      onUpdate({
        ...commonProps,
        type: 'solid',
        color: '#3b82f6',
      } as SolidFillLayer);
    } else {
      // Convert to image fill
      onUpdate({
        ...commonProps,
        type: 'image',
        src: '',
        scaleMode: 'cover',
        offsetX: 0.5,
        offsetY: 0.5,
      } as ImageFillLayer);
    }
  };

  const handleColorChange = (color: string) => {
    onUpdate({ color });
  };

  const handleImageFillChange = (data: { src?: string; imageWidth?: number; imageHeight?: number; offsetX?: number; offsetY?: number }) => {
    onUpdate(data);
  };

  const handleToggleEnabled = () => {
    onUpdate({ enabled: !layer.enabled });
  };

  // Get the color value for display (for solid fills)
  const colorValue = isSolidFill(layer) ? layer.color : '#000000';

  // Get image fill data (for image fills)
  const imageFillData = isImageFill(layer) ? {
    src: layer.src,
    imageWidth: layer.imageWidth,
    imageHeight: layer.imageHeight,
    offsetX: layer.offsetX,
    offsetY: layer.offsetY,
  } : undefined;

  return (
    <div className={cn(
      "flex items-center gap-2 transition-opacity min-w-0",
      !layer.enabled && "opacity-50 grayscale"
    )}>
      {/* Color picker with fill mode */}
      <div className={cn("flex-1 min-w-0", !layer.enabled && "pointer-events-none")}>
        <AdvancedColorPicker
          value={colorValue}
          onChange={handleColorChange}
          showAlpha={true}
          showEyedropper={true}
          showDocumentColors={true}
          documentColors={documentColors}
          fillMode={true}
          fillType={layer.type}
          onFillTypeChange={handleFillTypeChange}
          imageFillData={imageFillData}
          onImageFillChange={handleImageFillChange}
          disabled={!layer.enabled}
        />
      </div>

      {/* Eye icon - toggle visibility */}
      <button
        onClick={handleToggleEnabled}
        className="p-1 hover:bg-neutral-200 rounded transition-colors flex-shrink-0 group"
        title={layer.enabled ? 'Hide fill' : 'Show fill'}
      >
        {layer.enabled ? (
          <Eye className="w-6 h-6 text-neutral-400 group-hover:text-neutral-800" />
        ) : (
          <EyeOff className="w-6 h-6 text-neutral-400 group-hover:text-neutral-800" />
        )}
      </button>

      {/* Delete button - always enabled to allow deletion */}
      <button
        onClick={onDelete}
        className="p-1 hover:bg-red-50 rounded transition-colors group flex-shrink-0"
        title="Delete fill"
      >
        <Minus className="w-6 h-6 text-neutral-400 group-hover:text-red-600" />
      </button>
    </div>
  );
}
