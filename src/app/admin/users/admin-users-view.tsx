'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/client/api';
import { formatCents } from '@/lib/client/format';
import { Modal, ModalCloseButton } from '@/components/ui/modal';
import { SafeUser } from '@/lib/types/user';

interface UsersResponse {
  users: SafeUser[];
  total: number;
  page: number;
  pageSize: number;
}

export function AdminUsersView() {
  const [data, setData] = useState<UsersResponse | null>(null);
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<SafeUser | null>(null);

  useEffect(() => {
    apiFetch<UsersResponse>(`/api/admin/users?page=${page}&pageSize=20`)
      .then(setData)
      .catch(() => {
        toast.error('Could not load users', { description: 'Please refresh the page.' });
      });
  }, [page]);

  async function toggleRole(user: SafeUser) {
    const nextRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    setUpdatingId(user.id);
    try {
      await apiFetch(`/api/admin/users/${user.id}/role`, { method: 'PATCH', body: { role: nextRole } });
      setData((prev) =>
        prev
          ? { ...prev, users: prev.users.map((u) => (u.id === user.id ? { ...u, role: nextRole } : u)) }
          : prev,
      );
      toast.success(`${user.email} is now ${nextRole === 'ADMIN' ? 'an admin' : 'a standard user'}`);
    } catch (err) {
      toast.error('Could not update role', {
        description: err instanceof ApiError ? err.message : 'Please try again.',
      });
    } finally {
      setUpdatingId(null);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    const user = pendingDelete;
    setDeletingId(user.id);
    try {
      await apiFetch(`/api/admin/users/${user.id}`, { method: 'DELETE' });
      setData((prev) =>
        prev
          ? { ...prev, users: prev.users.filter((u) => u.id !== user.id), total: prev.total - 1 }
          : prev,
      );
      toast.success(`${user.email} was deleted`, { description: 'Their orders and history are preserved for audit.' });
      setPendingDelete(null);
    } catch (err) {
      toast.error('Could not delete user', {
        description: err instanceof ApiError ? err.message : 'Please try again.',
      });
    } finally {
      setDeletingId(null);
    }
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <div className="max-w-4xl">
      <div className="bg-white p-4">
        <div className="text-[10px] tracking-wide text-dark-500">ALL USERS ({data?.total ?? 0})</div>
        <div className="mt-2 flex flex-col divide-y divide-warm-150">
          {data?.users.map((user) => (
            <div key={user.id} className="flex items-center justify-between gap-3 py-3 text-[12px]">
              <div className="min-w-0 flex-1">
                <div className="truncate text-ink-900">
                  {user.firstName} {user.lastName}{' '}
                  <span className="text-dark-500">· {user.email}</span>
                </div>
                <div className="mt-0.5 text-[10.5px] text-dark-500">
                  Joined {new Date(user.createdAt).toLocaleDateString()} · Credit balance{' '}
                  {formatCents(user.creditBalanceCents)}
                </div>
              </div>
              <span
                className={`flex-none rounded-pill px-3 py-1 text-[10.5px] ${
                  user.role === 'ADMIN' ? 'bg-ink-900 text-white' : 'bg-warm-150 text-ink-700'
                }`}
              >
                {user.role}
              </span>
              <button
                onClick={() => toggleRole(user)}
                disabled={updatingId === user.id}
                className="flex-none rounded-pill border border-ink-900 px-3 py-1.5 text-[10.5px] text-ink-900 transition-colors hover:bg-warm-100 disabled:opacity-50"
              >
                {updatingId === user.id ? '…' : user.role === 'ADMIN' ? 'Revoke admin' : 'Make admin'}
              </button>
              <button
                onClick={() => setPendingDelete(user)}
                aria-label={`Delete ${user.email}`}
                className="flex-none flex h-8 w-8 items-center justify-center rounded-full text-ink-400 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {data?.users.length === 0 && <p className="py-4 text-[12px] text-dark-500">No users yet.</p>}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-3 flex justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`flex h-8 w-8 items-center justify-center text-[11.5px] transition-colors ${
                page === i + 1 ? 'bg-white text-ink-900' : 'bg-transparent text-dark-500 hover:bg-white/10'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      <Modal open={pendingDelete !== null} onClose={() => setPendingDelete(null)} className="w-[92vw] max-w-sm">
        <div className="flex items-center justify-between border-b border-warm-200 p-5">
          <h2 className="text-[15px] font-medium text-ink-900">Delete user</h2>
          <ModalCloseButton onClose={() => setPendingDelete(null)} />
        </div>
        <div className="p-5">
          <p className="text-[12.5px] leading-relaxed text-ink-700">
            {pendingDelete?.email} will lose access immediately and be removed from this list. Their orders,
            modifications, and referral history are kept for audit — this can&apos;t be self-undone from the UI.
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <button
              onClick={() => setPendingDelete(null)}
              className="rounded-pill border border-warm-400 px-4 py-2.5 text-[12px] text-ink-700 transition-colors hover:bg-warm-100"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              disabled={deletingId === pendingDelete?.id}
              className="rounded-pill bg-red-600 px-4 py-2.5 text-[12px] font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              {deletingId === pendingDelete?.id ? 'Deleting…' : 'Delete user'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
