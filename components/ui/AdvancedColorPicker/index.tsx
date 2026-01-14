'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Droplet } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import {
  hexToHsb,
  hsbToHex,
  parseAlpha,
  addAlphaToHex,
  type HSB,
  type ColorFormat,
} from '@/lib/utils/color';
import { ColorSpectrum } from './ColorSpectrum';
import { HueSlider } from './HueSlider';
import { FormatSelector } from './FormatSelector';
import { ColorInputs } from './ColorInputs';
import { DocumentColors } from './DocumentColors';
import { PresetColors } from './PresetColors';

interface AdvancedColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
  showAlpha?: boolean;
  showEyedropper?: boolean;
  showDocumentColors?: boolean;
  presetColors?: string[];
  documentColors?: string[];
  disabled?: boolean;
}

export function AdvancedColorPicker({
  value,
  onChange,
  label,
  showAlpha = true,
  showEyedropper = true,
  showDocumentColors = true,
  presetColors,
  documentColors = [],
  disabled = false,
}: AdvancedColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [format, setFormat] = useState<ColorFormat>('hex');
  const [pantoneHoverHsb, setPantoneHoverHsb] = useState<HSB | null>(null);

  // Track the last internal change to avoid infinite loop
  const lastInternalValue = useRef<string>(value);

  // Derive HSB and alpha from value prop, with internal override when user is interacting
  const [internalHsb, setInternalHsb] = useState<HSB | null>(null);
  const [internalAlpha, setInternalAlpha] = useState<number | null>(null);

  // Use internal state if set, otherwise derive from value prop
  const hsb = useMemo(() => {
    if (internalHsb !== null && lastInternalValue.current === value) {
      return internalHsb;
    }
    // Value changed externally, reset internal state
    return hexToHsb(value);
  }, [value, internalHsb]);

  const alpha = useMemo(() => {
    if (internalAlpha !== null && lastInternalValue.current === value) {
      return internalAlpha;
    }
    return parseAlpha(value);
  }, [value, internalAlpha]);

  const [alphaInput, setAlphaInput] = useState(() => Math.round(alpha * 100).toString());

  // Emit color change and update internal state
  const emitChange = useCallback(
    (newHsb: HSB, newAlpha: number) => {
      const hex = hsbToHex(newHsb);
      const finalColor = showAlpha && newAlpha < 1 ? addAlphaToHex(hex, newAlpha) : hex;
      lastInternalValue.current = finalColor;
      setInternalHsb(newHsb);
      setInternalAlpha(newAlpha);
      onChange(finalColor);
    },
    [onChange, showAlpha]
  );

  // Handle spectrum change
  const handleSpectrumChange = useCallback(
    (saturation: number, brightness: number) => {
      const newHsb = { ...hsb, s: saturation, b: brightness };
      emitChange(newHsb, alpha);
    },
    [hsb, alpha, emitChange]
  );

  // Handle hue change
  const handleHueChange = useCallback(
    (hue: number) => {
      const newHsb = { ...hsb, h: hue };
      emitChange(newHsb, alpha);
    },
    [hsb, alpha, emitChange]
  );

  // Handle input change (from spectrum, sliders, or RGB/HSB inputs)
  const handleInputChange = useCallback(
    (newHsb: HSB, newAlpha?: number) => {
      emitChange(newHsb, newAlpha ?? alpha);
    },
    [alpha, emitChange]
  );

  // Handle direct hex input - bypasses HSB conversion to preserve exact color
  const handleDirectHexChange = useCallback(
    (hexColor: string, newAlpha?: number) => {
      const finalAlpha = newAlpha ?? alpha;
      const finalColor = showAlpha && finalAlpha < 1 ? addAlphaToHex(hexColor, finalAlpha) : hexColor;
      // Update internal state to match the new hex
      const newHsb = hexToHsb(hexColor);
      lastInternalValue.current = finalColor;
      setInternalHsb(newHsb);
      setInternalAlpha(finalAlpha);
      // Emit the exact hex value without conversion
      onChange(finalColor);
    },
    [alpha, showAlpha, onChange]
  );

  // Handle preset/document color select
  const handleColorSelect = useCallback(
    (color: string) => {
      const newHsb = hexToHsb(color);
      const newAlpha = parseAlpha(color);
      emitChange(newHsb, newAlpha);
    },
    [emitChange]
  );

  // Handle eyedropper
  const handleEyedropper = useCallback(async () => {
    if (!('EyeDropper' in window)) {
      console.warn('EyeDropper API not supported');
      return;
    }

    try {
      // @ts-expect-error - EyeDropper is not in TypeScript lib yet
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      handleColorSelect(result.sRGBHex);
    } catch {
      // User cancelled or error
    }
  }, [handleColorSelect]);

  // Check if EyeDropper is available
  const eyedropperAvailable = typeof window !== 'undefined' && 'EyeDropper' in window;

  // Get current color for display
  const currentHex = hsbToHex(hsb);
  const displayColor = showAlpha && alpha < 1 ? addAlphaToHex(currentHex, alpha) : currentHex;

  // keep the inline alpha input in sync with derived alpha
  useEffect(() => {
    setAlphaInput(Math.round(alpha * 100).toString());
  }, [alpha]);

  const clampAlphaFromString = (raw: string) => {
    const num = parseInt(raw.replace(/%/g, '').trim(), 10);
    if (Number.isNaN(num)) return null;
    return Math.max(0, Math.min(100, num));
  };

  const applyInlineAlpha = () => {
    const clamped = clampAlphaFromString(alphaInput);
    if (clamped === null) {
      setAlphaInput(Math.round(alpha * 100).toString());
      return;
    }
    setAlphaInput(clamped.toString());
    emitChange(hsb, clamped / 100);
  };

  const handleInlineAlphaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/%/g, '').trim();
    setAlphaInput(raw);
  };

  const handleInlineAlphaBlur = () => {
    // On blur, reset to current derived alpha (no emit)
    setAlphaInput(Math.round(alpha * 100).toString());
  };

  const handleInlineAlphaKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      applyInlineAlpha();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      setAlphaInput(Math.round(alpha * 100).toString());
    }
  };

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-medium text-neutral-500">{label}</label>
      )}
      <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
        <Popover.Trigger asChild disabled={disabled}>
          <button
            type="button"
            className={cn(
              'w-full flex items-center gap-0.5 bg-[#f2f3f5] rounded-[10px] p-1',
              'hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-blue-500',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <div
              className={cn(
                'flex items-center gap-2 px-3 h-[32px] bg-white text-text-primary text-sm font-medium w-full',
                showAlpha ? 'rounded-l-lg rounded-r-xs' : 'rounded-lg flex-1'
              )}
            >
              <div
                className="w-8 h-8 rounded-full border border-neutral-200 flex-shrink-0 overflow-hidden"
                style={{
                  backgroundImage: `linear-gradient(45deg, #ccc 25%, transparent 25%),
                     linear-gradient(-45deg, #ccc 25%, transparent 25%),
                     linear-gradient(45deg, transparent 75%, #ccc 75%),
                     linear-gradient(-45deg, transparent 75%, #ccc 75%)`,
                  backgroundSize: '6px 6px',
                  backgroundPosition: '0 0, 0 3px, 3px -3px, -3px 0px',
                }}
              >
                <div
                  className="w-full h-full rounded-full"
                  style={{ backgroundColor: displayColor }}
                />
              </div>
              <span className="text-sm font-medium text-text-primary">
                {currentHex.toUpperCase()}
              </span>
            </div>
            {showAlpha && (
              <div className="w-[60px] flex items-center justify-center">
                <input
                  type="text"
                  value={`${alphaInput}%`}
                  onChange={handleInlineAlphaChange}
                  onBlur={handleInlineAlphaBlur}
                  onClick={(e) => e.stopPropagation()}
                  onFocus={(e) => e.stopPropagation()}
                  onKeyDown={handleInlineAlphaKeyDown}
                  className="color-picker-input text-xs text-text-secondary w-full h-[32px] text-center px-2 bg-white rounded-l-xs rounded-r-lg text-text-primary text-sm focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus:border-primary"
                />
              </div>
            )}
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            className="bg-white border-4 rounded-2xl shadow-xl border border-[#f2f3f5] p-4 z-50"
            style={{ width: 200 }}
            sideOffset={8}
            align="start"
            onOpenAutoFocus={(e) => e.preventDefault()}
            onPointerDownOutside={(e) => {
              // Close when clicking outside, but not on the trigger (let trigger handle toggle)
              const target = e.target as HTMLElement;
              if (target.closest('[data-radix-popover-trigger]')) {
                e.preventDefault();
              }
            }}
          >
            <div 
              className="flex flex-col gap-6"
              onPointerDown={(e) => e.stopPropagation()}
            >
              {/* Color spectrum */}
              <ColorSpectrum
                hue={hsb.h}
                saturation={hsb.s}
                brightness={hsb.b}
                onChange={handleSpectrumChange}
                pantoneHoverHsb={pantoneHoverHsb}
              />

              {/* Eyedropper and Hue slider row */}
              <div className="flex items-center gap-3">
                {/* Eyedropper button */}
                {showEyedropper && (
                  <button
                    onClick={eyedropperAvailable ? handleEyedropper : undefined}
                    className={cn(
                      'flex-shrink-0 p-1 rounded-sm transition-colors',
                      eyedropperAvailable
                        ? 'hover:bg-primary/10 text-text-tertiary hover:text-primary cursor-pointer'
                        : 'text-text-tertiary cursor-not-allowed'
                    )}
                    title={eyedropperAvailable ? 'Pick color from screen' : 'Eyedropper not supported'}
                    disabled={!eyedropperAvailable}
                  >
                    <Droplet size={16} />
                  </button>
                )}

                {/* Hue slider */}
                <div className="flex-1">
                  <HueSlider hue={hsb.h} onChange={handleHueChange} />
                </div>
              </div>

              {/* Format selector and color inputs */}
              <div className="flex flex-col items-center gap-4">
                <FormatSelector format={format} onChange={setFormat} />
                <ColorInputs
                  format={format}
                  hsb={hsb}
                  alpha={alpha}
                  onChange={handleInputChange}
                  onDirectHexChange={handleDirectHexChange}
                  onPantoneHover={setPantoneHoverHsb}
                />
              </div>

              {/* Document colors */}
              {showDocumentColors && (
                <DocumentColors
                  colors={documentColors}
                  selectedColor={currentHex}
                  onSelect={handleColorSelect}
                />
              )}

              {/* Preset colors - only show if document colors is empty or hidden */}
              {(!showDocumentColors || documentColors.length === 0) && (
                <PresetColors
                  colors={presetColors || [
                    '#f5f5f5', '#fafafa', '#d4d4d4', '#000000', '#7c3aed', '#a3a3a3',
                    '#ffffff', '#ef4444', '#22c55e', '#fef08a', '#fde047', '#d4a574',
                    '#0ea5e9', '#fb923c', '#059669', '#ca8a04', '#eab308', '#6366f1',
                  ]}
                  selectedColor={currentHex}
                  onSelect={handleColorSelect}
                />
              )}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
