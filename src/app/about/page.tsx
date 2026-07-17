import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Compass, Ruler, ShieldCheck, Sparkles } from 'lucide-react';
import { getCurrentUser } from '@/lib/server/current-user';
import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';
import { Reveal, RevealGroup } from '@/components/ui/reveal';
import { ABOUT_IMAGE, INTERIOR_IMAGES } from '@/lib/stock-images';

export const metadata: Metadata = { title: 'About — Umer Designs' };

const VALUES = [
  {
    icon: Ruler,
    title: 'Architectural precision',
    body: 'Every set is drawn to be built, not just admired — code-aware, contractor-ready.',
  },
  {
    icon: Sparkles,
    title: 'Vision-driven design',
    body: 'We start with how you want to live, then draw backward from there.',
  },
  {
    icon: Compass,
    title: 'Modern, restrained aesthetic',
    body: 'Warm materials, clean lines, nothing that fights the site.',
  },
  {
    icon: ShieldCheck,
    title: 'Trusted professionalism',
    body: 'Fixed pricing, clear stages, a real person on the other end of every message.',
  },
];

const STATS = [
  { value: '2019', label: 'Founded' },
  { value: '120+', label: 'Homes designed' },
  { value: '38', label: 'States built in' },
];

export default async function AboutPage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-warm-50">
      <SiteHeader isSignedIn={Boolean(user)} />
      <main className="mx-auto max-w-7xl px-5 pb-24 sm:px-8 lg:px-12">
        {/* Intro — side by side on desktop */}
        <div className="grid grid-cols-1 items-center gap-10 pt-4 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <div>
              <span className="inline-block rounded-pill bg-white px-4 py-1.5 text-[11px] text-ink-700">
                About Umer Designs
              </span>
              <h1 className="mt-4 text-[32px] font-light leading-tight text-ink-900 sm:text-[42px] lg:text-[48px]">
                Hi, we&apos;re <span className="font-medium">Umer Designs</span>
              </h1>
              <p className="mt-4 max-w-xl text-[13.5px] leading-relaxed text-ink-500">
                We started Umer Designs because buying an architect-drawn home shouldn&apos;t mean months of
                back and forth before you even see a floor plan. Every design in our store is drawn to be
                built as-is, priced honestly, and yours the moment you pay — with a real architect one
                message away for everything after.
              </p>
              <div className="mt-8 grid grid-cols-3 gap-4">
                {STATS.map((stat) => (
                  <div key={stat.label}>
                    <div className="text-[22px] font-medium text-ink-900 sm:text-[26px]">{stat.value}</div>
                    <div className="mt-1 text-[11px] text-ink-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="relative h-72 overflow-hidden rounded-card-lg sm:h-96 lg:h-[440px]">
              <Image src={ABOUT_IMAGE} alt="Umer Designs studio" fill className="object-cover" />
            </div>
          </Reveal>
        </div>

        {/* Approach — text + image, reversed on desktop */}
        <div className="mt-24 grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal className="order-2 lg:order-1">
            <div className="relative h-64 overflow-hidden rounded-card-lg sm:h-80 lg:h-[380px]">
              <Image src={INTERIOR_IMAGES[0]} alt="Interior design detail" fill className="object-cover" />
            </div>
          </Reveal>
          <Reveal className="order-1 lg:order-2" delay={0.1}>
            <div>
              <h2 className="text-[26px] font-light text-ink-900 sm:text-[30px]">
                Design first. Paperwork second.
              </h2>
              <p className="mt-4 text-[13.5px] leading-relaxed text-ink-500">
                Most architecture studios start with a proposal and a retainer. We start with a finished,
                buildable design you can see and price before you commit to anything. If it&apos;s close but
                not quite right, our modification system lets you reshape it — one clear total, paid
                upfront, tracked from submission to delivery.
              </p>
              <p className="mt-4 text-[13.5px] leading-relaxed text-ink-500">
                It&apos;s the same rigor as a traditional practice, just restructured around how people
                actually want to buy a home design in 2026: transparently, quickly, and without losing the
                architect along the way.
              </p>
              <Link
                href="/process"
                className="mt-6 inline-block text-[12.5px] font-medium text-ink-900 underline underline-offset-4"
              >
                See how the process works →
              </Link>
            </div>
          </Reveal>
        </div>

        {/* Values grid */}
        <div className="mt-24">
          <Reveal>
            <h2 className="text-[26px] font-light text-ink-900 sm:text-[30px]">What we hold to</h2>
          </Reveal>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <RevealGroup stagger={0.06}>
              {VALUES.map((v) => (
                <div
                  key={v.title}
                  className="rounded-card bg-white p-6 transition-shadow duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.07)]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warm-100 text-ink-900">
                    <v.icon size={18} />
                  </div>
                  <div className="mt-4 text-[13.5px] font-medium text-ink-900">{v.title}</div>
                  <p className="mt-2 text-[12px] leading-relaxed text-ink-500">{v.body}</p>
                </div>
              ))}
            </RevealGroup>
          </div>
        </div>

        {/* CTA */}
        <Reveal>
          <div className="mt-24 rounded-card-lg bg-ink-900 p-8 text-center sm:p-14">
            <h2 className="text-[24px] font-light text-white sm:text-[28px]">Want to talk before you buy?</h2>
            <p className="mx-auto mt-3 max-w-sm text-[13px] text-dark-500">
              Book a short call — no pressure, just a chance to ask questions about a design or your site.
            </p>
            <Link
              href="/schedule-a-meeting"
              className="mt-6 inline-block rounded-pill bg-white px-7 py-3.5 text-[12.5px] font-medium text-ink-900 transition-transform hover:scale-[1.03]"
            >
              Schedule a meeting
            </Link>
          </div>
        </Reveal>
      </main>
      <SiteFooter />
    </div>
  );
}
