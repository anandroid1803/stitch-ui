'use client';

import { useState, useEffect, useRef } from 'react';
import type { ColorFormat, HSB, RGB } from '@/lib/utils/color';
import { hsbToRgb, rgbToHsb, hexToRgb, rgbToHex, isValidHex } from '@/lib/utils/color';
import { findClosestPantone, type PantoneColor } from '@/lib/utils/pantone';

interface ColorInputsProps {
  format: ColorFormat;
  hsb: HSB;
  alpha: number;
  onChange: (hsb: HSB, alpha?: number) => void;
  onDirectHexChange?: (hex: string, alpha?: number) => void;
  onPantoneHover?: (pantoneHsb: HSB | null) => void;
}

export function ColorInputs({ format, hsb, alpha, onChange, onDirectHexChange, onPantoneHover }: ColorInputsProps) {
  const rgb = hsbToRgb(hsb);
  const hex = rgbToHex(rgb);

  switch (format) {
    case 'hex':
      return <HexInput hex={hex} alpha={alpha} onChange={onChange} onDirectHexChange={onDirectHexChange} />;
    case 'rgb':
      return <RgbInput rgb={rgb} alpha={alpha} onChange={onChange} />;
    case 'hsb':
      return <HsbInput hsb={hsb} alpha={alpha} onChange={onChange} />;
    case 'pantone':
      return <PantoneInput rgb={rgb} onChange={onChange} onHover={onPantoneHover} />;
    default:
      return null;
  }
}

// HEX Input
export interface HexInputProps {
  hex: string;
  alpha: number;
  onChange: (hsb: HSB, alpha?: number) => void;
  onDirectHexChange?: (hex: string, alpha?: number) => void;
}

