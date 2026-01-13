'use client';

import { useEditorStore } from '@/stores';
import { ColorPicker } from '@/components/ui';
import {
  MousePointer2,
  Hand,
  Square,
  Circle,
  Triangle,
  Hexagon,
  Star,
  Type,
  Image,
  Minus,
  Pen,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { Tool, ShapeTool } from '@/types/editor';

interface ToolButtonProps {
  active: boolean;
  onClick: () => void;
  icon: typeof MousePointer2;
  label: string;
  shortcut?: string;
}

function ToolButton({ active, onClick, icon: Icon, label, shortcut }: ToolButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-10 h-10 rounded-lg flex items-center justify-center transition-colors',
        active
          ? 'bg-blue-100 text-blue-600'
          : 'text-neutral-600 hover:bg-neutral-100'
      )}
      title={shortcut ? `${label} (${shortcut})` : label}
    >
      <Icon className="w-5 h-5" />
    </button>
  );
}

export function ToolPanel() {
  const activeTool = useEditorStore((state) => state.activeTool);
  const setActiveTool = useEditorStore((state) => state.setActiveTool);
  const activeShapeTool = useEditorStore((state) => state.activeShapeTool);
  const setActiveShapeTool = useEditorStore((state) => state.setActiveShapeTool);
  const fillColor = useEditorStore((state) => state.fillColor);
  const setFillColor = useEditorStore((state) => state.setFillColor);
  const strokeColor = useEditorStore((state) => state.strokeColor);
  const setStrokeColor = useEditorStore((state) => state.setStrokeColor);
  const strokeWidth = useEditorStore((state) => state.strokeWidth);
  const setStrokeWidth = useEditorStore((state) => state.setStrokeWidth);

  const shapeTools: { id: ShapeTool; icon: typeof Square; label: string }[] = [
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
    { id: 'ellipse', icon: Circle, label: 'Ellipse' },
    { id: 'triangle', icon: Triangle, label: 'Triangle' },
    { id: 'polygon', icon: Hexagon, label: 'Polygon' },
    { id: 'star', icon: Star, label: 'Star' },
  ];

  const handleShapeToolSelect = (shapeTool: ShapeTool) => {
    setActiveShapeTool(shapeTool);
    // Map shape tool to the generic shape tool
    if (shapeTool === 'rectangle') {
      setActiveTool('rectangle');
    } else if (shapeTool === 'ellipse') {
      setActiveTool('ellipse');
    } else {
      setActiveTool('rectangle'); // For other shapes, use rectangle tool behavior
    }
  };

  return (
    <div className="w-16 bg-white border-r border-neutral-200 flex flex-col items-center py-4 gap-1">
      {/* Selection Tools */}
      <div className="flex flex-col gap-1">
        <ToolButton
          active={activeTool === 'select'}
          onClick={() => setActiveTool('select')}
          icon={MousePointer2}
          label="Select"
          shortcut="V"
        />
        <ToolButton
          active={activeTool === 'pan'}
          onClick={() => setActiveTool('pan')}
          icon={Hand}
          label="Pan"
          shortcut="H"
        />
      </div>

      <div className="w-8 h-px bg-neutral-200 my-2" />

      {/* Shape Tools */}
      <div className="flex flex-col gap-1">
        {shapeTools.map((tool) => (
          <ToolButton
            key={tool.id}
            active={
              (activeTool === 'rectangle' || activeTool === 'ellipse') &&
              activeShapeTool === tool.id
            }
            onClick={() => handleShapeToolSelect(tool.id)}
            icon={tool.icon}
            label={tool.label}
          />
        ))}
      </div>

      <div className="w-8 h-px bg-neutral-200 my-2" />

      {/* Drawing Tools */}
      <div className="flex flex-col gap-1">
        <ToolButton
          active={activeTool === 'line'}
          onClick={() => setActiveTool('line')}
          icon={Minus}
          label="Line"
          shortcut="L"
        />
        <ToolButton
          active={activeTool === 'text'}
          onClick={() => setActiveTool('text')}
          icon={Type}
          label="Text"
          shortcut="T"
        />
        <ToolButton
          active={activeTool === 'image'}
          onClick={() => setActiveTool('image')}
          icon={Image}
          label="Image"
          shortcut="I"
        />
      </div>

      <div className="w-8 h-px bg-neutral-200 my-2" />

      {/* Color pickers */}
      <div className="flex flex-col gap-3 mt-auto pb-4">
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] text-neutral-500">Fill</span>
          <button
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'color';
              input.value = fillColor;
              input.onchange = (e) => setFillColor((e.target as HTMLInputElement).value);
              input.click();
            }}
            className="w-8 h-8 rounded border border-neutral-300"
            style={{ backgroundColor: fillColor }}
          />
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] text-neutral-500">Stroke</span>
          <button
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'color';
              input.value = strokeColor;
              input.onchange = (e) => setStrokeColor((e.target as HTMLInputElement).value);
              input.click();
            }}
            className="w-8 h-8 rounded border-2"
            style={{ borderColor: strokeColor, backgroundColor: 'white' }}
          />
        </div>
      </div>
    </div>
  );
}
