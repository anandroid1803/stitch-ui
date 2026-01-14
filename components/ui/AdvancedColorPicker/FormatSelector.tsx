'use client';

import { cn } from '@/lib/utils/cn';
import type { ColorFormat } from '@/lib/utils/color';

interface FormatSelectorProps {
  format: ColorFormat;
  onChange: (format: ColorFormat) => void;
}

const FORMAT_OPTIONS: { value: ColorFormat; label: string }[] = [
  { value: 'hex', label: 'HEX' },
  { value: 'pantone', label: 'PAN' },
  { value: 'rgb', label: 'RGB' },
  { value: 'hsb', label: 'HSB' },
];

export function FormatSelector({ format, onChange }: FormatSelectorProps) {
  return (
    <div className="flex items-center gap-1">
      {FORMAT_OPTIONS.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'px-4 py-1 rounded-sm text-sm font-medium transition-colors',
            format === option.value
              ? 'bg-primary/10 text-primary font-semibold'
              : 'text-text-tertiary hover:text-primary hover:bg-primary/10'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
