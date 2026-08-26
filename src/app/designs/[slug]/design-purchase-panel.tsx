'use client';

import { useMemo, useState } from 'react';
import { Design } from '@/lib/types/design';
import { formatCents } from '@/lib/client/format';
import { BuyButton } from '@/components/designs/buy-button';
import { AddToCartButton } from '@/components/designs/add-to-cart-button';

export function DesignPurchasePanel({
  design,
  isSignedIn,
}: {
  design: Design;
  isSignedIn: boolean;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const addOns = useMemo(() => design.addOns ?? [], [design.addOns]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const selectedAddOns = useMemo(
    () => addOns.filter((a) => selected.has(a.id)),
    [addOns, selected],
  );

  const total = useMemo(
    () => design.basePriceCents + selectedAddOns.reduce((sum, a) => sum + a.addedCostCents, 0),
    [design.basePriceCents, selectedAddOns],
  );

  return (
    <div>
      {addOns.length > 0 && (
        <div className="mt-2 flex flex-col gap-2">
          <div className="text-[10px] tracking-[0.12em] text-ink-500">ADD-ONS</div>
          {addOns.map((addOn) => {
            const isSelected = selected.has(addOn.id);
            return (
              <button
                key={addOn.id}
                onClick={() => toggle(addOn.id)}
                className={`flex items-center justify-between rounded-control bg-white px-4 py-3 text-left text-[13px] transition-colors ${
                  isSelected ? 'border-2 border-ink-900' : 'border border-warm-400 text-ink-500'
                }`}
              >
                <span className={isSelected ? 'text-ink-900' : ''}>
                  {isSelected ? '✓ ' : ''}
                  {addOn.label}
                  {addOn.description && (
                    <span className="ml-1.5 text-[11px] text-ink-400">{addOn.description}</span>
                  )}
                </span>
                <span className="font-medium text-ink-900">+{formatCents(addOn.addedCostCents)}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="text-[13px] text-ink-700">
          Total{selectedAddOns.length > 0 ? ` (base + ${selectedAddOns.length} add-on${selectedAddOns.length === 1 ? '' : 's'})` : ''}
        </span>
        <span className="text-[18px] font-medium text-ink-900">{formatCents(total)}</span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <BuyButton
          designId={design.id}
          designSlug={design.slug}
          isSignedIn={isSignedIn}
          addOnIds={Array.from(selected)}
        />
        <AddToCartButton
          design={design}
          selectedAddOns={selectedAddOns.map((a) => ({
            id: a.id,
            label: a.label,
            addedCostCents: a.addedCostCents,
          }))}
        />
      </div>
    </div>
  );
}
