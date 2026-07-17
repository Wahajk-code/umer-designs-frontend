'use client';

import { useState, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/client/cn';

interface AccordionItemData {
  question: string;
  answer: ReactNode;
}

export function Accordion({ items }: { items: AccordionItemData[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, i) => {
        const open = openIndex === i;
        return (
          <div key={item.question} className="rounded-card bg-white">
            <button
              onClick={() => setOpenIndex(open ? null : i)}
              aria-expanded={open}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className="text-[13.5px] font-medium text-ink-900">{item.question}</span>
              <ChevronDown
                size={16}
                className={cn('flex-none text-ink-500 transition-transform duration-200', open && 'rotate-180')}
              />
            </button>
            <div
              className="grid transition-[grid-template-rows] duration-300 ease-out"
              style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-4 text-[12.5px] leading-relaxed text-ink-500">{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
