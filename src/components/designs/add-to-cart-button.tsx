'use client';

import { ShoppingBag, Check } from 'lucide-react';
import { useCart } from '@/lib/client/cart-context';
import { Design } from '@/lib/types/design';

export function AddToCartButton({
  design,
  variant = 'primary',
}: {
  design: Pick<Design, 'id' | 'slug' | 'title' | 'basePriceCents' | 'coverImageUrl'>;
  variant?: 'primary' | 'secondary' | 'icon';
}) {
  const { addItem, isInCart } = useCart();
  const inCart = isInCart(design.id);

  function handleClick() {
    if (inCart) return;
    addItem({
      designId: design.id,
      slug: design.slug,
      title: design.title,
      priceCents: design.basePriceCents,
      coverImageUrl: design.coverImageUrl,
    });
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={handleClick}
        disabled={inCart}
        aria-label={inCart ? 'Already in cart' : `Add ${design.title} to cart`}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink-900 opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-visible:opacity-100 disabled:opacity-100"
      >
        {inCart ? <Check size={15} /> : <ShoppingBag size={15} />}
      </button>
    );
  }

  if (variant === 'secondary') {
    return (
      <button
        onClick={handleClick}
        disabled={inCart}
        className="flex-1 rounded-pill border border-warm-400 py-2 text-center text-[11px] text-ink-700 transition-colors hover:bg-warm-100 disabled:opacity-60"
      >
        {inCart ? 'In cart' : 'Add to cart'}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={inCart}
      className="mt-3 flex items-center justify-center gap-2 rounded-pill border border-ink-900 px-8 py-3 text-center text-[13px] font-medium text-ink-900 transition-colors hover:bg-warm-100 disabled:opacity-60"
    >
      {inCart ? (
        <>
          <Check size={14} /> In your cart
        </>
      ) : (
        <>
          <ShoppingBag size={14} /> Add to cart
        </>
      )}
    </button>
  );
}
