'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { CartButton } from '@/components/cart/cart-drawer';

const NAV_ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/designs', label: 'Designs' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/process', label: 'Process' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export function SiteHeader({ isSignedIn = false }: { isSignedIn?: boolean }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-warm-50/80 px-5 py-4 backdrop-blur-md sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <Link href="/" onClick={() => setMenuOpen(false)}>
          <Logo size="sm" withTagline={false} />
        </Link>

        <nav className="hidden gap-1 rounded-pill bg-white p-1.5 text-[12px] text-ink-700 shadow-[0_1px_4px_rgba(0,0,0,0.05)] lg:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-pill px-4 py-2 transition-colors ${
                pathname === item.href ? 'bg-ink-900 text-white' : 'hover:bg-warm-100'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <CartButton isSignedIn={isSignedIn} />
          {isSignedIn ? (
            <Link
              href="/dashboard"
              className="rounded-pill bg-white px-5 py-2.5 text-[12px] text-ink-900 shadow-[0_1px_4px_rgba(0,0,0,0.05)] transition-transform hover:scale-[1.03]"
            >
              My account
            </Link>
          ) : (
            <>
              <Link href="/sign-in" className="px-4 py-2.5 text-[12px] text-ink-700">
                Sign in
              </Link>
              <Link
                href="/designs"
                className="rounded-pill bg-ink-900 px-5 py-2.5 text-[12px] text-white transition-transform hover:scale-[1.03]"
              >
                Buy a design
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <CartButton isSignedIn={isSignedIn} />
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.05)]"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="mx-auto max-w-7xl overflow-hidden lg:hidden"
          >
            <nav className="mt-3 flex flex-col rounded-card-lg bg-white p-3 shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`rounded-control px-4 py-3 text-[13px] ${
                    pathname === item.href ? 'bg-ink-900 text-white' : 'text-ink-700 hover:bg-warm-100'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <div className="mt-2 flex flex-col gap-2 border-t border-warm-200 pt-3">
                {isSignedIn ? (
                  <Link
                    href="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-pill bg-ink-900 px-4 py-3 text-center text-[13px] text-white"
                  >
                    My account
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/sign-in"
                      onClick={() => setMenuOpen(false)}
                      className="rounded-pill border border-ink-900 px-4 py-3 text-center text-[13px] text-ink-900"
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/designs"
                      onClick={() => setMenuOpen(false)}
                      className="rounded-pill bg-ink-900 px-4 py-3 text-center text-[13px] text-white"
                    >
                      Buy a design
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
