import type { Metadata } from 'next';
import { AdminReferralsView } from './admin-referrals-view';

export const metadata: Metadata = { title: 'Referral program — Admin' };

export default function AdminReferralsPage() {
  return <AdminReferralsView />;
}
