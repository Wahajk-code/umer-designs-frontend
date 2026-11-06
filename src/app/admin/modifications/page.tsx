import type { Metadata } from 'next';
import { AdminModificationsView } from './admin-modifications-view';

export const metadata: Metadata = { title: 'Change requests — Admin' };

export default function AdminModificationsPage() {
  return <AdminModificationsView />;
}
