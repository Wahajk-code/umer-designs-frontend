import { redirect } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Calendar,
  CreditCard,
  Link2,
  MessagesSquare,
  Sliders,
  Users,
  Wrench,
} from 'lucide-react';
import { getCurrentUser } from '@/lib/server/current-user';
import { AppSidebar, SidebarNavItem } from '@/components/layout/app-sidebar';
import { NotificationBell } from '@/components/notifications/notification-bell';

const NAV_ITEMS: SidebarNavItem[] = [
  { href: '/admin', label: 'Overview', icon: <LayoutDashboard size={17} /> },
  { href: '/admin/modifications', label: 'Change requests', icon: <Wrench size={17} /> },
  { href: '/admin/messages', label: 'Messages', icon: <MessagesSquare size={17} /> },
  { href: '/admin/meetings', label: 'Meetings', icon: <Calendar size={17} /> },
  { href: '/admin/designs', label: 'Designs', icon: <Building2 size={17} /> },
  { href: '/admin/modification-options', label: 'Change pricing', icon: <Sliders size={17} /> },
  { href: '/admin/payment-links', label: 'Payment links', icon: <Link2 size={17} /> },
  { href: '/admin/referrals', label: 'Referrals', icon: <CreditCard size={17} /> },
  { href: '/admin/users', label: 'Users', icon: <Users size={17} /> },
];

/**
 * Admin is a distinct visual mode: dark chrome with soft light-grey panels.
 * Role is re-checked server-side against the backend on every render;
 * proxy.ts's cookie check is optimistic only.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/sign-in?next=/admin');
  }
  if (user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'Admin';

  return (
    <div className="flex min-h-screen bg-ink-950">
      <AppSidebar variant="dark" items={NAV_ITEMS} userLabel={name} userSubLabel={user.email} storageKey="ud_admin_sidebar_collapsed" />
      <div className="min-w-0 flex-1">
        <div className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-white/10 bg-ink-950/85 px-5 py-3 backdrop-blur sm:px-8">
          <span className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-dark-500">Studio admin</span>
          <NotificationBell dark />
        </div>
        <main className="mx-auto max-w-[1280px] px-5 pb-20 pt-7 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
