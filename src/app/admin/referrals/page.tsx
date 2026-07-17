import type { Metadata } from 'next';
import { AdminReferralsView } from './admin-referrals-view';

export const metadata: Metadata = { title: 'Referral program — Admin' };

export default function AdminReferralsPage() {
  return (
    <div>
      <h1 className="text-[18px] font-medium text-white">Referral program</h1>
      <div className="mt-4">
        <AdminReferralsView />
      </div>
    </div>
  );
}
