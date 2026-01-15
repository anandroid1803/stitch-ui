'use client';

import { Plus } from 'lucide-react';
import { FillLayerItem } from './FillLayerItem';
import type { CanvasElement } from '@/types/document';
import type { FillLayer } from '@/types/fill';
import { createSolidFill } from '@/types/fill';

interface FillLayersPanelProps {
  element: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  documentColors?: string[];
}

export function FillLayersPanel({
  element,
  onUpdate,
  documentColors = [],
}: FillLayersPanelProps) {
  // Get fills array (with backward compatibility for all element types)
  // Only use legacy fill if fills array doesn't exist (undefined/null), not if it's empty
  const legacyFill = 'fill' in element ? (element as any).fill : undefined;
  const fills = element.fills !== undefined && element.fills !== null
    ? element.fills
    : legacyFill
    ? [createSolidFill(legacyFill, 1)]
    : [];

  const handleAddSolidFill = () => {
    const newFill = createSolidFill('#3b82f6', 1);
    onUpdate({ fills: [...fills, newFill] });
  };

  const handleUpdateFill = (index: number, updates: Partial<FillLayer>) => {
    const updatedFills = [...fills];
    updatedFills[index] = { ...updatedFills[index], ...updates } as FillLayer;
    onUpdate({ fills: updatedFills });
  };

  const handleDeleteFill = (index: number) => {
    const updatedFills = fills.filter((_, i) => i !== index);
    // Allow empty fills for all element types - VectorElement can render without fills
    // Also clear legacy fill to avoid fallback rehydrating it
    onUpdate({
      fills: updatedFills,
      ...(updatedFills.length === 0 ? { fill: undefined } : {}),
    });
  };

  const labelStyle = {
    fontSize: 11,
    fontWeight: 500,
    color: '#737373',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  };

  const iconStyle = { width: 12, height: 12 };

  return (
    <div className="flex flex-col gap-6 px-2 py-4 bg-white/50 border border-white rounded-sm mt-2">
      <div className="flex items-center justify-between">
        <label style={labelStyle}>Fill</label>
        <button
          onClick={handleAddSolidFill}
          className="hover:bg-primary/10 rounded-lg transition-colors group"
          title="Add Fill"
          style={{ padding: 6 }}
        >
          <Plus style={iconStyle} className="text-text-tertiary group-hover:text-primary" />
        </button>
      </div>

      {/* Fill layers list - render in reverse order (top layer first visually) */}
      <div className="flex flex-col gap-2">
        {[...fills].reverse().map((fill, reverseIndex) => {
          const index = fills.length - 1 - reverseIndex;
          return (
            <FillLayerItem
              key={fill.id}
              layer={fill}
              index={index}
              onUpdate={(updates) => handleUpdateFill(index, updates)}
              onDelete={() => handleDeleteFill(index)}
              documentColors={documentColors}
            />
          );
        })}
      </div>
    </div>
  );
}
