'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/client/api';
import { Order } from '@/lib/types/order';
import { formatCents } from '@/lib/client/format';

interface ReferralSummary {
  creditBalanceCents: number;
  totalReferred: number;
}

export function OverviewStats() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [referrals, setReferrals] = useState<ReferralSummary | null>(null);

  useEffect(() => {
    apiFetch<Order[]>('/api/orders').then(setOrders).catch(() => setOrders([]));
    apiFetch<ReferralSummary>('/api/referrals').then(setReferrals).catch(() => setReferrals(null));
  }, []);

  const designsOwned = orders?.filter((o) => o.status === 'PAID').length ?? null;

  const stats = [
    { label: 'Designs owned', value: designsOwned === null ? null : String(designsOwned) },
    {
      label: 'Credit balance',
      value: referrals ? formatCents(referrals.creditBalanceCents) : null,
    },
    {
      label: 'Friends referred',
      value: referrals ? String(referrals.totalReferred) : null,
    },
  ];

  return (
    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-card bg-white p-5">
          {stat.value === null ? (
            <div className="h-7 w-16 animate-pulse rounded bg-warm-150" />
          ) : (
            <div className="text-[22px] font-medium text-ink-900">{stat.value}</div>
          )}
          <div className="mt-1 text-[11px] text-ink-500">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
