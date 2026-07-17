'use client';

import { useCallback, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Modal, ModalCloseButton } from '@/components/ui/modal';

interface LightboxProps {
  images: { src: string; alt: string }[];
  index: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

export function Lightbox({ images, index, onClose, onIndexChange }: LightboxProps) {
  const goNext = useCallback(
    () => onIndexChange((index + 1) % images.length),
    [index, images.length, onIndexChange],
  );
  const goPrev = useCallback(
    () => onIndexChange((index - 1 + images.length) % images.length),
    [index, images.length, onIndexChange],
  );

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'ArrowRight') goNext();
      if (event.key === 'ArrowLeft') goPrev();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrev]);

  const current = images[index];

  return (
    <Modal open onClose={onClose} className="relative h-[80vh] w-[92vw] max-w-4xl bg-transparent">
      <div className="relative flex h-full w-full items-center justify-center">
        <Image src={current.src} alt={current.alt} fill className="rounded-card-lg object-contain" priority />
        <div className="absolute right-3 top-3">
          <ModalCloseButton onClose={onClose} dark />
        </div>
        {images.length > 1 && (
          <>
            <button
              onClick={goPrev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={goNext}
              aria-label="Next image"
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60"
            >
              <ChevronRight size={20} />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-pill bg-black/40 px-3 py-1 text-[11px] text-white">
              {index + 1} / {images.length}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
