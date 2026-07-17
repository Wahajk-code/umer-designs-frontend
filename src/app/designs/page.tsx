import type { Metadata } from 'next';
import { Logo } from '@/components/brand/logo';
import Link from 'next/link';
import { StoreView } from './store-view';

export const metadata: Metadata = { title: 'Find your plan — Umer Designs' };

export default function StorePage() {
  return (
    <div className="min-h-screen bg-warm-50">
      <header className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-10">
        <Link href="/">
          <Logo size="sm" withTagline={false} />
        </Link>
        <nav className="flex gap-1 rounded-pill bg-white p-1.5 text-[12px] text-ink-700 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
          <Link href="/" className="rounded-pill px-4 py-2 hover:bg-warm-100">
            Home
          </Link>
          <Link href="/designs" className="rounded-pill bg-ink-900 px-4 py-2 text-white">
            Designs
          </Link>
        </nav>
        <Link
          href="/sign-in"
          className="rounded-pill bg-white px-5 py-2.5 text-[12px] text-ink-900 shadow-[0_1px_4px_rgba(0,0,0,0.05)]"
        >
          My account
        </Link>
      </header>
      <main className="px-5 pb-20 sm:px-10">
        <h1 className="mt-4 text-[28px] font-light text-ink-900 sm:text-[34px]">Find your plan</h1>
        <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-ink-500">
          Every design is buildable from day one. Pay once — the files are yours forever.
        </p>
        <StoreView />
      </main>
    </div>
  );
}
