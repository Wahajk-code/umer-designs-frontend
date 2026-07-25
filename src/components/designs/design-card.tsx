'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Eye } from 'lucide-react';
import { Design } from '@/lib/types/design';
import { formatCents, formatCompactCents } from '@/lib/client/format';
import { DesignQuickViewModal } from '@/components/designs/design-quick-view-modal';
import { AddToCartButton } from '@/components/designs/add-to-cart-button';

export function DesignCard({ design }: { design: Design }) {
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  return (
    <div className="group overflow-hidden rounded-card bg-white shadow-[0_1px_5px_rgba(0,0,0,0.05)] transition-shadow duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.09)]">
      <div className="relative h-[180px] w-full overflow-hidden">
        {design.coverImageUrl ? (
          <Image
            src={design.coverImageUrl}
            alt={design.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="placeholder-stripes h-full w-full" />
        )}
        <span className="absolute left-3.5 top-3.5 rounded-pill bg-ink-900 px-3 py-1.5 text-[10px] text-white">
          {design.category === 'CONTAINER' ? 'Container' : 'Residential'}
        </span>
        <div className="absolute right-3.5 top-3.5 flex gap-2">
          <AddToCartButton design={design} variant="icon" />
          <button
            onClick={() => setQuickViewOpen(true)}
            aria-label={`Quick view ${design.title}`}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink-900 opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-visible:opacity-100"
          >
            <Eye size={15} />
          </button>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-baseline justify-between">
          <span className="text-[15px] font-medium text-ink-900">{design.title}</span>
          <span className="text-[14.5px] text-ink-900">{formatCents(design.basePriceCents)}</span>
        </div>
        <div className="mt-1.5 flex flex-wrap gap-3 text-[11px] text-ink-500">
          <span>{design.bedrooms} bed</span>
          <span>{design.bathrooms} bath</span>
          <span>{design.sqft.toLocaleString()} sq ft</span>
          <span>build ≈ {formatCompactCents(design.estimatedBuildCents)}</span>
        </div>
        <div className="mt-3 flex gap-2">
          <Link
            href={`/designs/${design.slug}`}
            className="flex-1 rounded-pill bg-ink-900 py-2.5 text-center text-[11px] text-white transition-colors hover:bg-ink-950"
          >
            Buy now
          </Link>
          <AddToCartButton design={design} variant="secondary" />
        </div>
      </div>
      <DesignQuickViewModal design={design} open={quickViewOpen} onClose={() => setQuickViewOpen(false)} />
    </div>
  );
}
