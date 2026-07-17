'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}

/** Fades + slides content up as it scrolls into view. Animates once, then stays put. */
export function Reveal({ children, delay = 0, className, y = 18 }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

interface RevealGroupProps {
  children: ReactNode[];
  className?: string;
  stagger?: number;
}

/** Reveals a list of items with an incrementing delay so they cascade in. */
export function RevealGroup({ children, className, stagger = 0.08 }: RevealGroupProps) {
  return (
    <>
      {children.map((child, i) => (
        <Reveal key={i} delay={i * stagger} className={className}>
          {child}
        </Reveal>
      ))}
    </>
  );
}
