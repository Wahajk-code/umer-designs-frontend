import type { Metadata } from 'next';
import { TrackingView } from './tracking-view';

export const metadata: Metadata = { title: 'Track your request — Umer Designs' };

export default async function ModificationTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="pt-6">
      <TrackingView modificationId={id} />
    </div>
  );
}
