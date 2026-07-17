import { Suspense } from 'react';
import type { Metadata } from 'next';
import { NewModificationForm } from './new-modification-form';

export const metadata: Metadata = { title: 'Request a modification — Umer Designs' };

export default function NewModificationPage() {
  return (
    <div className="pt-6">
      <h1 className="text-[22px] font-light text-ink-900">Select your changes</h1>
      <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-ink-500">
        Pick what you would like changed — the total updates instantly and includes everything.
      </p>
      <div className="mt-6">
        <Suspense>
          <NewModificationForm />
        </Suspense>
      </div>
    </div>
  );
}
