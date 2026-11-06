'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Eye } from 'lucide-react';
import { SafeImage as Image } from '@/components/ui/safe-image';
import { Design } from '@/lib/types/design';
import { formatCents, formatCompactCents } from '@/lib/client/format';
import { DesignQuickViewModal } from '@/components/designs/design-quick-view-modal';
import { AddToCartButton } from '@/components/designs/add-to-cart-button';
import { fallbackImageFor } from '@/lib/stock-images';

/**
 * The whole card is a link to the design page (a full-card overlay link);
 * the quick-view / add-to-cart controls sit above it and stay independently
 * clickable.
 */
export function DesignCard({ design }: { design: Design }) {
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const photoCount = 1 + (design.galleryUrls?.length ?? 0);

  return (
    <div className="group relative overflow-hidden rounded-card bg-white shadow-[0_1px_5px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_34px_rgba(0,0,0,0.1)]">
      <Link
        href={`/designs/${design.slug}`}
        aria-label={`View ${design.title}`}
        className="absolute inset-0 z-10 rounded-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-900"
      />

      <div className="relative h-[200px] w-full overflow-hidden bg-warm-100">
        <Image
          src={design.coverImageUrl}
          fallbackSrc={fallbackImageFor(design.slug)}
          alt={design.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <span className="pointer-events-none absolute left-3.5 top-3.5 rounded-pill bg-ink-900 px-3 py-1.5 text-[10px] text-white">
          {design.category === 'CONTAINER' ? 'Container' : 'Residential'}
        </span>
        {photoCount > 1 && (
          <span className="pointer-events-none absolute bottom-3 left-3.5 rounded-pill bg-black/45 px-2.5 py-1 text-[10px] text-white backdrop-blur-sm">
            {photoCount} photos
          </span>
        )}
        <div className="absolute right-3.5 top-3.5 z-20 flex gap-2">
          <AddToCartButton design={design} variant="icon" />
          <button
            onClick={() => setQuickViewOpen(true)}
            aria-label={`Quick view ${design.title}`}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink-900 opacity-0 shadow-sm transition-all duration-200 hover:scale-110 focus-visible:opacity-100 group-hover:opacity-100"
          >
            <Eye size={15} />
          </button>
        </div>
      </div>

      <div className="pointer-events-none p-4">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[15px] font-medium text-ink-900">{design.title}</span>
          <span className="text-[14px] text-ink-900">{formatCents(design.basePriceCents)}</span>
        </div>
        <div className="mt-1.5 flex flex-wrap gap-3 text-[11px] text-ink-500">
          <span>{design.bedrooms} bed</span>
          <span>{design.bathrooms} bath</span>
          <span>{design.sqft.toLocaleString()} sq ft</span>
          <span>build ≈ {formatCompactCents(design.estimatedBuildCents)}</span>
        </div>
        <div className="mt-3 flex gap-2">
          <span className="flex flex-1 items-center justify-center gap-1.5 rounded-pill bg-ink-900 py-2.5 text-[11px] text-white transition-colors group-hover:bg-ink-950">
            View plan <ArrowRight size={12} className="transition-transform duration-300 group-hover:translate-x-0.5" />
          </span>
          <span className="pointer-events-auto relative z-20 flex flex-1">
            <AddToCartButton design={design} variant="secondary" />
          </span>
        </div>
      </div>
      <DesignQuickViewModal design={design} open={quickViewOpen} onClose={() => setQuickViewOpen(false)} />
    </div>
  );
}
