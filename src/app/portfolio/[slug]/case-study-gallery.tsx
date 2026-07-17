'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Expand } from 'lucide-react';
import { Lightbox } from '@/components/ui/lightbox';

export function CaseStudyGallery({ images, title }: { images: string[]; title: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const lightboxImages = images.map((src, i) => ({ src, alt: `${title} detail ${i + 1}` }));

  if (images.length === 0) return null;

  return (
    <>
      <div className="mt-8 grid grid-cols-2 gap-3">
        {images.map((url, i) => (
          <button
            key={i}
            onClick={() => setOpenIndex(i)}
            className="group relative h-40 overflow-hidden rounded-card sm:h-56"
          >
            <Image
              src={url}
              alt={`${title} detail ${i + 1}`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/30">
              <Expand
                size={18}
                className="text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
            </div>
          </button>
        ))}
      </div>

      {openIndex !== null && (
        <Lightbox
          images={lightboxImages}
          index={openIndex}
          onClose={() => setOpenIndex(null)}
          onIndexChange={setOpenIndex}
        />
      )}
    </>
  );
}
