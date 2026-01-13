'use client';

import dynamic from 'next/dynamic';

// Dynamically import EditorLayout to avoid SSR issues with Konva
const EditorLayout = dynamic(
  () => import('@/components/editor/EditorLayout').then((mod) => mod.EditorLayout),
  {
    ssr: false,
    loading: () => (
      <div className="h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <p className="text-sm text-neutral-500">Loading editor...</p>
        </div>
      </div>
    ),
  }
);

interface ClientEditorProps {
  documentId: string;
}

export function ClientEditor({ documentId }: ClientEditorProps) {
  return <EditorLayout documentId={documentId} />;
}