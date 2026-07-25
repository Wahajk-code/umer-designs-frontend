import { Suspense } from 'react';
import type { Metadata } from 'next';
import { SignUpForm } from './sign-up-form';

export const metadata: Metadata = {
  title: 'Create an account',
  description: 'Create a free Umer Designs account to buy plans, request modifications, and track your project from purchase to delivery.',
  robots: { index: false, follow: true },
};

export default function SignUpPage() {
  return (
    <Suspense>
      <SignUpForm />
    </Suspense>
  );
}
