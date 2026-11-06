'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { motion, useReducedMotion } from 'framer-motion';
import { Search, ShieldCheck, ShieldOff, Trash2, Users } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/client/api';
import { formatCents } from '@/lib/client/format';
import { SafeUser } from '@/lib/types/user';
import {
  AdminButton,
  AdminPageHeader,
  Avatar,
  ConfirmDialog,
  EmptyState,
  ErrorBanner,
  Pagination,
  Panel,
  PanelHeader,
  Pill,
  TableSkeleton,
  adminInput,
  fullName,
  td,
  th,
  tr,
} from '@/components/admin/admin-ui';

interface UsersResponse {
  users: SafeUser[];
  total: number;
  page: number;
  pageSize: number;
}

const PAGE_SIZE = 20;

export function AdminUsersView() {
  const reduce = useReducedMotion();
  const [data, setData] = useState<UsersResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [pendingRole, setPendingRole] = useState<SafeUser | null>(null);
  const [pendingDelete, setPendingDelete] = useState<SafeUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await apiFetch<UsersResponse>(`/api/admin/users?page=${page}&pageSize=${PAGE_SIZE}`));
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load users.');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount / page change
    load();
  }, [load]);

  async function confirmRole() {
    const user = pendingRole;
    if (!user) return;
    const nextRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    setUpdatingId(user.id);
    try {
      await apiFetch(`/api/admin/users/${user.id}/role`, { method: 'PATCH', body: { role: nextRole } });
      setData((prev) => (prev ? { ...prev, users: prev.users.map((u) => (u.id === user.id ? { ...u, role: nextRole } : u)) } : prev));
      toast.success(`${user.email} is now ${nextRole === 'ADMIN' ? 'an admin' : 'a standard user'}`);
      setPendingRole(null);
    } catch (err) {
      toast.error('Could not update role', { description: err instanceof ApiError ? err.message : 'Please try again.' });
    } finally {
      setUpdatingId(null);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    const user = pendingDelete;
    setDeleting(true);
    try {
      await apiFetch(`/api/admin/users/${user.id}`, { method: 'DELETE' });
      setData((prev) => (prev ? { ...prev, users: prev.users.filter((u) => u.id !== user.id), total: prev.total - 1 } : prev));
      toast.success(`${user.email} was deleted`, { description: 'Their orders and history are preserved for audit.' });
      setPendingDelete(null);
    } catch (err) {
      toast.error('Could not delete user', { description: err instanceof ApiError ? err.message : 'Please try again.' });
    } finally {
      setDeleting(false);
    }
  }

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data?.users ?? []).filter((u) => !q || fullName(u).toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [data, search]);
  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  return (
    <div>
      <AdminPageHeader title="Users" description="Everyone with an account. Promote a teammate to admin or remove an account." />
      {error && <ErrorBanner message={error} onRetry={load} className="mb-4" />}

      <Panel>
        <PanelHeader
          title="All users"
          count={data?.total}
          actions={
            <div className="relative w-64">
              <Search size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filter this page…" className={`${adminInput} h-9 rounded-pill pl-9`} />
            </div>
          }
        />
        {loading && !data ? (
          <TableSkeleton rows={8} cols={5} />
        ) : rows.length === 0 ? (
          <EmptyState icon={<Users size={18} />} title={search ? 'No users match' : 'No users yet'} />
        ) : (
          <div className={`overflow-x-auto transition-opacity ${loading ? 'opacity-60' : ''}`}>
            <table className="w-full min-w-[720px]">
              <thead>
                <tr>
                  <th className={th}>User</th>
                  <th className={th}>Role</th>
                  <th className={th}>Joined</th>
                  <th className={`${th} text-right`}>Credit</th>
                  <th className={`${th} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((user, i) => (
                  <motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: reduce ? 0 : Math.min(i, 12) * 0.02 }} className={tr}>
                    <td className={td}>
                      <div className="flex items-center gap-3">
                        <Avatar name={fullName(user)} size={32} dark={user.role === 'ADMIN'} />
                        <div className="min-w-0">
                          <div className="truncate font-medium">{fullName(user)}</div>
                          <div className="truncate text-[11px] text-ink-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className={td}>{user.role === 'ADMIN' ? <Pill tone="dark">Admin</Pill> : <Pill>Client</Pill>}</td>
                    <td className={`${td} text-ink-700`}>{new Date(user.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td className={`${td} text-right`}>{formatCents(user.creditBalanceCents)}</td>
                    <td className={`${td} text-right`}>
                      <div className="flex items-center justify-end gap-1">
                        <AdminButton
                          size="sm"
                          variant="secondary"
                          loading={updatingId === user.id}
                          icon={user.role === 'ADMIN' ? <ShieldOff size={12} /> : <ShieldCheck size={12} />}
                          onClick={() => setPendingRole(user)}
                        >
                          {user.role === 'ADMIN' ? 'Revoke admin' : 'Make admin'}
                        </AdminButton>
                        <button
                          onClick={() => setPendingDelete(user)}
                          aria-label={`Delete ${user.email}`}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </Panel>

      <ConfirmDialog
        open={!!pendingRole}
        title={pendingRole?.role === 'ADMIN' ? 'Revoke admin access?' : 'Make this user an admin?'}
        body={
          pendingRole?.role === 'ADMIN'
            ? `${pendingRole?.email} will lose access to the admin panel.`
            : `${pendingRole?.email} will be able to see every order, request and message, and manage the store.`
        }
        confirmLabel={pendingRole?.role === 'ADMIN' ? 'Revoke admin' : 'Make admin'}
        danger={pendingRole?.role === 'ADMIN'}
        loading={!!updatingId}
        onConfirm={confirmRole}
        onClose={() => setPendingRole(null)}
      />
      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete user?"
        body={`${pendingDelete?.email} will lose access immediately. Their orders, modifications and referral history are kept for audit — this can't be undone from the UI.`}
        confirmLabel="Delete user"
        danger
        loading={deleting}
        onConfirm={confirmDelete}
        onClose={() => setPendingDelete(null)}
      />
    </div>
  );
}
