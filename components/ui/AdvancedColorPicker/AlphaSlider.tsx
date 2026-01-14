'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import { hsbToHex } from '@/lib/utils/color';

interface AlphaSliderProps {
  alpha: number;
  hue: number;
  saturation: number;
  brightness: number;
  onChange: (alpha: number) => void;
}

export function AlphaSlider({
  alpha,
  hue,
  saturation,
  brightness,
  onChange,
}: AlphaSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Get the current color for the gradient
  const currentColor = hsbToHex({ h: hue, s: saturation, b: brightness });

  // Convert mouse position to alpha value
  const getAlphaFromPosition = useCallback((clientX: number) => {
    const slider = sliderRef.current;
    if (!slider) return;

    const rect = slider.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const newAlpha = Math.round((x / rect.width) * 100) / 100;

    onChange(newAlpha);
  }, [onChange]);

  // Mouse handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    getAlphaFromPosition(e.clientX);
  }, [getAlphaFromPosition]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    getAlphaFromPosition(e.clientX);
  }, [isDragging, getAlphaFromPosition]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Global mouse event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Touch handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const touch = e.touches[0];
    getAlphaFromPosition(touch.clientX);
  }, [getAlphaFromPosition]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    getAlphaFromPosition(touch.clientX);
  }, [isDragging, getAlphaFromPosition]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Calculate thumb position
  const thumbPosition = `${alpha * 100}%`;

  return (
    <div
      ref={sliderRef}
      className="relative h-3 rounded-full cursor-pointer overflow-hidden"
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Checkerboard background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(45deg, #ccc 25%, transparent 25%),
            linear-gradient(-45deg, #ccc 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #ccc 75%),
            linear-gradient(-45deg, transparent 75%, #ccc 75%)
          `,
          backgroundSize: '8px 8px',
          backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
        }}
      />

      {/* Color gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to right, transparent 0%, ${currentColor} 100%)`,
        }}
      />

      {/* Thumb */}
      <div
        className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-white pointer-events-none"
        style={{
          left: thumbPosition,
          boxShadow: '0 0 0 1px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.2)',
        }}
      />
    </div>
  );
}
