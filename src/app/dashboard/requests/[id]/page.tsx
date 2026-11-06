import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import { TrackingView } from '@/components/modifications/tracking-view';

export const metadata: Metadata = { title: 'Track your request' };

export default async function RequestTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/dashboard/requests"
        className="mb-4 inline-flex items-center gap-1.5 text-[12px] text-ink-700 underline-offset-2 hover:underline"
      >
        <ArrowLeft size={13} /> All requests
      </Link>
      <TrackingView modificationId={id} />
    </div>
  );
}
