import { redirect } from 'next/navigation';

/** Old "new request" page — requests are now a modal on My Designs. */
export default async function LegacyNewModificationPage({
  searchParams,
}: {
  searchParams: Promise<{ designId?: string }>;
}) {
  const { designId } = await searchParams;
  redirect(designId ? `/dashboard/designs?modify=${encodeURIComponent(designId)}` : '/dashboard/requests');
}
