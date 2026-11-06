/**
 * "Where did the user come from?" for pages reachable from several places
 * (e.g. a design page opened from the store vs. from My Designs). The origin
 * travels as `?from=/path`; only same-site relative paths are honoured.
 */
export interface BackLink {
  href: string;
  label: string;
}

const RULES: { test: (p: string) => boolean; label: string }[] = [
  { test: (p) => p.startsWith('/dashboard/designs'), label: 'Back to My Designs' },
  { test: (p) => /^\/dashboard\/requests\/[^/?#]+/.test(p), label: 'Back to your request' },
  { test: (p) => p.startsWith('/dashboard/requests'), label: 'Back to Requests' },
  { test: (p) => p.startsWith('/dashboard'), label: 'Back to dashboard' },
  { test: (p) => p.startsWith('/admin'), label: 'Back to admin' },
  { test: (p) => p.startsWith('/portfolio'), label: 'Back to portfolio' },
  { test: (p) => p === '/' , label: 'Back to homepage' },
  { test: (p) => p.startsWith('/designs'), label: 'Back to store' },
];

export function resolveBack(from: string | string[] | undefined | null, fallback: BackLink = { href: '/designs', label: 'Back to store' }): BackLink {
  const raw = Array.isArray(from) ? from[0] : from;
  if (!raw || !raw.startsWith('/') || raw.startsWith('//') || raw.includes('\\')) return fallback;
  const rule = RULES.find((r) => r.test(raw));
  return rule ? { href: raw, label: rule.label } : fallback;
}

/** Append `from` to a link so the destination can offer the right "Back" target. */
export function withFrom(href: string, from: string): string {
  return `${href}${href.includes('?') ? '&' : '?'}from=${encodeURIComponent(from)}`;
}
