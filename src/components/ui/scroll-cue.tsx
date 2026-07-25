'use client';

import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export function ScrollCue() {
  return (
    <motion.div
      className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-ink-700 shadow-[0_1px_4px_rgba(0,0,0,0.05)]"
      animate={{ y: [0, 6, 0] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
    >
      <ChevronDown size={16} />
    </motion.div>
  );
}
