'use client';

import { useDocumentStore, useEditorStore, useHistoryStore } from '@/stores';
import {
  MousePointer2,
  Square,
  Circle,
  Triangle,
  Hexagon,
  Star,
  ChevronDown,
} from 'lucide-react';
import {
  IconClick,
  IconTextResize,
  IconLine,
  IconLayoutGridAdd,
} from '@tabler/icons-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
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
        'w-[40px] h-[40px] rounded-lg flex items-center justify-center transition-colors',
        active
          ? 'bg-primary/10 text-primary'
          : 'text-border hover:bg-primary/10 hover:text-primary'
      )}
      title={shortcut ? `${label} (${shortcut})` : label}
    >
      <Icon className="w-[24px] h-[24px]" />
    </button>
  );
}

export function FloatingToolbar() {
  const document = useDocumentStore((state) => state.document);
  const updateDocumentName = useDocumentStore((state) => state.updateDocumentName);
  const isSaving = useDocumentStore((state) => state.isSaving);
  const hasUnsavedChanges = useDocumentStore((state) => state.hasUnsavedChanges);

  const activeTool = useEditorStore((state) => state.activeTool);
  const setActiveTool = useEditorStore((state) => state.setActiveTool);
  const activeShapeTool = useEditorStore((state) => state.activeShapeTool);
  const setActiveShapeTool = useEditorStore((state) => state.setActiveShapeTool);


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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-white/50 backdrop-blur-sm border-2 border-[#F2F3F5] rounded-xl shadow-lg px-6 py-6 flex items-center gap-12 max-w-4xl mx-auto">
        {/* Selection Tools */}
        <ToolButton
          active={activeTool === 'select'}
          onClick={() => setActiveTool('select')}
          icon={IconClick}
          label="Select"
          shortcut="V"
        />

        <div className="w-px h-6 bg-border" />

        {/* Shape Tools Dropdown */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              className={cn(
                'w-[48px] h-[40px] rounded-lg flex items-center justify-center transition-colors group',
                (activeTool === 'rectangle' || activeTool === 'ellipse')
                  ? 'bg-primary/10 text-primary'
                  : 'text-border hover:bg-primary/10 hover:text-primary'
              )}
              title="Shape Tools"
            >
              {(() => {
                const activeShape = shapeTools.find(tool => tool.id === activeShapeTool);
                const IconComponent = activeShape?.icon || Square;
                return <IconComponent className="w-[20px] h-[20px]" />;
              })()}
              <ChevronDown className="w-6 h-6 text-border group-hover:text-primary ml-1" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="bg-white rounded-lg shadow-lg border border-border py-1 z-50 min-w-[140px] outline-none"
              sideOffset={5}
            >
              {shapeTools.map((tool) => (
                <DropdownMenu.Item
                  key={tool.id}
                  className={cn(
                    "px-3 py-2 text-sm cursor-pointer outline-none flex items-center gap-2 outline-none",
                    (activeTool === 'rectangle' || activeTool === 'ellipse') && activeShapeTool === tool.id
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-primary/10 hover:text-primary outline-none'
                  )}
                  onClick={() => handleShapeToolSelect(tool.id)}
                >
                  <tool.icon className="w-8 h-8" />
                  {tool.label}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        <div className="w-px h-6 bg-border" />

        {/* Pan Tool */}
        <ToolButton
          active={activeTool === 'pan'}
          onClick={() => setActiveTool('pan')}
          icon={IconTextResize}
          label="Pan"
          shortcut="H"
        />

        <div className="w-px h-6 bg-border" />

        {/* Drawing Tools */}
        <ToolButton
          active={activeTool === 'line'}
          onClick={() => setActiveTool('line')}
          icon={IconLine}
          label="Line"
          shortcut="L"
        />

        <div className="w-px h-6 bg-border" />

        <ToolButton
          active={activeTool === 'text'}
          onClick={() => setActiveTool('text')}
          icon={IconLayoutGridAdd}
          label="Text"
          shortcut="T"
        />
      </div>
    </div>
  );
}