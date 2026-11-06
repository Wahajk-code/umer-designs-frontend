'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ShoppingBag, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { SafeImage as Image } from '@/components/ui/safe-image';
import { fallbackImageFor } from '@/lib/stock-images';
import { itemTotalCents, useCart } from '@/lib/client/cart-context';
import { formatCents } from '@/lib/client/format';
import { apiFetch, ApiError } from '@/lib/client/api';

/** Right-hand slide-over cart. Opened from the floating cart button or any "View cart" toast. */
export function CartSheet() {
  const { items, subtotalCents, removeItem, clear, isOpen, closeCart } = useCart();
  const router = useRouter();
  const reduce = useReducedMotion();
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeCart();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, closeCart]);

  async function handleCheckout() {
    setLoading(true);
    try {
      const { checkoutUrl } = await apiFetch<{ checkoutUrl: string | null }>('/api/checkout-cart', {
        method: 'POST',
        body: {
          items: items.map((i) => ({
            designId: i.designId,
            addOnIds: i.addOns.map((a) => a.id),
            modificationOptionIds: i.modifications.map((m) => m.id),
          })),
        },
      });
      if (!checkoutUrl) {
        clear();
        closeCart();
        toast.success('Purchase complete', { description: 'Covered entirely by your account credit.' });
        router.push('/dashboard?purchased=1');
        return;
      }
      window.location.href = checkoutUrl; // keep "Redirecting…" until Stripe loads
    } catch (err) {
      setLoading(false);
      if (err instanceof ApiError && err.statusCode === 401) {
        closeCart();
        toast.info('Sign in to check out', {
          id: 'cart-signin',
          description: 'Your cart is saved — sign in or create an account to finish buying.',
        });
        router.push('/sign-in?next=/designs');
        return;
      }
      toast.error('Could not start checkout', {
        id: 'cart-checkout-error',
        description: err instanceof ApiError ? err.message : 'Please try again in a moment.',
      });
    }
  }

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60]">
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.2 }}
            onClick={closeCart}
          />
          <motion.aside
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
            className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-[-12px_0_40px_rgba(0,0,0,0.15)] outline-none"
            initial={{ x: reduce ? 0 : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: reduce ? 0 : '100%' }}
            transition={{ duration: reduce ? 0 : 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between border-b border-warm-200 px-5 py-4">
              <h2 id="cart-title" className="flex items-center gap-2 text-[15px] font-medium text-ink-900">
                <ShoppingBag size={16} /> Your cart
                {items.length > 0 && <span className="text-[12px] font-normal text-ink-500">({items.length})</span>}
              </h2>
              <button
                onClick={closeCart}
                aria-label="Close cart"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-warm-100 text-ink-700 transition-colors hover:bg-warm-200"
              >
                <X size={16} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
                <ShoppingBag size={26} className="text-ink-300" />
                <p className="text-[13px] text-ink-700">Your cart is empty.</p>
                <p className="text-[12px] text-ink-500">Add a plan from the store — you can customise it before paying.</p>
                <Link
                  href="/designs"
                  onClick={closeCart}
                  className="mt-3 rounded-pill bg-ink-900 px-5 py-2.5 text-[12px] text-white transition-colors hover:bg-ink-950"
                >
                  Browse designs
                </Link>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-3">
                  {items.map((item) => (
                    <div key={item.designId} className="flex gap-3 rounded-control p-2 hover:bg-warm-50">
                      <Link
                        href={`/designs/${item.slug}`}
                        onClick={closeCart}
                        className="relative h-16 w-16 shrink-0 overflow-hidden rounded-control bg-warm-100"
                      >
                        <Image
                          src={item.coverImageUrl}
                          fallbackSrc={fallbackImageFor(item.slug)}
                          alt={item.title}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </Link>
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/designs/${item.slug}`}
                          onClick={closeCart}
                          className="block truncate text-[13px] font-medium text-ink-900 hover:underline"
                        >
                          {item.title}
                        </Link>
                        <p className="text-[12px] text-ink-700">{formatCents(itemTotalCents(item))}</p>
                        {item.addOns.length > 0 && (
                          <p className="truncate text-[10.5px] text-ink-500">Add-ons: {item.addOns.map((a) => a.label).join(', ')}</p>
                        )}
                        {item.modifications.length > 0 && (
                          <p className="truncate text-[10.5px] text-ink-500">
                            Changes: {item.modifications.map((m) => m.label).join(', ')}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.designId)}
                        aria-label={`Remove ${item.title} from cart`}
                        className="flex h-8 w-8 shrink-0 items-center justify-center self-center rounded-full text-ink-500 transition-colors hover:bg-warm-100 hover:text-ink-900"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="border-t border-warm-200 p-5">
                  <div className="flex items-center justify-between text-[13px] text-ink-700">
                    <span>Subtotal</span>
                    <span className="text-[17px] font-medium text-ink-900">{formatCents(subtotalCents)}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-ink-500">
                    Account credit is applied automatically at checkout.
                  </p>
                  <button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="mt-4 w-full rounded-pill bg-ink-900 py-3 text-[13px] font-medium text-white transition-colors hover:bg-ink-950 disabled:opacity-60"
                  >
                    {loading ? 'Redirecting to secure checkout…' : 'Checkout'}
                  </button>
                  <button
                    onClick={closeCart}
                    className="mt-2 w-full rounded-pill py-2.5 text-[12px] text-ink-700 transition-colors hover:bg-warm-100"
                  >
                    Continue browsing
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

const HIDDEN_ON = ['/admin', '/sign-in', '/sign-up', '/pay'];
const ONLY_WITH_ITEMS_ON = ['/dashboard', '/modifications'];

/** Floating bottom-right cart button + the slide-over it opens. Mounted once in the root layout. */
export function CartLauncher() {
  const pathname = usePathname();
  const { count, openCart } = useCart();
  const reduce = useReducedMotion();

  const hidden =
    HIDDEN_ON.some((p) => pathname.startsWith(p)) ||
    (count === 0 && ONLY_WITH_ITEMS_ON.some((p) => pathname.startsWith(p)));

  return (
    <>
      <AnimatePresence>
        {!hidden && (
          <motion.button
            key="cart-launcher"
            onClick={openCart}
            aria-label={`Open cart, ${count} item${count === 1 ? '' : 's'}`}
            className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-ink-900 text-white shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition-colors hover:bg-ink-950 sm:bottom-7 sm:right-7"
            initial={{ scale: reduce ? 1 : 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: reduce ? 1 : 0.6, opacity: 0 }}
            whileHover={reduce ? undefined : { scale: 1.06 }}
            whileTap={reduce ? undefined : { scale: 0.94 }}
          >
            <ShoppingBag size={20} />
            {count > 0 && (
              <motion.span
                key={count}
                initial={{ scale: reduce ? 1 : 1.6 }}
                animate={{ scale: 1 }}
                className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10.5px] font-semibold text-ink-900 ring-2 ring-ink-900"
              >
                {count}
              </motion.span>
            )}
          </motion.button>
        )}
      </AnimatePresence>
      <CartSheet />
    </>
  );
}
