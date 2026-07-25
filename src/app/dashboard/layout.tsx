import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { LayoutDashboard, FolderOpen, Wallet, Settings } from 'lucide-react';
import { getCurrentUser } from '@/lib/server/current-user';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { AppSidebar, SidebarNavItem } from '@/components/layout/app-sidebar';

export const metadata: Metadata = { robots: { index: false, follow: false } };

const NAV_ITEMS: SidebarNavItem[] = [
  { href: '/dashboard', label: 'Overview', icon: <LayoutDashboard size={17} /> },
  { href: '/dashboard/designs', label: 'My Designs', icon: <FolderOpen size={17} /> },
  { href: '/dashboard/referrals', label: 'Referrals & Credits', icon: <Wallet size={17} /> },
  { href: '/dashboard/settings', label: 'Settings', icon: <Settings size={17} /> },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/sign-in?next=/dashboard');
  }

  return (
    <div className="flex min-h-screen bg-warm-50">
      <AppSidebar
        variant="light"
        items={NAV_ITEMS}
        userLabel={`${user.firstName} ${user.lastName}`}
        userSubLabel={user.email}
        storageKey="ud_dashboard_sidebar_collapsed"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-end gap-3 border-b border-warm-300 px-5 py-3 sm:px-8">
          <NotificationBell />
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-700 text-[11px] text-white">
            {user.firstName[0]}
            {user.lastName[0]}
          </div>
        </div>
        <main className="flex-1 px-5 pb-16 pt-6 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
