'use client';

import { useEffect } from 'react';
import { FloatingToolbar, Canvas } from '@/components/editor';
import { RightPanel } from '@/components/editor/RightPanel';
import { useDocumentStore, useHistoryStore } from '@/stores';
import { useKeyboardShortcuts } from '@/hooks';

interface EditorLayoutProps {
  documentId?: string;
}

export function EditorLayout({ documentId }: EditorLayoutProps) {
  const document = useDocumentStore((state) => state.document);
  const createNewDocument = useDocumentStore((state) => state.createNewDocument);
  const pushState = useHistoryStore((state) => state.pushState);

  // Initialize keyboard shortcuts
  useKeyboardShortcuts();

  // Initialize document on mount
  useEffect(() => {
    if (!document) {
      createNewDocument('Untitled Board');
      // Push initial state to history
      setTimeout(() => pushState(), 100);
    }
  }, [document, createNewDocument, pushState]);

  if (!document) {
    return (
      <div className="h-screen flex items-center justify-center bg-neutral-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-neutral-100 overflow-hidden">
      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Canvas */}
        <Canvas />

        {/* Right floating panel - positioned absolutely */}
        <div className="absolute right-4 top-4 z-10">
          <RightPanel />
        </div>
      </div>

      {/* Floating Toolbar */}
      <FloatingToolbar />
    </div>
  );
}
