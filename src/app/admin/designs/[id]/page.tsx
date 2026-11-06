import { redirect } from 'next/navigation';

/** Editing is a modal on the designs list now (?edit=<id>); old links still work. */
export default async function EditDesignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/admin/designs?edit=${encodeURIComponent(id)}`);
}
