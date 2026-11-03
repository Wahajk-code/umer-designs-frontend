'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { LogoMark } from '@/components/brand/logo';

const MIN_VISIBLE_MS = 550; // long enough for the curtain to read as intentional
const MAX_VISIBLE_MS = 8000; // never trap the user behind the overlay
const FIRST_VISIT_KEY = 'ud-splash-seen';

/** App areas with their own sidebar: moving inside one stays instant. */
const APP_SECTIONS = ['/admin', '/dashboard'];
const sectionOf = (p: string) => APP_SECTIONS.find((s) => p === s || p.startsWith(`${s}/`));

function shouldSplash(from: string, to: string) {
  if (from === to) return false;
  const a = sectionOf(from);
  return !(a && a === sectionOf(to));
}

/**
 * Full-screen branded curtain shown between pages. Internal link clicks raise
 * the curtain immediately (covering the server round-trip), and it lifts once
 * the new pathname has rendered. Also plays once on the first visit of a
 * session as an intro splash.
 */
export function RouteSplash() {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const shownAt = useRef(0);
  const lastPath = useRef(pathname);
  const timers = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }, []);

  const show = useCallback(() => {
    clearTimers();
    shownAt.current = Date.now();
    setVisible(true);
    timers.current.push(window.setTimeout(() => setVisible(false), MAX_VISIBLE_MS));
  }, [clearTimers]);

  const hide = useCallback(() => {
    const wait = Math.max(0, MIN_VISIBLE_MS - (Date.now() - shownAt.current));
    clearTimers();
    timers.current.push(window.setTimeout(() => setVisible(false), wait));
  }, [clearTimers]);

  // Intro splash, once per session.
  useEffect(() => {
    let intro: number | undefined;
    try {
      if (!sessionStorage.getItem(FIRST_VISIT_KEY)) {
        sessionStorage.setItem(FIRST_VISIT_KEY, '1');
        intro = window.setTimeout(() => {
          show();
          hide();
        }, 0);
      }
    } catch {
      /* storage blocked — skip intro */
    }
    return () => {
      window.clearTimeout(intro);
      clearTimers();
    };
  }, [show, hide, clearTimers]);

  // Raise the curtain on internal link clicks (capture phase, because
  // next/link calls preventDefault itself).
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.('a');
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname.startsWith('/api/')) return;
      if (shouldSplash(window.location.pathname, url.pathname)) show();
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [show]);

  // Back/forward navigation (URL has already changed when popstate fires).
  useEffect(() => {
    const onPop = () => {
      if (shouldSplash(lastPath.current, window.location.pathname)) show();
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [show]);

  // New route rendered — lift the curtain.
  useEffect(() => {
    if (lastPath.current !== pathname) {
      lastPath.current = pathname;
      hide();
    }
  }, [pathname, hide]);

  const duration = reduce ? 0 : 0.45;
  const ease = [0.76, 0, 0.24, 1] as const;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="route-splash"
          aria-hidden
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-warm-50"
          initial={reduce ? { opacity: 0 } : { clipPath: 'inset(100% 0 0 0)' }}
          animate={reduce ? { opacity: 1 } : { clipPath: 'inset(0% 0 0 0)' }}
          exit={reduce ? { opacity: 0 } : { clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration, ease }}
        >
          <motion.div
            className="flex flex-col items-center gap-5"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: reduce ? 0 : 0.3, delay: reduce ? 0 : 0.15 }}
          >
            <LogoMark size={56} />
            <div className="text-[13px] font-medium tracking-[0.3em] text-ink-900">UMER DESIGNS</div>
            <div className="relative h-px w-40 overflow-hidden bg-warm-400">
              <motion.div
                className="absolute inset-y-0 left-0 w-1/3 bg-ink-900"
                animate={reduce ? undefined : { x: ['-100%', '300%'] }}
                transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
