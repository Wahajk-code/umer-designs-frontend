import type { Metadata } from 'next';
import { AdminModificationsView } from './admin-modifications-view';

export const metadata: Metadata = { title: 'Modification queue — Admin' };

export default function AdminModificationsPage() {
  return (
    <div>
      <h1 className="text-[18px] font-medium text-white">Modification queue</h1>
      <div className="mt-4">
        <AdminModificationsView />
      </div>
    </div>
  );
}
