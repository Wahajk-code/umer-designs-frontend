'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { motion, useReducedMotion } from 'framer-motion';
import { Pencil, Plus, Sliders } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/client/api';
import { ModificationOption } from '@/lib/types/modification';
import { formatCents } from '@/lib/client/format';
import { cn } from '@/lib/client/cn';
import {
  AdminButton,
  AdminModal,
  AdminPageHeader,
  EmptyState,
  ErrorBanner,
  Field,
  Panel,
  PanelHeader,
  TableSkeleton,
  Toggle,
  adminInput,
  adminTextarea,
  td,
  th,
  tr,
} from '@/components/admin/admin-ui';

export function AdminModificationOptionsView() {
  const reduce = useReducedMotion();
  const [options, setOptions] = useState<ModificationOption[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<ModificationOption | 'new' | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setOptions(await apiFetch<ModificationOption[]>('/api/admin/modification-options'));
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load options.');
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount pattern
    load();
  }, [load]);

  async function toggleActive(option: ModificationOption) {
    setTogglingId(option.id);
    try {
      await apiFetch(`/api/admin/modification-options/${option.id}`, { method: 'PATCH', body: { active: !option.active } });
      setOptions((prev) => prev?.map((o) => (o.id === option.id ? { ...o, active: !o.active } : o)) ?? prev);
      toast.success(option.active ? `“${option.label}” hidden from clients` : `“${option.label}” is offered again`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not update option.');
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Change pricing"
        description="The menu of changes clients can pick — at checkout with a plan, or later from their dashboard. Turning one off hides it without affecting past requests."
        actions={
          <AdminButton variant="light" icon={<Plus size={14} />} onClick={() => setEditing('new')}>
            New change type
          </AdminButton>
        }
      />
      {error && <ErrorBanner message={error} onRetry={load} className="mb-4" />}

      <Panel>
        <PanelHeader title="Change types" count={options?.length} description={options ? `${options.filter((o) => o.active).length} offered to clients` : undefined} />
        {!options && !error ? (
          <TableSkeleton rows={5} cols={4} />
        ) : options?.length === 0 ? (
          <EmptyState icon={<Sliders size={18} />} title="No change types yet" hint="Add things like “Add a room” or “Resize footprint” with a price." />
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th className={th}>Change</th>
                <th className={`${th} text-right`}>Price</th>
                <th className={th}>Offered</th>
                <th className={`${th} w-24`} />
              </tr>
            </thead>
            <tbody>
              {options?.map((o, i) => (
                <motion.tr key={o.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: reduce ? 0 : i * 0.03 }} className={tr}>
                  <td className={td}>
                    <div className={cn('font-medium', !o.active && 'text-ink-500 line-through')}>{o.label}</div>
                    {o.description && <div className="mt-0.5 line-clamp-1 text-[11px] text-ink-500">{o.description}</div>}
                  </td>
                  <td className={`${td} text-right font-medium`}>+{formatCents(o.addedCostCents)}</td>
                  <td className={td}>
                    <Toggle checked={o.active} busy={togglingId === o.id} onChange={() => toggleActive(o)} label={`${o.active ? 'Stop offering' : 'Offer'} ${o.label}`} />
                  </td>
                  <td className={`${td} text-right`}>
                    <AdminButton size="sm" variant="ghost" icon={<Pencil size={12} />} onClick={() => setEditing(o)}>
                      Edit
                    </AdminButton>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      <OptionModal option={editing} onClose={() => setEditing(null)} onSaved={load} />
    </div>
  );
}

function OptionModal({ option, onClose, onSaved }: { option: ModificationOption | 'new' | null; onClose: () => void; onSaved: () => Promise<void> }) {
  const isNew = option === 'new';
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!option) return;
    const o = option === 'new' ? null : option;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset the form for the option being edited
    setLabel(o?.label ?? '');
    setDescription(o?.description ?? '');
    setPrice(o ? String(o.addedCostCents / 100) : '');
    setErr(null);
  }, [option]);

  async function save() {
    if (!label.trim()) return setErr('Give it a label.');
    if (price === '' || !(Number(price) >= 0)) return setErr('Enter a price in dollars.');
    setSaving(true);
    const body = { label: label.trim(), description: description.trim() || undefined, addedCostCents: Math.round(Number(price) * 100) };
    try {
      if (isNew) await apiFetch('/api/admin/modification-options', { method: 'POST', body });
      else if (option) await apiFetch(`/api/admin/modification-options/${option.id}`, { method: 'PATCH', body });
      toast.success(isNew ? 'Change type added' : 'Change type updated');
      onClose();
      await onSaved();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Could not save.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminModal
      open={!!option}
      onClose={() => !saving && onClose()}
      title={isNew ? 'New change type' : 'Edit change type'}
      description={isNew ? undefined : 'Price changes apply to new requests only.'}
      footer={
        <>
          <AdminButton variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </AdminButton>
          <AdminButton onClick={save} loading={saving} loadingText="Saving…">
            {isNew ? 'Add change type' : 'Save'}
          </AdminButton>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Label">
          <input autoFocus value={label} onChange={(e) => setLabel(e.target.value)} maxLength={120} placeholder="Add a room" className={adminInput} />
        </Field>
        <Field label="Description (shown to clients)" hint="Optional — what's included">
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} rows={3} className={cn(adminTextarea, 'resize-none')} />
        </Field>
        <Field label="Price (USD)" error={err}>
          <div className="relative w-40">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[12.5px] text-ink-500">$</span>
            <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" min="0" step="1" className={`${adminInput} pl-7`} />
          </div>
        </Field>
      </div>
    </AdminModal>
  );
}
