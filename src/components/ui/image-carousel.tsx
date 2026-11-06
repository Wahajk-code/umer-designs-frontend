'use client';

import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Expand } from 'lucide-react';
import { SafeImage as Image } from '@/components/ui/safe-image';
import { cn } from '@/lib/client/cn';

/**
 * Inline slideshow (used in the quick-view modal): directional slide
 * animation, swipe, arrows on hover, dots, and an optional "expand" that
 * hands the current index to a full-screen Lightbox.
 */
export function ImageCarousel({
  images,
  alt,
  className,
  sizes = '(max-width: 640px) 92vw, 50vw',
  onExpand,
}: {
  images: string[];
  alt: string;
  className?: string;
  sizes?: string;
  onExpand?: (index: number) => void;
}) {
  const reduce = useReducedMotion();
  const [[index, direction], setState] = useState<[number, number]>([0, 1]);
  const count = images.length;
  const go = (next: number, dir: number) => setState([(next + count) % count, dir]);

  if (count === 0) return <div className={cn('placeholder-stripes', className)} />;

  return (
    <div className={cn('group relative overflow-hidden bg-warm-100', className)}>
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={index}
          className="absolute inset-0"
          initial={{ x: reduce ? 0 : `${direction * 100}%` }}
          animate={{ x: 0 }}
          exit={{ x: reduce ? 0 : `${-direction * 100}%` }}
          transition={{ duration: reduce ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
          drag={count > 1 ? 'x' : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.3}
          onDragEnd={(_, info) => {
            if (info.offset.x < -50) go(index + 1, 1);
            else if (info.offset.x > 50) go(index - 1, -1);
          }}
        >
          <Image
            src={images[index]}
            alt={`${alt} — photo ${index + 1}`}
            fill
            sizes={sizes}
            className="pointer-events-none select-none object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {count > 1 && (
        <>
          <button
            onClick={() => go(index - 1, -1)}
            aria-label="Previous photo"
            className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink-900 opacity-0 shadow-md transition-opacity duration-200 focus-visible:opacity-100 group-hover:opacity-100"
          >
            <ChevronLeft size={17} />
          </button>
          <button
            onClick={() => go(index + 1, 1)}
            aria-label="Next photo"
            className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink-900 opacity-0 shadow-md transition-opacity duration-200 focus-visible:opacity-100 group-hover:opacity-100"
          >
            <ChevronRight size={17} />
          </button>
          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i, i > index ? 1 : -1)}
                aria-label={`Show photo ${i + 1}`}
                className={cn(
                  'h-1.5 rounded-full bg-white shadow transition-all duration-300',
                  i === index ? 'w-5 opacity-100' : 'w-1.5 opacity-60 hover:opacity-90',
                )}
              />
            ))}
          </div>
        </>
      )}

      {onExpand && (
        <button
          onClick={() => onExpand(index)}
          aria-label="View photos full screen"
          className="absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-pill bg-black/50 px-3 py-1.5 text-[11px] text-white backdrop-blur-sm transition-colors hover:bg-black/70"
        >
          <Expand size={12} /> {count} photo{count === 1 ? '' : 's'}
        </button>
      )}
    </div>
  );
}
