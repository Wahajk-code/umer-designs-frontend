import Image from 'next/image';
import type { Metadata } from 'next';
import { Mail, Clock, MapPin } from 'lucide-react';
import { getCurrentUser } from '@/lib/server/current-user';
import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';
import { Reveal } from '@/components/ui/reveal';
import { CONTACT_IMAGE } from '@/lib/stock-images';
import { ContactForm } from './contact-form';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Questions about a design, your site, or a project already underway — send Umer Designs a message or schedule a meeting with the architect directly.',
};

const INFO = [
  { icon: Mail, title: 'Email', body: 'Real replies within a business day or two.' },
  { icon: Clock, title: 'Hours', body: 'Mon–Fri, 9am–6pm — meetings by request outside that window.' },
  { icon: MapPin, title: 'Based in', body: 'Remote-first, working with clients across the US.' },
];

export default async function ContactPage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-warm-50">
      <SiteHeader isSignedIn={Boolean(user)} />
      <main className="mx-auto max-w-7xl px-5 pb-24 sm:px-8 lg:px-12">
        <Reveal>
          <span className="inline-block rounded-pill bg-white px-4 py-1.5 text-[11px] text-ink-700">Contact</span>
          <h1 className="mt-4 max-w-xl text-[32px] font-light leading-tight text-ink-900 sm:text-[42px] lg:text-[48px]">
            Get in touch.
          </h1>
          <p className="mt-3 max-w-lg text-[13.5px] leading-relaxed text-ink-500">
            Questions about a design, your site, or a project already underway — send us a note and a real
            person will reply. For a live conversation, you can also{' '}
            <a href="/schedule-a-meeting" className="font-medium text-ink-900 underline underline-offset-2">
              schedule a meeting
            </a>
            .
          </p>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1fr_0.8fr] lg:items-start">
          <Reveal className="lg:order-1">
            <ContactForm />
          </Reveal>

          <Reveal delay={0.08} className="lg:order-2">
            <div className="relative h-64 overflow-hidden rounded-card-lg sm:h-80 lg:h-full lg:min-h-[420px]">
              <Image src={CONTACT_IMAGE} alt="Umer Designs" fill className="object-cover" />
            </div>
          </Reveal>

          <Reveal delay={0.14} className="lg:order-3">
            <div className="flex flex-col gap-3">
              {INFO.map((item) => (
                <div key={item.title} className="rounded-card bg-white p-5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-warm-100 text-ink-900">
                    <item.icon size={16} />
                  </div>
                  <div className="mt-3 text-[13px] font-medium text-ink-900">{item.title}</div>
                  <p className="mt-1 text-[11.5px] leading-relaxed text-ink-500">{item.body}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
