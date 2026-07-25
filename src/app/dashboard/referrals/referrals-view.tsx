'use client';

import { useEffect, useState } from 'react';
import { Check, Copy, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/client/api';
import { formatCents } from '@/lib/client/format';

interface ReferralSummary {
  referralCode: string;
  totalReferred: number;
  totalEarnedCents: number;
  creditBalanceCents: number;
  referrals: Array<{ referredEmail: string; rewardStatus: 'PENDING' | 'REWARDED'; createdAt: string }>;
}

export function ReferralsView() {
  const [summary, setSummary] = useState<ReferralSummary | null>(null);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    apiFetch<ReferralSummary>('/api/referrals')
      .then(setSummary)
      .catch(() => setError(true));
  }, []);

  if (error) {
    return (
      <div className="rounded-card-lg bg-white p-10 text-center text-[13px] text-ink-500">
        Could not load your referral summary. Please refresh the page.
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-card bg-warm-150" />
        ))}
      </div>
    );
  }

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/r/${summary.referralCode}` : '';

  function handleCopy() {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Referral link copied');
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      {/* Credit balance — the headline "currency" card */}
      <div className="rounded-card-lg bg-ink-900 p-7 sm:p-9">
        <div className="flex items-center gap-2 text-[11px] tracking-wide text-dark-500">
          <Wallet size={14} /> DESIGN CREDIT BALANCE
        </div>
        <div className="mt-2 text-[38px] font-light text-white sm:text-[44px]">
          {formatCents(summary.creditBalanceCents)}
        </div>
        <p className="mt-2 max-w-sm text-[12.5px] leading-relaxed text-dark-500">
          Applied automatically at your next checkout — up to the full price of any design. No codes,
          no manual redemption.
        </p>
      </div>

      {/* Share link */}
      <div className="mt-4 rounded-card-lg bg-white p-6">
        <h2 className="text-[15px] font-medium text-ink-900">Share your link</h2>
        <p className="mt-1.5 text-[12px] leading-relaxed text-ink-500">
          Earn $30 in design credit every time someone you refer completes their first purchase.
        </p>
        <div className="mt-4 flex items-center justify-between gap-2 rounded-pill bg-warm-100 py-1.5 pl-4 pr-1.5">
          <span className="truncate text-[12px] text-ink-900">{shareUrl.replace(/^https?:\/\//, '')}</span>
          <button
            onClick={handleCopy}
            className="flex flex-none items-center gap-1.5 rounded-pill bg-ink-900 px-4 py-2 text-[11px] text-white transition-colors hover:bg-ink-950"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-card bg-white p-5">
          <div className="text-[20px] font-medium text-ink-900">{summary.totalReferred}</div>
          <div className="mt-1 text-[11px] text-ink-500">Friends referred</div>
        </div>
        <div className="rounded-card bg-white p-5">
          <div className="text-[20px] font-medium text-ink-900">{formatCents(summary.totalEarnedCents)}</div>
          <div className="mt-1 text-[11px] text-ink-500">Lifetime credit earned</div>
        </div>
      </div>

      {summary.referrals.length > 0 && (
        <div className="mt-4 rounded-card-lg bg-white p-2">
          {summary.referrals.map((r, i) => (
            <div
              key={i}
              className={`flex items-center justify-between px-4 py-3 text-[12.5px] ${
                i < summary.referrals.length - 1 ? 'border-b border-warm-200' : ''
              }`}
            >
              <span className="text-ink-700">{r.referredEmail}</span>
              <span
                className={`rounded-pill px-3 py-1 text-[10.5px] ${
                  r.rewardStatus === 'REWARDED' ? 'bg-warm-100 text-ink-900' : 'text-ink-500'
                }`}
              >
                {r.rewardStatus === 'REWARDED' ? 'Credited ✓' : 'Pending first purchase'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
