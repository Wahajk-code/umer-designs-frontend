import type { Metadata } from 'next';
import { getCurrentUser } from '@/lib/server/current-user';
import { CheckoutReturn } from '@/components/checkout/checkout-return';
import { ActiveRequest } from './active-request';
import { OverviewStats } from './overview-stats';
import { OverviewActions } from './overview-actions';

export const metadata: Metadata = { title: 'Overview' };

export default async function DashboardPage() {
  const user = await getCurrentUser();

  return (
    <div>
      <h1 className="text-[26px] font-light text-ink-900">Good to see you, {user?.firstName} 👋</h1>
      <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-ink-500">
        Your plans, change requests and conversations with the architect — all in one place.
      </p>

      <div className="mt-7">
        <CheckoutReturn />
        <ActiveRequest />
      </div>

      <OverviewStats />
      <OverviewActions />
    </div>
  );
}
