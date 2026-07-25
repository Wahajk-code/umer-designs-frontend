'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronsLeft, ChevronsRight, ExternalLink, Home, Menu, Store, X } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { SignOutButton } from '@/components/auth/sign-out-button';

export interface SidebarNavItem {
  href: string;
  label: string;
  /** A pre-rendered icon element (e.g. `<LayoutDashboard size={17} />`), not a component
   * reference — Server Components can't pass function/component references as props
   * to Client Components, only already-rendered JSX. */
  icon: React.ReactNode;
}

interface AppSidebarProps {
  variant: 'light' | 'dark';
  items: SidebarNavItem[];
  userLabel: string;
  userSubLabel?: string;
  storageKey: string;
  headerSlot?: React.ReactNode;
}

const QUICK_LINKS: SidebarNavItem[] = [
  { href: '/', label: 'Homepage', icon: <Home size={16} /> },
  { href: '/designs', label: 'Store', icon: <Store size={16} /> },
];

export function AppSidebar({ variant, items, userLabel, userSubLabel, storageKey, headerSlot }: AppSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dark = variant === 'dark';

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from localStorage (an external system) into initial state, standard pattern
    if (stored === '1') setCollapsed(true);
  }, [storageKey]);

  function toggleCollapsed() {
    setCollapsed((v) => {
      window.localStorage.setItem(storageKey, !v ? '1' : '0');
      return !v;
    });
  }

  const bg = dark ? 'bg-ink-950' : 'bg-white';
  const border = dark ? 'border-white/10' : 'border-warm-300';
  const textMuted = dark ? 'text-dark-500' : 'text-ink-500';
  const textBase = dark ? 'text-white' : 'text-ink-900';
  const hover = dark ? 'hover:bg-white/5' : 'hover:bg-warm-100';
  const activeBg = dark ? 'bg-white/10' : 'bg-ink-900';
  const activeText = dark ? 'text-white' : 'text-white';

  const content = (
    <div className={`flex h-full flex-col ${bg}`}>
      <div className={`flex items-center justify-between border-b px-4 py-4 ${border}`}>
        {!collapsed ? (
          <Link href="/" onClick={() => setMobileOpen(false)}>
            <Logo size="sm" withTagline={false} dark={dark} />
          </Link>
        ) : (
          <Link href="/" onClick={() => setMobileOpen(false)} className="mx-auto">
            <Logo size="sm" withTagline={false} dark={dark} />
          </Link>
        )}
        <button
          onClick={() => setMobileOpen(false)}
          className={`flex h-8 w-8 items-center justify-center rounded-full lg:hidden ${textMuted} ${hover}`}
          aria-label="Close menu"
        >
          <X size={16} />
        </button>
      </div>

      {headerSlot && !collapsed && <div className={`border-b px-4 py-3 ${border}`}>{headerSlot}</div>}

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="flex flex-col gap-1">
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 rounded-control px-3 py-2.5 text-[12.5px] transition-colors ${
                  active ? `${activeBg} ${activeText}` : `${textBase} ${hover}`
                } ${collapsed ? 'justify-center' : ''}`}
              >
                <span className="flex-none">{item.icon}</span>
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </div>

        <div className={`mt-4 border-t pt-4 ${border}`}>
          {!collapsed && (
            <div className={`px-3 pb-2 text-[10px] font-medium uppercase tracking-wide ${textMuted}`}>
              Quick links
            </div>
          )}
          <div className="flex flex-col gap-1">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                title={collapsed ? link.label : undefined}
                className={`flex items-center gap-3 rounded-control px-3 py-2.5 text-[12.5px] ${textMuted} ${hover} ${
                  collapsed ? 'justify-center' : ''
                }`}
              >
                <span className="flex-none">{link.icon}</span>
                {!collapsed && (
                  <span className="flex flex-1 items-center justify-between">
                    {link.label}
                    <ExternalLink size={12} className="opacity-50" />
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <div className={`border-t px-3 py-3 ${border}`}>
        {!collapsed && (
          <div className="px-2 pb-2">
            <div className={`truncate text-[12px] font-medium ${textBase}`}>{userLabel}</div>
            {userSubLabel && <div className={`truncate text-[10.5px] ${textMuted}`}>{userSubLabel}</div>}
          </div>
        )}
        <div className={`flex items-center gap-2 ${collapsed ? 'flex-col' : 'justify-between px-2'}`}>
          <SignOutButton dark={dark} />
          <button
            onClick={toggleCollapsed}
            className={`hidden h-8 w-8 items-center justify-center rounded-full lg:flex ${textMuted} ${hover}`}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronsRight size={15} /> : <ChevronsLeft size={15} />}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className={`flex items-center justify-between border-b px-5 py-3 lg:hidden ${bg} ${border}`}>
        <Logo size="sm" withTagline={false} dark={dark} />
        <button
          onClick={() => setMobileOpen(true)}
          className={`flex h-9 w-9 items-center justify-center rounded-full ${textMuted} ${hover}`}
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside
        className={`sticky top-0 hidden h-screen flex-none border-r transition-[width] duration-200 lg:block ${border} ${
          collapsed ? 'w-[76px]' : 'w-64'
        }`}
      >
        {content}
      </aside>

      {/* Mobile off-canvas */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="fixed inset-y-0 left-0 z-50 w-72 lg:hidden"
            >
              {content}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
