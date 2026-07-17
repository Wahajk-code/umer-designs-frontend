'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/client/api';
import { Modification } from '@/lib/types/modification';
import { StatusPipeline } from '@/components/modifications/status-pipeline';

export function ActiveRequest() {
  const [modifications, setModifications] = useState<Modification[] | null>(null);

  useEffect(() => {
    apiFetch<Modification[]>('/api/modifications')
      .then(setModifications)
      .catch(() => setModifications([]));
  }, []);

  if (!modifications || modifications.length === 0) return null;

  const active = modifications.find((m) => m.status !== 'DELIVERED') ?? modifications[0];

  return (
    <div className="mb-6 rounded-card-lg bg-ink-900 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-[10px] tracking-[0.14em] text-dark-500">
            ACTIVE REQUEST · #{active.id.slice(0, 8)} · {active.design.title.toUpperCase()}
          </div>
          <div className="mt-1.5 text-[15.5px] font-medium text-white">
            {active.selectedOptions.map((s) => s.option.label).join(' + ')}
          </div>
        </div>
        <Link
          href={`/modifications/${active.id}`}
          className="rounded-pill bg-white px-5 py-2.5 text-[11.5px] font-medium text-ink-900"
        >
          View tracking →
        </Link>
      </div>
      <div className="mt-5">
        <StatusPipeline status={active.status} dark />
      </div>
    </div>
  );
}
