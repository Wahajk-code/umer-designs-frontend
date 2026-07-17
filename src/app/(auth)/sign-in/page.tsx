import { Suspense } from 'react';
import type { Metadata } from 'next';
import { SignInForm } from './sign-in-form';

export const metadata: Metadata = { title: 'Sign in — Umer Designs' };

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
