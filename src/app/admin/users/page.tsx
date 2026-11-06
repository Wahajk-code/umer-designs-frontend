import type { Metadata } from 'next';
import { AdminUsersView } from './admin-users-view';

export const metadata: Metadata = { title: 'Users — Admin' };

export default function AdminUsersPage() {
  return <AdminUsersView />;
}
