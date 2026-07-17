import { Suspense } from 'react';
import type { Metadata } from 'next';
import { SignUpForm } from './sign-up-form';

export const metadata: Metadata = { title: 'Create an account — Umer Designs' };

export default function SignUpPage() {
  return (
    <Suspense>
      <SignUpForm />
    </Suspense>
  );
}
