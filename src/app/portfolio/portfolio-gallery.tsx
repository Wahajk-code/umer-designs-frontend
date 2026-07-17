'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { PortfolioProject } from '@/lib/portfolio-data';
import { Reveal, RevealGroup } from '@/components/ui/reveal';

const FILTERS: { label: string; value: 'ALL' | 'CONTAINER' | 'RESIDENTIAL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Container', value: 'CONTAINER' },
  { label: 'Residential', value: 'RESIDENTIAL' },
];

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

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <RevealGroup stagger={0.05}>
          {visible.map((project, i) => (
            <Link
              key={project.slug}
              href={`/portfolio/${project.slug}`}
              className={`group relative overflow-hidden rounded-card bg-white ${
                i === 0 ? 'sm:col-span-2 lg:col-span-2 lg:row-span-2' : ''
              }`}
            >
              <div className={`relative w-full overflow-hidden ${i === 0 ? 'h-64 sm:h-full sm:min-h-[420px]' : 'h-52'}`}>
                <Image
                  src={project.coverImage}
                  alt={project.title}
                  fill
                  sizes={i === 0 ? '(max-width: 1024px) 100vw, 66vw' : '(max-width: 1024px) 50vw, 33vw'}
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <span className="absolute left-3 top-3 rounded-pill bg-ink-900 px-3 py-1.5 text-[10px] text-white">
                  {project.category === 'CONTAINER' ? 'Container' : 'Residential'}
                </span>
                <div className="absolute right-3 top-3 flex h-8 w-8 translate-y-1 items-center justify-center rounded-full bg-white/90 text-ink-900 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <ArrowUpRight size={15} />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <div className={`font-medium text-white ${i === 0 ? 'text-[18px]' : 'text-[13.5px]'}`}>
                    {project.title}
                  </div>
                  <div className="mt-1 text-[11px] text-white/80">
                    {project.location} · {project.year}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </RevealGroup>
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
