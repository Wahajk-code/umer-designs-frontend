'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Modal, ModalCloseButton } from '@/components/ui/modal';
import { useCart } from '@/lib/client/cart-context';
import { formatCents } from '@/lib/client/format';
import { apiFetch, ApiError } from '@/lib/client/api';

export function CartDrawer({
  open,
  onClose,
  isSignedIn,
}: {
  open: boolean;
  onClose: () => void;
  isSignedIn: boolean;
}) {
  const { items, subtotalCents, removeItem, clear } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    if (!isSignedIn) {
      onClose();
      toast.info('Sign in to check out', {
        description: 'Your cart is saved — sign in or create an account to finish buying.',
      });
      router.push('/sign-in?next=/designs');
      return;
    }

    setLoading(true);
    try {
      const { checkoutUrl } = await apiFetch<{ checkoutUrl: string | null }>('/api/checkout-cart', {
        method: 'POST',
        body: { designIds: items.map((i) => i.designId) },
      });
      if (!checkoutUrl) {
        clear();
        toast.success('Purchase complete', { description: 'Covered entirely by your account credit.' });
        router.push('/dashboard?purchased=1');
        return;
      }
      window.location.href = checkoutUrl;
    } catch (err) {
      toast.error('Could not start checkout', {
        description: err instanceof ApiError ? err.message : 'Please try again in a moment.',
      });
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} className="w-[92vw] max-w-md" labelledBy="cart-title">
      <div className="flex items-center justify-between border-b border-warm-200 p-5">
        <h2 id="cart-title" className="flex items-center gap-2 text-[15px] font-medium text-ink-900">
          <ShoppingBag size={16} /> Your cart
        </h2>
        <ModalCloseButton onClose={onClose} />
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
          <ShoppingBag size={22} className="text-ink-300" />
          <p className="text-[12.5px] text-ink-500">Your cart is empty.</p>
          <Link
            href="/designs"
            onClick={onClose}
            className="mt-2 rounded-pill bg-ink-900 px-5 py-2.5 text-[12px] text-white"
          >
            Browse designs
          </Link>
        </div>
      ) : (
        <>
          <div className="max-h-[45vh] overflow-y-auto p-3">
            {items.map((item) => (
              <div key={item.designId} className="flex items-center gap-3 rounded-control p-2 hover:bg-warm-50">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-control bg-warm-100">
                  {item.coverImageUrl ? (
                    <Image src={item.coverImageUrl} alt={item.title} fill className="object-cover" />
                  ) : (
                    <div className="placeholder-stripes h-full w-full" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] font-medium text-ink-900">{item.title}</p>
                  <p className="text-[11.5px] text-ink-500">{formatCents(item.priceCents)}</p>
                </div>
                <button
                  onClick={() => removeItem(item.designId)}
                  aria-label={`Remove ${item.title} from cart`}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-400 transition-colors hover:bg-warm-100 hover:text-ink-700"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="border-t border-warm-200 p-5">
            <div className="flex items-center justify-between text-[13px] text-ink-700">
              <span>Subtotal</span>
              <span className="text-[16px] font-medium text-ink-900">{formatCents(subtotalCents)}</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="mt-4 w-full rounded-pill bg-ink-900 py-3 text-[13px] font-medium text-white transition-colors hover:bg-ink-950 disabled:opacity-50"
            >
              {loading ? 'Redirecting…' : isSignedIn ? 'Checkout' : 'Sign in to checkout'}
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}

export function CartButton({ isSignedIn }: { isSignedIn: boolean }) {
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label={`Cart, ${count} item${count === 1 ? '' : 's'}`}
        className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.05)] transition-colors hover:bg-warm-100"
      >
        <ShoppingBag size={15} className="text-ink-900" />
        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-ink-900 px-1 text-[9.5px] font-medium text-white">
            {count}
          </span>
        )}
      </button>
      <CartDrawer open={open} onClose={() => setOpen(false)} isSignedIn={isSignedIn} />
    </>
  );
}
