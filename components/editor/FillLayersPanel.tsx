'use client';

import { useState } from 'react';
import { Plus, ChevronDown } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { FillLayerItem } from './FillLayerItem';
import type { ShapeElement } from '@/types/document';
import type { FillLayer } from '@/types/fill';
import { createSolidFill, createImageFill } from '@/types/fill';

interface FillLayersPanelProps {
  element: ShapeElement;
  onUpdate: (updates: Partial<ShapeElement>) => void;
  documentColors?: string[];
}

export function FillLayersPanel({
  element,
  onUpdate,
  documentColors = [],
}: FillLayersPanelProps) {
  // Get fills array (with backward compatibility)
  const fills = element.fills && element.fills.length > 0
    ? element.fills
    : [createSolidFill(element.fill, 1)];

  const handleAddSolidFill = () => {
    const newFill = createSolidFill('#3b82f6', 1);
    onUpdate({ fills: [...fills, newFill] });
  };

  const handleAddImageFill = () => {
    // Create placeholder image fill - user will add image via picker
    const newFill = createImageFill('', undefined, undefined, 1);
    onUpdate({ fills: [...fills, newFill] });
  };

  const handleUpdateFill = (index: number, updates: Partial<FillLayer>) => {
    const updatedFills = [...fills];
    updatedFills[index] = { ...updatedFills[index], ...updates } as FillLayer;
    onUpdate({ fills: updatedFills });
  };

  const handleDeleteFill = (index: number) => {
    const updatedFills = fills.filter((_, i) => i !== index);
    // Keep at least one fill
    if (updatedFills.length === 0) {
      updatedFills.push(createSolidFill('#3b82f6', 1));
    }
    onUpdate({ fills: updatedFills });
  };

  const labelStyle = {
    fontSize: 11,
    fontWeight: 500,
    color: '#737373',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  };

  return (
    <div className="flex flex-col gap-2 px-2 py-4 bg-white/50 border border-white rounded-sm mt-2">
      <label style={labelStyle}>Fill</label>

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

      {/* Add fill button with dropdown */}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Fill
            <ChevronDown className="w-3 h-3 text-neutral-400" />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="bg-white rounded-lg shadow-lg border border-neutral-200 p-1 z-50 min-w-[140px]"
            sideOffset={5}
          >
            <DropdownMenu.Item
              className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded cursor-pointer outline-none"
              onSelect={handleAddSolidFill}
            >
              <div className="w-4 h-4 rounded bg-blue-500" />
              Solid Color
            </DropdownMenu.Item>

            <DropdownMenu.Item
              className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded cursor-pointer outline-none"
              onSelect={handleAddImageFill}
            >
              <div className="w-4 h-4 rounded border border-neutral-300 bg-gradient-to-br from-purple-400 to-pink-400" />
              Image Fill
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}
