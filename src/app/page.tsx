import Link from 'next/link';
import Image from 'next/image';
import { Download, Wand2, Users, ArrowRight, Star } from 'lucide-react';
import { getCurrentUser } from '@/lib/server/current-user';
import { callBackend } from '@/lib/server/backend-client';
import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';
import { DesignCard } from '@/components/designs/design-card';
import { Reveal, RevealGroup } from '@/components/ui/reveal';
import { Accordion } from '@/components/ui/accordion';
import { HERO_IMAGE, PORTFOLIO_IMAGES } from '@/lib/stock-images';
import { PORTFOLIO_PROJECTS } from '@/lib/portfolio-data';
import { PaginatedDesigns } from '@/lib/types/design';

async function getPopularDesigns() {
  try {
    const data = await callBackend<PaginatedDesigns>('/designs?sort=newest&pageSize=6');
    return data.designs;
  } catch {
    return [];
  }
}

const FEATURES = [
  {
    icon: Download,
    title: 'Instant download',
    body: 'Full CAD + PDF construction set the moment you pay — yours forever, no waiting on a quote.',
  },
  {
    icon: Wand2,
    title: 'Changes, priced upfront',
    body: 'Pick your modifications from a real menu, see one total instantly, and pay once — no back-and-forth.',
  },
  {
    icon: Users,
    title: 'A real architect with you',
    body: 'Meetings, direct messages, and a shared whiteboard, built into every request from start to delivery.',
  },
];

const STATS = [
  { value: '120+', label: 'Designs sold' },
  { value: '38', label: 'States built in' },
  { value: '4.9 / 5', label: 'Average rating' },
  { value: '~14 days', label: 'Avg. modification turnaround' },
];

const STEPS = [
  { title: 'Browse and buy', body: 'Every design is priced and ready to build. Pay once, files unlock instantly.' },
  { title: 'Make it yours', body: 'Add a room, resize, rework the layout — see one total before you pay.' },
  { title: 'Track every stage', body: 'Submitted → in review → in progress → revision → delivered, with a live thread.' },
  { title: 'Build with confidence', body: 'Final files are yours for good. Book a meeting any time you need us.' },
];

const TESTIMONIALS = [
  {
    quote:
      'We bought Fold House as-is and had ground broken within six weeks. Having the full CAD set on day one changed everything.',
    name: 'Renee A.',
    location: 'Bend, OR',
  },
  {
    quote:
      'The modification pricing was the whole reason we went with Umer — no waiting a week for a quote, just pick and pay.',
    name: 'Marcus T.',
    location: 'Marfa, TX',
  },
  {
    quote:
      'The shared whiteboard during revisions was genuinely useful — we sketched the kitchen layout together in real time.',
    name: 'Priya K.',
    location: 'Tucson, AZ',
  },
];

const FAQS = [
  {
    question: 'What do I actually receive when I buy a design?',
    answer:
      'A complete, build-ready CAD and PDF construction set — the same files a contractor needs to pull permits and break ground. Files unlock in your account the moment payment clears and are yours permanently.',
  },
  {
    question: 'How does pricing work for modifications?',
    answer:
      'Every design has a menu of priced add-ons (extra rooms, resizing, layout changes). Select what you want and you see one combined total before paying — nothing is quoted after the fact.',
  },
  {
    question: 'How long does a modification take?',
    answer:
      'Most requests move from submitted to delivered in about two weeks, with visible status updates and a live comment thread at every stage.',
  },
  {
    question: 'Can I talk to the architect directly?',
    answer:
      'Yes — every purchase and modification request includes direct messaging, a shared whiteboard for sketching changes together, and the option to book a live meeting.',
  },
  {
    question: 'Do you offer a referral program?',
    answer:
      'Yes. Every account gets a unique referral link — when someone you refer completes their first purchase, you earn a reward automatically.',
  },
];

