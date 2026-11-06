'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { SafeImage as Image } from '@/components/ui/safe-image';
import { cn } from '@/lib/client/cn';

interface LightboxProps {
  images: { src: string; alt: string }[];
  index: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
  /** Keep the component mounted and toggle this so the close animation can play. */
  open?: boolean;
}

const SWIPE_PX = 70;

/**
 * Full-screen photo slideshow: animated open/close, directional slide
 * transitions, swipe/drag, keyboard (← → Esc), counter and a thumbnail strip.
 */
export function Lightbox({ images, index, onClose, onIndexChange, open = true }: LightboxProps) {
  const reduce = useReducedMotion();
  const [direction, setDirection] = useState(1);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const count = images.length;

  const go = useCallback(
    (next: number, dir: number) => {
      setDirection(dir);
      onIndexChange((next + count) % count);
    },
    [count, onIndexChange],
  );
  const goNext = useCallback(() => go(index + 1, 1), [go, index]);
  const goPrev = useCallback(() => go(index - 1, -1), [go, index]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'Escape') onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, goNext, goPrev, onClose]);

  // Keep the active thumbnail in view.
  useEffect(() => {
    if (!open) return;
    const el = thumbsRef.current?.querySelector<HTMLElement>(`[data-thumb="${index}"]`);
    el?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', inline: 'center', block: 'nearest' });
  }, [index, open, reduce]);

  if (typeof document === 'undefined' || count === 0) return null;
  const current = images[Math.min(index, count - 1)];
  const offset = reduce ? 0 : 80;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          className="fixed inset-0 z-[70] flex flex-col bg-black/92 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.22 }}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 py-3 text-white sm:px-6">
            <span className="rounded-pill bg-white/10 px-3 py-1 text-[11.5px] tabular-nums">
              {index + 1} / {count}
            </span>
            <span className="mx-4 hidden truncate text-[12px] text-white/70 sm:block">{current.alt}</span>
            <button
              onClick={onClose}
              aria-label="Close photo viewer"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
            >
              <X size={18} />
            </button>
          </div>

          {/* Stage */}
          <motion.div
            className="relative flex-1 overflow-hidden"
            initial={{ scale: reduce ? 1 : 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: reduce ? 1 : 0.96, opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
          >
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <motion.div
                key={index}
                custom={direction}
                className="absolute inset-0 mx-auto max-w-6xl cursor-grab px-4 active:cursor-grabbing sm:px-20"
                initial={{ x: direction * offset, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -direction * offset, opacity: 0 }}
                transition={{ duration: reduce ? 0 : 0.32, ease: [0.22, 1, 0.36, 1] }}
                drag={count > 1 ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.35}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -SWIPE_PX) goNext();
                  else if (info.offset.x > SWIPE_PX) goPrev();
                }}
              >
                <div className="relative h-full w-full">
                  <Image
                    src={current.src}
                    alt={current.alt}
                    fill
                    sizes="100vw"
                    className="pointer-events-none select-none object-contain"
                    priority
                  />
                </div>
              </motion.div>
            </AnimatePresence>

            {count > 1 && (
              <>
                <button
                  onClick={goPrev}
                  aria-label="Previous photo"
                  className="absolute left-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25 sm:left-6"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  onClick={goNext}
                  aria-label="Next photo"
                  className="absolute right-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25 sm:right-6"
                >
                  <ChevronRight size={22} />
                </button>
              </>
            )}
          </motion.div>

          {/* Thumbnails */}
          {count > 1 && (
            <div ref={thumbsRef} className="flex justify-center-safe gap-2 overflow-x-auto px-4 py-4">
              {images.map((img, i) => (
                <button
                  key={`${img.src}-${i}`}
                  data-thumb={i}
                  onClick={() => go(i, i > index ? 1 : -1)}
                  aria-label={`Show photo ${i + 1}`}
                  aria-current={i === index}
                  className={cn(
                    'relative h-14 w-20 flex-none overflow-hidden rounded-control transition-all duration-200',
                    i === index ? 'opacity-100 ring-2 ring-white' : 'opacity-45 hover:opacity-80',
                  )}
                >
                  <Image src={img.src} alt="" fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
