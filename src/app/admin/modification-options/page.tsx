import type { Metadata } from 'next';
import { AdminModificationOptionsView } from './admin-modification-options-view';

export const metadata: Metadata = { title: 'Change-type pricing — Admin' };

export default function AdminModificationOptionsPage() {
  return (
    <div>
      <h1 className="text-[18px] font-medium text-white">Change-type pricing</h1>
      <div className="mt-4">
        <AdminModificationOptionsView />
      </div>
    </div>
  );
}
