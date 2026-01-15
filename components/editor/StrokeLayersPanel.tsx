'use client';

import { Plus } from 'lucide-react';
import type React from 'react';
import { StrokeLayerItem } from './StrokeLayerItem';
import type { CanvasElement } from '@/types/document';
import type { StrokeLayer } from '@/types/stroke';
import { createStroke } from '@/types/stroke';

interface StrokeLayersPanelProps {
  element: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  documentColors?: string[];
}

export function StrokeLayersPanel({
  element,
  onUpdate,
  documentColors = [],
}: StrokeLayersPanelProps) {
  // Get strokes array (with backward compatibility for legacy stroke properties)
  // Only use legacy stroke if strokes array doesn't exist (undefined/null), not if it's empty
  const legacyStroke = 'stroke' in element ? (element as any).stroke : undefined;
  const legacyStrokeWidth = 'strokeWidth' in element ? (element as any).strokeWidth : undefined;
  
  const strokes = element.strokes !== undefined && element.strokes !== null
    ? element.strokes
    : legacyStroke && legacyStrokeWidth !== undefined
    ? [createStroke(legacyStroke, legacyStrokeWidth, 1)]
    : [];

  const handleAddStroke = () => {
    const newStroke = createStroke('#000000', 2, 1);
    onUpdate({ strokes: [...strokes, newStroke] });
  };

  const handleUpdateStroke = (index: number, updates: Partial<StrokeLayer>) => {
    const updatedStrokes = [...strokes];
    updatedStrokes[index] = { ...updatedStrokes[index], ...updates } as StrokeLayer;
    onUpdate({ strokes: updatedStrokes });
  };

  const handleDeleteStroke = (index: number) => {
    const updatedStrokes = strokes.filter((_, i) => i !== index);
    onUpdate({ strokes: updatedStrokes });
  };

  const handleStrokeWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    // Update all strokes to have the same width
    const updatedStrokes = strokes.map(stroke => ({
      ...stroke,
      width: value,
    }));
    onUpdate({ strokes: updatedStrokes });
  };

  // Get the stroke width (use first stroke's width, or default to 2)
  const strokeWidth = strokes.length > 0 ? strokes[0].width : 2;

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
        <label style={labelStyle}>Stroke</label>
        <button
          onClick={handleAddStroke}
          className="hover:bg-primary/10 rounded-lg transition-colors group"
          title="Add Stroke"
          style={{ padding: 6 }}
        >
          <Plus style={iconStyle} className="text-text-tertiary group-hover:text-primary" />
        </button>
      </div>

      {/* Stroke layers list - render in reverse order (top layer first visually) */}
      <div className="flex flex-col gap-2">
        {[...strokes].reverse().map((stroke, reverseIndex) => {
          const index = strokes.length - 1 - reverseIndex;
          return (
            <StrokeLayerItem
              key={stroke.id}
              layer={stroke}
              index={index}
              onUpdate={(updates) => handleUpdateStroke(index, updates)}
              onDelete={() => handleDeleteStroke(index)}
              documentColors={documentColors}
            />
          );
        })}
      </div>

      {/* Stroke width input - single input for all strokes */}
      {strokes.length > 0 && (
        <div className="-mt-[10px]" style={{ position: 'relative', backgroundColor: '#F2F3F5', padding: '2px', borderRadius: '10px' }}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              position: 'absolute',
              left: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              color: '#CACACC',
            }}
          >
            <line x1="2" y1="4" x2="14" y2="4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            <line x1="2" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="2" y1="12" x2="14" y2="12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <input
            type="number"
            min={0}
            max={50}
            value={strokeWidth}
            onChange={handleStrokeWidthChange}
            style={{
              width: '100%',
              height: 28,
              paddingLeft: 32,
              paddingRight: 8,
              backgroundColor: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: 14,
              outline: 'none',
            }}
          />
        </div>
      )}
    </div>
  );
}
