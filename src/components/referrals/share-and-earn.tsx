'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/client/api';
import { formatCents } from '@/lib/client/format';

interface ReferralSummary {
  referralCode: string;
  totalReferred: number;
  totalEarnedCents: number;
  referrals: Array<{ referredEmail: string; rewardStatus: 'PENDING' | 'REWARDED'; createdAt: string }>;
}

export function ShareAndEarn() {
  const [summary, setSummary] = useState<ReferralSummary | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
     
    apiFetch<ReferralSummary>('/api/referrals').then(setSummary).catch(() => setSummary(null));
  }, []);

  if (!summary) {
    return <div className="h-40 animate-pulse rounded-card bg-warm-150" />;
  }

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/r/${summary.referralCode}` : '';

  function handleCopy() {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-card bg-white p-5">
      <h2 className="text-[16px] font-medium text-ink-900">Share & earn</h2>
      <p className="mt-2 text-[11.5px] leading-relaxed text-ink-500">
        Give friends your link — you earn $30 credit when they make their first purchase.
      </p>
      <div className="mt-3 flex items-center justify-between rounded-pill bg-warm-100 py-1.5 pl-4 pr-1.5">
        <span className="truncate text-[11px] text-ink-900">{shareUrl.replace(/^https?:\/\//, '')}</span>
        <button
          onClick={handleCopy}
          className="rounded-pill bg-ink-900 px-4 py-2 text-[10.5px] text-white transition-colors hover:bg-ink-950"
        >
          {copied ? 'Copied ✓' : 'Copy'}
        </button>
      </div>
      <div className="mt-4 flex gap-2.5">
        <div className="flex-1 rounded-control bg-warm-50 p-3">
          <div className="text-[16px] font-medium text-ink-900">{summary.totalReferred}</div>
          <div className="text-[9.5px] text-ink-500">signups</div>
        </div>
        <div className="flex-1 rounded-control bg-warm-50 p-3">
          <div className="text-[16px] font-medium text-ink-900">{formatCents(summary.totalEarnedCents)}</div>
          <div className="text-[9.5px] text-ink-500">earned</div>
        </div>
      </div>
      {summary.referrals.length > 0 && (
        <div className="mt-4 rounded-control bg-warm-50 p-2">
          {summary.referrals.map((r, i) => (
            <div
              key={i}
              className={`flex justify-between px-2 py-1.5 text-[10.5px] ${
                i < summary.referrals.length - 1 ? 'border-b border-warm-200' : ''
              }`}
            >
              <span className="text-ink-700">{r.referredEmail}</span>
              <span className={r.rewardStatus === 'REWARDED' ? 'text-ink-900' : 'text-ink-500'}>
                {r.rewardStatus === 'REWARDED' ? 'earned ✓' : 'pending'}
              </span>
            </div>
          ))}
        </div>
      )}
      <Link
        href="/schedule-a-meeting"
        className="mt-4 block text-center text-[11px] text-ink-500 underline underline-offset-2"
      >
        Need to talk it through? Schedule a meeting
      </Link>
    </div>
  );
}
