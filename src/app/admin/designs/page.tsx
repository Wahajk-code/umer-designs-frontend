import type { Metadata } from 'next';
import { AdminDesignsView } from './admin-designs-view';

export const metadata: Metadata = { title: 'Design listings — Admin' };

export default function AdminDesignsPage() {
  return (
    <div>
      <h1 className="text-[18px] font-medium text-white">Design listings</h1>
      <div className="mt-4">
        <AdminDesignsView />
      </div>
    </div>
  );
}
