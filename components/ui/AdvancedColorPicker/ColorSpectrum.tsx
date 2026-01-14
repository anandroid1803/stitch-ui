'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { hsbToHex, type HSB } from '@/lib/utils/color';

interface ColorSpectrumProps {
  hue: number;
  saturation: number;
  brightness: number;
  onChange: (saturation: number, brightness: number) => void;
  pantoneHoverHsb?: HSB | null;
}

export function ColorSpectrum({
  hue,
  saturation,
  brightness,
  onChange,
  pantoneHoverHsb,
}: ColorSpectrumProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Draw the spectrum gradient
  const drawSpectrum = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Horizontal gradient: white to saturated color
    const gradientH = ctx.createLinearGradient(0, 0, width, 0);
    gradientH.addColorStop(0, '#ffffff');
    gradientH.addColorStop(1, hsbToHex({ h: hue, s: 100, b: 100 }));
    ctx.fillStyle = gradientH;
    ctx.fillRect(0, 0, width, height);

    // Vertical gradient: transparent to black
    const gradientV = ctx.createLinearGradient(0, 0, 0, height);
    gradientV.addColorStop(0, 'rgba(0,0,0,0)');
    gradientV.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.fillStyle = gradientV;
    ctx.fillRect(0, 0, width, height);
  }, [hue]);

  // Update canvas when hue changes
  useEffect(() => {
    drawSpectrum();
  }, [drawSpectrum]);

  // Handle canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resizeObserver = new ResizeObserver(() => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      drawSpectrum();
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [drawSpectrum]);

  // Convert mouse position to saturation/brightness
  const getColorFromPosition = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(clientY - rect.top, rect.height));

    const newSaturation = Math.round((x / rect.width) * 100);
    const newBrightness = Math.round(100 - (y / rect.height) * 100);

    onChange(newSaturation, newBrightness);
  }, [onChange]);

  // Mouse handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    getColorFromPosition(e.clientX, e.clientY);
  }, [getColorFromPosition]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    getColorFromPosition(e.clientX, e.clientY);
  }, [isDragging, getColorFromPosition]);

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
    getColorFromPosition(touch.clientX, touch.clientY);
  }, [getColorFromPosition]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    getColorFromPosition(touch.clientX, touch.clientY);
  }, [isDragging, getColorFromPosition]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Calculate indicator position
  const indicatorX = `${saturation}%`;
  const indicatorY = `${100 - brightness}%`;

  // Calculate Pantone indicator position if hovering
  const pantoneIndicatorX = pantoneHoverHsb ? `${pantoneHoverHsb.s}%` : null;
  const pantoneIndicatorY = pantoneHoverHsb ? `${100 - pantoneHoverHsb.b}%` : null;

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-square rounded-lg overflow-hidden cursor-crosshair"
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
      {/* Color indicator */}
      <div
        className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          left: indicatorX,
          top: indicatorY,
        }}
      >
        <div
          className="w-full h-full rounded-full border-2 border-white shadow-lg"
          style={{
            boxShadow: '0 0 0 1px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.3)',
          }}
        />
      </div>
      {/* Pantone hover indicator */}
      {pantoneHoverHsb && pantoneIndicatorX && pantoneIndicatorY && (
        <div
          className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{
            left: pantoneIndicatorX,
            top: pantoneIndicatorY,
          }}
        >
          <div
            className="w-full h-full rounded-full bg-white shadow-lg"
            style={{
              boxShadow: '0 0 0 1px rgba(255, 255, 255, 1), 0 2px 4px rgba(0,0,0,0.3)',
            }}
          />
        </div>
      )}
    </div>
  );
}
