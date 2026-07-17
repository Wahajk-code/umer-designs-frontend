'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/client/api';
import { PaginatedDesigns, DesignCategory } from '@/lib/types/design';
import { DesignCard } from '@/components/designs/design-card';

const CATEGORY_FILTERS: { label: string; value: DesignCategory | undefined }[] = [
  { label: 'All', value: undefined },
  { label: 'Container', value: 'CONTAINER' },
  { label: 'Residential', value: 'RESIDENTIAL' },
];

export function StoreView() {
  const [category, setCategory] = useState<DesignCategory | undefined>(undefined);
  const [sort, setSort] = useState<'newest' | 'price_asc' | 'price_desc'>('newest');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PaginatedDesigns | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-dependency-change pattern; each run's setState reflects the new params, not the previous render's props
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    params.set('sort', sort);
    params.set('page', String(page));
    params.set('pageSize', '12');

    apiFetch<PaginatedDesigns>(`/api/designs?${params.toString()}`)
      .then(setData)
      .catch(() => setError('Could not load designs. Please try again.'))
      .finally(() => setLoading(false));
  }, [category, sort, page]);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {CATEGORY_FILTERS.map((f) => (
            <button
              key={f.label}
              onClick={() => {
                setCategory(f.value);
                setPage(1);
              }}
              className={`rounded-pill px-[18px] py-2 text-[11.5px] transition-colors ${
                category === f.value ? 'bg-ink-900 text-white' : 'bg-white text-ink-700 hover:bg-warm-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          className="rounded-pill bg-white px-4 py-2 text-[11.5px] text-ink-700 outline-none"
        >
          <option value="newest">Sort: Newest</option>
          <option value="price_asc">Price: Low to high</option>
          <option value="price_desc">Price: High to low</option>
        </select>
      </div>

      {error && <p className="mt-8 text-[13px] text-red-600">{error}</p>}

      {!error && loading && (
        <div className="mt-8 grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[300px] animate-pulse rounded-card bg-warm-150" />
          ))}
        </div>
      )}

      {!error && !loading && data && data.designs.length === 0 && (
        <p className="mt-16 text-center text-[13px] text-ink-500">
          No designs match those filters yet.
        </p>
      )}

      {!error && !loading && data && data.designs.length > 0 && (
        <>
          <div className="mt-8 grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
            {data.designs.map((design) => (
              <DesignCard key={design.id} design={design} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-10 flex justify-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-[11.5px] transition-colors ${
                    page === i + 1 ? 'bg-ink-900 text-white' : 'bg-white text-ink-700 hover:bg-warm-100'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
