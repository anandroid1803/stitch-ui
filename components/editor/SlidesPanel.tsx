'use client';

import { useDocumentStore } from '@/stores';
import { Plus, Copy, Trash2, MoreVertical } from 'lucide-react';
import * as ContextMenu from '@radix-ui/react-context-menu';
import { cn } from '@/lib/utils/cn';

export function SlidesPanel() {
  const document = useDocumentStore((state) => state.document);
  const currentSlideId = useDocumentStore((state) => state.currentSlideId);
  const setCurrentSlide = useDocumentStore((state) => state.setCurrentSlide);
  const addSlide = useDocumentStore((state) => state.addSlide);
  const deleteSlide = useDocumentStore((state) => state.deleteSlide);
  const duplicateSlide = useDocumentStore((state) => state.duplicateSlide);

  const slides = document?.slides ?? [];

  return (
    <div className="w-48 bg-neutral-50 border-l border-neutral-200 flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-neutral-200 flex items-center justify-between">
        <span className="text-sm font-medium">Slides</span>
        <button
          onClick={() => addSlide(currentSlideId ?? undefined)}
          className="p-1 hover:bg-neutral-200 rounded"
          title="Add Slide"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Slides list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {slides.map((slide, index) => (
          <ContextMenu.Root key={slide.id}>
            <ContextMenu.Trigger asChild>
              <button
                onClick={() => setCurrentSlide(slide.id)}
                className={cn(
                  'w-full aspect-video rounded-lg border-2 overflow-hidden transition-colors relative group',
                  currentSlideId === slide.id
                    ? 'border-blue-500'
                    : 'border-neutral-200 hover:border-neutral-300'
                )}
              >
                {/* Thumbnail or placeholder */}
                {slide.thumbnail ? (
                  <img
                    src={slide.thumbnail}
                    alt={slide.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full"
                    style={{
                      backgroundColor:
                        slide.backgroundColor ||
                        document?.settings.backgroundColor ||
                        '#ffffff',
                    }}
                  />
                )}

                {/* Slide number badge */}
                <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
                  {index + 1}
                </div>

                {/* Action button (on hover) - Now just visual, context menu opens on right-click */}
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="p-1 bg-white/90 rounded">
                    <MoreVertical className="w-3 h-3 text-neutral-600" />
                  </div>
                </div>
              </button>
            </ContextMenu.Trigger>

            <ContextMenu.Portal>
              <ContextMenu.Content className="bg-white rounded-lg shadow-lg border border-neutral-200 py-1 min-w-[160px] z-50">
                <ContextMenu.Item
                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-neutral-100 cursor-pointer outline-none"
                  onClick={() => duplicateSlide(slide.id)}
                >
                  <Copy className="w-4 h-4" />
                  Duplicate
                </ContextMenu.Item>
                <ContextMenu.Separator className="h-px bg-neutral-200 my-1" />
                <ContextMenu.Item
                  className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer outline-none"
                  onClick={() => deleteSlide(slide.id)}
                  disabled={slides.length <= 1}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </ContextMenu.Item>
              </ContextMenu.Content>
            </ContextMenu.Portal>
          </ContextMenu.Root>
        ))}
      </div>

      {/* Add slide button at bottom */}
      <div className="p-2 border-t border-neutral-200">
        <button
          onClick={() => addSlide(currentSlideId ?? undefined)}
          className="w-full py-2 text-sm text-neutral-600 hover:bg-neutral-100 rounded flex items-center justify-center gap-1"
        >
          <Plus className="w-4 h-4" />
          Add Slide
        </button>
      </div>
    </div>
  );
}
