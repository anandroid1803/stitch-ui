'use client';

import { Minus, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { AdvancedColorPicker } from '@/components/ui/AdvancedColorPicker';
import type { StrokeLayer } from '@/types/stroke';

interface StrokeLayerItemProps {
  layer: StrokeLayer;
  index: number;
  onUpdate: (updates: Partial<StrokeLayer>) => void;
  onDelete: () => void;
  documentColors?: string[];
}

export function StrokeLayerItem({
  layer,
  index,
  onUpdate,
  onDelete,
  documentColors = [],
}: StrokeLayerItemProps) {
  const handleColorChange = (color: string) => {
    onUpdate({ color });
  };

  const handleToggleEnabled = () => {
    onUpdate({ enabled: !layer.enabled });
  };

  return (
    <div className={cn(
      "flex items-center gap-2 transition-opacity min-w-0",
      !layer.enabled && "opacity-50 grayscale"
    )}>
      {/* Color picker */}
      <div className={cn("flex-1 min-w-0", !layer.enabled && "pointer-events-none")}>
        <AdvancedColorPicker
          value={layer.color}
          onChange={handleColorChange}
          showAlpha={true}
          showEyedropper={true}
          showDocumentColors={true}
          documentColors={documentColors}
          disabled={!layer.enabled}
        />
      </div>

      {/* Eye icon - toggle visibility */}
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
