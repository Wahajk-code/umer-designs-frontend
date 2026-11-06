'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ClipboardList, Download, ShoppingBag, Wrench } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch, ApiError } from '@/lib/client/api';
import { Modification } from '@/lib/types/modification';
import { formatCents } from '@/lib/client/format';
import { SafeImage } from '@/components/ui/safe-image';
import { fallbackImageFor } from '@/lib/stock-images';
import { RequestChangesModal } from '@/components/modifications/request-changes-modal';
import { useOwnedDesigns } from '@/components/modifications/use-owned-designs';
import { withFrom } from '@/lib/back-link';

function DownloadButton({ orderId, fileId, label }: { orderId: string; fileId: string; label: string }) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const { url } = await apiFetch<{ url: string }>(`/api/orders/${orderId}/download/${fileId}`);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      toast.error('Could not start download', {
        id: `dl-${fileId}`,
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
      className="flex items-center gap-1.5 rounded-pill bg-warm-150 px-3 py-1.5 text-[10.5px] text-ink-900 transition-colors hover:bg-warm-200 disabled:opacity-50"
    >
      <Download size={11} /> {loading ? 'Preparing…' : label}
    </button>
  );
}

export function MyDesigns() {
  const reduce = useReducedMotion();
  const { orders, designs, error, reload } = useOwnedDesigns();
  const [mods, setMods] = useState<Modification[]>([]);
  const [requestFor, setRequestFor] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Modification[]>('/api/modifications').then(setMods).catch(() => setMods([]));
  }, []);

  // Deep link from old URLs / emails: /dashboard/designs?modify=<designId>
  useEffect(() => {
    if (!designs) return;
    const want = new URLSearchParams(window.location.search).get('modify');
    if (want && designs.some((d) => d.id === want)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reacting to the URL once data is loaded
      setRequestFor(want);
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [designs]);

  if (error) {
    return (
      <div className="rounded-card-lg bg-white p-8 text-center">
        <p className="text-[12.5px] text-ink-500">Could not load your orders.</p>
        <button
          onClick={reload}
          className="mt-3 rounded-pill bg-ink-900 px-5 py-2.5 text-[12px] font-medium text-white transition-colors hover:bg-ink-950"
        >
          Try again
        </button>
      </div>
    );
  }
  if (!orders || !designs) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-64 animate-pulse rounded-card-lg bg-warm-150" />
        ))}
      </div>
    );
  }

  const paidOrders = orders.filter((o) => o.status === 'PAID');

  return (
    <div>
      {paidOrders.length === 0 ? (
        <div className="flex flex-col items-center rounded-card-lg bg-white px-6 py-14 text-center">
          <ShoppingBag size={26} className="text-ink-300" />
          <p className="mt-3 text-[14px] font-medium text-ink-900">No plans yet</p>
          <p className="mt-1 max-w-sm text-[12.5px] text-ink-500">Plans you buy appear here with their files, ready to download any time.</p>
          <Link href="/designs" className="mt-5 rounded-pill bg-ink-900 px-5 py-2.5 text-[12.5px] text-white transition-colors hover:bg-ink-950">
            Browse designs
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {paidOrders.map((order, i) => {
            const designMods = mods.filter((m) => m.designId === order.designId);
            const active = designMods.find((m) => m.status !== 'DELIVERED');
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: reduce ? 0 : 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduce ? 0 : i * 0.05, duration: 0.35 }}
                className="flex flex-col overflow-hidden rounded-card-lg bg-white shadow-[0_1px_5px_rgba(0,0,0,0.04)]"
              >
                <Link href={withFrom(`/designs/${order.design.slug}`, '/dashboard/designs')} className="group relative h-36 w-full overflow-hidden bg-warm-100">
                  <SafeImage
                    src={order.design.coverImageUrl}
                    fallbackSrc={fallbackImageFor(order.design.slug)}
                    alt={order.design.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {active && (
                    <span className="absolute left-3 top-3 rounded-pill bg-ink-900 px-2.5 py-1 text-[10px] text-white">Changes in progress</span>
                  )}
                </Link>
                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-baseline justify-between gap-2">
                    <Link href={withFrom(`/designs/${order.design.slug}`, '/dashboard/designs')} className="truncate text-[14px] font-medium text-ink-900 hover:underline">
                      {order.design.title}
                    </Link>
                    <span className="flex-none text-[10.5px] text-ink-500">
                      {order.paidAt ? new Date(order.paidAt).toLocaleDateString() : ''}
                    </span>
                  </div>

                  <div className="mt-3 text-[10px] tracking-[0.12em] text-ink-500">FILES</div>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {(order.design.files ?? []).length === 0 && (
                      <span className="text-[11px] text-ink-500">The architect is preparing the files.</span>
                    )}
                    {(order.design.files ?? []).map((file) => (
                      <DownloadButton key={file.id} orderId={order.id} fileId={file.id} label={file.label} />
                    ))}
                  </div>

                  <div className="mt-auto flex flex-wrap gap-2 pt-4">
                    <button
                      onClick={() => setRequestFor(order.designId)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-pill bg-ink-900 px-4 py-2.5 text-[12px] font-medium text-white transition-colors hover:bg-ink-950"
                    >
                      <Wrench size={13} /> Request changes
                    </button>
                    {designMods.length > 0 && (
                      <Link
                        href={active ? `/dashboard/requests/${active.id}` : '/dashboard/requests'}
                        className="flex items-center justify-center gap-1.5 rounded-pill border border-ink-900 px-4 py-2.5 text-[12px] text-ink-900 transition-colors hover:bg-warm-100"
                      >
                        <ClipboardList size={13} /> Track
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <h2 className="mt-10 text-[16px] font-medium text-ink-900">Order history</h2>
      <div className="mt-3 overflow-x-auto rounded-card-lg bg-white px-4">
        {orders.length === 0 && <p className="py-4 text-[12px] text-ink-500">No orders yet.</p>}
        {orders.map((order, i) => (
          <div
            key={order.id}
            className={`grid min-w-[520px] grid-cols-[80px_1fr_100px_90px_70px] items-center gap-2 py-3 text-[11.5px] text-ink-700 ${
              i < orders.length - 1 ? 'border-b border-warm-150' : ''
            }`}
          >
            <span className="text-ink-500">#{order.id.slice(0, 6)}</span>
            <Link href={withFrom(`/designs/${order.design.slug}`, '/dashboard/designs')} className="truncate hover:underline">
              {order.design.title}
            </Link>
            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
            <span>{formatCents(order.amountCents)}</span>
            <span className={order.status === 'PAID' ? 'text-ink-900' : 'text-ink-500'}>
              {order.status === 'PAID' ? 'Paid ✓' : order.status.toLowerCase()}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-center">
        <Link href="/designs" className="flex items-center gap-1.5 text-[12px] text-ink-700 underline-offset-2 hover:underline">
          Browse more designs <ArrowRight size={12} />
        </Link>
      </div>

      <RequestChangesModal
        open={requestFor !== null}
        onClose={() => setRequestFor(null)}
        designs={designs}
        initialDesignId={requestFor ?? undefined}
      />
    </div>
  );
}
