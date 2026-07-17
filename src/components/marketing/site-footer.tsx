import Link from 'next/link';
import { Logo } from '@/components/brand/logo';

const COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: 'Explore',
    links: [
      { href: '/designs', label: 'Buy a design' },
      { href: '/portfolio', label: 'Portfolio' },
      { href: '/process', label: 'How it works' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'About' },
      { href: '/contact', label: 'Contact' },
      { href: '/schedule-a-meeting', label: 'Schedule a meeting' },
    ],
  },
  {
    title: 'Account',
    links: [
      { href: '/sign-in', label: 'Sign in' },
      { href: '/sign-up', label: 'Create an account' },
      { href: '/dashboard', label: 'Referral program' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-warm-300 px-5 py-14 sm:px-8 lg:px-12">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 sm:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo size="sm" />
          <p className="mt-4 max-w-xs text-[12px] leading-relaxed text-ink-500">
            Architect-drawn container and residential plans, bought online, in your hands today.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <div className="text-[11px] font-medium uppercase tracking-wide text-ink-500">{col.title}</div>
            <div className="mt-3 flex flex-col gap-2.5">
              {col.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[12.5px] text-ink-700 transition-colors hover:text-ink-900"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-12 max-w-7xl border-t border-warm-300 pt-6 text-[11px] text-ink-500">
        © {new Date().getFullYear()} Umer Designs — Tending your visions into reality
      </div>
    </footer>
  );
}
