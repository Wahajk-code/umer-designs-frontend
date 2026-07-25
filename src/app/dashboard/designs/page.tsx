import type { Metadata } from 'next';
import { MyDesigns } from '../my-designs';

export const metadata: Metadata = { title: 'My Designs — Umer Designs' };

export default function DashboardDesignsPage() {
  return (
    <div>
      <h1 className="text-[26px] font-light text-ink-900">My designs</h1>
      <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-ink-500">
        Everything you&apos;ve bought, re-downloadable any time.
      </p>
      <div className="mt-7">
        <MyDesigns />
      </div>
    </div>
  );
}
