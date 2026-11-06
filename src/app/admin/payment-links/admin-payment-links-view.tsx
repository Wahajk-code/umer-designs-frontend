'use client';

import { useCallback, useEffect, useState, FormEvent } from 'react';
import { toast } from 'sonner';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check, Copy, Link2 } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/client/api';
import { formatCents } from '@/lib/client/format';
import {
  AdminButton,
  AdminPageHeader,
  ConfirmDialog,
  EmptyState,
  ErrorBanner,
  Field,
  Panel,
  PanelHeader,
  Pill,
  TableSkeleton,
  adminInput,
  td,
  th,
  tr,
} from '@/components/admin/admin-ui';

interface PaymentLink {
  id: string;
  clientEmail: string;
  description: string;
  amountCents: number;
  status: 'OPEN' | 'PAID' | 'EXPIRED' | 'CANCELLED';
  expiresAt: string;
  createdAt?: string;
}

const TONE = { OPEN: 'blue', PAID: 'green', EXPIRED: 'neutral', CANCELLED: 'red' } as const;

export function AdminPaymentLinksView() {
  const reduce = useReducedMotion();
  const [links, setLinks] = useState<PaymentLink[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [clientEmail, setClientEmail] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pendingCancel, setPendingCancel] = useState<PaymentLink | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<{ paymentLinks: PaymentLink[] }>('/api/admin/payment-links');
      setLinks(data.paymentLinks);
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'Could not load payment links.');
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount pattern
    load();
  }, [load]);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (!/^\S+@\S+\.\S+$/.test(clientEmail.trim())) return setFormError('Enter the client’s email.');
    if (!(Number(amount) >= 0.5)) return setFormError('Minimum amount is $0.50.');
    if (!description.trim()) return setFormError('Describe what the payment is for.');
    setSaving(true);
    setGeneratedUrl(null);
    try {
      const result = await apiFetch<{ redeemUrl: string }>('/api/admin/payment-links', {
        method: 'POST',
        body: { clientEmail: clientEmail.trim(), description: description.trim(), amountCents: Math.round(Number(amount) * 100) },
      });
      setGeneratedUrl(result.redeemUrl);
      setCopied(false);
      setClientEmail('');
      setDescription('');
      setAmount('');
      toast.success('Payment link created', { description: 'Copy it and send it to the client.' });
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Could not generate link.');
    } finally {
      setSaving(false);
    }
  }

  async function copy() {
    if (!generatedUrl) return;
    await navigator.clipboard.writeText(generatedUrl).catch(() => undefined);
    setCopied(true);
    toast.success('Link copied');
  }

  async function confirmCancel() {
    if (!pendingCancel) return;
    setCancelling(true);
    try {
      await apiFetch(`/api/admin/payment-links/${pendingCancel.id}/cancel`, { method: 'PATCH' });
      toast.success('Link cancelled — it can no longer be paid');
      setPendingCancel(null);
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not cancel the link.');
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div>
      <AdminPageHeader title="Payment links" description="Charge a client for custom work outside the store. They pay through Stripe; you're notified when it's paid." />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <Panel className="h-fit lg:col-span-2">
          <PanelHeader title="New payment link" />
          <form onSubmit={handleCreate} noValidate className="space-y-4 px-5 py-5">
            <Field label="Client email">
              <input value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} type="email" placeholder="client@example.com" className={adminInput} />
            </Field>
            <Field label="Amount (USD)">
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[12.5px] text-ink-500">$</span>
                <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" min="0.5" step="0.01" placeholder="0.00" className={`${adminInput} pl-7`} />
              </div>
            </Field>
            <Field label="What it's for" error={formError}>
              <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Site visit + structural notes" className={adminInput} />
            </Field>
            <AdminButton type="submit" loading={saving} loadingText="Creating link…" className="w-full">
              Create Stripe payment link
            </AdminButton>

            <AnimatePresence>
              {generatedUrl && (
                <motion.div
                  initial={{ opacity: 0, y: reduce ? 0 : 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-card-sm bg-white p-3 ring-1 ring-emerald-200"
                >
                  <div className="text-[11px] font-medium text-emerald-700">Ready to send</div>
                  <div className="mt-1 flex items-center gap-2">
                    <code className="min-w-0 flex-1 truncate text-[11.5px] text-ink-900">{generatedUrl}</code>
                    <AdminButton size="sm" variant="secondary" icon={copied ? <Check size={12} /> : <Copy size={12} />} onClick={copy}>
                      {copied ? 'Copied' : 'Copy'}
                    </AdminButton>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </Panel>

        <Panel className="lg:col-span-3" delay={0.05}>
          <PanelHeader title="All links" count={links?.length} />
          {loadError && <ErrorBanner message={loadError} onRetry={load} className="m-4" />}
          {!links && !loadError ? (
            <TableSkeleton rows={5} cols={4} />
          ) : links?.length === 0 ? (
            <EmptyState icon={<Link2 size={18} />} title="No payment links yet" hint="Create one on the left for custom work." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px]">
                <thead>
                  <tr>
                    <th className={th}>Client</th>
                    <th className={`${th} text-right`}>Amount</th>
                    <th className={th}>Status</th>
                    <th className={th} />
                  </tr>
                </thead>
                <tbody>
                  {links?.map((link) => (
                    <tr key={link.id} className={tr}>
                      <td className={td}>
                        <div className="truncate">{link.clientEmail}</div>
                        <div className="truncate text-[11px] text-ink-500">{link.description}</div>
                      </td>
                      <td className={`${td} text-right font-medium`}>{formatCents(link.amountCents)}</td>
                      <td className={td}>
                        <Pill tone={TONE[link.status]}>{link.status.charAt(0) + link.status.slice(1).toLowerCase()}</Pill>
                        {link.status === 'OPEN' && (
                          <div className="mt-1 text-[10.5px] text-ink-500">expires {new Date(link.expiresAt).toLocaleDateString()}</div>
                        )}
                      </td>
                      <td className={`${td} text-right`}>
                        {link.status === 'OPEN' && (
                          <AdminButton size="sm" variant="ghost" className="text-red-600 hover:bg-red-50" onClick={() => setPendingCancel(link)}>
                            Cancel
                          </AdminButton>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>

      <ConfirmDialog
        open={!!pendingCancel}
        title="Cancel this payment link?"
        body={`${pendingCancel?.clientEmail} won't be able to pay ${pendingCancel ? formatCents(pendingCancel.amountCents) : ''} with it any more.`}
        confirmLabel="Cancel link"
        danger
        loading={cancelling}
        onConfirm={confirmCancel}
        onClose={() => setPendingCancel(null)}
      />
    </div>
  );
}
