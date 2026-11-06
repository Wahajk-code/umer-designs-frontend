'use client';

/* eslint-disable @next/next/no-img-element -- admin previews show arbitrary pasted URLs, which next/image would reject */

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, ImagePlus, Link2, Star, Trash2, UploadCloud } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/client/api';
import { uploadPublicImage } from '@/lib/client/cloudinary-upload';
import { Design, DesignCategory, DesignStatus } from '@/lib/types/design';
import { cn } from '@/lib/client/cn';
import { AdminButton, AdminModal, Field, Skeleton, adminInput, adminTextarea } from '@/components/admin/admin-ui';
import { DesignFilesManager } from './[id]/design-files-manager';
import { DesignAddOnsManager } from './[id]/design-addons-manager';

interface UploadSignature {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
}

type Tab = 'details' | 'photos' | 'files' | 'addons';

interface FormState {
  title: string;
  category: DesignCategory;
  status: DesignStatus;
  price: string; // dollars
  bedrooms: string;
  bathrooms: string;
  sqft: string;
  build: string; // dollars
  summary: string;
  description: string;
}

function toForm(d?: Design | null): FormState {
  return {
    title: d?.title ?? '',
    category: d?.category ?? 'CONTAINER',
    status: d?.status ?? 'DRAFT',
    price: d ? String(d.basePriceCents / 100) : '',
    bedrooms: String(d?.bedrooms ?? 1),
    bathrooms: String(d?.bathrooms ?? 1),
    sqft: String(d?.sqft ?? 500),
    build: d ? String(d.estimatedBuildCents / 100) : '',
    summary: d?.summary ?? '',
    description: d?.description ?? '',
  };
}

/** Cover first, then gallery (deduped) — one ordered list the admin manages. */
function toPhotos(d?: Design | null): string[] {
  if (!d) return [];
  return Array.from(new Set([d.coverImageUrl, ...(d.galleryUrls ?? [])].filter(Boolean)));
}

const isUrl = (s: string) => /^https?:\/\/\S+$/i.test(s.trim());

