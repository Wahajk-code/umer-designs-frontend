import type { Metadata } from 'next';
import { AdminModificationOptionsView } from './admin-modification-options-view';

export const metadata: Metadata = { title: 'Change pricing — Admin' };

export default function AdminModificationOptionsPage() {
  return <AdminModificationOptionsView />;
}
