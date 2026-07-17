'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Design } from '@/lib/types/design';
import { formatCents, formatCompactCents } from '@/lib/client/format';
import { Modal, ModalCloseButton } from '@/components/ui/modal';

export function DesignQuickViewModal({
  design,
  open,
  onClose,
}: {
  design: Design;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      className="w-[92vw] max-w-3xl overflow-hidden"
      labelledBy="quick-view-title"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2">
        <div className="relative h-56 sm:h-full">
          {design.coverImageUrl ? (
            <Image
              src={design.coverImageUrl}
              alt={design.title}
              fill
              sizes="(max-width: 640px) 92vw, 46vw"
              className="object-cover"
            />
          ) : (
            <div className="placeholder-stripes h-full w-full" />
          )}
        </div>
        <div className="flex flex-col p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="rounded-pill bg-warm-100 px-3 py-1 text-[10px] text-ink-700">
                {design.category === 'CONTAINER' ? 'Container' : 'Residential'}
              </span>
              <h2 id="quick-view-title" className="mt-2 text-[19px] font-medium text-ink-900">
                {design.title}
              </h2>
            </div>
            <ModalCloseButton onClose={onClose} />
          </div>

          <p className="mt-3 text-[12.5px] leading-relaxed text-ink-500">{design.summary}</p>

          <div className="mt-4 grid grid-cols-2 gap-2 text-[11.5px] text-ink-700">
            <div className="rounded-control bg-warm-100 px-3 py-2">{design.bedrooms} bed</div>
            <div className="rounded-control bg-warm-100 px-3 py-2">{design.bathrooms} bath</div>
            <div className="rounded-control bg-warm-100 px-3 py-2">{design.sqft.toLocaleString()} sq ft</div>
            <div className="rounded-control bg-warm-100 px-3 py-2">
              build ≈ {formatCompactCents(design.estimatedBuildCents)}
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between pt-6">
            <span className="text-[20px] font-medium text-ink-900">{formatCents(design.basePriceCents)}</span>
            <Link
              href={`/designs/${design.slug}`}
              className="rounded-pill bg-ink-900 px-6 py-3 text-[12px] font-medium text-white transition-colors hover:bg-ink-950"
            >
              View full details
            </Link>
          </div>
        </div>
      </div>
    </Modal>
  );
}
