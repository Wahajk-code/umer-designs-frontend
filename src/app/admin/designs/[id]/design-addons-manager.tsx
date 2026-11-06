'use client';

import { useCallback, useEffect, useState, FormEvent } from 'react';
import { toast } from 'sonner';
import { PackagePlus, Plus } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/client/api';
import { DesignAddOn } from '@/lib/types/design';
import { formatCents } from '@/lib/client/format';
import { cn } from '@/lib/client/cn';
import { AdminButton, EmptyState, ErrorBanner, ListSkeleton, Toggle, adminInput } from '@/components/admin/admin-ui';

/** Per-design extras the buyer can tick at checkout (e.g. material list, 3D renders). */
export function DesignAddOnsManager({ designId }: { designId: string }) {
  const [addOns, setAddOns] = useState<DesignAddOn[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [label, setLabel] = useState('');
  const [cost, setCost] = useState('');
  const [creating, setCreating] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      setAddOns(await apiFetch<DesignAddOn[]>(`/api/admin/designs/${designId}/add-ons`));
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'Could not load add-ons.');
    }
  }, [designId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount pattern
    load();
  }, [load]);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    if (!label.trim() || !(Number(cost) >= 0) || cost === '') {
      toast.error('Enter a label and a price.');
      return;
    }
    setCreating(true);
    try {
      await apiFetch(`/api/admin/designs/${designId}/add-ons`, {
        method: 'POST',
        body: { label: label.trim(), addedCostCents: Math.round(Number(cost) * 100) },
      });
      setLabel('');
      setCost('');
      toast.success('Add-on created');
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not create add-on.');
    } finally {
      setCreating(false);
    }
  }

  async function toggleActive(addOn: DesignAddOn) {
    setTogglingId(addOn.id);
    try {
      await apiFetch(`/api/admin/designs/${designId}/add-ons/${addOn.id}`, { method: 'PATCH', body: { active: !addOn.active } });
      setAddOns((prev) => prev?.map((a) => (a.id === addOn.id ? { ...a, active: !a.active } : a)) ?? prev);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not update add-on.');
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div>
      <p className="text-[12px] leading-relaxed text-ink-500">Optional extras shown on this design&apos;s page and added to the buyer&apos;s checkout.</p>

      <form onSubmit={handleCreate} noValidate className="mt-4 flex flex-wrap gap-2">
        <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label (e.g. 3D render pack)" className={`${adminInput} min-w-0 flex-1`} />
        <div className="relative w-32">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[12.5px] text-ink-500">$</span>
          <input value={cost} onChange={(e) => setCost(e.target.value)} placeholder="0" type="number" min="0" step="1" className={`${adminInput} pl-7`} />
        </div>
        <AdminButton type="submit" icon={<Plus size={14} />} loading={creating} loadingText="Adding…">
          Add
        </AdminButton>
      </form>

      <div className="mt-4 overflow-hidden rounded-card-sm bg-panel-100 ring-1 ring-panel-300">
        {loadError && <ErrorBanner message={loadError} onRetry={load} className="m-3" />}
        {!addOns && !loadError && <ListSkeleton rows={2} />}
        {addOns?.length === 0 && <EmptyState icon={<PackagePlus size={18} />} title="No add-ons yet" hint="Add extras like a material take-off list or a render pack." />}
        {addOns && addOns.length > 0 && (
          <ul className="divide-y divide-panel-300">
            {addOns.map((addOn) => (
              <li key={addOn.id} className="flex items-center gap-3 px-4 py-3">
                <span className={cn('min-w-0 flex-1 truncate text-[12.5px]', addOn.active ? 'text-ink-900' : 'text-ink-500 line-through')}>
                  {addOn.label}
                </span>
                <span className="text-[12.5px] font-medium text-ink-900">+{formatCents(addOn.addedCostCents)}</span>
                <Toggle checked={!!addOn.active} busy={togglingId === addOn.id} onChange={() => toggleActive(addOn)} label={`${addOn.active ? 'Deactivate' : 'Activate'} ${addOn.label}`} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
