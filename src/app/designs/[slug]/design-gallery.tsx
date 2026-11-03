'use client';

import { useState } from 'react';
import { SafeImage as Image } from '@/components/ui/safe-image';
import { Expand } from 'lucide-react';
import { Lightbox } from '@/components/ui/lightbox';
import { EXTERIOR_IMAGES, INTERIOR_IMAGES } from '@/lib/stock-images';

export function DesignGallery({ title, images: rawImages }: { title: string; images: string[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  // Never show an empty gallery: pad with working stock photos.
  const images = rawImages.length > 0 ? rawImages : [EXTERIOR_IMAGES[0], ...INTERIOR_IMAGES.slice(0, 4)];

  return (
    <>
      <div className="relative mt-4 grid grid-cols-4 gap-1.5 overflow-hidden rounded-card-lg">
        <button
          type="button"
          onClick={() => setOpenIndex(0)}
          className="relative col-span-4 h-[280px] cursor-zoom-in sm:h-[360px]"
        >
          <Image src={images[0]} alt={title} fill className="object-cover" priority />
        </button>
        {images.slice(1, 5).map((url, i) => (
          <button
            type="button"
            key={i}
            onClick={() => setOpenIndex(i + 1)}
            className="relative col-span-1 h-[70px] cursor-zoom-in sm:h-[90px]"
          >
            <Image src={url} alt={`${title} photo ${i + 2}`} fill className="object-cover" />
          </button>
        ))}
        {images.length > 1 && (
          <button
            type="button"
            onClick={() => setOpenIndex(0)}
            className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-pill bg-black/50 px-3 py-1.5 text-[11px] text-white transition-colors hover:bg-black/70"
          >
            <Expand size={12} /> Preview ({images.length} photos)
          </button>
        )}
      </div>

      {openIndex !== null && (
        <Lightbox
          images={images.map((src, i) => ({ src, alt: `${title} photo ${i + 1}` }))}
          index={openIndex}
          onClose={() => setOpenIndex(null)}
          onIndexChange={setOpenIndex}
        />
      )}
    </>
  );
}
