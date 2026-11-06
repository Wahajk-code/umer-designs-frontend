'use client';

/* eslint-disable @next/next/no-img-element -- admin thumbnails may be any URL */

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronRight, MessageCircle, Wrench } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/client/api';
import { AdminModificationRow, ModificationStatus } from '@/lib/types/modification';
import { formatCents } from '@/lib/client/format';
import {
  AdminPageHeader,
  Avatar,
  EmptyState,
  ErrorBanner,
  FilterTabs,
  Pagination,
  Panel,
  StatusBadge,
  TableSkeleton,
  fullName,
  td,
  th,
  timeAgo,
  tr,
} from '@/components/admin/admin-ui';

interface PaginatedModifications {
  modifications: AdminModificationRow[];
  total: number;
  page: number;
  pageSize: number;
}

type Filter = ModificationStatus | '' | 'OPEN';

const PAGE_SIZE = 20;

export function AdminModificationsView() {
  const reduce = useReducedMotion();
  const router = useRouter();
  const [data, setData] = useState<PaginatedModifications | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [filter, setFilter] = useState<Filter>('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const sp = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
      if (filter && filter !== 'OPEN') sp.set('status', filter);
      const [list, c] = await Promise.all([
        apiFetch<PaginatedModifications>(`/api/admin/modifications?${sp.toString()}`),
        apiFetch<Record<string, number>>('/api/admin/modifications/counts').catch(() => ({})),
      ]);
      setData(list);
      setCounts(c);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load requests.');
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount / when filter or page changes
    load();
  }, [load]);

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  return (
    <div>
      <AdminPageHeader
        title="Change requests"
        description="Every paid modification request. Open one to move its progress, message the client and deliver files."
      />

      <FilterTabs<Filter>
        className="mb-4"
        value={filter}
        onChange={(v) => {
          setFilter(v);
          setPage(1);
        }}
        options={[
          { label: 'All', value: '', count: total },
          { label: 'Submitted', value: 'SUBMITTED', count: counts.SUBMITTED ?? 0 },
          { label: 'In review', value: 'IN_REVIEW', count: counts.IN_REVIEW ?? 0 },
          { label: 'In progress', value: 'IN_PROGRESS', count: counts.IN_PROGRESS ?? 0 },
          { label: 'Revision', value: 'REVISION', count: counts.REVISION ?? 0 },
          { label: 'Delivered', value: 'DELIVERED', count: counts.DELIVERED ?? 0 },
        ]}
      />

      {error && <ErrorBanner message={error} onRetry={load} className="mb-4" />}

      <Panel>
        {loading && !data ? (
          <TableSkeleton rows={6} cols={6} />
        ) : !data || data.modifications.length === 0 ? (
          <EmptyState
            icon={<Wrench size={18} />}
            title={filter ? 'Nothing in this stage' : 'No change requests yet'}
            hint={filter ? 'Pick another filter above.' : 'When a client pays for changes, the request appears here.'}
          />
        ) : (
          <>
            <div className={`overflow-x-auto transition-opacity ${loading ? 'opacity-60' : ''}`}>
              <table className="w-full min-w-[820px]">
                <thead>
                  <tr>
                    <th className={th}>Request</th>
                    <th className={th}>Client</th>
                    <th className={th}>Changes</th>
                    <th className={`${th} text-right`}>Amount</th>
                    <th className={th}>Status</th>
                    <th className={th}>Last activity</th>
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody>
                  {data.modifications.map((mod, i) => {
                    const last = mod.events[0];
                    const awaiting = last?.kind === 'COMMENT' && last.author?.role !== 'ADMIN';
                    const name = fullName(mod.user);
                    return (
                      <motion.tr
                        key={mod.id}
                        initial={{ opacity: 0, y: reduce ? 0 : 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: reduce ? 0 : Math.min(i, 10) * 0.025 }}
                        onClick={() => router.push(`/admin/modifications/${mod.id}`)}
                        onKeyDown={(e) => e.key === 'Enter' && router.push(`/admin/modifications/${mod.id}`)}
                        tabIndex={0}
                        className={`${tr} group cursor-pointer outline-none focus-visible:bg-panel-200`}
                      >
                        <td className={td}>
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-12 flex-none overflow-hidden rounded-control bg-panel-200">
                              <img src={mod.design.coverImageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
                            </div>
                            <div className="min-w-0">
                              <div className="truncate font-medium">{mod.design.title}</div>
                              <div className="text-[10.5px] text-ink-500">#{mod.id.slice(0, 8)}</div>
                            </div>
                          </div>
                        </td>
                        <td className={td}>
                          <div className="flex items-center gap-2.5">
                            <Avatar name={name} size={28} />
                            <div className="min-w-0">
                              <div className="truncate">{name}</div>
                              <div className="truncate text-[10.5px] text-ink-500">{mod.user?.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className={`${td} max-w-[220px]`}>
                          <div className="truncate text-ink-700" title={mod.selectedOptions.map((s) => s.option.label).join(', ')}>
                            {mod.selectedOptions.map((s) => s.option.label).join(', ') || '—'}
                          </div>
                        </td>
                        <td className={`${td} text-right font-medium`}>{formatCents(mod.totalAmountCents)}</td>
                        <td className={td}>
                          <StatusBadge status={mod.status} />
                        </td>
                        <td className={`${td} whitespace-nowrap text-ink-700`}>
                          <div>{timeAgo(last?.createdAt ?? mod.createdAt)}</div>
                          {awaiting && (
                            <div className="mt-0.5 inline-flex items-center gap-1 text-[10.5px] font-medium text-amber-700">
                              <MessageCircle size={11} /> Awaiting your reply
                            </div>
                          )}
                        </td>
                        <td className="pr-4 text-ink-500">
                          <ChevronRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </>
        )}
      </Panel>
    </div>
  );
}
