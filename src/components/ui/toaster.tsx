'use client';

import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast: 'rounded-card! bg-ink-900! text-white! border-none! shadow-[0_8px_30px_rgba(0,0,0,0.25)]!',
          title: 'text-[13px]! font-medium!',
          description: 'text-[12px]! text-dark-500!',
          actionButton: 'bg-white! text-ink-900!',
          cancelButton: 'bg-white/10! text-white!',
        },
      }}
    />
  );
}
