import type { Metadata } from 'next';
import { getCurrentUser } from '@/lib/server/current-user';
import { AdminOverview } from './admin-overview';

export const metadata: Metadata = { title: 'Admin — Umer Designs' };

export default async function AdminOverviewPage() {
  const user = await getCurrentUser();
  const name = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || 'there';
  return <AdminOverview name={name} />;
}