export function DesignEditorModal({
  open,
  designId,
  onClose,
  onSaved,
}: {
  open: boolean;
  /** null = create a new design */
  designId: string | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const reduce = useReducedMotion();
  const [currentId, setCurrentId] = useState<string | null>(designId);
  const [design, setDesign] = useState<Design | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>('details');
  const [form, setForm] = useState<FormState>(toForm());
  const [photos, setPhotos] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState | 'photos', string>>>({});
  const [initial, setInitial] = useState<string>('');

  // (Re)load whenever the modal opens for a design.
  /* eslint-disable react-hooks/set-state-in-effect -- reset + fetch when the modal opens */
  useEffect(() => {
    if (!open) return;
    setCurrentId(designId);
    setTab('details');
    setErrors({});
    if (!designId) {
      setDesign(null);
      setForm(toForm());
      setPhotos([]);
      setInitial(JSON.stringify([toForm(), []]));
      return;
    }
    setLoading(true);
    apiFetch<Design>(`/api/admin/designs/${designId}`)
      .then((d) => {
        setDesign(d);
        setForm(toForm(d));
        setPhotos(toPhotos(d));
        setInitial(JSON.stringify([toForm(d), toPhotos(d)]));
      })
      .catch((err) => toast.error(err instanceof ApiError ? err.message : 'Could not load this design.'))
      .finally(() => setLoading(false));
  }, [open, designId]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const dirty = useMemo(() => JSON.stringify([form, photos]) !== initial, [form, photos, initial]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function requestClose() {
    if (saving) return;
    if (dirty && !window.confirm('Discard unsaved changes to this design?')) return;
    onClose();
  }

  function validate(): boolean {
    const e: typeof errors = {};
    if (form.title.trim().length < 2) e.title = 'At least 2 characters.';
    if (!(Number(form.price) >= 0) || form.price === '') e.price = 'Enter a price in dollars.';
    if (!(Number(form.sqft) >= 1)) e.sqft = 'Must be at least 1.';
    if (!form.summary.trim()) e.summary = 'A one-line summary is required.';
    if (!form.description.trim()) e.description = 'A description is required.';
    if (photos.length === 0) e.photos = 'Add at least one photo — the first one is the cover.';
    setErrors(e);
    if (e.photos && Object.keys(e).length === 1) setTab('photos');
    else if (Object.keys(e).length) setTab('details');
    return Object.keys(e).length === 0;
  }

  async function save() {
    if (!validate()) return;
    setSaving(true);
    const body = {
      title: form.title.trim(),
      category: form.category,
      basePriceCents: Math.round(Number(form.price) * 100),
      bedrooms: Math.round(Number(form.bedrooms) || 0),
      bathrooms: Number(form.bathrooms) || 0,
      sqft: Math.round(Number(form.sqft)),
      estimatedBuildCents: Math.round((Number(form.build) || 0) * 100),
      summary: form.summary.trim(),
      description: form.description.trim(),
      coverImageUrl: photos[0],
      galleryUrls: photos.slice(1),
    };
    try {
      if (currentId) {
        const saved = await apiFetch<Design>(`/api/admin/designs/${currentId}`, {
          method: 'PATCH',
          body: { ...body, status: form.status },
        });
        setDesign((d) => ({ ...(d ?? saved), ...saved }));
        setInitial(JSON.stringify([form, photos]));
        toast.success('Design saved');
      } else {
        const created = await apiFetch<Design>('/api/admin/designs', { method: 'POST', body });
        setCurrentId(created.id);
        setDesign(created);
        const next = { ...form, status: created.status };
        setForm(next);
        setInitial(JSON.stringify([next, photos]));
        toast.success('Design created as a draft', { description: 'Now add the plan files and add-ons, then publish.' });
        setTab('files');
      }
      onSaved();
    } catch (err) {
      toast.error('Could not save', { description: err instanceof ApiError ? err.message : 'Please try again.' });
    } finally {
      setSaving(false);
    }
  }

  const tabs: { id: Tab; label: string; disabled?: boolean; badge?: number }[] = [
    { id: 'details', label: 'Details' },
    { id: 'photos', label: 'Photos', badge: photos.length },
    { id: 'files', label: 'Plan files', disabled: !currentId },
    { id: 'addons', label: 'Add-ons', disabled: !currentId },
  ];

  return (
    <AdminModal
      open={open}
      onClose={requestClose}
      wide
      title={currentId ? form.title || 'Edit design' : 'New design'}
      description={
        currentId
          ? `${design?.slug ? `/designs/${design.slug}` : ''}${dirty ? ' · unsaved changes' : ''}`
          : 'Created as a draft — publish once photos and files are ready.'
      }
      footer={
        tab === 'details' || tab === 'photos' ? (
          <>
            <AdminButton variant="secondary" onClick={requestClose} disabled={saving}>
              {currentId ? 'Close' : 'Cancel'}
            </AdminButton>
            <AdminButton onClick={save} loading={saving} loadingText="Saving…" disabled={loading || (!!currentId && !dirty)}>
              {currentId ? 'Save changes' : 'Create design'}
            </AdminButton>
          </>
        ) : (
          <>
            <span className="mr-auto self-center text-[11px] text-ink-500">Changes on this tab save instantly.</span>
            <AdminButton variant="secondary" onClick={requestClose}>
              Done
            </AdminButton>
          </>
        )
      }
    >
      <div className="-mx-6 -mt-5 mb-5 flex gap-1 border-b border-panel-300 px-5">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => !t.disabled && setTab(t.id)}
            disabled={t.disabled}
            title={t.disabled ? 'Create the design first' : undefined}
            className={cn(
              'relative flex items-center gap-1.5 px-3 py-3 text-[12px] transition-colors',
              tab === t.id ? 'text-ink-900' : 'text-ink-500 hover:text-ink-900',
            )}
          >
            {t.label}
            {!!t.badge && <span className="rounded-pill bg-panel-200 px-1.5 text-[10px] text-ink-700">{t.badge}</span>}
            {tab === t.id && (
              <motion.span layoutId="design-editor-tab" className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-ink-900" />
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
          <Skeleton className="h-28 w-full" />
        </div>
      ) : (
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={tab}
            initial={{ opacity: 0, x: reduce ? 0 : 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: reduce ? 0 : -8 }}
            transition={{ duration: 0.15 }}
          >
            {tab === 'details' && <DetailsTab form={form} update={update} errors={errors} isNew={!currentId} />}
            {tab === 'photos' && (
              <PhotosTab
                photos={photos}
                setPhotos={(p) => {
                  setPhotos(p);
                  setErrors((e) => ({ ...e, photos: undefined }));
                }}
                error={errors.photos}
              />
            )}
            {tab === 'files' && currentId && <DesignFilesManager designId={currentId} initialFiles={design?.files ?? []} />}
            {tab === 'addons' && currentId && <DesignAddOnsManager designId={currentId} />}
          </motion.div>
        </AnimatePresence>
      )}
    </AdminModal>
  );
}

/* ───────────────────────── Details ───────────────────────── */

function DetailsTab({
  form,
  update,
  errors,
  isNew,
}: {
  form: FormState;
  update: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  errors: Partial<Record<string, string>>;
  isNew: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
      <Field label="Title" error={errors.title} className="sm:col-span-4">
        <input className={adminInput} value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="The Meridian" />
      </Field>
      <Field label="Category" className="sm:col-span-2">
        <select className={adminInput} value={form.category} onChange={(e) => update('category', e.target.value as DesignCategory)}>
          <option value="CONTAINER">Container</option>
          <option value="RESIDENTIAL">Residential</option>
        </select>
      </Field>

      <Field label="Plan price (USD)" error={errors.price} className="sm:col-span-2">
        <input className={adminInput} type="number" min="0" step="1" inputMode="decimal" value={form.price} onChange={(e) => update('price', e.target.value)} placeholder="1450" />
      </Field>
      <Field label="Estimated build cost (USD)" hint="Shown as a guide on the listing" className="sm:col-span-2">
        <input className={adminInput} type="number" min="0" step="1000" value={form.build} onChange={(e) => update('build', e.target.value)} placeholder="85000" />
      </Field>
      <Field label="Status" hint={isNew ? 'New designs start as drafts' : undefined} className="sm:col-span-2">
        <select className={adminInput} value={form.status} disabled={isNew} onChange={(e) => update('status', e.target.value as DesignStatus)}>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="HIDDEN">Hidden</option>
        </select>
      </Field>

      <Field label="Bedrooms" className="sm:col-span-2">
        <input className={adminInput} type="number" min="0" max="20" value={form.bedrooms} onChange={(e) => update('bedrooms', e.target.value)} />
      </Field>
      <Field label="Bathrooms" className="sm:col-span-2">
        <input className={adminInput} type="number" min="0" max="20" step="0.5" value={form.bathrooms} onChange={(e) => update('bathrooms', e.target.value)} />
      </Field>
      <Field label="Floor area (sq ft)" error={errors.sqft} className="sm:col-span-2">
        <input className={adminInput} type="number" min="1" value={form.sqft} onChange={(e) => update('sqft', e.target.value)} />
      </Field>

      <Field label="Summary" error={errors.summary} hint={`${form.summary.length}/280 · shown on cards`} className="sm:col-span-6">
        <input className={adminInput} maxLength={280} value={form.summary} onChange={(e) => update('summary', e.target.value)} placeholder="A bright two-bed container home with a wraparound deck." />
      </Field>
      <Field label="Description" error={errors.description} className="sm:col-span-6">
        <textarea className={cn(adminTextarea, 'h-36 resize-y')} value={form.description} onChange={(e) => update('description', e.target.value)} />
      </Field>
    </div>
  );
}

/* ───────────────────────── Photos ───────────────────────── */

function PhotosTab({ photos, setPhotos, error }: { photos: string[]; setPhotos: (p: string[]) => void; error?: string }) {
  const [url, setUrl] = useState('');
  const [uploading, setUploading] = useState<{ done: number; total: number } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function addUrls(urls: string[]) {
    const next = Array.from(new Set([...photos, ...urls]));
    if (next.length > 31) {
      toast.error('Up to 31 photos per design (1 cover + 30 gallery).');
      return;
    }
    setPhotos(next);
  }

  function addByUrl() {
    if (!isUrl(url)) {
      toast.error('Paste a full image URL starting with https://');
      return;
    }
    addUrls([url.trim()]);
    setUrl('');
  }

  async function uploadFiles(files: FileList | File[]) {
    const images = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (images.length === 0) return;
    setUploading({ done: 0, total: images.length });
    const uploaded: string[] = [];
    try {
      const signature = await apiFetch<UploadSignature>('/api/admin/designs/image-signature', { method: 'POST' });
      for (const file of images) {
        uploaded.push(await uploadPublicImage(file, signature));
        setUploading({ done: uploaded.length, total: images.length });
      }
      toast.success(`${uploaded.length} photo${uploaded.length === 1 ? '' : 's'} uploaded`, { description: 'Save the design to publish them.' });
    } catch (err) {
      toast.error('Upload failed', { description: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      if (uploaded.length) addUrls(uploaded);
      setUploading(null);
    }
  }

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= photos.length) return;
    const next = [...photos];
    [next[i], next[j]] = [next[j], next[i]];
    setPhotos(next);
  }

  function makeCover(i: number) {
    setPhotos([photos[i], ...photos.filter((_, k) => k !== i)]);
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          uploadFiles(e.dataTransfer.files);
        }}
        className={cn(
          'flex flex-col items-center justify-center rounded-card-sm border-2 border-dashed px-6 py-7 text-center transition-colors',
          dragOver ? 'border-ink-900 bg-white' : 'border-panel-300 bg-panel-100',
        )}
      >
        <UploadCloud size={22} className="text-ink-500" />
        <p className="mt-2 text-[12.5px] text-ink-900">Drag photos here, or</p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <AdminButton
            size="sm"
            icon={<ImagePlus size={13} />}
            loading={!!uploading}
            loadingText={uploading ? `Uploading ${uploading.done + 1}/${uploading.total}…` : undefined}
            onClick={() => inputRef.current?.click()}
          >
            Choose files
          </AdminButton>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) uploadFiles(e.target.files);
            e.target.value = '';
          }}
        />
        <div className="mt-4 flex w-full max-w-md items-center gap-2">
          <div className="relative flex-1">
            <Link2 size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addByUrl())}
              placeholder="…or paste an image URL"
              className={cn(adminInput, 'h-9 pl-8')}
            />
          </div>
          <AdminButton size="sm" variant="secondary" onClick={addByUrl} disabled={!url.trim()}>
            Add
          </AdminButton>
        </div>
      </div>

      {error && <p className="mt-2 text-[11.5px] text-red-600">{error}</p>}

      <div className="mt-4 flex items-center justify-between text-[11px] text-ink-500">
        <span>{photos.length} photo{photos.length === 1 ? '' : 's'} · the first is the cover shown on cards</span>
      </div>

      <motion.ul layout className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        <AnimatePresence initial={false}>
          {photos.map((src, i) => (
            <motion.li
              layout
              key={src}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.18 }}
              className={cn(
                'group relative aspect-[4/3] overflow-hidden rounded-control bg-panel-200 ring-1',
                i === 0 ? 'ring-2 ring-ink-900' : 'ring-panel-300',
              )}
            >
              <img src={src} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" loading="lazy" />
              {i === 0 && (
                <span className="absolute left-2 top-2 flex items-center gap-1 rounded-pill bg-ink-900 px-2 py-0.5 text-[10px] text-white">
                  <Star size={10} /> Cover
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-linear-to-t from-black/70 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                <div className="flex gap-1">
                  <IconBtn label="Move left" onClick={() => move(i, -1)} disabled={i === 0}>
                    <ArrowLeft size={12} />
                  </IconBtn>
                  <IconBtn label="Move right" onClick={() => move(i, 1)} disabled={i === photos.length - 1}>
                    <ArrowRight size={12} />
                  </IconBtn>
                  {i !== 0 && (
                    <IconBtn label="Make cover" onClick={() => makeCover(i)}>
                      <Star size={12} />
                    </IconBtn>
                  )}
                </div>
                <IconBtn label="Remove photo" onClick={() => setPhotos(photos.filter((_, k) => k !== i))} danger>
                  <Trash2 size={12} />
                </IconBtn>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </div>
  );
}

function IconBtn({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-ink-900 transition-colors disabled:opacity-40',
        danger ? 'hover:bg-red-600 hover:text-white' : 'hover:bg-white',
      )}
    >
      {children}
    </button>
  );
}
