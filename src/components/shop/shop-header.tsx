'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Menu, X } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { CartButton } from '@/components/cart/cart-drawer';

interface ShopHeaderProps {
  isSignedIn: boolean;
}

/**
 * The store's own header — deliberately distinct from the marketing site's
 * SiteHeader (a focused shopping chrome, not the full marketing nav) but
 * always keeps an explicit way back to the main site, per design review.
 */
export function ShopHeader({ isSignedIn }: ShopHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-warm-300 bg-warm-50/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-12">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Logo size="sm" withTagline={false} />
          </Link>
          <span className="hidden rounded-pill bg-ink-900 px-3.5 py-1.5 text-[10.5px] tracking-[0.12em] text-white sm:inline-block">
            STORE
          </span>
        </div>

        <div className="hidden items-center gap-3 sm:flex">
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-pill border border-warm-400 px-3.5 py-2 text-[11.5px] text-ink-700 transition-colors hover:bg-warm-100"
          >
            <ArrowLeft size={13} /> Back to website
          </Link>
          <CartButton isSignedIn={isSignedIn} />
          <Link
            href={isSignedIn ? '/dashboard' : '/sign-in'}
            className="rounded-pill bg-white px-5 py-2.5 text-[12px] text-ink-900 shadow-[0_1px_4px_rgba(0,0,0,0.05)] transition-colors hover:bg-warm-100"
          >
            {isSignedIn ? 'My account' : 'Sign in'}
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:hidden">
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
            className="overflow-hidden sm:hidden"
          >
            <div className="flex flex-col gap-2 border-t border-warm-300 px-5 py-3">
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-1.5 rounded-pill border border-warm-400 px-4 py-2.5 text-[12px] text-ink-700"
              >
                <ArrowLeft size={13} /> Back to website
              </Link>
              <Link
                href={isSignedIn ? '/dashboard' : '/sign-in'}
                onClick={() => setMenuOpen(false)}
                className="rounded-pill bg-ink-900 px-4 py-2.5 text-center text-[12px] text-white"
              >
                {isSignedIn ? 'My account' : 'Sign in'}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
