'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, ApiError } from '@/lib/client/api';
import { Design, DesignCategory } from '@/lib/types/design';

interface DesignFormProps {
  design?: Design;
}

interface FormState {
  title: string;
  category: DesignCategory;
  basePriceCents: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  estimatedBuildCents: number;
  summary: string;
  description: string;
  coverImageUrl: string;
  galleryUrls: string;
}

function toFormState(design?: Design): FormState {
  return {
    title: design?.title ?? '',
    category: design?.category ?? 'CONTAINER',
    basePriceCents: design?.basePriceCents ?? 0,
    bedrooms: design?.bedrooms ?? 1,
    bathrooms: design?.bathrooms ?? 1,
    sqft: design?.sqft ?? 500,
    estimatedBuildCents: design?.estimatedBuildCents ?? 0,
    summary: design?.summary ?? '',
    description: design?.description ?? '',
    coverImageUrl: design?.coverImageUrl ?? '',
    galleryUrls: design?.galleryUrls.join('\n') ?? '',
  };
}

const inputClass =
  'w-full border border-warm-400 bg-white px-3 py-2 text-[12.5px] text-ink-900 outline-none focus:border-ink-900';
const labelClass = 'text-[10.5px] tracking-wide text-dark-500';

export function DesignForm({ design }: DesignFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(toFormState(design));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSaving(true);

    const body = {
      title: form.title,
      category: form.category,
      basePriceCents: Number(form.basePriceCents),
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      sqft: Number(form.sqft),
      estimatedBuildCents: Number(form.estimatedBuildCents),
      summary: form.summary,
      description: form.description,
      coverImageUrl: form.coverImageUrl,
      galleryUrls: form.galleryUrls
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
    };

    try {
      if (design) {
        await apiFetch(`/api/admin/designs/${design.id}`, { method: 'PATCH', body });
      } else {
        const created = await apiFetch<Design>('/api/admin/designs', { method: 'POST', body });
        router.push(`/admin/designs/${created.id}`);
        return;
      }
      router.push('/admin/designs');
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save design.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="max-w-2xl space-y-4">
      <div>
        <label className={labelClass}>Title</label>
        <input
          className={inputClass}
          value={form.title}
          onChange={(e) => update('title', e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Category</label>
          <select
            className={inputClass}
            value={form.category}
            onChange={(e) => update('category', e.target.value as DesignCategory)}
          >
            <option value="CONTAINER">Container</option>
            <option value="RESIDENTIAL">Residential</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Base price (cents)</label>
          <input
            type="number"
            className={inputClass}
            value={form.basePriceCents}
            onChange={(e) => update('basePriceCents', Number(e.target.value))}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div>
          <label className={labelClass}>Bedrooms</label>
          <input
            type="number"
            className={inputClass}
            value={form.bedrooms}
            onChange={(e) => update('bedrooms', Number(e.target.value))}
          />
        </div>
        <div>
          <label className={labelClass}>Bathrooms</label>
          <input
            type="number"
            step="0.5"
            className={inputClass}
            value={form.bathrooms}
            onChange={(e) => update('bathrooms', Number(e.target.value))}
          />
        </div>
        <div>
          <label className={labelClass}>Sq ft</label>
          <input
            type="number"
            className={inputClass}
            value={form.sqft}
            onChange={(e) => update('sqft', Number(e.target.value))}
          />
        </div>
        <div>
          <label className={labelClass}>Est. build (cents)</label>
          <input
            type="number"
            className={inputClass}
            value={form.estimatedBuildCents}
            onChange={(e) => update('estimatedBuildCents', Number(e.target.value))}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Summary</label>
        <input
          className={inputClass}
          value={form.summary}
          onChange={(e) => update('summary', e.target.value)}
          maxLength={280}
          required
        />
      </div>

      <div>
        <label className={labelClass}>Description</label>
        <textarea
          className={`${inputClass} h-28`}
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          required
        />
      </div>

      <div>
        <label className={labelClass}>Cover image URL</label>
        <input
          className={inputClass}
          value={form.coverImageUrl}
          onChange={(e) => update('coverImageUrl', e.target.value)}
          placeholder="https://images.unsplash.com/..."
          required
        />
      </div>

      <div>
        <label className={labelClass}>Gallery image URLs (one per line)</label>
        <textarea
          className={`${inputClass} h-20`}
          value={form.galleryUrls}
          onChange={(e) => update('galleryUrls', e.target.value)}
        />
      </div>

      {error && <p className="text-[12px] text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="bg-ink-950 px-6 py-2.5 text-[11px] tracking-wide text-white hover:bg-black disabled:opacity-50"
      >
        {saving ? 'Saving…' : design ? 'Save changes' : 'Create design'}
      </button>
    </form>
  );
}
