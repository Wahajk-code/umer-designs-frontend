import { Suspense } from 'react';
import type { Metadata } from 'next';
import { SignInForm } from './sign-in-form';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to your Umer Designs account to track requests, message the architect, and re-download your files.',
  robots: { index: false, follow: true },
};

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
