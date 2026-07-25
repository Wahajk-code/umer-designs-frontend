import Link from 'next/link';
import type { Metadata } from 'next';
import { getCurrentUser } from '@/lib/server/current-user';
import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';
import { Reveal } from '@/components/ui/reveal';
import { PORTFOLIO_PROJECTS } from '@/lib/portfolio-data';
import { PortfolioGallery } from './portfolio-gallery';

export const metadata: Metadata = {
  title: 'Portfolio',
  description:
    'Homes built from Umer Designs plans — container and residential projects across the US, as bought or with a few changes along the way.',
};

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

        <Reveal>
          <div className="mt-20 rounded-card-lg bg-white p-8 text-center sm:p-14">
            <h2 className="text-[22px] font-light text-ink-900 sm:text-[26px]">Like what you see?</h2>
            <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-ink-500">
              Every project here started as a design in our store — browse it, or talk to us about your
              own site first.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/designs"
                className="rounded-pill bg-ink-900 px-6 py-3 text-[12.5px] font-medium text-white transition-transform hover:scale-[1.03]"
              >
                Browse the store
              </Link>
              <Link
                href="/contact"
                className="rounded-pill border border-ink-900 px-6 py-3 text-[12.5px] text-ink-900 transition-colors hover:bg-warm-100"
              >
                Talk to us
              </Link>
            </div>
          </div>
        </Reveal>
      </main>
      <SiteFooter />
    </div>
  );
}
