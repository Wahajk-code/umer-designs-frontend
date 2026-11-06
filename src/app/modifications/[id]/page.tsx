import { redirect } from 'next/navigation';

/** Old tracking URL — tracking now lives in the dashboard. */
export default async function LegacyTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/dashboard/requests/${id}`);
}
