'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Inbox, MessagesSquare, Search } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/client/api';
import { MessageThread, Modification } from '@/lib/types/modification';
import { cn } from '@/lib/client/cn';
import {
  AdminPageHeader,
  Avatar,
  EmptyState,
  ErrorBanner,
  ListSkeleton,
  Panel,
  Skeleton,
  StatusBadge,
  adminInput,
  fullName,
  timeAgo,
} from '@/components/admin/admin-ui';
import { Conversation } from '@/components/admin/conversation';

type Filter = 'all' | 'awaiting';

export function MessagesInbox() {
  const reduce = useReducedMotion();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const selectedId = params.get('id');

  const [threads, setThreads] = useState<MessageThread[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [active, setActive] = useState<Modification | null>(null);
  const [activeError, setActiveError] = useState<string | null>(null);

  const loadThreads = useCallback(async () => {
    try {
      setThreads(await apiFetch<MessageThread[]>('/api/admin/modifications/threads'));
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load messages.');
    }
  }, []);

  const loadActive = useCallback(async (id: string) => {
    try {
      setActive(await apiFetch<Modification>(`/api/modifications/${id}`));
      setActiveError(null);
    } catch (err) {
      setActiveError(err instanceof ApiError ? err.message : 'Could not load this conversation.');
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount + polling
    loadThreads();
    const t = setInterval(() => document.visibilityState === 'visible' && loadThreads(), 20000);
    return () => clearInterval(t);
  }, [loadThreads]);

  useEffect(() => {
    if (!selectedId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clear when nothing is selected
      setActive(null);
      return;
    }
    if (active?.id !== selectedId) setActive(null);
    loadActive(selectedId);
    const t = setInterval(() => document.visibilityState === 'visible' && loadActive(selectedId), 10000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `active` is read only to decide whether to blank the pane
  }, [selectedId, loadActive]);

  function select(id: string | null) {
    router.replace(id ? `${pathname}?id=${id}` : pathname, { scroll: false });
  }

  const awaitingCount = threads?.filter((t) => t.awaitingReply).length ?? 0;
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (threads ?? [])
      .filter((t) => filter === 'all' || t.awaitingReply)
      .filter(
        (t) =>
          !q ||
          fullName(t.client).toLowerCase().includes(q) ||
          t.client.email.toLowerCase().includes(q) ||
          t.design.title.toLowerCase().includes(q),
      );
  }, [threads, filter, search]);

  const selectedThread = threads?.find((t) => t.modificationId === selectedId);

  return (
    <div>
      <AdminPageHeader
        title="Messages"
        description="Every conversation with clients, one per change request. Newest activity first."
      />
      {error && <ErrorBanner message={error} onRetry={loadThreads} className="mb-4" />}

      <Panel className="grid h-[calc(100vh-220px)] min-h-[520px] grid-cols-1 md:grid-cols-[340px_1fr]">
        {/* ── thread list ── */}
        <div className={cn('flex min-h-0 flex-col border-panel-300 md:border-r', selectedId && 'hidden md:flex')}>
          <div className="space-y-3 border-b border-panel-300 p-4">
            <div className="relative">
              <Search size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search client or design…" className={`${adminInput} h-9 rounded-pill pl-9`} />
            </div>
            <div className="flex gap-1">
              {(
                [
                  ['all', 'All', threads?.length ?? 0],
                  ['awaiting', 'Awaiting reply', awaitingCount],
                ] as const
              ).map(([value, label, count]) => (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-[11.5px] transition-colors',
                    filter === value ? 'bg-ink-900 text-white' : 'text-ink-700 hover:bg-panel-200',
                  )}
                >
                  {label}
                  <span className={cn('rounded-pill px-1.5 text-[10px]', filter === value ? 'bg-white/20' : 'bg-panel-200', value === 'awaiting' && count > 0 && filter !== value && 'bg-amber-100 text-amber-800')}>
                    {count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {!threads && !error && <ListSkeleton rows={6} />}
            {threads && visible.length === 0 && (
              <EmptyState
                icon={<Inbox size={18} />}
                title={filter === 'awaiting' ? 'All caught up' : 'No conversations'}
                hint={filter === 'awaiting' ? 'No client is waiting on a reply.' : 'Conversations start from a change request.'}
              />
            )}
            <ul>
              {visible.map((t, i) => {
                const name = fullName(t.client);
                const isActive = t.modificationId === selectedId;
                return (
                  <motion.li key={t.modificationId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: reduce ? 0 : Math.min(i, 12) * 0.02 }}>
                    <button
                      onClick={() => select(t.modificationId)}
                      aria-current={isActive ? 'true' : undefined}
                      className={cn(
                        'relative flex w-full items-start gap-3 border-b border-panel-300/70 px-4 py-3.5 text-left transition-colors',
                        isActive ? 'bg-white' : 'hover:bg-panel-200/60',
                      )}
                    >
                      {isActive && <motion.span layoutId="thread-active" className="absolute inset-y-0 left-0 w-0.5 bg-ink-900" />}
                      <div className="relative">
                        <Avatar name={name} size={36} />
                        {t.awaitingReply && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-panel" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className={cn('truncate text-[12.5px]', t.awaitingReply ? 'font-semibold text-ink-900' : 'font-medium text-ink-900')}>{name}</span>
                          <span className="flex-none text-[10.5px] text-ink-500">{timeAgo(t.lastActivityAt)}</span>
                        </div>
                        <div className="truncate text-[11px] text-ink-500">{t.design.title}</div>
                        <div className={cn('mt-1 line-clamp-1 text-[11.5px]', t.awaitingReply ? 'text-ink-900' : 'text-ink-500')}>
                          {t.lastMessage ? (
                            <>
                              {t.lastMessage.fromAdmin && <span className="text-ink-500">You: </span>}
                              {t.lastMessage.comment}
                            </>
                          ) : (
                            <span className="italic">No messages yet — start the conversation</span>
                          )}
                        </div>
                      </div>
                    </button>
                  </motion.li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* ── conversation ── */}
        <div className={cn('flex min-h-0 flex-col', !selectedId && 'hidden md:flex')}>
          <AnimatePresence mode="wait">
            {!selectedId ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-1 items-center justify-center">
                <EmptyState icon={<MessagesSquare size={18} />} title="Select a conversation" hint="Pick a client on the left to read and reply." />
              </motion.div>
            ) : (
              <motion.div
                key={selectedId}
                initial={{ opacity: 0, x: reduce ? 0 : 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="flex min-h-0 flex-1 flex-col"
              >
                <div className="flex items-center gap-3 border-b border-panel-300 px-4 py-3">
                  <button
                    onClick={() => select(null)}
                    aria-label="Back to conversations"
                    className="flex h-8 w-8 items-center justify-center rounded-full text-ink-700 hover:bg-panel-200 md:hidden"
                  >
                    <ArrowLeft size={15} />
                  </button>
                  {active || selectedThread ? (
                    <>
                      <Avatar name={fullName(active?.user ?? selectedThread?.client)} size={36} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[13px] font-medium text-ink-900">{fullName(active?.user ?? selectedThread?.client)}</div>
                        <div className="truncate text-[11px] text-ink-500">
                          {(active?.user ?? selectedThread?.client)?.email} · {active?.design.title ?? selectedThread?.design.title}
                        </div>
                      </div>
                      {(active?.status ?? selectedThread?.status) && <StatusBadge status={(active?.status ?? selectedThread?.status)!} />}
                      <Link
                        href={`/admin/modifications/${selectedId}`}
                        className="hidden items-center gap-1 rounded-pill px-3 py-1.5 text-[11.5px] text-ink-700 ring-1 ring-panel-300 transition-colors hover:bg-white sm:inline-flex"
                      >
                        Open request <ExternalLink size={11} />
                      </Link>
                    </>
                  ) : (
                    <div className="flex flex-1 items-center gap-3">
                      <Skeleton className="h-9 w-9 rounded-full" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-3 w-32" />
                        <Skeleton className="h-2.5 w-48" />
                      </div>
                    </div>
                  )}
                </div>

                {activeError && <ErrorBanner message={activeError} onRetry={() => loadActive(selectedId)} className="m-4" />}
                {!active && !activeError && (
                  <div className="flex-1 space-y-4 p-5">
                    <Skeleton className="h-10 w-2/3" />
                    <Skeleton className="ml-auto h-10 w-1/2" />
                    <Skeleton className="h-10 w-3/5" />
                  </div>
                )}
                {active && (
                  <Conversation
                    modification={active}
                    showStatusEvents={false}
                    className="flex-1"
                    onUpdated={(m) => {
                      setActive(m);
                      loadThreads();
                    }}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Panel>
    </div>
  );
}
