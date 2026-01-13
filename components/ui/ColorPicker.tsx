'use client';

import { useState, useRef, useEffect } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { cn } from '@/lib/utils/cn';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
  presetColors?: string[];
}

const DEFAULT_PRESET_COLORS = [
  '#000000', '#ffffff', '#f87171', '#fb923c', '#facc15', '#4ade80',
  '#22d3ee', '#60a5fa', '#a78bfa', '#f472b6', '#94a3b8', '#78716c',
];

export function ColorPicker({
  value,
  onChange,
  label,
  presetColors = DEFAULT_PRESET_COLORS,
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    if (/^#[0-9A-Fa-f]{6}$/.test(newValue)) {
      onChange(newValue);
    }
  };

  const handleInputBlur = () => {
    if (!/^#[0-9A-Fa-f]{6}$/.test(inputValue)) {
      setInputValue(value);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-medium text-neutral-500">{label}</label>
      )}
      <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
        <Popover.Trigger asChild>
          <button
            className={cn(
              'flex items-center gap-2 h-8 px-2 rounded border border-neutral-200',
              'hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
            )}
          >
            <div
              className="w-5 h-5 rounded border border-neutral-300"
              style={{ backgroundColor: value }}
            />
            <span className="text-xs font-mono text-neutral-600">
              {value.toUpperCase()}
            </span>
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            className="bg-white rounded-lg shadow-lg border border-neutral-200 p-3 z-50"
            sideOffset={5}
          >
            <div className="flex flex-col gap-3">
              {/* Color input */}
              <input
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-32 rounded cursor-pointer"
              />

              {/* Hex input */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-500">HEX</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  className={cn(
                    'flex-1 h-8 px-2 rounded border border-neutral-200 text-sm font-mono',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500'
                  )}
                />
              </div>

              {/* Preset colors */}
              <div className="grid grid-cols-6 gap-1">
                {presetColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      onChange(color);
                      setIsOpen(false);
                    }}
                    className={cn(
                      'w-6 h-6 rounded border border-neutral-200',
                      'hover:scale-110 transition-transform',
                      value === color && 'ring-2 ring-blue-500 ring-offset-1'
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <Popover.Arrow className="fill-white" />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
