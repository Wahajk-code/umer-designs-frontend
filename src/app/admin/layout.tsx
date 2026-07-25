import { redirect } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Calendar,
  CreditCard,
  Link2,
  Sliders,
  Users,
  Wrench,
} from 'lucide-react';
import { getCurrentUser } from '@/lib/server/current-user';
import { AppSidebar, SidebarNavItem } from '@/components/layout/app-sidebar';

const NAV_ITEMS: SidebarNavItem[] = [
  { href: '/admin', label: 'Overview', icon: <LayoutDashboard size={17} /> },
  { href: '/admin/designs', label: 'Designs', icon: <Building2 size={17} /> },
  { href: '/admin/modifications', label: 'Modifications', icon: <Wrench size={17} /> },
  { href: '/admin/modification-options', label: 'Modification options', icon: <Sliders size={17} /> },
  { href: '/admin/meetings', label: 'Meetings', icon: <Calendar size={17} /> },
  { href: '/admin/payment-links', label: 'Payment links', icon: <Link2 size={17} /> },
  { href: '/admin/referrals', label: 'Referrals', icon: <CreditCard size={17} /> },
  { href: '/admin/users', label: 'Users', icon: <Users size={17} /> },
];

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
    <div className="flex min-h-screen bg-ink-950">
      <AppSidebar
        variant="dark"
        items={NAV_ITEMS}
        userLabel="Admin"
        userSubLabel={user.email}
        storageKey="ud_admin_sidebar_collapsed"
      />
      <div className="min-w-0 flex-1">
        <main className="px-5 pb-16 pt-6 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
