'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Check, CheckCircle2, ClipboardCheck, Download, Wrench } from 'lucide-react';
import { Design } from '@/lib/types/design';
import { ModificationOption } from '@/lib/types/modification';
import { Order } from '@/lib/types/order';
import { formatCents } from '@/lib/client/format';
import { apiFetch } from '@/lib/client/api';
import { cn } from '@/lib/client/cn';
import { BuyButton } from '@/components/designs/buy-button';
import { AddToCartButton } from '@/components/designs/add-to-cart-button';
import { useCheckoutCancelledToast } from '@/components/checkout/checkout-return';
import { RequestChangesModal } from '@/components/modifications/request-changes-modal';

function ChoiceRow({
  selected,
  onToggle,
  label,
  description,
  priceCents,
}: {
  selected: boolean;
  onToggle: () => void;
  label: string;
  description?: string | null;
  priceCents: number;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      className={cn(
        'flex w-full items-center gap-3 rounded-control border bg-white px-4 py-3 text-left transition-all',
        selected ? 'border-ink-900 shadow-[0_0_0_1px_var(--color-ink-900)]' : 'border-warm-400 hover:border-ink-500',
      )}
    >
      <span
        className={cn(
          'flex h-5 w-5 flex-none items-center justify-center rounded-md border transition-colors',
          selected ? 'border-ink-900 bg-ink-900 text-white' : 'border-warm-500',
        )}
      >
        {selected && <Check size={13} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] text-ink-900">{label}</span>
        {description && <span className="block text-[11px] text-ink-500">{description}</span>}
      </span>
      <span className="text-[13px] font-medium text-ink-900">+{formatCents(priceCents)}</span>
    </button>
  );
}

export function DesignPurchasePanel({ design, isSignedIn }: { design: Design; isSignedIn: boolean }) {
  useCheckoutCancelledToast();
  const addOns = useMemo(() => design.addOns ?? [], [design.addOns]);
  const [selectedAddOns, setSelectedAddOns] = useState<Set<string>>(new Set());
  const [selectedMods, setSelectedMods] = useState<Set<string>>(new Set());
  const [options, setOptions] = useState<ModificationOption[]>([]);
  const [owned, setOwned] = useState<boolean | null>(isSignedIn ? null : false);
  const [requestOpen, setRequestOpen] = useState(false);

  useEffect(() => {
    apiFetch<ModificationOption[]>('/api/modifications/options').then(setOptions).catch(() => setOptions([]));
  }, []);

  useEffect(() => {
    if (!isSignedIn) return;
    apiFetch<Order[]>('/api/orders')
      .then((orders) => setOwned(orders.some((o) => o.designId === design.id && o.status === 'PAID')))
      .catch(() => setOwned(false));
  }, [isSignedIn, design.id]);

  const toggle = (setter: typeof setSelectedAddOns) => (id: string) =>
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const chosenAddOns = addOns.filter((a) => selectedAddOns.has(a.id));
  const chosenMods = options.filter((o) => selectedMods.has(o.id));
  const addOnsCents = chosenAddOns.reduce((s, a) => s + a.addedCostCents, 0);
  const modsCents = chosenMods.reduce((s, m) => s + m.addedCostCents, 0);
  const total = design.basePriceCents + addOnsCents + modsCents;

  if (owned === null) {
    return <div className="mt-4 h-24 animate-pulse rounded-card bg-warm-150" />;
  }

  if (owned) {
    return (
      <div id="customize" className="mt-4 scroll-mt-24 rounded-card bg-warm-50 p-5">
        <div className="flex items-center gap-2 text-[14px] font-medium text-ink-900">
          <CheckCircle2 size={17} /> You own this plan
        </div>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-700">
          Your files are in your dashboard. Need it changed? Request changes — you only pay for the changes, and
          you&apos;ll track every step with the architect.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setRequestOpen(true)}
            className="flex items-center gap-2 rounded-pill bg-ink-900 px-6 py-3 text-[13px] font-medium text-white transition-colors hover:bg-ink-950"
          >
            <Wrench size={14} /> Request changes
          </button>
          <Link
            href="/dashboard/designs"
            className="flex items-center gap-2 rounded-pill border border-ink-900 px-6 py-3 text-[13px] text-ink-900 transition-colors hover:bg-warm-100"
          >
            <Download size={14} /> Download files
          </Link>
        </div>
        <RequestChangesModal
          open={requestOpen}
          onClose={() => setRequestOpen(false)}
          designs={[design]}
          initialDesignId={design.id}
        />
      </div>
    );
  }

  return (
    <div>
      {addOns.length > 0 && (
        <div className="mt-5">
          <div className="text-[10px] tracking-[0.12em] text-ink-500">PLAN ADD-ONS</div>
          <div className="mt-2 flex flex-col gap-2">
            {addOns.map((a) => (
              <ChoiceRow
                key={a.id}
                selected={selectedAddOns.has(a.id)}
                onToggle={() => toggle(setSelectedAddOns)(a.id)}
                label={a.label}
                description={a.description}
                priceCents={a.addedCostCents}
              />
            ))}
          </div>
        </div>
      )}

      {options.length > 0 && (
        <div id="customize" className="mt-6 scroll-mt-24 rounded-card border border-dashed border-warm-500 p-4">
          <div className="flex items-center gap-2 text-[13px] font-medium text-ink-900">
            <Wrench size={14} /> Customise this plan <span className="font-normal text-ink-500">(optional)</span>
          </div>
          <p className="mt-1 text-[11.5px] text-ink-500">
            Pick changes now and pay in the same checkout. The architect starts right away and you track progress
            from your dashboard.
          </p>
          <div className="mt-3 flex flex-col gap-2">
            {options.map((o) => (
              <ChoiceRow
                key={o.id}
                selected={selectedMods.has(o.id)}
                onToggle={() => toggle(setSelectedMods)(o.id)}
                label={o.label}
                description={o.description}
                priceCents={o.addedCostCents}
              />
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 rounded-card bg-warm-50 p-4 text-[12.5px] text-ink-700">
        <div className="flex justify-between">
          <span>Plan</span>
          <span>{formatCents(design.basePriceCents)}</span>
        </div>
        {addOnsCents > 0 && (
          <div className="mt-1 flex justify-between">
            <span>Add-ons ({chosenAddOns.length})</span>
            <span>+{formatCents(addOnsCents)}</span>
          </div>
        )}
        {modsCents > 0 && (
          <div className="mt-1 flex justify-between">
            <span>Plan changes ({chosenMods.length})</span>
            <span>+{formatCents(modsCents)}</span>
          </div>
        )}
        <div className="mt-2 flex items-center justify-between border-t border-warm-300 pt-2">
          <span className="font-medium text-ink-900">Total</span>
          <span className="text-[19px] font-medium text-ink-900">{formatCents(total)}</span>
        </div>
        {chosenMods.length > 0 && (
          <p className="mt-2 flex items-center gap-1.5 text-[11px] text-ink-500">
            <ClipboardCheck size={12} /> Your changes become a tracked request right after payment.
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <BuyButton
          designId={design.id}
          designSlug={design.slug}
          isSignedIn={isSignedIn}
          addOnIds={Array.from(selectedAddOns)}
          modificationOptionIds={Array.from(selectedMods)}
        />
        <AddToCartButton
          design={design}
          selectedAddOns={chosenAddOns.map((a) => ({ id: a.id, label: a.label, addedCostCents: a.addedCostCents }))}
          selectedModifications={chosenMods.map((m) => ({ id: m.id, label: m.label, addedCostCents: m.addedCostCents }))}
        />
      </div>
    </div>
  );
}
