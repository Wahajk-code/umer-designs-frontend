'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { apiFetch } from '@/lib/client/api';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/client/cn';

export function SignOutButton({ dark = false }: { dark?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } finally {
      router.push('/');
      router.refresh();
    }
  }

  return (
    <Button
      variant="ghost"
      loading={loading}
      onClick={handleSignOut}
      className={cn(dark && 'text-dark-500 hover:bg-white/5 hover:text-white')}
    >
      Sign out
    </Button>
  );
}
