import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { callBackend, BackendError } from '@/lib/server/backend-client';
import { getCurrentUser } from '@/lib/server/current-user';
import { Design } from '@/lib/types/design';
import { formatCents, formatCompactCents } from '@/lib/client/format';
import { Logo } from '@/components/brand/logo';
import { BuyButton } from '@/components/designs/buy-button';

async function getDesign(slug: string): Promise<Design | null> {
  try {
    return await callBackend<Design>(`/designs/${encodeURIComponent(slug)}`);
  } catch (err) {
    if (err instanceof BackendError && err.statusCode === 404) return null;
    throw err;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const design = await getDesign(slug);
  return { title: design ? `${design.title} — Umer Designs` : 'Design not found' };
}

export default async function DesignDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [design, user] = await Promise.all([getDesign(slug), getCurrentUser()]);
  if (!design) notFound();

  const images = [design.coverImageUrl, ...design.galleryUrls].filter(Boolean);

  return (
    <div className="min-h-screen bg-warm-50">
      <header className="flex items-center justify-between px-5 py-4 sm:px-10">
        <Link href="/">
          <Logo size="sm" withTagline={false} />
        </Link>
        <Link href="/designs" className="text-[12px] text-ink-700 underline underline-offset-2">
          ← Back to store
        </Link>
      </header>

      <main className="mx-auto max-w-4xl px-5 pb-24 sm:px-10">
        <div className="grid grid-cols-4 gap-1.5 overflow-hidden rounded-card-lg">
          <div className="relative col-span-4 h-[280px] sm:h-[360px]">
            {images[0] ? (
              <Image src={images[0]} alt={design.title} fill className="object-cover" priority />
            ) : (
              <div className="placeholder-stripes h-full w-full" />
            )}
          </div>
          {images.slice(1, 5).map((url, i) => (
            <div key={i} className="relative col-span-1 h-[70px] sm:h-[90px]">
              <Image src={url} alt="" fill className="object-cover" />
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="text-[26px] font-medium text-ink-900">{design.title}</h1>
          <span className="text-[20px] text-ink-900">{formatCents(design.basePriceCents)}</span>
        </div>

        <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-ink-500">
          <span className="rounded-pill bg-white px-3 py-1.5">{design.bedrooms} bed</span>
          <span className="rounded-pill bg-white px-3 py-1.5">{design.bathrooms} bath</span>
          <span className="rounded-pill bg-white px-3 py-1.5">{design.sqft.toLocaleString()} sq ft</span>
          <span className="rounded-pill bg-white px-3 py-1.5">
            ≈ {formatCompactCents(design.estimatedBuildCents)} build
          </span>
        </div>

        <p className="mt-6 max-w-2xl text-[13px] leading-relaxed text-ink-700">{design.description}</p>

        <div className="mt-8 rounded-card-lg bg-white p-6">
          <div className="text-[10px] tracking-[0.12em] text-ink-500">INCLUDED</div>
          <p className="mt-2 text-[12.5px] leading-relaxed text-ink-700">
            Full CAD + PDF plan set, delivered instantly to your account the moment payment
            confirms — yours to re-download forever.
          </p>
          <BuyButton designId={design.id} designSlug={design.slug} isSignedIn={Boolean(user)} />
        </div>
      </main>
    </div>
  );
}