export function HexInput({ hex, alpha, onChange, onDirectHexChange }: HexInputProps) {
  const [inputValue, setInputValue] = useState(hex);
  const [alphaInputValue, setAlphaInputValue] = useState(() => Math.round(alpha * 100).toString());
  const [isFocused, setIsFocused] = useState(false);
  const lastExternalHex = useRef(hex);

  const normalizeHex = (rawValue: string): string | null => {
    const cleaned = rawValue.trim().replace(/^#/, '').replace(/[^0-9a-fA-F]/g, '');
    if (cleaned.length === 0) return null;

    let expanded = cleaned;

    // Figma-style expansion: repeat the pattern to fill 6 chars
    if (cleaned.length === 1) {
      // "A" -> "AAAAAA"
      expanded = cleaned.repeat(6);
    } else if (cleaned.length === 2) {
      // "1E" -> "1E1E1E"
      expanded = cleaned.repeat(3);
    } else if (cleaned.length === 3) {
      // "1E1" -> "1E11E1" (standard CSS shorthand)
      expanded = cleaned.split('').map((c) => c + c).join('');
    } else if (cleaned.length === 4) {
      // "1E1E" -> "1E1E1E" (repeat first 2)
      expanded = cleaned + cleaned.slice(0, 2);
    } else if (cleaned.length === 5) {
      // "1E1E1" -> "1E1E11" (add first char)
      expanded = cleaned + cleaned[0];
    } else {
      // 6+ chars - just take first 6
      expanded = cleaned.slice(0, 6);
    }

    return `#${expanded.toUpperCase()}`;
  };

  // Only sync from external hex when it actually changes AND we're not focused
  useEffect(() => {
    if (!isFocused && hex !== lastExternalHex.current) {
      setInputValue(hex);
      lastExternalHex.current = hex;
    }
  }, [hex, isFocused]);

  useEffect(() => {
    if (!isFocused) {
      setAlphaInputValue(Math.round(alpha * 100).toString());
    }
  }, [alpha, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.toUpperCase();
    // Allow only valid hex characters and #
    value = value.replace(/[^#0-9A-F]/gi, '');
    if (!value.startsWith('#')) {
      value = '#' + value;
    }
    // Limit to # + 6 chars max while typing
    if (value.length > 7) {
      value = value.slice(0, 7);
    }
    setInputValue(value);
    // Don't call onChange during typing - only on blur/enter
  };

  const finalizeHexInput = () => {
    setIsFocused(false);
    const normalized = normalizeHex(inputValue);
    if (normalized && isValidHex(normalized)) {
      setInputValue(normalized);
      lastExternalHex.current = normalized;
      // Use direct hex change if available to preserve exact color
      if (onDirectHexChange) {
        onDirectHexChange(normalized);
      } else {
        const rgb = hexToRgb(normalized);
        const newHsb = rgbToHsb(rgb);
        onChange(newHsb);
      }
      return;
    }
    setInputValue(hex);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    finalizeHexInput();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      finalizeHexInput();
      (e.target as HTMLInputElement).blur();
    }
    if (e.key === 'Escape') {
      setInputValue(hex);
      setIsFocused(false);
      (e.target as HTMLInputElement).blur();
    }
  };

  const handleAlphaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/%/g, '').trim();
    setAlphaInputValue(value);

    const numValue = parseInt(value) || 0;
    const newAlpha = Math.max(0, Math.min(100, numValue)) / 100;
    const rgb = hexToRgb(hex);
    onChange(rgbToHsb(rgb), newAlpha);
  };

  const handleAlphaBlur = () => {
    const numValue = parseInt(alphaInputValue.replace(/%/g, '').trim()) || 0;
    const clampedValue = Math.max(0, Math.min(100, numValue));
    setAlphaInputValue(clampedValue.toString());
  };

  return (
    <div className="flex items-center gap-0.5 bg-[#f2f3f5] rounded-[10px] p-1">
      <div className="flex">
        <input
          type="text"
          value={inputValue.toUpperCase()}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="color-picker-input font-medium w-full h-[32px] px-3 bg-white rounded-l-lg rounded-r-xs text-text-primary text-sm focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus:border-primary"
          maxLength={7}
        />
      </div>
      <div className='w-[60px] flex items-center justify-center'>
        <input
          type="text"
          value={`${alphaInputValue}%`}
          onChange={handleAlphaChange}
          onBlur={handleAlphaBlur}
          className="color-picker-input text-xs text-text-secondary w-full h-[32px] px-2 bg-white rounded-l-xs rounded-r-lg text-text-primary text-sm focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus:border-primary"
        />
      </div>
    </div>
  );
}

// RGB Input
interface RgbInputProps {
  rgb: RGB;
  alpha: number;
  onChange: (hsb: HSB, alpha?: number) => void;
}

function RgbInput({ rgb, alpha, onChange }: RgbInputProps) {
  const [rValue, setRValue] = useState(rgb.r.toString());
  const [gValue, setGValue] = useState(rgb.g.toString());
  const [bValue, setBValue] = useState(rgb.b.toString());
  const [alphaInputValue, setAlphaInputValue] = useState(() => Math.round(alpha * 100).toString());

  useEffect(() => {
    setRValue(rgb.r.toString());
    setGValue(rgb.g.toString());
    setBValue(rgb.b.toString());
  }, [rgb]);

  useEffect(() => {
    setAlphaInputValue(Math.round(alpha * 100).toString());
  }, [alpha]);

  const handleChange = (channel: 'r' | 'g' | 'b', value: string) => {
    const numValue = parseInt(value) || 0;
    const clampedValue = Math.max(0, Math.min(255, numValue));
    
    if (channel === 'r') setRValue(value);
    else if (channel === 'g') setGValue(value);
    else setBValue(value);

    const newRgb = { ...rgb, [channel]: clampedValue };
    onChange(rgbToHsb(newRgb));
  };

  const handleBlur = (channel: 'r' | 'g' | 'b') => {
    const currentValue = channel === 'r' ? rValue : channel === 'g' ? gValue : bValue;
    const numValue = parseInt(currentValue) || 0;
    const clampedValue = Math.max(0, Math.min(255, numValue));
    
    if (channel === 'r') setRValue(clampedValue.toString());
    else if (channel === 'g') setGValue(clampedValue.toString());
    else setBValue(clampedValue.toString());

    const newRgb = { ...rgb, [channel]: clampedValue };
    onChange(rgbToHsb(newRgb));
  };

  const handleAlphaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/%/g, '').trim();
    setAlphaInputValue(value);

    const numValue = parseInt(value) || 0;
    const newAlpha = Math.max(0, Math.min(100, numValue)) / 100;
    onChange(rgbToHsb(rgb), newAlpha);
  };

  const handleAlphaBlur = () => {
    const numValue = parseInt(alphaInputValue.replace(/%/g, '').trim()) || 0;
    const clampedValue = Math.max(0, Math.min(100, numValue));
    setAlphaInputValue(clampedValue.toString());
  };

  return (
    <div className="flex items-center gap-0.5 bg-[#f2f3f5] rounded-[10px] p-1">
      <div className="flex">
        <input
          type="text"
          value={rValue}
          onChange={(e) => handleChange('r', e.target.value)}
          onBlur={() => handleBlur('r')}
          className="color-picker-input w-[40px] h-[32px] font-medium px-3 bg-white rounded-l-lg rounded-r-xs text-text-primary text-sm text-center focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus:border-primary"
        />
      </div>
      <div className="flex">
        <input
          type="text"
          value={gValue}
          onChange={(e) => handleChange('g', e.target.value)}
          onBlur={() => handleBlur('g')}
          className="color-picker-input w-[40px] h-[32px] font-medium px-2 bg-white rounded-xs text-text-primary text-sm text-center focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus:border-primary"
        />
      </div>
      <div className="flex">
        <input
          type="text"
          value={bValue}
          onChange={(e) => handleChange('b', e.target.value)}
          onBlur={() => handleBlur('b')}
          className="color-picker-input  font-medium w-[40px] h-[32px] px-2 bg-white rounded-xs text-text-primary text-sm text-center focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus:border-primary"
        />
      </div>
      <div className="w-full flex items-center justify-center">
        <input
          type="text"
          value={`${alphaInputValue}%`}
          onChange={handleAlphaChange}
          onBlur={handleAlphaBlur}
          className="color-picker-input text-xs text-text-secondary w-full h-[32px] px-2 bg-white rounded-l-xs rounded-r-lg text-text-primary text-sm text-center focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus:border-primary"
        />
      </div>
    </div>
  );
}

