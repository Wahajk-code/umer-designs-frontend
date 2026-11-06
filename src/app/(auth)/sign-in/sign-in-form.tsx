'use client';

import { useState, useTransition, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch, ApiError } from '@/lib/client/api';
import { TextField } from '@/components/ui/text-field';
import { Button } from '@/components/ui/button';
import { SafeUser } from '@/lib/types/user';

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [navigating, startTransition] = useTransition();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { user } = await apiFetch<{ user: SafeUser }>('/api/auth/login', {
        method: 'POST',
        body: { email, password },
      });
      const requested = searchParams.get('next');
      // Only follow same-site relative paths (no //evil.com open redirects).
      const safeNext = requested && requested.startsWith('/') && !requested.startsWith('//') ? requested : null;
      // Admins go straight to the admin panel; clients to their dashboard (or where they were headed).
      const next =
        user?.role === 'ADMIN'
          ? safeNext?.startsWith('/admin')
            ? safeNext
            : '/admin'
          : safeNext && !safeNext.startsWith('/admin')
            ? safeNext
            : '/dashboard';
      // Keep "Signing in…" on screen until the destination has rendered.
      startTransition(() => {
        router.push(next);
        router.refresh();
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="text-[22px] font-light text-ink-900">Welcome back</h1>
      <p className="mt-2 text-[13px] leading-relaxed text-ink-500">
        Sign in to track requests, message the architect, and re-download your files.
      </p>
      <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-4">
        <TextField
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Password"
          type="password"
          name="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-[12px] text-red-600">{error}</p>}
        <Button type="submit" loading={loading || navigating} loadingText="Signing in…" className="mt-2 w-full">
          Sign in
        </Button>
      </form>
      <p className="mt-6 text-center text-[12px] text-ink-500">
        New here?{' '}
        <Link href="/sign-up" className="font-medium text-ink-900 underline underline-offset-2">
          Create an account
        </Link>
      </p>
    </>
  );
}
