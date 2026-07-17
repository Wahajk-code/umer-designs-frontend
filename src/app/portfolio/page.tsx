import type { Metadata } from 'next';
import { getCurrentUser } from '@/lib/server/current-user';
import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';
import { Reveal } from '@/components/ui/reveal';
import { PORTFOLIO_PROJECTS } from '@/lib/portfolio-data';
import { PortfolioGallery } from './portfolio-gallery';

export const metadata: Metadata = { title: 'Portfolio — Umer Designs' };

export default async function PortfolioPage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-warm-50">
      <SiteHeader isSignedIn={Boolean(user)} />
      <main className="mx-auto max-w-7xl px-5 pb-24 sm:px-8 lg:px-12">
        <Reveal>
          <span className="inline-block rounded-pill bg-white px-4 py-1.5 text-[11px] text-ink-700">
            Portfolio
          </span>
          <h1 className="mt-4 max-w-2xl text-[32px] font-light leading-tight text-ink-900 sm:text-[42px] lg:text-[48px]">
            Built, not just drawn.
          </h1>
          <p className="mt-3 max-w-lg text-[13.5px] leading-relaxed text-ink-500">
            A selection of homes built from our designs — as bought, or with a few changes along the way.
            Every project here started as a file in someone&apos;s account.
          </p>
        </Reveal>
        <div className="mt-10">
          <PortfolioGallery projects={PORTFOLIO_PROJECTS} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
