import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import { getCurrentUser } from '@/lib/server/current-user';
import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';
import { Reveal } from '@/components/ui/reveal';
import { PORTFOLIO_PROJECTS } from '@/lib/portfolio-data';
import { CaseStudyGallery } from './case-study-gallery';

export function generateStaticParams() {
  return PORTFOLIO_PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = PORTFOLIO_PROJECTS.find((p) => p.slug === slug);
  if (!project) return { title: 'Project not found' };
  return {
    title: project.title,
    description: project.description,
    openGraph: { images: [{ url: project.coverImage, width: 1200, height: 630, alt: project.title }] },
  };
}

export default async function PortfolioCaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = PORTFOLIO_PROJECTS.find((p) => p.slug === slug);
  if (!project) notFound();

  const user = await getCurrentUser();
  const otherProjects = PORTFOLIO_PROJECTS.filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <div className="min-h-screen bg-warm-50">
      <SiteHeader isSignedIn={Boolean(user)} />
      <main className="mx-auto max-w-7xl px-5 pb-24 sm:px-8 lg:px-12">
        <Reveal>
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-1.5 text-[12px] text-ink-700 underline underline-offset-2"
          >
            <ArrowLeft size={13} /> Back to portfolio
          </Link>
        </Reveal>

        <div className="mt-4 grid grid-cols-1 gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <Reveal>
              <div className="relative h-72 overflow-hidden rounded-card-lg sm:h-96 lg:h-[460px]">
                <Image src={project.coverImage} alt={project.title} fill priority className="object-cover" />
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <CaseStudyGallery images={project.gallery.slice(1)} title={project.title} />
            </Reveal>
          </div>

          <Reveal delay={0.05}>
            <div className="rounded-card-lg bg-white p-6 lg:sticky lg:top-24 lg:p-8">
              <span className="rounded-pill bg-warm-100 px-3 py-1.5 text-[10px] text-ink-700">
                {project.category === 'CONTAINER' ? 'Container' : 'Residential'}
              </span>
              <h1 className="mt-3 text-[26px] font-medium text-ink-900 lg:text-[30px]">{project.title}</h1>
              <div className="mt-4 grid grid-cols-3 gap-2 text-[11.5px] text-ink-700">
                <div className="rounded-control bg-warm-100 px-3 py-2 text-center">{project.year}</div>
                <div className="rounded-control bg-warm-100 px-3 py-2 text-center">{project.location}</div>
                <div className="rounded-control bg-warm-100 px-3 py-2 text-center">
                  {project.sqft.toLocaleString()} sqft
                </div>
              </div>
              <p className="mt-5 text-[13px] leading-relaxed text-ink-700">{project.description}</p>
              <Link
                href="/designs"
                className="mt-6 block rounded-pill bg-ink-900 py-3 text-center text-[12.5px] font-medium text-white transition-transform hover:scale-[1.02]"
              >
                Browse the store
              </Link>
              <Link
                href="/contact"
                className="mt-2 block rounded-pill border border-warm-400 py-3 text-center text-[12.5px] text-ink-700 transition-colors hover:bg-warm-100"
              >
                Ask about this project
              </Link>
            </div>
          </Reveal>
        </div>

        {otherProjects.length > 0 && (
          <div className="mt-20">
            <Reveal>
              <h2 className="text-[22px] font-normal text-ink-900 sm:text-[25px]">More from the portfolio</h2>
            </Reveal>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {otherProjects.map((p) => (
                <Link key={p.slug} href={`/portfolio/${p.slug}`} className="group overflow-hidden rounded-card bg-white">
                  <div className="relative h-40 w-full overflow-hidden">
                    <Image
                      src={p.coverImage}
                      alt={p.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <div className="text-[13px] font-medium text-ink-900">{p.title}</div>
                    <div className="mt-1 text-[11px] text-ink-500">
                      {p.location} · {p.year}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
