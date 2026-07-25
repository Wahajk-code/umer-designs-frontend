'use client';

import { useEffect, useState, FormEvent } from 'react';
import { apiFetch, ApiError } from '@/lib/client/api';
import { ModificationOption } from '@/lib/types/modification';
import { formatCents } from '@/lib/client/format';

export function AdminModificationOptionsView() {
  const [options, setOptions] = useState<ModificationOption[] | null>(null);
  const [label, setLabel] = useState('');
  const [cost, setCost] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const data = await apiFetch<ModificationOption[]>('/api/admin/modification-options');
    setOptions(data);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount pattern
    load();
  }, []);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      await apiFetch('/api/admin/modification-options', {
        method: 'POST',
        body: { label, addedCostCents: Math.round(Number(cost) * 100) },
      });
      setLabel('');
      setCost('');
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not create option.');
    }
  }

  async function toggleActive(option: ModificationOption) {
    await apiFetch(`/api/admin/modification-options/${option.id}`, {
      method: 'PATCH',
      body: { active: !option.active },
    });
    load();
  }

  return (
    <div className="max-w-lg">
      <div className="bg-white p-4">
        <div className="text-[10px] tracking-wide text-dark-500">CHANGE-TYPE PRICING</div>
        <ul className="mt-2 flex flex-col divide-y divide-warm-150">
          {options?.map((option) => (
            <li key={option.id} className="flex items-center justify-between py-2 text-[12px]">
              <span className={option.active ? 'text-ink-900' : 'text-ink-500 line-through'}>
                {option.label}
              </span>
              <span className="flex items-center gap-2">
                <span className="text-ink-900">+{formatCents(option.addedCostCents)}</span>
                <button onClick={() => toggleActive(option)} className="text-[10.5px] underline text-ink-500">
                  {option.active ? 'deactivate' : 'activate'}
                </button>
              </span>
            </li>
          ))}
          {options?.length === 0 && <li className="py-2 text-[12px] text-dark-500">No options yet.</li>}
        </ul>

        <form onSubmit={handleCreate} noValidate className="mt-4 flex gap-2">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Label (e.g. Add a room)"
            className="h-9 flex-1 border border-warm-400 px-3 text-[12px] outline-none"
            required
          />
          <input
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder="$"
            type="number"
            min="0"
            step="1"
            className="h-9 w-24 border border-warm-400 px-3 text-[12px] outline-none"
            required
          />
          <button className="bg-ink-950 px-4 text-[11px] text-white">Add</button>
        </form>
        {error && <p className="mt-2 text-[12px] text-red-600">{error}</p>}
      </div>
    </div>
  );
}
