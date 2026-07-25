'use client';

import { useState, FormEvent } from 'react';
import { toast } from 'sonner';
import { apiFetch, ApiError } from '@/lib/client/api';
import { TextField } from '@/components/ui/text-field';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/client/cn';

export function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      await apiFetch<null>('/api/contact', { method: 'POST', body: { name, email, message } });
      toast.success('Message sent', {
        description: "Thanks for reaching out — we'll get back to you within a day or two.",
      });
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      toast.error('Could not send your message', {
        description: err instanceof ApiError ? err.message : 'Something went wrong. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 rounded-card-lg bg-white p-6 sm:p-8">
      <TextField
        label="Name"
        name="name"
        autoComplete="name"
        required
        maxLength={120}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <TextField
        label="Email"
        type="email"
        name="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="message" className="text-[11px] font-medium tracking-wide text-ink-700">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          maxLength={3000}
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={cn(
            'resize-none rounded-control border border-warm-400 bg-white px-4 py-3 text-[13px] text-ink-900 placeholder:text-ink-500/60 outline-none transition-colors focus:border-ink-900',
          )}
        />
      </div>
      <Button type="submit" loading={loading} className="mt-2 w-full">
        Send message
      </Button>
    </form>
  );
}
