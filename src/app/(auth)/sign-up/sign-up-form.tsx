'use client';

import { useState, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch, ApiError } from '@/lib/client/api';
import { TextField } from '@/components/ui/text-field';
import { Button } from '@/components/ui/button';
import { SafeUser } from '@/lib/types/user';

export function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState(searchParams.get('ref') ?? '');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiFetch<{ user: SafeUser }>('/api/auth/register', {
        method: 'POST',
        body: {
          firstName,
          lastName,
          email,
          password,
          referralCode: referralCode || undefined,
        },
      });
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="text-[22px] font-light text-ink-900">Create your account</h1>
      <p className="mt-2 text-[13px] leading-relaxed text-ink-500">
        Buy plans, request modifications, and track every stage in one place.
      </p>
      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="First name"
            name="firstName"
            autoComplete="given-name"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <TextField
            label="Last name"
            name="lastName"
            autoComplete="family-name"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
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
          autoComplete="new-password"
          required
          minLength={10}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <TextField
          label="Referral code (optional)"
          name="referralCode"
          value={referralCode}
          onChange={(e) => setReferralCode(e.target.value)}
        />
        {error && <p className="text-[12px] text-red-600">{error}</p>}
        <Button type="submit" loading={loading} className="mt-2 w-full">
          Create account
        </Button>
      </form>
      <p className="mt-6 text-center text-[12px] text-ink-500">
        Already have an account?{' '}
        <Link href="/sign-in" className="font-medium text-ink-900 underline underline-offset-2">
          Sign in
        </Link>
      </p>
    </>
  );
}
