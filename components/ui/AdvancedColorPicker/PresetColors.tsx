'use client';

import { cn } from '@/lib/utils/cn';

interface PresetColorsProps {
  colors: string[];
  selectedColor: string;
  onSelect: (color: string) => void;
}

const DEFAULT_PRESET_COLORS = [
  '#000000', '#ffffff', '#f87171', '#fb923c', '#facc15', '#4ade80',
  '#22d3ee', '#60a5fa', '#a78bfa', '#f472b6', '#94a3b8', '#78716c',
  '#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#0891b2', '#2563eb',
  '#7c3aed', '#db2777', '#64748b', '#57534e', '#991b1b', '#9a3412',
];

export function PresetColors({
  colors = DEFAULT_PRESET_COLORS,
  selectedColor,
  onSelect,
}: PresetColorsProps) {
  const normalizedSelected = selectedColor.toLowerCase();

  return (
    <div className="grid grid-cols-6 gap-2">
      {colors.map((color) => {
        const isSelected = color.toLowerCase() === normalizedSelected;
        const isTransparent = color.toLowerCase() === 'transparent';

        return (
          <div key={color} className="flex items-center justify-center">
            <button
              onClick={() => onSelect(color)}
              className={cn(
                'w-8 h-8 rounded-full border-2 transition-all hover:scale-110',
                isSelected
                  ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-white border-white shadow-md'
                  : 'border-neutral-200 hover:border-neutral-300'
              )}
              style={{
                backgroundColor: isTransparent ? 'transparent' : color,
                backgroundImage: isTransparent
                  ? `linear-gradient(45deg, #ccc 25%, transparent 25%),
                     linear-gradient(-45deg, #ccc 25%, transparent 25%),
                     linear-gradient(45deg, transparent 75%, #ccc 75%),
                     linear-gradient(-45deg, transparent 75%, #ccc 75%)`
                  : undefined,
                backgroundSize: isTransparent ? '6px 6px' : undefined,
                backgroundPosition: isTransparent
                  ? '0 0, 0 3px, 3px -3px, -3px 0px'
                  : undefined,
              }}
              title={color}
            />
          </div>
        );
      })}
    </div>
  );
}
