import type { Metadata } from 'next';
import { ReferralsView } from './referrals-view';

export const metadata: Metadata = { title: 'Referrals & Credits — Umer Designs' };

export default function DashboardReferralsPage() {
  return (
    <div>
      <h1 className="text-[26px] font-light text-ink-900">Referrals & credits</h1>
      <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-ink-500">
        Your design credit is real, spendable balance — earned by referring friends, applied
        automatically the next time you buy.
      </p>
      <div className="mt-7">
        <ReferralsView />
      </div>
    </div>
  );
}
