import type { Metadata } from 'next';
import { AdminUsersView } from './admin-users-view';

export const metadata: Metadata = { title: 'Users — Admin' };

export default function AdminUsersPage() {
  return (
    <div>
      <h1 className="text-[18px] font-medium text-white">Users</h1>
      <p className="mt-1 text-[12px] text-dark-500">
        Every registered account. Promote to admin or revoke access as needed.
      </p>
      <div className="mt-6">
        <AdminUsersView />
      </div>
    </div>
  );
}
