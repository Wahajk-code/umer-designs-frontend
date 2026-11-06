'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Bell } from 'lucide-react';
import { apiFetch } from '@/lib/client/api';
import { formatCents } from '@/lib/client/format';
import { AppNotification, NotificationsResponse } from '@/lib/types/notification';

const TYPE_LABEL: Record<string, string> = {
  ORDER_CONFIRMED: 'Order confirmed',
  QUOTE_READY: 'Quote ready',
  PAYMENT_RECEIVED: 'Payment received',
  STATUS_CHANGE: 'Request update',
  MEETING_BOOKED: 'Meeting update',
  DELIVERY_COMPLETE: 'Delivered',
  REFERRAL_REWARDED: 'Referral reward',
};

const str = (v: unknown) => (typeof v === 'string' ? v : undefined);
const num = (v: unknown) => (typeof v === 'number' ? v : undefined);

function describe(n: AppNotification): { title: string; detail?: string } {
  const p = n.payload;
  const admin = p.audience === 'admin';
  const design = str(p.designTitle);
  const client = str(p.clientName) ?? str(p.clientEmail) ?? 'A client';
  const preview = str(p.preview);
  if (p.kind === 'message') {
    if (admin) {
      return { title: `${str(p.authorName) ?? client} sent a message`, detail: `${design ? `${design} · ` : ''}${preview ? `“${preview}”` : ''}` };
    }
    return { title: `New message from ${str(p.authorName) ?? 'your architect'}`, detail: `${design ? `${design} · ` : ''}${preview ? `“${preview}”` : ''}` };
  }
  if (admin) {
    if (n.type === 'ORDER_CONFIRMED') return { title: `${client} bought a plan`, detail: `${design} · ${formatCents(num(p.amountCents) ?? 0)}` };
    if (n.type === 'MEETING_BOOKED')
      return {
        title: `${client} requested a meeting`,
        detail: new Date(str(p.scheduledAt) ?? n.createdAt).toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
      };
    if (p.paymentLinkId) return { title: `${client} paid a payment link`, detail: `${str(p.description) ?? ''} · ${formatCents(num(p.amountCents) ?? 0)}` };
    if (p.modificationId) return { title: `${client} paid for changes`, detail: `${design ?? ''}${num(p.totalAmountCents) ? ` · ${formatCents(num(p.totalAmountCents)!)}` : ''}` };
  }
  if (n.type === 'STATUS_CHANGE' && p.toStatus) return { title: 'Request update', detail: `${design ?? 'Your request'} — now ${String(p.toStatus).toLowerCase().replace('_', ' ')}` };
  if (n.type === 'MEETING_BOOKED') return { title: 'Meeting update', detail: str(p.status)?.toLowerCase() };
  return { title: TYPE_LABEL[n.type] ?? n.type, detail: design ?? str(p.description) };
}

/** Sends each recipient to the screen where they can act on it. */
function linkFor(n: AppNotification): string {
  const p = n.payload;
  const id = str(p.modificationId);
  if (p.audience === 'admin') {
    if (id && p.kind === 'message') return `/admin/messages?id=${id}`;
    if (id) return `/admin/modifications/${id}`;
    if (n.type === 'MEETING_BOOKED') return '/admin/meetings';
    if (p.paymentLinkId) return '/admin/payment-links';
    return '/admin';
  }
  if (id) return `/dashboard/requests/${id}`;
  if (n.type === 'ORDER_CONFIRMED') return '/dashboard/designs';
  if (n.type === 'REFERRAL_REWARDED') return '/dashboard/referrals';
  if (n.type === 'MEETING_BOOKED') return '/schedule-a-meeting';
  return '/dashboard';
}

function timeAgo(iso: string): string {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return new Date(iso).toLocaleDateString();
}

export function NotificationBell({ dark = false }: { dark?: boolean }) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<NotificationsResponse | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      setData(await apiFetch<NotificationsResponse>('/api/notifications?pageSize=10'));
    } catch {
      /* keep last good data */
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount + polling pattern
    load();
    const interval = setInterval(() => document.visibilityState === 'visible' && load(), 20000);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false);
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  async function handleMarkRead(id: string) {
    await apiFetch(`/api/notifications/${id}/read`, { method: 'PATCH' }).catch(() => undefined);
    load();
  }

  async function handleMarkAllRead() {
    await apiFetch('/api/notifications/read-all', { method: 'PATCH' }).catch(() => undefined);
    load();
  }

  const unreadCount = data?.unreadCount ?? 0;
  const items = data?.notifications ?? [];

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => {
          setOpen((v) => !v);
          if (!open) load();
        }}
        className={`relative flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
          dark ? 'text-white hover:bg-white/10' : 'text-ink-900 hover:bg-warm-100'
        }`}
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={open}
      >
        <Bell size={17} />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key={unreadCount}
              initial={{ scale: reduce ? 1 : 0.4 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-medium text-white"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: reduce ? 0 : -6, scale: reduce ? 1 : 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reduce ? 0 : -6, scale: reduce ? 1 : 0.98 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            style={{ transformOrigin: 'top right' }}
            className="absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-card-lg bg-white p-2 text-left shadow-[0_10px_40px_rgba(0,0,0,0.16)]"
          >
            <div className="flex items-center justify-between px-2 py-1.5">
              <span className="text-[12px] font-medium text-ink-900">Notifications</span>
              {unreadCount > 0 && (
                <button onClick={handleMarkAllRead} className="text-[11px] text-ink-500 underline underline-offset-2 hover:text-ink-900">
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {items.length === 0 && (
                <p className="px-2 py-8 text-center text-[12px] text-ink-500">You&apos;re all caught up.</p>
              )}
              {items.map((notification) => {
                const { title, detail } = describe(notification);
                const unread = !notification.readAt;
                return (
                  <Link
                    key={notification.id}
                    href={linkFor(notification)}
                    onClick={() => {
                      setOpen(false);
                      if (unread) handleMarkRead(notification.id);
                    }}
                    className={`flex gap-2.5 rounded-control px-2.5 py-2.5 transition-colors hover:bg-warm-100 ${
                      unread ? 'bg-warm-50' : ''
                    }`}
                  >
                    <span className={`mt-1.5 h-1.5 w-1.5 flex-none rounded-full ${unread ? 'bg-ink-900' : 'bg-transparent'}`} />
                    <span className="min-w-0 flex-1">
                      <span className={`block truncate text-[12.5px] ${unread ? 'font-medium text-ink-900' : 'text-ink-700'}`}>
                        {title}
                      </span>
                      {detail && <span className="mt-0.5 line-clamp-2 block text-[11.5px] text-ink-500">{detail}</span>}
                      <span className="mt-1 block text-[10.5px] text-ink-500/80">{timeAgo(notification.createdAt)}</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
