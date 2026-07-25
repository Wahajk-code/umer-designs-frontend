'use client';

import { motion } from 'framer-motion';

/**
 * Next re-mounts `template.tsx` on every navigation (unlike layout.tsx, which
 * persists) — giving every route change a consistent, smooth entrance
 * instead of an abrupt swap, including moving between the marketing site and
 * the store.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
