'use client';

import { useRef, useState } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface ImageFillPickerProps {
  onImageSelect: (dataUrl: string, width: number, height: number) => void;
}

export function ImageFillPicker({ onImageSelect }: ImageFillPickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      console.warn('Selected file is not an image');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;

      // Load image to get dimensions
      const img = new Image();
      img.onload = () => {
        setPreview(dataUrl);
        onImageSelect(dataUrl, img.width, img.height);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          handleFileSelect(file);
          break;
        }
      }
    }
  };

  return (
    <div className="flex flex-col gap-3 p-3">
      {/* Preview if image selected */}
      {preview && (
        <div className="w-full h-32 rounded-lg overflow-hidden border border-neutral-200 bg-neutral-50">
          <img
            src={preview}
            alt="Selected image"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Drag-drop zone */}
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-neutral-300 hover:border-neutral-400 bg-neutral-50'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onPaste={handlePaste}
        onClick={() => fileInputRef.current?.click()}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            fileInputRef.current?.click();
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileInputChange}
        />

        <div className="flex flex-col items-center gap-2 text-center">
          <div className="p-3 rounded-full bg-white border border-neutral-200">
            <ImageIcon className="w-6 h-6 text-neutral-400" />
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-neutral-700">
              Choose an image or drag it here
            </p>
            <p className="text-xs text-neutral-500">
              PNG, JPG, GIF up to 10MB
            </p>
          </div>

          <button
            className="mt-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            <Upload className="w-4 h-4" />
            Upload Image
          </button>
        </div>
      </div>

      {/* Paste hint */}
      <div className="text-center">
        <p className="text-xs text-neutral-500">
          Or paste an image from clipboard (Cmd+V)
        </p>
      </div>
    </div>
  );
}
