import { ClientEditor } from './ClientEditor';

interface EditorPageProps {
  params: Promise<{
    documentId: string;
  }>;
}

export default async function EditorPage({ params }: EditorPageProps) {
  const { documentId } = await params;
  return <ClientEditor documentId={documentId} />;
}
