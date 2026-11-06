'use client';

import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, Gift } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/client/api';
import { formatCents } from '@/lib/client/format';
import {
  AdminPageHeader,
  EmptyState,
  ErrorBanner,
  Panel,
  PanelHeader,
  PanelLabel,
  Pill,
  Skeleton,
  TableSkeleton,
  td,
  th,
  tr,
} from '@/components/admin/admin-ui';

interface AdminReferral {
  id: string;
  referrerEmail: string;
  referredEmail: string;
  rewardStatus: 'PENDING' | 'REWARDED';
  rewardCents: number;
  createdAt: string;
}

interface AdminReferralsResponse {
  referrals: AdminReferral[];
  total: number;
  totalRewardedCents: number;
}

interface ReferralSettings {
  rewardCents: number;
  payout: string;
}

export function AdminReferralsView() {
  const [data, setData] = useState<AdminReferralsResponse | null>(null);
  const [settings, setSettings] = useState<ReferralSettings | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [d, s] = await Promise.all([
        apiFetch<AdminReferralsResponse>('/api/admin/referrals'),
        apiFetch<ReferralSettings>('/api/admin/referrals/settings'),
      ]);
      setData(d);
      setSettings(s);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load referrals.');
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount pattern
    load();
  }, [load]);

  const pending = data?.referrals.filter((r) => r.rewardStatus === 'PENDING').length ?? 0;
  const stats = [
    { label: 'Reward per referral', value: settings ? formatCents(settings.rewardCents) : null, hint: settings?.payout },
    { label: 'Total paid out', value: data ? formatCents(data.totalRewardedCents) : null, hint: 'as account credit' },
    { label: 'Referrals', value: data ? String(data.total) : null, hint: `${pending} waiting for a first purchase` },
  ];

  return (
    <div>
      <AdminPageHeader title="Referral program" description="Clients earn credit when someone they refer makes their first purchase." />
      {error && <ErrorBanner message={error} onRetry={load} className="mb-4" />}

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s, i) => (
          <Panel key={s.label} className="p-5" delay={i * 0.04}>
            <PanelLabel>{s.label}</PanelLabel>
            <div className="mt-2 text-[24px] font-light text-ink-900">{s.value ?? <Skeleton className="h-7 w-20" />}</div>
            {s.hint && <div className="text-[11px] text-ink-500">{s.hint}</div>}
          </Panel>
        ))}
      </div>

      <Panel delay={0.12}>
        <PanelHeader title="All referrals" count={data?.total} />
        {!data && !error ? (
          <TableSkeleton rows={5} cols={4} />
        ) : data?.referrals.length === 0 ? (
          <EmptyState icon={<Gift size={18} />} title="No referrals yet" hint="Clients share their link from the dashboard's Referrals tab." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr>
                  <th className={th}>Referrer → referred</th>
                  <th className={th}>Joined</th>
                  <th className={th}>Reward</th>
                </tr>
              </thead>
              <tbody>
                {data?.referrals.map((r) => (
                  <tr key={r.id} className={tr}>
                    <td className={td}>
                      <span className="inline-flex items-center gap-2">
                        {r.referrerEmail} <ArrowRight size={12} className="text-ink-500" /> {r.referredEmail}
                      </span>
                    </td>
                    <td className={`${td} text-ink-700`}>{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td className={td}>
                      {r.rewardStatus === 'REWARDED' ? <Pill tone="green">{formatCents(r.rewardCents)} paid</Pill> : <Pill tone="amber">Pending</Pill>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
