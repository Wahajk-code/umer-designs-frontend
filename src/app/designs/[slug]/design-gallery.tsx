'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Expand } from 'lucide-react';
import { SafeImage as Image } from '@/components/ui/safe-image';
import { Lightbox } from '@/components/ui/lightbox';
import { EXTERIOR_IMAGES, INTERIOR_IMAGES } from '@/lib/stock-images';

/**
 * Hero photo + up to four tiles; every photo opens the full-screen slideshow
 * at that photo. The last tile shows "+N" when there are more.
 */
export function DesignGallery({ title, images: rawImages }: { title: string; images: string[] }) {
  const reduce = useReducedMotion();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  // Never show an empty gallery: pad with working stock photos.
  const images = rawImages.length > 0 ? rawImages : [EXTERIOR_IMAGES[0], ...INTERIOR_IMAGES.slice(0, 4)];
  const tiles = images.slice(1, 5);
  const hidden = images.length - 5;

  const tile = (i: number) => ({
    initial: { opacity: 0, y: reduce ? 0 : 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, delay: reduce ? 0 : 0.06 * i, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <>
      <div className="mt-4 grid grid-cols-4 gap-2 overflow-hidden rounded-card-lg md:grid-cols-[2fr_1fr_1fr] md:grid-rows-2">
        <motion.button
          {...tile(0)}
          type="button"
          onClick={() => setOpenIndex(0)}
          aria-label={`Open ${title} photos`}
          className="group relative col-span-4 h-[280px] cursor-zoom-in overflow-hidden sm:h-[380px] md:col-span-1 md:row-span-2 md:h-[440px]"
        >
          <Image
            src={images[0]}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 55vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            priority
          />
          <span className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
        </motion.button>

        {tiles.map((url, i) => {
          const isLast = i === tiles.length - 1 && hidden > 0;
          return (
            <motion.button
              {...tile(i + 1)}
              type="button"
              key={`${url}-${i}`}
              onClick={() => setOpenIndex(i + 1)}
              aria-label={isLast ? `View all ${images.length} photos` : `${title} photo ${i + 2}`}
              className="group relative col-span-1 h-[78px] cursor-zoom-in overflow-hidden sm:h-[110px] md:h-auto"
            >
              <Image
                src={url}
                alt={`${title} photo ${i + 2}`}
                fill
                sizes="(max-width: 768px) 25vw, 22vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.08]"
              />
              <span className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/15" />
              {isLast && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-[15px] font-medium text-white">
                  +{hidden + 1}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {images.length > 1 && (
        <button
          type="button"
          onClick={() => setOpenIndex(0)}
          className="mt-3 inline-flex items-center gap-1.5 rounded-pill bg-white px-4 py-2 text-[11.5px] text-ink-900 shadow-[0_1px_4px_rgba(0,0,0,0.06)] transition-colors hover:bg-warm-100"
        >
          <Expand size={12} /> View all {images.length} photos
        </button>
      )}

      <Lightbox
        open={openIndex !== null}
        images={images.map((src, i) => ({ src, alt: `${title} — photo ${i + 1}` }))}
        index={openIndex ?? 0}
        onClose={() => setOpenIndex(null)}
        onIndexChange={setOpenIndex}
      />
    </>
  );
}
