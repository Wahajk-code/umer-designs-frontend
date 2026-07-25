'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ProcessStepSectionProps {
  index: number;
  title: string;
  body: string;
  image: string;
  reversed?: boolean;
}

export function ProcessStepSection({ index, title, body, image, reversed }: ProcessStepSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const imageScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.12, 1, 1.12]);
  const imageY = useTransform(scrollYProgress, [0, 1], ['-4%', '4%']);

  return (
    <div
      ref={ref}
      className={`relative flex flex-col items-center gap-8 py-16 sm:py-20 lg:flex-row lg:gap-16 ${
        reversed ? 'lg:flex-row-reverse' : ''
      }`}
    >
      <span
        aria-hidden
        className={`pointer-events-none absolute -top-6 text-[110px] font-light leading-none text-warm-300/70 sm:text-[150px] ${
          reversed ? 'right-0' : 'left-0'
        }`}
      >
        {String(index + 1).padStart(2, '0')}
      </span>

      <motion.div
        className="relative z-10 h-64 w-full flex-1 overflow-hidden rounded-card-lg sm:h-80 lg:h-[420px]"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <motion.div className="absolute inset-0" style={{ scale: imageScale, y: imageY }}>
          <Image src={image} alt={title} fill className="object-cover" />
        </motion.div>
      </motion.div>

      <motion.div
        className="relative z-10 flex-1"
        initial={{ opacity: 0, x: reversed ? 24 : -24 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-900 text-[13px] text-white">
          {index + 1}
        </div>
        <h2 className="mt-5 text-[26px] font-light text-ink-900 sm:text-[32px]">{title}</h2>
        <p className="mt-3 max-w-md text-[14px] leading-relaxed text-ink-500">{body}</p>
      </motion.div>
    </div>
  );
}
