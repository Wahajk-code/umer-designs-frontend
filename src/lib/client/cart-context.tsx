'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { toast } from 'sonner';

export interface CartAddOnSelection {
  id: string;
  label: string;
  addedCostCents: number;
}

export interface CartItem {
  designId: string;
  slug: string;
  title: string;
  priceCents: number;
  coverImageUrl: string;
  addOns: CartAddOnSelection[];
  /** Plan changes bought with the plan — become a tracked request after payment. */
  modifications: CartAddOnSelection[];
}

export type NewCartItem = Omit<CartItem, 'modifications'> & { modifications?: CartAddOnSelection[] };

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotalCents: number;
  addItem: (item: NewCartItem) => void;
  removeItem: (designId: string) => void;
  clear: () => void;
  isInCart: (designId: string) => boolean;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = 'ud_cart';

export const itemTotalCents = (item: CartItem) =>
  item.priceCents +
  item.addOns.reduce((s, a) => s + a.addedCostCents, 0) +
  item.modifications.reduce((s, m) => s + m.addedCostCents, 0);

function readStoredCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Partial<CartItem>[];
    // Backfills carts saved before add-ons / plan changes existed.
    return parsed.map((item) => ({ ...item, addOns: item.addOns ?? [], modifications: item.modifications ?? [] }) as CartItem);
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from localStorage (an external system) into initial state
    setItems(readStoredCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  // Side effects (toasts) live OUTSIDE the state updater: React may call an
  // updater twice in development, which is what made toasts appear twice.
  const addItem = useCallback(
    (item: NewCartItem) => {
      const viewCart = { label: 'View cart', onClick: () => setIsOpen(true) };
      if (items.some((i) => i.designId === item.designId)) {
        toast.info('Already in your cart', { id: `cart-${item.designId}`, action: viewCart });
        return;
      }
      setItems((prev) =>
        prev.some((i) => i.designId === item.designId)
          ? prev
          : [...prev, { ...item, modifications: item.modifications ?? [] }],
      );
      toast.success('Added to cart', { id: `cart-${item.designId}`, description: item.title, action: viewCart });
    },
    [items],
  );

  const removeItem = useCallback((designId: string) => {
    setItems((prev) => prev.filter((i) => i.designId !== designId));
  }, []);

  const clear = useCallback(() => setItems([]), []);
  const isInCart = useCallback((designId: string) => items.some((i) => i.designId === designId), [items]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: items.length,
      subtotalCents: items.reduce((sum, i) => sum + itemTotalCents(i), 0),
      addItem,
      removeItem,
      clear,
      isInCart,
      isOpen,
      openCart,
      closeCart,
    }),
    [items, addItem, removeItem, clear, isInCart, isOpen, openCart, closeCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
