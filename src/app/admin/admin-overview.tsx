'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Building2, CalendarClock, ChevronRight, Link2, MessageCircle, Plus, Wrench } from 'lucide-react';
import { apiFetch } from '@/lib/client/api';
import { AdminModificationRow, MessageThread } from '@/lib/types/modification';
import { Meeting } from '@/lib/types/meeting';
import { PaginatedDesigns } from '@/lib/types/design';
import { formatCents } from '@/lib/client/format';
import { cn } from '@/lib/client/cn';
import {
  AdminPageHeader,
  Avatar,
  EmptyState,
  ListSkeleton,
  Panel,
  PanelHeader,
  Skeleton,
  StatusBadge,
  fullName,
  timeAgo,
} from '@/components/admin/admin-ui';

interface AdminMeeting extends Meeting {
  user?: { email: string; firstName: string; lastName: string };
}

interface OverviewData {
  counts: Record<string, number>;
  threads: MessageThread[];
  meetings: AdminMeeting[];
  recent: AdminModificationRow[];
  liveDesigns: number;
  loadedAt: number;
}

export function AdminOverview({ name }: { name: string }) {
  const reduce = useReducedMotion();
  const [data, setData] = useState<OverviewData | null>(null);

  useEffect(() => {
    Promise.all([
      apiFetch<Record<string, number>>('/api/admin/modifications/counts').catch(() => ({})),
      apiFetch<MessageThread[]>('/api/admin/modifications/threads').catch(() => []),
      apiFetch<{ meetings: AdminMeeting[] }>('/api/admin/meetings?pageSize=100').catch(() => ({ meetings: [] })),
      apiFetch<{ modifications: AdminModificationRow[] }>('/api/admin/modifications?pageSize=6').catch(() => ({ modifications: [] })),
      apiFetch<PaginatedDesigns>('/api/admin/designs?pageSize=60').catch(() => null),
    ]).then(([counts, threads, meetings, recent, designs]) =>
      setData({
        counts,
        threads,
        meetings: meetings.meetings,
        recent: recent.modifications,
        liveDesigns: designs?.designs.filter((d) => d.status === 'PUBLISHED').length ?? 0,
        loadedAt: Date.now(),
      }),
    );
  }, []);

  const open = data ? Object.entries(data.counts).filter(([k]) => k !== 'DELIVERED').reduce((a, [, v]) => a + v, 0) : 0;
  const awaiting = data?.threads.filter((t) => t.awaitingReply) ?? [];
  const requested = data?.meetings.filter((m) => m.status === 'REQUESTED') ?? [];
  const upcoming =
    data?.meetings
      .filter((m) => (m.status === 'CONFIRMED' || m.status === 'REQUESTED') && new Date(m.scheduledAt).getTime() > data.loadedAt)
      .sort((a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt))
      .slice(0, 5) ?? [];

  const stats = [
    { label: 'Open change requests', value: open, hint: `${data?.counts.SUBMITTED ?? 0} new`, href: '/admin/modifications', icon: <Wrench size={16} /> },
    { label: 'Awaiting your reply', value: awaiting.length, hint: 'client messages', href: '/admin/messages', icon: <MessageCircle size={16} />, alert: awaiting.length > 0 },
    { label: 'Meeting requests', value: requested.length, hint: 'to confirm', href: '/admin/meetings', icon: <CalendarClock size={16} />, alert: requested.length > 0 },
    { label: 'Live designs', value: data?.liveDesigns ?? 0, hint: 'in the store', href: '/admin/designs', icon: <Building2 size={16} /> },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div>
      <AdminPageHeader
        title={`${greeting}, ${name.split(' ')[0]}`}
        description="Here's what needs you today."
        actions={
          <>
            <Link href="/admin/payment-links" className="inline-flex h-10 items-center gap-1.5 rounded-pill bg-white/10 px-4 text-[12.5px] text-white transition-colors hover:bg-white/15">
              <Link2 size={14} /> Payment link
            </Link>
            <Link href="/admin/designs?new=1" className="inline-flex h-10 items-center gap-1.5 rounded-pill bg-white px-4 text-[12.5px] font-medium text-ink-900 transition-colors hover:bg-warm-100">
              <Plus size={14} /> New design
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: reduce ? 0 : 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduce ? 0 : i * 0.05 }}>
            <Link
              href={s.href}
              className="group block rounded-card bg-panel p-5 shadow-panel ring-1 ring-black/5 transition-all hover:-translate-y-0.5 hover:bg-white"
            >
              <div className="flex items-center justify-between">
                <span className={cn('flex h-9 w-9 items-center justify-center rounded-full', s.alert ? 'bg-amber-100 text-amber-800' : 'bg-panel-200 text-ink-700')}>{s.icon}</span>
                <ArrowUpRight size={15} className="text-ink-500 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <div className="mt-4 text-[28px] font-light leading-none text-ink-900">{data ? s.value : <Skeleton className="h-7 w-10" />}</div>
              <div className="mt-2 text-[12px] font-medium text-ink-900">{s.label}</div>
              <div className="text-[11px] text-ink-500">{s.hint}</div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-5">
        <Panel className="lg:col-span-3" delay={0.15}>
          <PanelHeader
            title="Needs your attention"
            actions={
              <Link href="/admin/modifications" className="text-[11.5px] text-ink-700 underline-offset-2 hover:underline">
                All requests
              </Link>
            }
          />
          {!data ? (
            <ListSkeleton rows={4} />
          ) : awaiting.length === 0 && data.recent.length === 0 ? (
            <EmptyState icon={<Wrench size={18} />} title="All quiet" hint="New requests and client messages will appear here." />
          ) : (
            <ul className="divide-y divide-panel-300">
              {awaiting.slice(0, 4).map((t) => (
                <li key={`m-${t.modificationId}`}>
                  <Link href={`/admin/messages?id=${t.modificationId}`} className="group flex items-center gap-3 px-5 py-3 transition-colors hover:bg-panel-200/60">
                    <Avatar name={fullName(t.client)} size={32} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[12.5px] text-ink-900">
                        <b className="font-medium">{fullName(t.client)}</b> sent a message · {t.design.title}
                      </div>
                      <div className="truncate text-[11.5px] text-ink-500">“{t.lastMessage?.comment}”</div>
                    </div>
                    <span className="flex-none text-[10.5px] text-ink-500">{timeAgo(t.lastActivityAt)}</span>
                    <ChevronRight size={14} className="flex-none text-ink-500 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </li>
              ))}
              {data.recent
                .filter((m) => m.status !== 'DELIVERED')
                .slice(0, 5)
                .map((m) => (
                  <li key={`r-${m.id}`}>
                    <Link href={`/admin/modifications/${m.id}`} className="group flex items-center gap-3 px-5 py-3 transition-colors hover:bg-panel-200/60">
                      <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-panel-200 text-ink-700">
                        <Wrench size={14} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[12.5px] text-ink-900">
                          <b className="font-medium">{m.design.title}</b> · {fullName(m.user)}
                        </div>
                        <div className="truncate text-[11.5px] text-ink-500">
                          {m.selectedOptions.map((s) => s.option.label).join(', ')} · {formatCents(m.totalAmountCents)}
                        </div>
                      </div>
                      <StatusBadge status={m.status} />
                      <ChevronRight size={14} className="flex-none text-ink-500 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </li>
                ))}
            </ul>
          )}
        </Panel>

        <Panel className="lg:col-span-2" delay={0.2}>
          <PanelHeader
            title="Upcoming meetings"
            actions={
              <Link href="/admin/meetings" className="text-[11.5px] text-ink-700 underline-offset-2 hover:underline">
                All meetings
              </Link>
            }
          />
          {!data ? (
            <ListSkeleton rows={3} />
          ) : upcoming.length === 0 ? (
            <EmptyState icon={<CalendarClock size={18} />} title="No upcoming meetings" />
          ) : (
            <ul className="divide-y divide-panel-300">
              {upcoming.map((m) => {
                const d = new Date(m.scheduledAt);
                return (
                  <li key={m.id}>
                    <Link href="/admin/meetings" className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-panel-200/60">
                      <div className="flex h-11 w-11 flex-none flex-col items-center justify-center rounded-control bg-white ring-1 ring-panel-300">
                        <span className="text-[8.5px] font-medium uppercase text-red-600">{d.toLocaleDateString(undefined, { month: 'short' })}</span>
                        <span className="text-[15px] leading-none text-ink-900">{d.getDate()}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[12.5px] text-ink-900">{fullName(m.user)}</div>
                        <div className="text-[11px] text-ink-500">{d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                      <span className={cn('rounded-pill px-2 py-0.5 text-[10px] font-medium', m.status === 'REQUESTED' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800')}>
                        {m.status === 'REQUESTED' ? 'To confirm' : 'Confirmed'}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
