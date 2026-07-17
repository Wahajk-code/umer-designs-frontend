import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/server/current-user';
import { Logo } from '@/components/brand/logo';
import { SignOutButton } from '@/components/auth/sign-out-button';

/**
 * Admin is deliberately a different visual mode (dark chrome, square
 * corners, dense) per the design reference — not just the same UI with more
 * buttons. Role is re-checked server-side against the backend on every
 * render; proxy.ts's cookie check is optimistic only.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/sign-in?next=/admin');
  }
  if (user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-ink-950">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-10">
        <Logo size="sm" withTagline={false} dark />
        <div className="flex items-center gap-3">
          <span className="hidden text-[11px] text-dark-500 sm:inline">{user.email} · admin</span>
          <SignOutButton dark />
        </div>
      </header>
      <main className="px-5 pb-16 pt-6 sm:px-10">{children}</main>
    </div>
  );
}
