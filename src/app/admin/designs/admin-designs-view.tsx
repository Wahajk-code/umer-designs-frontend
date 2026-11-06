'use client';

/* eslint-disable @next/next/no-img-element -- admin thumbnails may be any pasted URL */

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { motion, useReducedMotion } from 'framer-motion';
import { Building2, ExternalLink, Eye, EyeOff, Pencil, Plus, Search } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/client/api';
import { Design, DesignStatus, PaginatedDesigns } from '@/lib/types/design';
import { formatCents } from '@/lib/client/format';
import {
  AdminButton,
  AdminPageHeader,
  EmptyState,
  ErrorBanner,
  FilterTabs,
  Panel,
  Pill,
  TableSkeleton,
  adminInput,
  td,
  th,
  tr,
} from '@/components/admin/admin-ui';
import { DesignEditorModal } from './design-editor-modal';

const STATUS_TONE: Record<DesignStatus, 'green' | 'amber' | 'neutral'> = {
  PUBLISHED: 'green',
  DRAFT: 'amber',
  HIDDEN: 'neutral',
};
const STATUS_TEXT: Record<DesignStatus, string> = { PUBLISHED: 'Published', DRAFT: 'Draft', HIDDEN: 'Hidden' };

type Filter = '' | DesignStatus;

export function AdminDesignsView() {
  const reduce = useReducedMotion();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [data, setData] = useState<PaginatedDesigns | null>(null);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // The editor modal is URL-driven (?edit=<id> / ?new=1) so it survives refresh and the back button closes it.
  const editId = params.get('edit');
  const creating = params.get('new') === '1';
  const modalOpen = creating || !!editId;

  function setModal(next: { edit?: string; new?: boolean } | null) {
    const sp = new URLSearchParams(params.toString());
    sp.delete('edit');
    sp.delete('new');
    if (next?.edit) sp.set('edit', next.edit);
    if (next?.new) sp.set('new', '1');
    const qs = sp.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  // debounce the search box
  useEffect(() => {
    const t = setTimeout(() => setQuery(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const sp = new URLSearchParams({ pageSize: '60' });
      if (query) sp.set('search', query);
      setData(await apiFetch<PaginatedDesigns>(`/api/admin/designs?${sp.toString()}`));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load designs.');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount / when the query changes
    load();
  }, [load]);

  async function toggleStatus(design: Design) {
    const next: DesignStatus = design.status === 'PUBLISHED' ? 'HIDDEN' : 'PUBLISHED';
    setTogglingId(design.id);
    try {
      await apiFetch(`/api/admin/designs/${design.id}`, { method: 'PATCH', body: { status: next } });
      setData((prev) => (prev ? { ...prev, designs: prev.designs.map((d) => (d.id === design.id ? { ...d, status: next } : d)) } : prev));
      toast.success(next === 'PUBLISHED' ? `${design.title} is live in the store` : `${design.title} is hidden from the store`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not update design.');
    } finally {
      setTogglingId(null);
    }
  }

  const counts = useMemo(() => {
    const c = { '': 0, PUBLISHED: 0, DRAFT: 0, HIDDEN: 0 } as Record<Filter, number>;
    data?.designs.forEach((d) => {
      c[''] += 1;
      c[d.status] += 1;
    });
    return c;
  }, [data]);

  const rows = (data?.designs ?? []).filter((d) => !filter || d.status === filter);

  return (
    <div>
      <AdminPageHeader
        title="Designs"
        description="Everything in the store. Create and edit listings — details, photos, plan files and add-ons — without leaving this page."
        actions={
          <AdminButton variant="light" icon={<Plus size={14} />} onClick={() => setModal({ new: true })}>
            New design
          </AdminButton>
        }
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <FilterTabs<Filter>
          value={filter}
          onChange={setFilter}
          options={[
            { label: 'All', value: '', count: counts[''] },
            { label: 'Published', value: 'PUBLISHED', count: counts.PUBLISHED },
            { label: 'Drafts', value: 'DRAFT', count: counts.DRAFT },
            { label: 'Hidden', value: 'HIDDEN', count: counts.HIDDEN },
          ]}
        />
        <div className="relative w-full max-w-xs">
          <Search size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search designs…" className={`${adminInput} rounded-pill pl-9`} />
        </div>
      </div>

      {error && <ErrorBanner message={error} onRetry={load} className="mb-4" />}

      <Panel>
        {loading && !data ? (
          <TableSkeleton rows={6} cols={6} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<Building2 size={18} />}
            title={query || filter ? 'No designs match' : 'No designs yet'}
            hint={query || filter ? 'Try a different search or filter.' : 'Create your first listing — it starts as a draft.'}
            action={
              !query && !filter && (
                <AdminButton icon={<Plus size={14} />} onClick={() => setModal({ new: true })}>
                  New design
                </AdminButton>
              )
            }
          />
        ) : (
          <div className={`overflow-x-auto transition-opacity ${loading ? 'opacity-60' : ''}`}>
            <table className="w-full min-w-[760px]">
              <thead>
                <tr>
                  <th className={th}>Design</th>
                  <th className={th}>Category</th>
                  <th className={th}>Specs</th>
                  <th className={`${th} text-right`}>Price</th>
                  <th className={th}>Status</th>
                  <th className={`${th} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((design, i) => (
                  <motion.tr
                    key={design.id}
                    initial={{ opacity: 0, y: reduce ? 0 : 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: reduce ? 0 : Math.min(i, 10) * 0.025 }}
                    className={`${tr} cursor-pointer`}
                    onClick={() => setModal({ edit: design.id })}
                  >
                    <td className={td}>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-14 flex-none overflow-hidden rounded-control bg-panel-200 ring-1 ring-panel-300">
                          {design.coverImageUrl && <img src={design.coverImageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-medium">{design.title}</div>
                          <div className="truncate text-[11px] text-ink-500">
                            /{design.slug} · {1 + (design.galleryUrls?.length ?? 0)} photos
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className={`${td} text-ink-700`}>{design.category === 'CONTAINER' ? 'Container' : 'Residential'}</td>
                    <td className={`${td} whitespace-nowrap text-ink-700`}>
                      {design.bedrooms} bd · {design.bathrooms} ba · {design.sqft.toLocaleString()} sqft
                    </td>
                    <td className={`${td} text-right font-medium`}>{formatCents(design.basePriceCents)}</td>
                    <td className={td}>
                      <Pill tone={STATUS_TONE[design.status]}>{STATUS_TEXT[design.status]}</Pill>
                    </td>
                    <td className={`${td} text-right`} onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <AdminButton size="sm" variant="ghost" icon={<Pencil size={12} />} onClick={() => setModal({ edit: design.id })}>
                          Edit
                        </AdminButton>
                        <AdminButton
                          size="sm"
                          variant="secondary"
                          icon={design.status === 'PUBLISHED' ? <EyeOff size={12} /> : <Eye size={12} />}
                          loading={togglingId === design.id}
                          onClick={() => toggleStatus(design)}
                          className="w-[92px]"
                        >
                          {design.status === 'PUBLISHED' ? 'Hide' : 'Publish'}
                        </AdminButton>
                        {design.status === 'PUBLISHED' ? (
                          <Link
                            href={`/designs/${design.slug}`}
                            target="_blank"
                            aria-label={`View ${design.title} in the store`}
                            title="View in store"
                            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-panel-200 hover:text-ink-900"
                          >
                            <ExternalLink size={13} />
                          </Link>
                        ) : (
                          <span className="h-8 w-8" />
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <DesignEditorModal open={modalOpen} designId={editId} onClose={() => setModal(null)} onSaved={load} />
    </div>
  );
}
