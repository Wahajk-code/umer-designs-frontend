'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { apiFetch, ApiError } from '@/lib/client/api';
import { Order } from '@/lib/types/order';
import { formatCents } from '@/lib/client/format';

function DownloadButton({ orderId, fileId, label }: { orderId: string; fileId: string; label: string }) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const { url } = await apiFetch<{ url: string }>(`/api/orders/${orderId}/download/${fileId}`);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      toast.error('Could not start download', {
        description: err instanceof ApiError ? err.message : 'Please try again in a moment.',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="inline-block rounded-pill bg-warm-150 px-3 py-1.5 text-[10px] text-ink-900 disabled:opacity-50"
    >
      {loading ? 'Preparing…' : `Download ${label} ↓`}
    </button>
  );
}

export function MyDesigns() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryTick, setRetryTick] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount/retry pattern
    setError(null);
    apiFetch<Order[]>('/api/orders')
      .then(setOrders)
      .catch(() => {
        setError('Could not load your orders.');
        toast.error('Could not load your orders', { description: 'Please check your connection and try again.' });
      });
  }, [retryTick]);

  if (error) {
    return (
      <div className="rounded-card-lg bg-white p-8 text-center">
        <p className="text-[12.5px] text-ink-500">{error}</p>
        <button
          onClick={() => setRetryTick((t) => t + 1)}
          className="mt-3 rounded-pill bg-ink-900 px-5 py-2.5 text-[12px] font-medium text-white transition-colors hover:bg-ink-950"
        >
          Try again
        </button>
      </div>
    );
  }
  if (!orders) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-card-sm bg-warm-150" />
        ))}
      </div>
    );
  }

  const paidOrders = orders.filter((o) => o.status === 'PAID');

  return (
    <div>
      {paidOrders.length === 0 ? (
        <p className="mt-3 text-[12.5px] text-ink-500">
          Nothing purchased yet — browse the store to get started.
        </p>
      ) : (
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {paidOrders.map((order) => (
            <div key={order.id} className="overflow-hidden rounded-card-sm bg-white">
              <div className="placeholder-stripes h-24 w-full" />
              <div className="p-3.5">
                <div className="text-[12px] font-medium text-ink-900">{order.design.title}</div>
                <div className="mt-0.5 text-[9.5px] text-ink-500">
                  {order.paidAt ? new Date(order.paidAt).toLocaleDateString() : ''}
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {(order.design.files ?? []).length === 0 && (
                    <span className="text-[10px] text-ink-500">Files not uploaded yet</span>
                  )}
                  {(order.design.files ?? []).map((file) => (
                    <DownloadButton key={file.id} orderId={order.id} fileId={file.id} label={file.label} />
                  ))}
                </div>
                <Link
                  href={`/modifications/new?designId=${order.designId}`}
                  className="mt-2 inline-block text-[10px] text-ink-500 underline underline-offset-2"
                >
                  Request a modification
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="mt-8 text-[16px] font-medium text-ink-900">Order history</h2>
      <div className="mt-3 rounded-card-sm bg-white px-4">
        {orders.length === 0 && <p className="py-4 text-[12px] text-ink-500">No orders yet.</p>}
        {orders.map((order, i) => (
          <div
            key={order.id}
            className={`grid grid-cols-[70px_1fr_90px_70px_60px] items-center gap-2 py-3 text-[11px] text-ink-700 ${
              i < orders.length - 1 ? 'border-b border-warm-150' : ''
            }`}
          >
            <span className="text-ink-500">#{order.id.slice(0, 6)}</span>
            <span>{order.design.title} — plan set</span>
            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
            <span>{formatCents(order.amountCents)}</span>
            <span>{order.status === 'PAID' ? 'Paid ✓' : order.status.toLowerCase()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
