'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { apiFetch } from '@/lib/client/api';
import { AppNotification, NotificationsResponse } from '@/lib/types/notification';

const TYPE_LABEL: Record<string, string> = {
  ORDER_CONFIRMED: 'Order confirmed',
  QUOTE_READY: 'Quote ready',
  PAYMENT_RECEIVED: 'Payment received',
  STATUS_CHANGE: 'Status update',
  MEETING_BOOKED: 'Meeting update',
  DELIVERY_COMPLETE: 'Delivered',
  REFERRAL_REWARDED: 'Referral reward',
};

function linkFor(notification: AppNotification): string {
  const payload = notification.payload;
  if (typeof payload.modificationId === 'string') return `/modifications/${payload.modificationId}`;
  if (notification.type === 'ORDER_CONFIRMED') return '/dashboard';
  return '/dashboard';
}

export function NotificationBell({ dark = false }: { dark?: boolean }) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<NotificationsResponse | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  async function load() {
    const result = await apiFetch<NotificationsResponse>('/api/notifications?pageSize=10');
    setData(result);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount pattern
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleMarkRead(id: string) {
    await apiFetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
    load();
  }

  async function handleMarkAllRead() {
    await apiFetch('/api/notifications/read-all', { method: 'PATCH' });
    load();
  }

  const unreadCount = data?.unreadCount ?? 0;

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`relative flex h-8 w-8 items-center justify-center rounded-full ${dark ? 'text-white hover:bg-white/5' : 'text-ink-900 hover:bg-warm-100'}`}
        aria-label="Notifications"
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-card-lg bg-white p-2 shadow-[0_4px_20px_rgba(0,0,0,0.12)]">
          <div className="flex items-center justify-between px-2 py-1.5">
            <span className="text-[11px] font-medium text-ink-900">Notifications</span>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="text-[10.5px] text-ink-500 underline">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {(data?.notifications ?? []).length === 0 && (
              <p className="px-2 py-4 text-center text-[12px] text-ink-500">Nothing yet.</p>
            )}
            {data?.notifications.map((notification) => (
              <Link
                key={notification.id}
                href={linkFor(notification)}
                onClick={() => !notification.readAt && handleMarkRead(notification.id)}
                className={`block rounded-control px-2 py-2 text-[12px] hover:bg-warm-100 ${
                  notification.readAt ? 'text-ink-500' : 'text-ink-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{TYPE_LABEL[notification.type] ?? notification.type}</span>
                  {!notification.readAt && <span className="h-1.5 w-1.5 rounded-full bg-ink-900" />}
                </div>
                <div className="mt-0.5 text-[10.5px] text-ink-500">
                  {new Date(notification.createdAt).toLocaleString()}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