export default async function Home() {
  const [user, popularDesigns] = await Promise.all([getCurrentUser(), getPopularDesigns()]);
  const featuredProjects = PORTFOLIO_PROJECTS.slice(0, 3);

  return (
    <div className="min-h-screen bg-warm-50">
      <SiteHeader isSignedIn={Boolean(user)} />

      <main className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        {/* Hero */}
        <section className="overflow-hidden rounded-card-lg">
          <div className="relative h-[460px] sm:h-[560px] lg:h-[620px]">
            <Image src={HERO_IMAGE} alt="A modern home at golden hour" fill priority className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 px-6 pb-9 sm:px-12 sm:pb-14">
              <span className="inline-block rounded-pill bg-white/15 px-4 py-1.5 text-[11px] tracking-wide text-white backdrop-blur-sm">
                Architect-drawn · Ready to build
              </span>
              <h1 className="mt-4 max-w-2xl text-[36px] font-light leading-tight text-white sm:text-[52px] lg:text-[60px]">
                A home you can <span className="font-medium">start building</span> this month.
              </h1>
              <p className="mt-4 max-w-lg text-[13.5px] leading-relaxed text-white/85 sm:text-[15px]">
                Architect-drawn container and residential plans, bought online, in your hands today —
                with the architect one message away for everything after.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/designs"
                  className="rounded-pill bg-white px-7 py-3.5 text-[13px] font-medium text-ink-900 transition-transform hover:scale-[1.03]"
                >
                  Browse the store
                </Link>
                <Link
                  href="/process"
                  className="rounded-pill border border-white/70 px-7 py-3.5 text-[13px] text-white transition-colors hover:bg-white/10"
                >
                  How it works
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats bar */}
        <Reveal>
          <section className="-mt-8 relative z-10 mx-4 grid grid-cols-2 gap-px overflow-hidden rounded-card-lg bg-warm-300 shadow-[0_10px_30px_rgba(0,0,0,0.08)] sm:mx-8 sm:grid-cols-4 lg:mx-16">
            {STATS.map((stat) => (
              <div key={stat.label} className="bg-white px-4 py-6 text-center sm:py-7">
                <div className="text-[22px] font-medium text-ink-900 sm:text-[26px]">{stat.value}</div>
                <div className="mt-1 text-[10.5px] text-ink-500 sm:text-[11px]">{stat.label}</div>
              </div>
            ))}
          </section>
        </Reveal>

        {/* Feature cards */}
        <section className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <RevealGroup>
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-card bg-white p-6 transition-shadow duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.07)]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warm-100 text-ink-900">
                  <f.icon size={18} />
                </div>
                <div className="mt-4 text-[14.5px] font-medium text-ink-900">{f.title}</div>
                <div className="mt-2 text-[12.5px] leading-relaxed text-ink-500">{f.body}</div>
              </div>
            ))}
          </RevealGroup>
        </section>

        {/* Popular designs */}
        <section className="mt-20">
          <Reveal>
            <div className="mb-6 flex items-baseline justify-between gap-4">
              <div>
                <h2 className="text-[26px] font-normal text-ink-900 sm:text-[30px]">Popular this month</h2>
                <p className="mt-1.5 text-[13px] text-ink-500">Ready-to-build sets, priced and published today.</p>
              </div>
              <Link
                href="/designs"
                className="hidden shrink-0 items-center gap-1.5 rounded-pill bg-white px-5 py-2.5 text-[12.5px] text-ink-700 transition-colors hover:bg-warm-100 sm:flex"
              >
                All designs <ArrowRight size={14} />
              </Link>
            </div>
          </Reveal>
          {popularDesigns.length > 0 ? (
            <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
              <RevealGroup stagger={0.06}>
                {popularDesigns.map((design) => (
                  <DesignCard key={design.id} design={design} />
                ))}
              </RevealGroup>
            </div>
          ) : (
            <div className="rounded-card-lg bg-white p-10 text-center">
              <p className="text-[13px] text-ink-500">
                New designs are being added — check back soon, or browse the full store.
              </p>
            </div>
          )}
          <Link
            href="/designs"
            className="mt-6 flex items-center justify-center gap-1.5 rounded-pill bg-white px-5 py-3 text-[12.5px] text-ink-700 sm:hidden"
          >
            All designs <ArrowRight size={14} />
          </Link>
        </section>

        {/* How it works teaser */}
        <section className="mt-20">
          <Reveal>
            <h2 className="text-[26px] font-normal text-ink-900 sm:text-[30px]">From browsing to move-in</h2>
            <p className="mt-1.5 max-w-lg text-[13px] text-ink-500">Four stages, no surprises along the way.</p>
          </Reveal>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <RevealGroup stagger={0.08}>
              {STEPS.map((step, i) => (
                <div key={step.title} className="rounded-card bg-white p-6">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-900 text-[13px] text-white">
                    {i + 1}
                  </div>
                  <div className="mt-4 text-[13.5px] font-medium text-ink-900">{step.title}</div>
                  <p className="mt-2 text-[12px] leading-relaxed text-ink-500">{step.body}</p>
                </div>
              ))}
            </RevealGroup>
          </div>
          <Reveal delay={0.1}>
            <Link
              href="/process"
              className="mt-6 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-900 underline underline-offset-4"
            >
              See the full process <ArrowRight size={14} />
            </Link>
          </Reveal>
        </section>

        {/* Portfolio teaser */}
        <section className="mt-20">
          <Reveal>
            <div className="mb-6 flex items-baseline justify-between gap-4">
              <div>
                <h2 className="text-[26px] font-normal text-ink-900 sm:text-[30px]">Recently built</h2>
                <p className="mt-1.5 text-[13px] text-ink-500">A few projects clients have taken from file to foundation.</p>
              </div>
              <Link
                href="/portfolio"
                className="hidden shrink-0 items-center gap-1.5 rounded-pill bg-white px-5 py-2.5 text-[12.5px] text-ink-700 transition-colors hover:bg-warm-100 sm:flex"
              >
                Full portfolio <ArrowRight size={14} />
              </Link>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <RevealGroup stagger={0.08}>
              {featuredProjects.map((project) => (
                <Link
                  key={project.slug}
                  href={`/portfolio/${project.slug}`}
                  className="group overflow-hidden rounded-card bg-white"
                >
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image
                      src={project.coverImage}
                      alt={project.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute left-3 top-3 rounded-pill bg-ink-900 px-3 py-1.5 text-[10px] text-white">
                      {project.category === 'CONTAINER' ? 'Container' : 'Residential'}
                    </span>
                  </div>
                  <div className="p-4">
                    <div className="text-[13.5px] font-medium text-ink-900">{project.title}</div>
                    <div className="mt-1 text-[11px] text-ink-500">
                      {project.location} · {project.year}
                    </div>
                  </div>
                </Link>
              ))}
            </RevealGroup>
          </div>
        </section>

        {/* Testimonials */}
        <section className="mt-20">
          <Reveal>
            <h2 className="text-[26px] font-normal text-ink-900 sm:text-[30px]">What clients say</h2>
          </Reveal>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <RevealGroup stagger={0.08}>
              {TESTIMONIALS.map((t) => (
                <div key={t.name} className="flex flex-col rounded-card bg-white p-6">
                  <div className="flex gap-0.5 text-ink-900">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={13} fill="currentColor" strokeWidth={0} />
                    ))}
                  </div>
                  <p className="mt-4 flex-1 text-[12.5px] leading-relaxed text-ink-700">&ldquo;{t.quote}&rdquo;</p>
                  <div className="mt-5 text-[12px] font-medium text-ink-900">{t.name}</div>
                  <div className="text-[11px] text-ink-500">{t.location}</div>
                </div>
              ))}
            </RevealGroup>
          </div>
        </section>

        {/* Referral + Dark CTA */}
        <section className="mt-20 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.1fr]">
          <Reveal>
            <div className="flex h-full flex-col justify-center rounded-card-lg bg-white p-8 sm:p-10">
              <h2 className="text-[22px] font-normal text-ink-900 sm:text-[25px]">Know someone building?</h2>
              <p className="mt-3 text-[13px] leading-relaxed text-ink-500">
                Share your referral link — when they complete their first purchase, you earn a reward
                automatically. No codes to track, no forms to fill out.
              </p>
              <Link
                href={user ? '/dashboard' : '/sign-up'}
                className="mt-6 inline-block w-fit rounded-pill border border-ink-900 px-6 py-3 text-[12.5px] font-medium text-ink-900 transition-colors hover:bg-warm-100"
              >
                {user ? 'Get my referral link' : 'Create an account'}
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="grid h-full grid-cols-1 gap-8 rounded-card-lg bg-ink-900 p-8 sm:grid-cols-2 sm:p-11">
              <div>
                <h2 className="text-[22px] font-normal text-white sm:text-[25px]">Own a design? Make it yours.</h2>
                <p className="mt-3 text-[13px] leading-loose text-dark-500">
                  Add a room, resize, rework the layout. See the cost instantly, pay one total, then follow
                  every stage — with meetings and a shared whiteboard along the way.
                </p>
                <Link
                  href={user ? '/dashboard' : '/sign-up'}
                  className="mt-5 inline-block rounded-pill bg-white px-6 py-3 text-[12.5px] font-medium text-ink-900 transition-transform hover:scale-[1.03]"
                >
                  Request a modification
                </Link>
              </div>
              <div className="rounded-card bg-dark-800 p-6">
                <div className="text-[10px] tracking-[0.14em] text-dark-500">TRACKING · REQUEST #1042</div>
                <div className="mt-3 flex flex-col gap-3">
                  {[
                    { label: 'Submitted & paid', done: true },
                    { label: 'In review', done: true },
                    { label: 'In progress — layout revision 2', current: true },
                    { label: 'Delivered', done: false },
                  ].map((step) => (
                    <div key={step.label} className="flex items-center gap-3">
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                          step.done
                            ? 'bg-white text-ink-900'
                            : step.current
                              ? 'border-2 border-white'
                              : 'border border-dark-600'
                        }`}
                      >
                        {step.done ? '✓' : ''}
                      </div>
                      <span className={`text-[12px] ${step.done || step.current ? 'text-white' : 'text-dark-500'}`}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        {/* FAQ */}
        <section className="mt-20 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.4fr]">
          <Reveal>
            <div>
              <h2 className="text-[26px] font-normal text-ink-900 sm:text-[30px]">Common questions</h2>
              <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-ink-500">
                Can&apos;t find what you&apos;re looking for?{' '}
                <Link href="/contact" className="font-medium text-ink-900 underline underline-offset-2">
                  Send us a message
                </Link>{' '}
                and we&apos;ll get back to you within a day or two.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <Accordion items={FAQS} />
          </Reveal>
        </section>

        {/* Closing image strip */}
        <Reveal>
          <section className="my-20 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {PORTFOLIO_IMAGES.slice(0, 4).map((src, i) => (
              <div key={i} className="relative h-32 overflow-hidden rounded-card sm:h-40">
                <Image src={src} alt="Umer Designs project" fill className="object-cover" />
              </div>
            ))}
          </section>
        </Reveal>
      </main>

      <SiteFooter />
    </div>
  );
}
