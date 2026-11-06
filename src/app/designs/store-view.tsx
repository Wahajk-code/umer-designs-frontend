'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/client/api';
import { PaginatedDesigns, DesignCategory } from '@/lib/types/design';
import { DesignCard } from '@/components/designs/design-card';
import { useCheckoutCancelledToast } from '@/components/checkout/checkout-return';

const PAGE_SIZE = 6;

const CATEGORY_FILTERS: { label: string; value: DesignCategory | undefined }[] = [
  { label: 'All', value: undefined },
  { label: 'Container', value: 'CONTAINER' },
  { label: 'Residential', value: 'RESIDENTIAL' },
];

export function StoreView() {
  useCheckoutCancelledToast();
  const [category, setCategory] = useState<DesignCategory | undefined>(undefined);
  const [sort, setSort] = useState<'newest' | 'price_asc' | 'price_desc'>('newest');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PaginatedDesigns | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryTick, setRetryTick] = useState(0);
  const topRef = useRef<HTMLDivElement>(null);

  function goToPage(next: number) {
    setPage(next);
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-dependency-change pattern; each run's setState reflects the new params, not the previous render's props
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    params.set('sort', sort);
    params.set('page', String(page));
    params.set('pageSize', String(PAGE_SIZE));

    apiFetch<PaginatedDesigns>(`/api/designs?${params.toString()}`)
      .then(setData)
      .catch(() => {
        setError('Could not load designs.');
        toast.error('Could not load designs', { description: 'Please check your connection and try again.' });
      })
      .finally(() => setLoading(false));
  }, [category, sort, page, retryTick]);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <div ref={topRef} className="scroll-mt-24">
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
          onChange={(e) => {
            setSort(e.target.value as typeof sort);
            setPage(1);
          }}
          className="rounded-pill bg-white px-4 py-2 text-[11.5px] text-ink-700 outline-none"
        >
          <option value="newest">Sort: Newest</option>
          <option value="price_asc">Price: Low to high</option>
          <option value="price_desc">Price: High to low</option>
        </select>
      </div>

      {error && (
        <div className="mt-8 rounded-card-lg bg-white p-10 text-center">
          <p className="text-[13px] text-ink-500">{error}</p>
          <button
            onClick={() => setRetryTick((t) => t + 1)}
            className="mt-4 rounded-pill bg-ink-900 px-5 py-2.5 text-[12px] font-medium text-white transition-colors hover:bg-ink-950"
          >
            Try again
          </button>
        </div>
      )}

      {!error && loading && (
        <div className="mt-8 grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
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
            <nav aria-label="Designs pagination" className="mt-10 flex flex-col items-center gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page <= 1}
                  aria-label="Previous page"
                  className="flex h-9 items-center gap-1 rounded-pill bg-white px-3.5 text-[11.5px] text-ink-700 transition-colors hover:bg-warm-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={14} /> Prev
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goToPage(i + 1)}
                    aria-current={page === i + 1 ? 'page' : undefined}
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-[11.5px] transition-colors ${
                      page === i + 1 ? 'bg-ink-900 text-white' : 'bg-white text-ink-700 hover:bg-warm-100'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={page >= totalPages}
                  aria-label="Next page"
                  className="flex h-9 items-center gap-1 rounded-pill bg-white px-3.5 text-[11.5px] text-ink-700 transition-colors hover:bg-warm-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
              <p className="text-[11px] text-ink-500">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, data.total)} of {data.total} designs
              </p>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
