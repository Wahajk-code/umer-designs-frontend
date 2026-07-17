'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch, ApiError } from '@/lib/client/api';
import { Order } from '@/lib/types/order';
import { ModificationOption } from '@/lib/types/modification';
import { formatCents } from '@/lib/client/format';
import { Button } from '@/components/ui/button';

export function NewModificationForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const designId = searchParams.get('designId');

  const [order, setOrder] = useState<Order | null | undefined>(undefined);
  const [options, setOptions] = useState<ModificationOption[] | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!designId) return;
    apiFetch<Order[]>('/api/orders').then((orders) => {
      setOrder(orders.find((o) => o.designId === designId && o.status === 'PAID') ?? null);
    });
    apiFetch<ModificationOption[]>('/api/modifications/options').then(setOptions);
  }, [designId]);

  const total = useMemo(() => {
    if (!order || !options) return 0;
    const optionsTotal = options
      .filter((o) => selected.has(o.id))
      .reduce((sum, o) => sum + o.addedCostCents, 0);
    return order.design.basePriceCents + optionsTotal;
  }, [order, options, selected]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSubmit() {
    if (!designId || selected.size === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const { checkoutUrl } = await apiFetch<{ checkoutUrl: string }>('/api/modifications/checkout', {
        method: 'POST',
        body: { designId, selectedOptionIds: Array.from(selected) },
      });
      window.location.href = checkoutUrl;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not start checkout.');
      setSubmitting(false);
    }
  }

  if (!designId) {
    return <p className="text-[13px] text-ink-500">Choose a design from your dashboard to get started.</p>;
  }

  if (order === undefined || options === null) {
    return <div className="mt-4 h-40 animate-pulse rounded-card bg-warm-150" />;
  }

  if (order === null) {
    return (
      <div>
        <p className="text-[13px] text-ink-500">
          You can only request a modification on a design you already own.
        </p>
        <Link href="/dashboard" className="mt-3 inline-block text-[12px] text-ink-900 underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg">
      <p className="text-[12px] text-ink-500">
        {order.design.title} · base {formatCents(order.design.basePriceCents)}
      </p>

      <div className="mt-4 flex flex-col gap-2">
        {options.map((option) => {
          const isSelected = selected.has(option.id);
          return (
            <button
              key={option.id}
              onClick={() => toggle(option.id)}
              className={`flex items-center justify-between rounded-control bg-white px-4 py-3 text-left text-[13px] transition-colors ${
                isSelected ? 'border-2 border-ink-900' : 'border border-warm-400 text-ink-500'
              }`}
            >
              <span className={isSelected ? 'text-ink-900' : ''}>
                {isSelected ? '✓ ' : ''}
                {option.label}
              </span>
              <span className="font-medium text-ink-900">+{formatCents(option.addedCostCents)}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 rounded-card-lg bg-ink-900 p-5 text-white">
        <div className="flex justify-between text-[13px]">
          <span>Total due today</span>
          <span className="font-semibold">{formatCents(total)}</span>
        </div>
        <p className="mt-1 text-[10.5px] text-dark-500">
          base {formatCents(order.design.basePriceCents)} + changes {formatCents(total - order.design.basePriceCents)} · one payment, work starts right away
        </p>
        {error && <p className="mt-3 text-[11.5px] text-red-300">{error}</p>}
        <Button
          onClick={handleSubmit}
          disabled={selected.size === 0 || submitting}
          className="mt-4 w-full !bg-white !text-ink-900 hover:!bg-warm-100"
        >
          {submitting ? 'Redirecting to checkout…' : `Pay ${formatCents(total)} & start →`}
        </Button>
      </div>

      <button onClick={() => router.push('/dashboard')} className="mt-4 text-[12px] text-ink-500 underline">
        Cancel
      </button>
    </div>
  );
}
