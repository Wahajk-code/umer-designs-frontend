'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Design } from '@/lib/types/design';
import { formatCents, formatCompactCents } from '@/lib/client/format';
import { Modal, ModalCloseButton } from '@/components/ui/modal';
import { ImageCarousel } from '@/components/ui/image-carousel';
import { Lightbox } from '@/components/ui/lightbox';
import { AddToCartButton } from '@/components/designs/add-to-cart-button';

export function DesignQuickViewModal({
  design,
  open,
  onClose,
}: {
  design: Design;
  open: boolean;
  onClose: () => void;
}) {
  const images = [design.coverImageUrl, ...(design.galleryUrls ?? [])].filter(Boolean);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <Modal
        open={open && lightboxIndex === null}
        onClose={onClose}
        className="max-h-[92vh] w-[94vw] max-w-4xl overflow-y-auto"
        labelledBy={`quick-view-${design.id}`}
      >
        <div className="grid grid-cols-1 md:grid-cols-[1.15fr_1fr]">
          <ImageCarousel
            images={images}
            alt={design.title}
            className="h-64 sm:h-80 md:h-full md:min-h-[440px]"
            sizes="(max-width: 768px) 94vw, 480px"
            onExpand={(i) => setLightboxIndex(i)}
          />

          <div className="flex flex-col p-6 sm:p-7">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="rounded-pill bg-warm-100 px-3 py-1 text-[10px] text-ink-700">
                  {design.category === 'CONTAINER' ? 'Container' : 'Residential'}
                </span>
                <h2 id={`quick-view-${design.id}`} className="mt-2.5 text-[21px] font-medium text-ink-900">
                  {design.title}
                </h2>
              </div>
              <ModalCloseButton onClose={onClose} />
            </div>

            <p className="mt-3 text-[13px] leading-relaxed text-ink-500">{design.summary}</p>

            <div className="mt-5 grid grid-cols-2 gap-2 text-[12px] text-ink-700">
              <div className="rounded-control bg-warm-100 px-3 py-2.5">{design.bedrooms} bed</div>
              <div className="rounded-control bg-warm-100 px-3 py-2.5">{design.bathrooms} bath</div>
              <div className="rounded-control bg-warm-100 px-3 py-2.5">{design.sqft.toLocaleString()} sq ft</div>
              <div className="rounded-control bg-warm-100 px-3 py-2.5">
                build ≈ {formatCompactCents(design.estimatedBuildCents)}
              </div>
            </div>

            <p className="mt-4 text-[11.5px] text-ink-500">
              Want changes? Customise the plan (add a room, resize, …) on the full page — it&apos;s one checkout,
              and you can track the changes from your dashboard.
            </p>

            <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-6">
              <span className="text-[22px] font-medium text-ink-900">{formatCents(design.basePriceCents)}</span>
              <div className="flex items-center gap-2">
                <AddToCartButton
                  design={design}
                  variant="secondary"
                  className="flex-none border-ink-900 px-5 py-3 text-[12px] font-medium text-ink-900"
                />
                <Link
                  href={`/designs/${design.slug}`}
                  className="flex items-center gap-1.5 whitespace-nowrap rounded-pill bg-ink-900 px-6 py-3 text-[12px] font-medium text-white transition-colors hover:bg-ink-950"
                >
                  View & customise <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <Lightbox
        open={lightboxIndex !== null}
        images={images.map((src, i) => ({ src, alt: `${design.title} — photo ${i + 1}` }))}
        index={lightboxIndex ?? 0}
        onIndexChange={setLightboxIndex}
        onClose={() => setLightboxIndex(null)}
      />
    </>
  );
}
