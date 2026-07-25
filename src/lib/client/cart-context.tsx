'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { toast } from 'sonner';

export interface CartItem {
  designId: string;
  slug: string;
  title: string;
  priceCents: number;
  coverImageUrl: string;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotalCents: number;
  addItem: (item: CartItem) => void;
  removeItem: (designId: string) => void;
  clear: () => void;
  isInCart: (designId: string) => boolean;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = 'ud_cart';

function readStoredCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from localStorage (an external system) into initial state
    setItems(readStoredCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  function addItem(item: CartItem) {
    setItems((prev) => {
      if (prev.some((i) => i.designId === item.designId)) {
        toast.info('Already in your cart');
        return prev;
      }
      toast.success('Added to cart', { description: item.title });
      return [...prev, item];
    });
  }

  function removeItem(designId: string) {
    setItems((prev) => prev.filter((i) => i.designId !== designId));
  }

  function clear() {
    setItems([]);
  }

  function isInCart(designId: string) {
    return items.some((i) => i.designId === designId);
  }

  const subtotalCents = items.reduce((sum, i) => sum + i.priceCents, 0);

  return (
    <CartContext.Provider
      value={{ items, count: items.length, subtotalCents, addItem, removeItem, clear, isInCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