// HSB Input
interface HsbInputProps {
  hsb: HSB;
  alpha: number;
  onChange: (hsb: HSB, alpha?: number) => void;
}

function HsbInput({ hsb, alpha, onChange }: HsbInputProps) {
  const [hValue, setHValue] = useState(hsb.h.toString());
  const [sValue, setSValue] = useState(hsb.s.toString());
  const [bValue, setBValue] = useState(hsb.b.toString());
  const [alphaInputValue, setAlphaInputValue] = useState(() => Math.round(alpha * 100).toString());

  useEffect(() => {
    setHValue(hsb.h.toString());
    setSValue(hsb.s.toString());
    setBValue(hsb.b.toString());
  }, [hsb]);

  useEffect(() => {
    setAlphaInputValue(Math.round(alpha * 100).toString());
  }, [alpha]);

  const handleChange = (channel: 'h' | 's' | 'b', value: string) => {
    const maxValue = channel === 'h' ? 360 : 100;
    const numValue = parseInt(value) || 0;
    const clampedValue = Math.max(0, Math.min(maxValue, numValue));
    
    if (channel === 'h') setHValue(value);
    else if (channel === 's') setSValue(value);
    else setBValue(value);

    const newHsb = { ...hsb, [channel]: clampedValue };
    onChange(newHsb);
  };

  const handleBlur = (channel: 'h' | 's' | 'b') => {
    const currentValue = channel === 'h' ? hValue : channel === 's' ? sValue : bValue;
    const maxValue = channel === 'h' ? 360 : 100;
    const numValue = parseInt(currentValue) || 0;
    const clampedValue = Math.max(0, Math.min(maxValue, numValue));
    
    if (channel === 'h') setHValue(clampedValue.toString());
    else if (channel === 's') setSValue(clampedValue.toString());
    else setBValue(clampedValue.toString());

    const newHsb = { ...hsb, [channel]: clampedValue };
    onChange(newHsb);
  };

  const handleAlphaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/%/g, '').trim();
    setAlphaInputValue(value);

    const numValue = parseInt(value) || 0;
    const newAlpha = Math.max(0, Math.min(100, numValue)) / 100;
    onChange(hsb, newAlpha);
  };

  const handleAlphaBlur = () => {
    const numValue = parseInt(alphaInputValue.replace(/%/g, '').trim()) || 0;
    const clampedValue = Math.max(0, Math.min(100, numValue));
    setAlphaInputValue(clampedValue.toString());
  };

  return (
    <div className="flex items-center gap-0.5 bg-[#f2f3f5] rounded-[10px] p-1">
      <div className="flex">
        <input
          type="text"
          value={hValue}
          onChange={(e) => handleChange('h', e.target.value)}
          onBlur={() => handleBlur('h')}
          className="color-picker-input w-[40px] h-[32px] font-medium px-3 bg-white rounded-l-lg rounded-r-xs text-text-primary text-sm text-center focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus:border-primary"
        />
      </div>
      <div className="flex">
        <input
          type="text"
          value={sValue}
          onChange={(e) => handleChange('s', e.target.value)}
          onBlur={() => handleBlur('s')}
          className="color-picker-input w-[40px] h-[32px] font-medium px-2 bg-white rounded-xs text-text-primary text-sm text-center focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus:border-primary"
        />
      </div>
      <div className="flex">
        <input
          type="text"
          value={bValue}
          onChange={(e) => handleChange('b', e.target.value)}
          onBlur={() => handleBlur('b')}
          className="color-picker-input font-medium w-[40px] h-[32px] px-2 bg-white rounded-xs text-text-primary text-sm text-center focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus:border-primary"
        />
      </div>
      <div className="w-full flex items-center justify-center">
        <input
          type="text"
          value={`${alphaInputValue}%`}
          onChange={handleAlphaChange}
          onBlur={handleAlphaBlur}
          className="color-picker-input text-xs text-text-secondary w-full h-[32px] px-2 bg-white rounded-l-xs rounded-r-lg text-text-primary text-sm text-center focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus:border-primary"
        />
      </div>
    </div>
  );
}

