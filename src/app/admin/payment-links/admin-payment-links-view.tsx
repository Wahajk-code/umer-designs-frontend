'use client';

import { useEffect, useState, FormEvent } from 'react';
import { apiFetch, ApiError } from '@/lib/client/api';
import { formatCents } from '@/lib/client/format';

interface PaymentLink {
  id: string;
  clientEmail: string;
  description: string;
  amountCents: number;
  status: 'OPEN' | 'PAID' | 'EXPIRED' | 'CANCELLED';
  expiresAt: string;
}

export function AdminPaymentLinksView() {
  const [links, setLinks] = useState<PaymentLink[] | null>(null);
  const [clientEmail, setClientEmail] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const data = await apiFetch<{ paymentLinks: PaymentLink[] }>('/api/admin/payment-links');
    setLinks(data.paymentLinks);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount pattern
    load();
  }, []);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSaving(true);
    setGeneratedUrl(null);
    try {
      const result = await apiFetch<{ redeemUrl: string }>('/api/admin/payment-links', {
        method: 'POST',
        body: { clientEmail, description, amountCents: Math.round(Number(amount) * 100) },
      });
      setGeneratedUrl(result.redeemUrl);
      setClientEmail('');
      setDescription('');
      setAmount('');
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not generate link.');
    } finally {
      setSaving(false);
    }
  }

  async function handleCancel(id: string) {
    await apiFetch(`/api/admin/payment-links/${id}/cancel`, { method: 'PATCH' });
    load();
  }

  return (
    <div className="max-w-lg">
      <div className="bg-white p-4">
        <div className="text-[10px] tracking-wide text-dark-500">GENERATE LINK</div>
        <form onSubmit={handleCreate} className="mt-3 flex flex-col gap-2">
          <input
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            placeholder="Client email"
            type="email"
            className="h-9 border border-warm-400 px-3 text-[12px] outline-none"
            required
          />
          <div className="flex gap-2">
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="$ 0.00"
              type="number"
              min="0.5"
              step="0.01"
              className="h-9 w-28 border border-warm-400 px-3 text-[12px] outline-none"
              required
            />
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              className="h-9 flex-1 border border-warm-400 px-3 text-[12px] outline-none"
              required
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="bg-ink-950 px-4 py-2 text-[11px] tracking-wide text-white disabled:opacity-50"
          >
            {saving ? 'Generating…' : 'GENERATE STRIPE LINK'}
          </button>
        </form>
        {error && <p className="mt-2 text-[12px] text-red-600">{error}</p>}
        {generatedUrl && (
          <div className="mt-3 break-all rounded bg-warm-100 p-2 text-[11px] text-ink-900">{generatedUrl}</div>
        )}
      </div>

      <div className="mt-4 bg-white p-4">
        {links?.map((link, i) => (
          <div
            key={link.id}
            className={`flex items-center justify-between py-2 text-[12px] ${i < links.length - 1 ? 'border-b border-warm-150' : ''}`}
          >
            <span>
              {link.clientEmail} · {formatCents(link.amountCents)}
            </span>
            <span className="flex items-center gap-2">
              <span className="text-dark-500">{link.status.toLowerCase()}</span>
              {link.status === 'OPEN' && (
                <button onClick={() => handleCancel(link.id)} className="text-red-600 underline">
                  cancel
                </button>
              )}
            </span>
          </div>
        ))}
        {links?.length === 0 && <p className="text-[12px] text-dark-500">No payment links yet.</p>}
      </div>
    </div>
  );
}
