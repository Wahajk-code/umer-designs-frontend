'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { PortfolioProject } from '@/lib/portfolio-data';
import { Reveal } from '@/components/ui/reveal';

const FILTERS: { label: string; value: 'ALL' | 'CONTAINER' | 'RESIDENTIAL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Container', value: 'CONTAINER' },
  { label: 'Residential', value: 'RESIDENTIAL' },
];

/**
 * Repeating 6-tile bento pattern (col-span/row-span per position). Combined
 * with `grid-flow-dense` on the container so the browser backfills any gap
 * left by a spanning tile instead of leaving visible whitespace — the bug in
 * the previous version, which only spanned the first tile without `dense`.
 */
const BENTO_PATTERN = [
  'col-span-2 row-span-2', // 0: big feature
  'col-span-1 row-span-1', // 1
  'col-span-1 row-span-2', // 2: tall
  'col-span-1 row-span-1', // 3
  'col-span-2 row-span-1', // 4: wide
  'col-span-1 row-span-1', // 5
];

function titleSize(spanClass: string): string {
  return spanClass.includes('col-span-2') ? 'text-[17px]' : 'text-[13px]';
}

export function PortfolioGallery({ projects }: { projects: PortfolioProject[] }) {
  const [filter, setFilter] = useState<'ALL' | 'CONTAINER' | 'RESIDENTIAL'>('ALL');
  const visible = filter === 'ALL' ? projects : projects.filter((p) => p.category === filter);

  return (
    <div>
      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-pill px-4 py-2 text-[11.5px] transition-colors ${
              filter === f.value ? 'bg-ink-900 text-white' : 'bg-white text-ink-700 hover:bg-warm-100'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-flow-row-dense grid-cols-2 auto-rows-[150px] gap-3 sm:grid-cols-3 sm:auto-rows-[170px] lg:grid-cols-4 lg:auto-rows-[190px]">
        <AnimatePresence mode="popLayout">
          {visible.map((project, i) => {
            const span = BENTO_PATTERN[i % BENTO_PATTERN.length];
            return (
              <motion.div
                key={project.slug}
                layout
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.35, delay: i * 0.04, ease: 'easeOut' }}
                className={span}
              >
                <Link
                  href={`/portfolio/${project.slug}`}
                  className="group relative block h-full w-full overflow-hidden rounded-card bg-white"
                >
                  <Image
                    src={project.coverImage}
                    alt={project.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-90" />
                  <span className="absolute left-3 top-3 rounded-pill bg-ink-900 px-3 py-1.5 text-[10px] text-white">
                    {project.category === 'CONTAINER' ? 'Container' : 'Residential'}
                  </span>
                  <div className="absolute right-3 top-3 flex h-8 w-8 translate-y-1 items-center justify-center rounded-full bg-white/90 text-ink-900 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <ArrowUpRight size={15} />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <div className={`font-medium text-white ${titleSize(span)}`}>{project.title}</div>
                    <div className="mt-1 text-[11px] text-white/80">
                      {project.location} · {project.year}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {visible.length === 0 && (
        <Reveal>
          <div className="mt-4 rounded-card-lg bg-white p-10 text-center text-[13px] text-ink-500">
            No projects in this category yet.
          </div>
        </Reveal>
      )}
    </div>
  );
}