// Pantone Input
interface PantoneInputProps {
  rgb: RGB;
  onChange: (hsb: HSB) => void;
  onHover?: (pantoneHsb: HSB | null) => void;
}

function PantoneInput({ rgb, onChange, onHover }: PantoneInputProps) {
  const closestPantone = findClosestPantone(rgb);
  const pantoneHsb = rgbToHsb(closestPantone.rgb);

  const handleSelectPantone = (pantone: PantoneColor) => {
    const newHsb = rgbToHsb(pantone.rgb);
    onChange(newHsb);
  };

  const handleMouseEnter = () => {
    onHover?.(pantoneHsb);
  };

  const handleMouseLeave = () => {
    onHover?.(null);
  };

  return (
    <div className="flex items-center gap-0.5 bg-[#f2f3f5] rounded-[10px] p-1 w-full">
      <button
        onClick={() => handleSelectPantone(closestPantone)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="flex items-center gap-3 px-3 py-2 w-full h-[32px] bg-white rounded-lg bg-neutral-50 transition-colors"
      >
        <div
          className="w-6 h-6 rounded-md border border-neutral-300 flex-shrink-0"
          style={{ backgroundColor: closestPantone.hex }}
        />
        <div className="flex items-center flex-1 min-w-0 justify-between">
          <span className="text-text-primary text-left text-sm font-medium truncate w-full ">{closestPantone.name}</span>
          <span className="text-text-secondary text-right text-xs w-full">{closestPantone.code}</span>
        </div>
      </button>
    </div>
  );
}
