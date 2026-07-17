'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch, ApiError } from '@/lib/client/api';
import { Order } from '@/lib/types/order';
import { formatCents } from '@/lib/client/format';

function DownloadButton({ orderId, fileId, label }: { orderId: string; fileId: string; label: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setLoading(true);
    setError(null);
    try {
      const { url } = await apiFetch<{ url: string }>(`/api/orders/${orderId}/download/${fileId}`);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not start download.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="inline-block">
      <button
        onClick={handleDownload}
        disabled={loading}
        className="inline-block rounded-pill bg-warm-150 px-3 py-1.5 text-[10px] text-ink-900 disabled:opacity-50"
      >
        {loading ? 'Preparing…' : `Download ${label} ↓`}
      </button>
      {error && <p className="mt-1 text-[10px] text-red-600">{error}</p>}
    </div>
  );
}

export function MyDesigns() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Order[]>('/api/orders')
      .then(setOrders)
      .catch(() => setError('Could not load your orders.'));
  }, []);

  if (error) return <p className="text-[12px] text-red-600">{error}</p>;
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
      <div className="flex items-baseline justify-between">
        <h2 className="text-[16px] font-medium text-ink-900">My designs</h2>
        <span className="text-[10.5px] text-ink-500">re-download anytime</span>
      </div>

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
