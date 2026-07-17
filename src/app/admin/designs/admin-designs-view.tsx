'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch, ApiError } from '@/lib/client/api';
import { PaginatedDesigns } from '@/lib/types/design';
import { formatCents } from '@/lib/client/format';

const STATUS_LABEL: Record<string, string> = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  HIDDEN: 'hidden',
};

export function AdminDesignsView() {
  const [data, setData] = useState<PaginatedDesigns | null>(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      params.set('pageSize', '50');
      const result = await apiFetch<PaginatedDesigns>(`/api/admin/designs?${params.toString()}`);
      setData(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load designs.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- load() is the standard fetch-on-mount pattern
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function toggleStatus(id: string, current: string) {
    const next = current === 'PUBLISHED' ? 'HIDDEN' : 'PUBLISHED';
    try {
      await apiFetch(`/api/admin/designs/${id}`, { method: 'PATCH', body: { status: next } });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not update design.');
    }
  }

  return (
    <div className="overflow-hidden rounded-lg bg-white">
      <div className="flex items-center gap-3 border-b border-black/5 p-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load()}
          placeholder="Search designs…"
          className="h-9 flex-1 border border-warm-400 px-3 text-[12px] text-ink-900 outline-none"
        />
        <button
          onClick={load}
          className="h-9 border border-warm-400 px-4 text-[11px] text-ink-700 hover:bg-warm-100"
        >
          Search
        </button>
        <Link
          href="/admin/designs/new"
          className="flex h-9 items-center bg-ink-950 px-4 text-[11px] tracking-wide text-white hover:bg-black"
        >
          + NEW
        </Link>
      </div>

      {error && <p className="p-4 text-[12px] text-red-600">{error}</p>}
      {loading && <p className="p-4 text-[12px] text-dark-500">Loading…</p>}

      {!loading && data && (
        <table className="w-full text-left text-[12px]">
          <thead>
            <tr className="border-b border-black/5 text-[10px] tracking-wider text-dark-500">
              <th className="px-4 py-2 font-medium">TITLE</th>
              <th className="px-4 py-2 font-medium">CATEGORY</th>
              <th className="px-4 py-2 font-medium">PRICE</th>
              <th className="px-4 py-2 font-medium">STATUS</th>
              <th className="px-4 py-2 font-medium">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {data.designs.map((design) => (
              <tr key={design.id} className="border-b border-warm-150">
                <td className="px-4 py-3 text-ink-900">{design.title}</td>
                <td className="px-4 py-3 text-ink-500">{design.category}</td>
                <td className="px-4 py-3 text-ink-900">{formatCents(design.basePriceCents)}</td>
                <td className="px-4 py-3 text-ink-500">{STATUS_LABEL[design.status]}</td>
                <td className="px-4 py-3 text-ink-500">
                  <Link href={`/admin/designs/${design.id}`} className="underline underline-offset-2">
                    edit
                  </Link>
                  {' · '}
                  <button
                    onClick={() => toggleStatus(design.id, design.status)}
                    className="underline underline-offset-2"
                  >
                    {design.status === 'PUBLISHED' ? 'hide' : 'publish'}
                  </button>
                </td>
              </tr>
            ))}
            {data.designs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-dark-500">
                  No designs yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
