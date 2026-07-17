'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/client/api';
import { formatCents } from '@/lib/client/format';

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

  useEffect(() => {
     
    apiFetch<AdminReferralsResponse>('/api/admin/referrals').then(setData);
     
    apiFetch<ReferralSettings>('/api/admin/referrals/settings').then(setSettings);
  }, []);

  return (
    <div className="max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4">
          <div className="text-[10px] tracking-wide text-dark-500">REFERRAL PROGRAM</div>
          <div className="mt-2 flex justify-between text-[12px] text-ink-900">
            <span>Reward</span>
            <span>{settings ? formatCents(settings.rewardCents) : '—'} flat credit</span>
          </div>
          <div className="mt-1 flex justify-between text-[12px] text-ink-900">
            <span>Payout</span>
            <span>{settings?.payout ?? '—'}</span>
          </div>
        </div>
        <div className="bg-white p-4">
          <div className="text-[10px] tracking-wide text-dark-500">TOTAL PAID OUT</div>
          <div className="mt-2 text-[22px] font-light text-ink-900">
            {data ? formatCents(data.totalRewardedCents) : '—'}
          </div>
        </div>
      </div>

      <div className="mt-4 bg-white p-4">
        <div className="text-[10px] tracking-wide text-dark-500">ALL REFERRALS ({data?.total ?? 0})</div>
        <div className="mt-2 flex flex-col divide-y divide-warm-150">
          {data?.referrals.map((r) => (
            <div key={r.id} className="flex items-center justify-between py-2 text-[12px]">
              <span className="text-ink-900">
                {r.referrerEmail} → {r.referredEmail}
              </span>
              <span className={r.rewardStatus === 'REWARDED' ? 'text-ink-900' : 'text-dark-500'}>
                {r.rewardStatus === 'REWARDED' ? `${formatCents(r.rewardCents)} paid` : 'pending'}
              </span>
            </div>
          ))}
          {data?.referrals.length === 0 && <p className="py-4 text-[12px] text-dark-500">No referrals yet.</p>}
        </div>
      </div>
    </div>
  );
}
