'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';
import { ModificationStatus, MODIFICATION_STAGES } from '@/lib/types/modification';

const STAGE_LABEL: Record<ModificationStatus, string> = {
  SUBMITTED: 'Submitted',
  IN_REVIEW: 'In review',
  IN_PROGRESS: 'In progress',
  REVISION: 'Revision',
  DELIVERED: 'Delivered',
};

/**
 * Evenly spaced stages: each stage is a grid column with its dot and label
 * centred on the same axis, so labels always sit exactly under their dot.
 * The progress line fills (animated) from the first dot to the current one.
 */
export function StatusPipeline({ status, dark = false }: { status: ModificationStatus; dark?: boolean }) {
  const reduce = useReducedMotion();
  const n = MODIFICATION_STAGES.length;
  const current = Math.max(0, MODIFICATION_STAGES.indexOf(status));
  const inset = `${50 / n}%`; // centre of first / last column
  const fill = `${(current / (n - 1)) * (100 - 100 / n)}%`;
  const done = status === 'DELIVERED';

  const track = dark ? 'bg-dark-700' : 'bg-warm-400';
  const ink = dark ? 'bg-white' : 'bg-ink-900';

  return (
    <div className="relative w-full" role="img" aria-label={`Status: ${STAGE_LABEL[status]}`}>
      <div className={`absolute top-[9px] h-0.5 rounded-full ${track}`} style={{ left: inset, right: inset }} />
      <motion.div
        className={`absolute top-[9px] h-0.5 rounded-full ${ink}`}
        style={{ left: inset }}
        initial={{ width: reduce ? fill : 0 }}
        animate={{ width: fill }}
        transition={{ duration: reduce ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] }}
      />
      <div className="relative grid" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
        {MODIFICATION_STAGES.map((stage, i) => {
          const complete = i < current || (done && i === current);
          const active = i === current && !done;
          return (
            <div key={stage} className="flex flex-col items-center">
              <span className="relative flex h-5 w-5 items-center justify-center">
                {active && !reduce && (
                  <motion.span
                    className={`absolute inset-0 rounded-full ${dark ? 'bg-white/30' : 'bg-ink-900/20'}`}
                    animate={{ scale: [1, 1.8], opacity: [0.7, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                  />
                )}
                <motion.span
                  initial={{ scale: reduce ? 1 : 0.4 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: reduce ? 0 : 0.08 * i, type: 'spring', stiffness: 380, damping: 22 }}
                  className={`relative flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                    complete
                      ? `${ink} ${dark ? 'border-white text-ink-950' : 'border-ink-900 text-white'}`
                      : active
                        ? `${dark ? 'border-white bg-ink-950' : 'border-ink-900 bg-white'}`
                        : `${dark ? 'border-dark-700 bg-ink-950' : 'border-warm-400 bg-white'}`
                  }`}
                >
                  {complete && <Check size={11} strokeWidth={3} />}
                  {active && <span className={`h-1.5 w-1.5 rounded-full ${ink}`} />}
                </motion.span>
              </span>
              <span
                className={`mt-2 px-0.5 text-center text-[9px] leading-tight tracking-wide sm:text-[10px] ${
                  i <= current ? (dark ? 'text-white' : 'text-ink-900') : dark ? 'text-dark-500' : 'text-ink-500'
                } ${i === current ? 'font-semibold' : ''}`}
              >
                {STAGE_LABEL[stage].toUpperCase()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
