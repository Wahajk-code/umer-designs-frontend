import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/server/current-user';
import { Logo } from '@/components/brand/logo';
import { SignOutButton } from '@/components/auth/sign-out-button';
import { NotificationBell } from '@/components/notifications/notification-bell';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/sign-in?next=/dashboard');
  }

  return (
    <div className="min-h-screen bg-warm-50">
      <header className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-10">
        <Logo size="sm" withTagline={false} />
        <div className="flex items-center gap-3">
          <span className="hidden text-[11px] text-ink-500 sm:inline">{user.email}</span>
          <NotificationBell />
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-700 text-[11px] text-white">
            {user.firstName[0]}
            {user.lastName[0]}
          </div>
          <SignOutButton />
        </div>
      </header>
      <main className="px-5 pb-16 sm:px-10">{children}</main>
    </div>
  );
}
