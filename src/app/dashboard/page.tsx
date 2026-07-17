import type { Metadata } from 'next';
import { getCurrentUser } from '@/lib/server/current-user';
import { MyDesigns } from './my-designs';
import { ActiveRequest } from './active-request';
import { ShareAndEarn } from '@/components/referrals/share-and-earn';

export const metadata: Metadata = { title: 'Overview — Umer Designs' };

export default async function DashboardPage() {
  const user = await getCurrentUser();

  return (
    <div className="pt-6">
      <h1 className="text-[27px] font-light text-ink-900">Good to see you, {user?.firstName} 👋</h1>
      <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-ink-500">
        Track requests, message the architect, and manage referral earnings — all in one place.
      </p>

      <div className="mt-8">
        <ActiveRequest />
      </div>

      <div className="mt-2 grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
        <MyDesigns />
        <ShareAndEarn />
      </div>
    </div>
  );
}
