'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ClipboardList, Plus } from 'lucide-react';
import { apiFetch } from '@/lib/client/api';
import { Modification } from '@/lib/types/modification';
import { formatCents } from '@/lib/client/format';
import { StatusPipeline } from '@/components/modifications/status-pipeline';
import { STATUS_LABEL } from '@/components/modifications/tracking-view';
import { RequestChangesModal } from '@/components/modifications/request-changes-modal';
import { useOwnedDesigns } from '@/components/modifications/use-owned-designs';
import { SafeImage as Image } from '@/components/ui/safe-image';
import { fallbackImageFor } from '@/lib/stock-images';

export function RequestsList() {
  const reduce = useReducedMotion();
  const [mods, setMods] = useState<Modification[] | null>(null);
  const [error, setError] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  const { designs } = useOwnedDesigns();

  useEffect(() => {
    apiFetch<Modification[]>('/api/modifications')
      .then(setMods)
      .catch(() => setError(true));
  }, []);

  const open = (mods ?? []).filter((m) => m.status !== 'DELIVERED');
  const delivered = (mods ?? []).filter((m) => m.status === 'DELIVERED');

  const card = (m: Modification, i: number) => (
    <motion.div
      key={m.id}
      initial={{ opacity: 0, y: reduce ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reduce ? 0 : i * 0.05, duration: 0.35 }}
    >
      <Link
        href={`/dashboard/requests/${m.id}`}
        className="group block rounded-card-lg bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(0,0,0,0.08)]"
      >
        <div className="flex items-center gap-4">
          <div className="relative h-14 w-20 flex-none overflow-hidden rounded-control bg-warm-100">
            <Image src={m.design.coverImageUrl} fallbackSrc={fallbackImageFor(m.design.slug)} alt={m.design.title} fill sizes="80px" className="object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[14px] font-medium text-ink-900">{m.design.title}</div>
            <div className="truncate text-[11.5px] text-ink-500">
              {m.selectedOptions.map((s) => s.option.label).join(' · ')}
            </div>
            <div className="mt-0.5 text-[10.5px] text-ink-500">
              #{m.id.slice(0, 8)} · {formatCents(m.totalAmountCents)} · {new Date(m.createdAt).toLocaleDateString()}
            </div>
          </div>
          <span className={`hidden rounded-pill px-3 py-1 text-[11px] sm:inline ${m.status === 'DELIVERED' ? 'bg-ink-900 text-white' : 'bg-warm-100 text-ink-900'}`}>
            {STATUS_LABEL[m.status]}
          </span>
          <ArrowRight size={16} className="flex-none text-ink-500 transition-transform group-hover:translate-x-1" />
        </div>
        <div className="mt-5 px-1">
          <StatusPipeline status={m.status} />
        </div>
      </Link>
    </motion.div>
  );

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-light text-ink-900">Requests &amp; tracking</h1>
          <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-ink-500">
            Every change request, its live progress, and your conversation with the architect.
          </p>
        </div>
        <button
          onClick={() => setRequestOpen(true)}
          className="flex items-center gap-2 rounded-pill bg-ink-900 px-5 py-2.5 text-[12.5px] font-medium text-white transition-colors hover:bg-ink-950"
        >
          <Plus size={15} /> New change request
        </button>
      </div>

      <div className="mt-7">
        {error && <p className="rounded-card-lg bg-white p-8 text-center text-[13px] text-ink-500">Could not load your requests. Please refresh.</p>}
        {!error && mods === null && (
          <div className="flex flex-col gap-3">
            {[0, 1].map((i) => (
              <div key={i} className="h-36 animate-pulse rounded-card-lg bg-warm-150" />
            ))}
          </div>
        )}
        {mods && mods.length === 0 && (
          <div className="flex flex-col items-center rounded-card-lg bg-white px-6 py-14 text-center">
            <ClipboardList size={26} className="text-ink-300" />
            <p className="mt-3 text-[14px] font-medium text-ink-900">No change requests yet</p>
            <p className="mt-1 max-w-sm text-[12.5px] text-ink-500">
              Want a room added, the footprint resized or the kitchen opened up? Request changes to any plan you own and
              follow every step here.
            </p>
            {designs && designs.length > 0 ? (
              <button onClick={() => setRequestOpen(true)} className="mt-5 rounded-pill bg-ink-900 px-5 py-2.5 text-[12.5px] text-white transition-colors hover:bg-ink-950">
                Request changes
              </button>
            ) : (
              <Link href="/designs" className="mt-5 rounded-pill bg-ink-900 px-5 py-2.5 text-[12.5px] text-white transition-colors hover:bg-ink-950">
                Browse designs
              </Link>
            )}
          </div>
        )}
        {open.length > 0 && (
          <>
            <div className="mb-3 text-[10px] tracking-[0.12em] text-ink-500">IN PROGRESS ({open.length})</div>
            <div className="flex flex-col gap-3">{open.map(card)}</div>
          </>
        )}
        {delivered.length > 0 && (
          <>
            <div className="mb-3 mt-8 text-[10px] tracking-[0.12em] text-ink-500">DELIVERED ({delivered.length})</div>
            <div className="flex flex-col gap-3">{delivered.map((m, i) => card(m, i + open.length))}</div>
          </>
        )}
      </div>

      <RequestChangesModal open={requestOpen} onClose={() => setRequestOpen(false)} designs={designs ?? []} />
    </div>
  );
}
