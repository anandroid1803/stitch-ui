'use client';

import { cn } from '@/lib/utils/cn';
import { IconSelector } from '@tabler/icons-react';
import { useState } from 'react';

interface DocumentColorsProps {
  colors: string[];
  trendingColors?: string[];
  selectedColor: string;
  onSelect: (color: string) => void;
}

export function DocumentColors({
  colors,
  trendingColors,
  selectedColor,
  onSelect,
}: DocumentColorsProps) {
  const [activeSet, setActiveSet] = useState<'page' | 'trending'>('page');
  const normalizedSelected = selectedColor.toLowerCase();

  const dedupeColors = (list: string[]) => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const color of list) {
      const key = color.trim().toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      result.push(color);
    }
    return result;
  };

  const onThisPageColors = dedupeColors(colors);
  const trendingList = dedupeColors(
    trendingColors ?? [
      '#1E1E1E', '#FFFFFF', '#C8A2C8', '#A7C7E7', '#98FF98',
      '#FFB3B3', '#FFC300', '#FF6F61', '#B565A7', '#50C878',
      '#FF007F', '#6B5B95', '#88B04B', '#92A8D1', '#F7CAC9',
      '#955251', '#B1B3B3', '#FFD662', '#00539C', '#EEA47F',
      '#2A4B7C', '#F5DF4D', '#8A307F', '#4B0082', '#E94B3C'
    ]
  );

  const activeColors = activeSet === 'page' ? onThisPageColors : trendingList;

  if (activeColors.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => setActiveSet(activeSet === 'page' ? 'trending' : 'page')}
        className="flex items-center justify-between gap-2 w-full px-2 py-1 text-neutral-500 hover:text-neutral-700 hover:bg-[#f2f3f5] rounded-sm transition-colors group"
        title={activeSet === 'page' ? 'Show trending colors' : 'Show page colors'}
      >
        <div className="text-xs font-medium text-neutral-700">
          {activeSet === 'page' ? 'On this page' : 'Trending'}
        </div>
        <IconSelector size={14} />
      </button>

      <div className="grid grid-cols-6 gap-2 p-2">
        {activeColors.map((color, index) => {
          const isSelected = color.toLowerCase() === normalizedSelected;

          return (
            <div key={`${color}-${index}`} className="flex items-center justify-center">
              <button
                onClick={() => onSelect(color)}
                className={cn(
                  'w-10 h-10 rounded-full border-1 border-neutral-300 hover:scale-105 transition-all cursor-pointer',
                  isSelected
                    ? 'scale-110'
                    : 'border-neutral-200 hover:border-neutral-300'
                )}
                style={{ backgroundColor: color }}
                title={color}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
