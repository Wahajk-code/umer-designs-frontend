'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, ChevronLeft, ClipboardCheck } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/client/api';
import { formatCents } from '@/lib/client/format';
import { ModificationOption } from '@/lib/types/modification';
import { Modal, ModalCloseButton } from '@/components/ui/modal';
import { SafeImage as Image } from '@/components/ui/safe-image';
import { fallbackImageFor } from '@/lib/stock-images';
import { cn } from '@/lib/client/cn';

export interface OwnedDesign {
  id: string;
  title: string;
  slug: string;
  coverImageUrl: string;
}

/**
 * Post-purchase change request, as a modal (from My Designs, the overview,
 * Requests, or the design page). The plan is already owned, so only the
 * selected changes are charged. After payment Stripe returns to the
 * dashboard, which opens the new request's tracking page.
 */
export function RequestChangesModal({
  open,
  onClose,
  designs,
  initialDesignId,
}: {
  open: boolean;
  onClose: () => void;
  designs: OwnedDesign[];
  initialDesignId?: string;
}) {
  const reduce = useReducedMotion();
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [options, setOptions] = useState<ModificationOption[] | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const designId = pickedId ?? initialDesignId ?? (designs.length === 1 ? designs[0].id : null);
  const design = designs.find((d) => d.id === designId) ?? null;

  useEffect(() => {
    if (!open || options) return;
    apiFetch<ModificationOption[]>('/api/modifications/options')
      .then(setOptions)
      .catch(() => setError('Could not load the list of changes. Please try again.'));
  }, [open, options]);

  const total = useMemo(
    () => (options ?? []).filter((o) => selected.has(o.id)).reduce((sum, o) => sum + o.addedCostCents, 0),
    [options, selected],
  );

  function close() {
    if (submitting) return;
    onClose();
    // reset after the close animation
    window.setTimeout(() => {
      setPickedId(null);
      setSelected(new Set());
      setError(null);
    }, 250);
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function submit() {
    if (!design || selected.size === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const { checkoutUrl } = await apiFetch<{ checkoutUrl: string }>('/api/modifications/checkout', {
        method: 'POST',
        body: { designId: design.id, selectedOptionIds: Array.from(selected) },
      });
      window.location.assign(checkoutUrl); // stay in "Redirecting…" until Stripe loads
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not start checkout.');
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={close} className="flex max-h-[92vh] w-[94vw] max-w-xl flex-col overflow-hidden" labelledBy="request-changes-title">
      <div className="flex items-start justify-between gap-3 border-b border-warm-200 px-6 py-5">
        <div>
          <h2 id="request-changes-title" className="text-[18px] font-medium text-ink-900">
            Request changes
          </h2>
          <p className="mt-1 text-[12px] text-ink-500">
            {design ? 'Pick what you want changed — you only pay for the changes.' : 'Which plan would you like changed?'}
          </p>
        </div>
        <ModalCloseButton onClose={close} />
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        {!design ? (
          designs.length === 0 ? (
            <p className="py-6 text-center text-[13px] text-ink-500">
              You don&apos;t own any plans yet. Buy a plan first — you can even add changes at checkout.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {designs.map((d, i) => (
                <motion.button
                  key={d.id}
                  initial={{ opacity: 0, y: reduce ? 0 : 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: reduce ? 0 : i * 0.04 }}
                  onClick={() => setPickedId(d.id)}
                  className="group overflow-hidden rounded-card-sm border border-warm-300 bg-white text-left transition-all hover:-translate-y-0.5 hover:border-ink-900 hover:shadow-md"
                >
                  <div className="relative h-24 w-full bg-warm-100">
                    <Image src={d.coverImageUrl} fallbackSrc={fallbackImageFor(d.slug)} alt={d.title} fill sizes="260px" className="object-cover" />
                  </div>
                  <div className="px-3 py-2.5 text-[13px] font-medium text-ink-900">{d.title}</div>
                </motion.button>
              ))}
            </div>
          )
        ) : (
          <>
            <div className="flex items-center gap-3 rounded-card-sm bg-warm-50 p-3">
              <div className="relative h-12 w-16 flex-none overflow-hidden rounded-control bg-warm-100">
                <Image src={design.coverImageUrl} fallbackSrc={fallbackImageFor(design.slug)} alt={design.title} fill sizes="64px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-medium text-ink-900">{design.title}</div>
                <div className="text-[11px] text-ink-500">You own this plan — it won&apos;t be charged again</div>
              </div>
              {designs.length > 1 && !initialDesignId && (
                <button onClick={() => setPickedId(null)} className="flex items-center gap-1 text-[11.5px] text-ink-700 underline-offset-2 hover:underline">
                  <ChevronLeft size={13} /> Change
                </button>
              )}
            </div>

            <div className="mt-5 text-[10px] tracking-[0.12em] text-ink-500">CHOOSE YOUR CHANGES</div>
            {options === null && !error && (
              <div className="mt-3 flex flex-col gap-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-14 animate-pulse rounded-control bg-warm-150" />
                ))}
              </div>
            )}
            <div className="mt-3 flex flex-col gap-2">
              {(options ?? []).map((option, i) => {
                const isSelected = selected.has(option.id);
                return (
                  <motion.button
                    key={option.id}
                    initial={{ opacity: 0, y: reduce ? 0 : 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: reduce ? 0 : i * 0.035 }}
                    onClick={() => toggle(option.id)}
                    aria-pressed={isSelected}
                    className={cn(
                      'flex items-center gap-3 rounded-control border bg-white px-4 py-3 text-left transition-all',
                      isSelected ? 'border-ink-900 shadow-[0_0_0_1px_var(--color-ink-900)]' : 'border-warm-400 hover:border-ink-500',
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-5 w-5 flex-none items-center justify-center rounded-md border transition-colors',
                        isSelected ? 'border-ink-900 bg-ink-900 text-white' : 'border-warm-500 bg-white',
                      )}
                    >
                      {isSelected && <Check size={13} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] text-ink-900">{option.label}</span>
                      {option.description && <span className="block text-[11px] text-ink-500">{option.description}</span>}
                    </span>
                    <span className="text-[13px] font-medium text-ink-900">+{formatCents(option.addedCostCents)}</span>
                  </motion.button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {design && (
        <div className="border-t border-warm-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] text-ink-700">
              {selected.size === 0 ? 'Nothing selected yet' : `${selected.size} change${selected.size === 1 ? '' : 's'}`}
            </span>
            <span className="text-[19px] font-medium text-ink-900">{formatCents(total)}</span>
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-[11px] text-ink-500">
            <ClipboardCheck size={12} /> After payment you get a live tracking page — you and the architect see every step.
          </p>
          {error && <p className="mt-2 text-[12px] text-red-600">{error}</p>}
          <button
            onClick={submit}
            disabled={selected.size === 0 || submitting}
            className="mt-3 w-full rounded-pill bg-ink-900 py-3 text-[13px] font-medium text-white transition-colors hover:bg-ink-950 disabled:opacity-50"
          >
            {submitting ? 'Redirecting to secure checkout…' : selected.size === 0 ? 'Select at least one change' : `Pay ${formatCents(total)} & start`}
          </button>
        </div>
      )}
    </Modal>
  );
}
