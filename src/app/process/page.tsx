import Link from 'next/link';
import type { Metadata } from 'next';
import { CheckCircle2, MessageSquare, Paperclip, Video } from 'lucide-react';
import { getCurrentUser } from '@/lib/server/current-user';
import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';
import { Reveal, RevealGroup } from '@/components/ui/reveal';
import { ScrollCue } from '@/components/ui/scroll-cue';
import { EXTERIOR_IMAGES, INTERIOR_IMAGES, PROCESS_IMAGE } from '@/lib/stock-images';
import { ProcessStepSection } from './process-step-section';

export const metadata: Metadata = {
  title: 'How it works',
  description:
    'From browsing to move-in: buy a build-ready design, optionally request priced modifications, track every stage, and get an architect one message away throughout.',
};

const STEPS = [
  {
    title: 'Browse and buy',
    body: 'Every design in the store is priced, spec’d, and ready to build. Pay once and the full CAD + PDF set unlocks in your account instantly.',
    image: EXTERIOR_IMAGES[3],
  },
  {
    title: 'Make it yours (optional)',
    body: 'Want a bigger kitchen, an extra room, or a mirrored layout? Select changes, see one total instantly, and pay upfront — no back-and-forth quoting.',
    image: INTERIOR_IMAGES[2],
  },
  {
    title: 'Track every stage',
    body: 'Your request moves through submitted → in review → in progress → revision → delivered, with comments and shared files at every step.',
    image: PROCESS_IMAGE,
  },
  {
    title: 'Build with confidence',
    body: 'Final files land in your account for good. Book a meeting any time you want to talk through details with the architect directly.',
    image: EXTERIOR_IMAGES[5],
  },
];

const DURING_TOOLS = [
  {
    icon: MessageSquare,
    title: 'Threaded comments',
    body: 'Every modification request has its own comment thread, tied to the exact stage it was left at.',
  },
  {
    icon: Paperclip,
    title: 'Shared files',
    body: 'Preview and download files the architect shares at every stage, right from your request.',
  },
  {
    icon: Video,
    title: 'Live meetings',
    body: 'Book time directly from your request whenever a call beats a written back-and-forth.',
  },
  {
    icon: CheckCircle2,
    title: 'Visible status',
    body: 'Always know exactly which of the five stages your request is sitting in — no need to ask.',
  },
];

const PIPELINE_STAGES = [
  { label: 'Submitted & paid', done: true },
  { label: 'In review', done: true },
  { label: 'In progress — layout revision 2', current: true },
  { label: 'Revision', done: false },
  { label: 'Delivered', done: false },
];

export default async function ProcessPage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen overflow-hidden bg-warm-50">
      <SiteHeader isSignedIn={Boolean(user)} />
      <main className="mx-auto max-w-7xl px-5 pb-24 sm:px-8 lg:px-12">
        <Reveal>
          <span className="inline-block rounded-pill bg-white px-4 py-1.5 text-[11px] text-ink-700">
            How it works
          </span>
          <h1 className="mt-4 max-w-xl text-[32px] font-light leading-tight text-ink-900 sm:text-[42px] lg:text-[48px]">
            From browsing to move-in.
          </h1>
          <p className="mt-3 max-w-lg text-[13.5px] leading-relaxed text-ink-500">
            Four stages, no surprises. Here&apos;s exactly what happens at each one.
          </p>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mt-8 flex justify-center sm:justify-start">
            <ScrollCue />
          </div>
        </Reveal>

        {/* One full section per step, alternating layout, each with its own scroll-linked animation */}
        <div className="mt-4 divide-y divide-warm-300">
          {STEPS.map((step, i) => (
            <ProcessStepSection
              key={step.title}
              index={i}
              title={step.title}
              body={step.body}
              image={step.image}
              reversed={i % 2 === 1}
            />
          ))}
        </div>

        {/* Tools available at every stage */}
        <div className="mt-20">
          <Reveal>
            <h2 className="text-[26px] font-light text-ink-900 sm:text-[30px]">Built into every request</h2>
            <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-ink-500">
              None of these are add-ons — they come with every modification request, at no extra cost.
            </p>
          </Reveal>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <RevealGroup stagger={0.06} className="h-full">
              {DURING_TOOLS.map((tool) => (
                <div
                  key={tool.title}
                  className="flex h-full flex-col rounded-card bg-white p-6 transition-shadow duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.07)]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warm-100 text-ink-900">
                    <tool.icon size={18} />
                  </div>
                  <div className="mt-4 text-[13.5px] font-medium text-ink-900">{tool.title}</div>
                  <p className="mt-2 text-[12px] leading-relaxed text-ink-500">{tool.body}</p>
                </div>
              ))}
            </RevealGroup>
          </div>
        </div>

        {/* Live pipeline preview */}
        <Reveal>
          <div className="mt-24 rounded-card-lg bg-ink-900 p-8 sm:p-12">
            <div className="mx-auto max-w-md">
              <div className="text-center text-[11px] tracking-[0.14em] text-dark-500">
                WHAT YOU SEE · REQUEST #1042
              </div>
              <div className="mt-6 flex flex-col gap-4">
                {PIPELINE_STAGES.map((stage, i) => (
                  <Reveal key={stage.label} delay={i * 0.08} y={10}>
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-6 w-6 flex-none items-center justify-center rounded-full text-[10px] ${
                          stage.done
                            ? 'bg-white text-ink-900'
                            : stage.current
                              ? 'border-2 border-white'
                              : 'border border-dark-600'
                        }`}
                      >
                        {stage.done ? '✓' : ''}
                      </div>
                      <span
                        className={`text-[13px] ${stage.done || stage.current ? 'text-white' : 'text-dark-500'}`}
                      >
                        {stage.label}
                      </span>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        {/* CTA */}
        <Reveal>
          <div className="mt-24 rounded-card-lg bg-white p-8 text-center sm:p-14">
            <h2 className="text-[24px] font-light text-ink-900 sm:text-[28px]">Ready to start?</h2>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/designs"
                className="rounded-pill bg-ink-900 px-7 py-3.5 text-[12.5px] font-medium text-white transition-transform hover:scale-[1.03]"
              >
                Browse the store
              </Link>
              <Link
                href="/schedule-a-meeting"
                className="rounded-pill border border-ink-900 px-7 py-3.5 text-[12.5px] text-ink-900 transition-colors hover:bg-warm-100"
              >
                Talk to us first
              </Link>
            </div>
          </div>
        </Reveal>
      </main>
      <SiteFooter />
    </div>
  );
}
