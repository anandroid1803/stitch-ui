'use client';

import { useState } from 'react';
import { Eye, EyeOff, Trash2, ChevronDown, ChevronUp, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { AdvancedColorPicker } from '@/components/ui/AdvancedColorPicker';
import type { FillLayer, SolidFillLayer, ImageFillLayer } from '@/types/fill';
import { isSolidFill, isImageFill } from '@/types/fill';

interface FillLayerItemProps {
  layer: FillLayer;
  index: number;
  onUpdate: (updates: Partial<FillLayer>) => void;
  onDelete: () => void;
  documentColors?: string[];
}

export function FillLayerItem({
  layer,
  index,
  onUpdate,
  onDelete,
  documentColors = [],
}: FillLayerItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleEnabled = () => {
    onUpdate({ enabled: !layer.enabled });
  };

  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    onUpdate({ opacity: value / 100 });
  };

  // Get display name for layer
  const getLayerName = () => {
    if (isSolidFill(layer)) {
      return 'Solid Color';
    } else if (isImageFill(layer)) {
      return 'Image Fill';
    }
    return 'Fill';
  };

  // Get preview element
  const renderPreview = () => {
    if (isSolidFill(layer)) {
      return (
        <div
          className="w-6 h-6 rounded border border-neutral-200"
          style={{ backgroundColor: layer.color }}
        />
      );
    } else if (isImageFill(layer)) {
      return (
        <div className="w-6 h-6 rounded border border-neutral-200 bg-neutral-100 flex items-center justify-center overflow-hidden">
          {layer.src ? (
            <img
              src={layer.src}
              alt="Fill preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <ImageIcon className="w-3 h-3 text-neutral-400" />
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col bg-white border border-white rounded-lg overflow-hidden">
      {/* Collapsed view */}
      <div className="flex items-center gap-2 p-2">
        {/* Visibility toggle */}
        <button
          onClick={handleToggleEnabled}
          className="p-1 hover:bg-neutral-100 rounded transition-colors"
          title={layer.enabled ? 'Hide fill' : 'Show fill'}
        >
          {layer.enabled ? (
            <Eye className="w-4 h-4 text-neutral-600" />
          ) : (
            <EyeOff className="w-4 h-4 text-neutral-400" />
          )}
        </button>

        {/* Preview */}
        {renderPreview()}

        {/* Expand/collapse button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex-1 flex items-center justify-between hover:bg-neutral-50 rounded px-2 py-1 transition-colors"
        >
          <span className="text-xs font-medium text-neutral-700">
            {getLayerName()}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-3 h-3 text-neutral-400" />
          ) : (
            <ChevronDown className="w-3 h-3 text-neutral-400" />
          )}
        </button>

        {/* Opacity display */}
        <span className="text-xs text-neutral-500 w-8 text-right">
          {Math.round(layer.opacity * 100)}%
        </span>

        {/* Delete button */}
        <button
          onClick={onDelete}
          className="p-1 hover:bg-red-50 rounded transition-colors group"
          title="Delete fill"
        >
          <Trash2 className="w-4 h-4 text-neutral-400 group-hover:text-red-600" />
        </button>
      </div>

      {/* Expanded view */}
      {isExpanded && (
        <div className="px-2 pb-2 flex flex-col gap-2 border-t border-neutral-100 pt-2">
          {/* Color picker for solid fills */}
          {isSolidFill(layer) && (
            <div className="flex flex-col gap-1">
              <label className="text-xs text-neutral-500 uppercase tracking-wide font-medium">
                Color
              </label>
              <AdvancedColorPicker
                value={layer.color}
                onChange={(color) => onUpdate({ color })}
                showAlpha={true}
                showEyedropper={true}
                showDocumentColors={true}
                documentColors={documentColors}
              />
            </div>
          )}

          {/* Image preview and upload for image fills */}
          {isImageFill(layer) && (
            <div className="flex flex-col gap-1">
              <label className="text-xs text-neutral-500 uppercase tracking-wide font-medium">
                Image
              </label>
              {layer.src ? (
                <div className="w-full h-24 rounded border border-neutral-200 overflow-hidden bg-neutral-50 relative group">
                  <img
                    src={layer.src}
                    alt="Fill image"
                    className="w-full h-full object-cover"
                  />
                  {/* Change image overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <label className="px-3 py-1.5 bg-white rounded text-xs font-medium cursor-pointer hover:bg-neutral-100">
                      Change Image
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const dataUrl = event.target?.result as string;
                              const img = new window.Image();
                              img.onload = () => {
                                onUpdate({
                                  src: dataUrl,
                                  imageWidth: img.width,
                                  imageHeight: img.height,
                                });
                              };
                              img.src = dataUrl;
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <div className="w-full h-24 rounded border-2 border-dashed border-neutral-300 bg-neutral-50 flex items-center justify-center">
                  <label className="flex flex-col items-center gap-2 cursor-pointer">
                    <ImageIcon className="w-6 h-6 text-neutral-400" />
                    <span className="text-xs text-neutral-500">Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const dataUrl = event.target?.result as string;
                            const img = new window.Image();
                            img.onload = () => {
                              onUpdate({
                                src: dataUrl,
                                imageWidth: img.width,
                                imageHeight: img.height,
                              });
                            };
                            img.src = dataUrl;
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              )}

              {/* Position controls for image fills */}
              {layer.src && (
                <>
                  <div className="flex flex-col gap-1 mt-2">
                    <label className="text-xs text-neutral-500 uppercase tracking-wide font-medium">
                      Position X
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={Math.round((layer.offsetX ?? 0.5) * 100)}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          onUpdate({ offsetX: value / 100 });
                        }}
                        className="flex-1 h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(layer.offsetX ?? 0.5) * 100}%, #e5e5e5 ${(layer.offsetX ?? 0.5) * 100}%, #e5e5e5 100%)`,
                        }}
                      />
                      <span className="text-xs text-neutral-600 w-10 text-right">
                        {Math.round((layer.offsetX ?? 0.5) * 100)}%
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-neutral-500 uppercase tracking-wide font-medium">
                      Position Y
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={Math.round((layer.offsetY ?? 0.5) * 100)}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          onUpdate({ offsetY: value / 100 });
                        }}
                        className="flex-1 h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(layer.offsetY ?? 0.5) * 100}%, #e5e5e5 ${(layer.offsetY ?? 0.5) * 100}%, #e5e5e5 100%)`,
                        }}
                      />
                      <span className="text-xs text-neutral-600 w-10 text-right">
                        {Math.round((layer.offsetY ?? 0.5) * 100)}%
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Opacity slider */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-neutral-500 uppercase tracking-wide font-medium">
              Opacity
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="100"
                value={Math.round(layer.opacity * 100)}
                onChange={handleOpacityChange}
                className="flex-1 h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${layer.opacity * 100}%, #e5e5e5 ${layer.opacity * 100}%, #e5e5e5 100%)`,
                }}
              />
              <span className="text-xs text-neutral-600 w-10 text-right">
                {Math.round(layer.opacity * 100)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
