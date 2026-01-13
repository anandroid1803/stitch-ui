import { redirect } from 'next/navigation';

export default function Home() {
  // For now, redirect directly to editor with a new document
  // Later this will be a dashboard showing all documents
  redirect('/editor/new');
}
