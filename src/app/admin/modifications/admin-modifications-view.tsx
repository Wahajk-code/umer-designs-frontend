'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch, ApiError } from '@/lib/client/api';
import { Modification, ModificationStatus } from '@/lib/types/modification';
import { formatCents } from '@/lib/client/format';

interface PaginatedModifications {
  modifications: Modification[];
  total: number;
}

const STATUS_OPTIONS: { label: string; value: ModificationStatus | '' }[] = [
  { label: 'All', value: '' },
  { label: 'Submitted', value: 'SUBMITTED' },
  { label: 'In review', value: 'IN_REVIEW' },
  { label: 'In progress', value: 'IN_PROGRESS' },
  { label: 'Revision', value: 'REVISION' },
  { label: 'Delivered', value: 'DELIVERED' },
];

export function AdminModificationsView() {
  const [data, setData] = useState<PaginatedModifications | null>(null);
  const [status, setStatus] = useState<ModificationStatus | ''>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    apiFetch<PaginatedModifications>(`/api/admin/modifications?${params.toString()}`)
      .then(setData)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load requests.'));
  }, [status]);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.label}
            onClick={() => setStatus(opt.value)}
            className={`px-3 py-1.5 text-[10.5px] ${
              status === opt.value ? 'bg-ink-950 text-white' : 'border border-white/10 text-dark-500'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {error && <p className="mt-3 text-[12px] text-red-400">{error}</p>}

      <div className="mt-3 overflow-hidden rounded-lg bg-white">
        {!data && <p className="p-4 text-[12px] text-dark-500">Loading…</p>}
        {data?.modifications.map((mod, i) => (
          <div
            key={mod.id}
            className={`px-4 py-3 ${i < data.modifications.length - 1 ? 'border-b border-warm-150' : ''}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-ink-900">
                <b>#{mod.id.slice(0, 8)}</b> {mod.design.title} —{' '}
                {mod.selectedOptions.map((s) => s.option.label).join(', ')}
              </span>
              <span className="bg-ink-950 px-2 py-1 text-[9.5px] text-white">{mod.status}</span>
            </div>
            <div className="mt-1 flex items-center gap-3 text-[10.5px] text-ink-500">
              <span>{formatCents(mod.totalAmountCents)}</span>
              <Link href={`/admin/modifications/${mod.id}`} className="underline">
                open →
              </Link>
            </div>
          </div>
        ))}
        {data?.modifications.length === 0 && (
          <p className="p-4 text-[12px] text-dark-500">No requests in this status.</p>
        )}
      </div>
    </div>
  );
}
