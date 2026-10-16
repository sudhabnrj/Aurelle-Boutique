'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { getProduct, type Product } from '@/lib/products';

export type CartItem = {
  key: string;
  productId: string;
  size: string;
  color: string;
  qty: number;
};

type ShopContextValue = {
  items: (CartItem & { product: Product })[];
  count: number;
  subtotal: number;
  addItem: (product: Product, size: string, color?: string) => void;
  updateQty: (key: string, delta: number) => void;
  removeItem: (key: string) => void;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  wishlist: Set<string>;
  toggleWishlist: (id: string) => void;
  sizeGuideOpen: boolean;
  setSizeGuideOpen: (open: boolean) => void;
};

const ShopContext = createContext<ShopContextValue | null>(null);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlist, setWishlist] = useState<Set<string>>(() => new Set());
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  const addItem = useCallback((product: Product, size: string, color = product.colors[0]?.name ?? '') => {
    const key = `${product.id}__${size}__${color}`;
    setCart((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) return prev.map((i) => (i.key === key ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { key, productId: product.id, size, color, qty: 1 }];
    });
    setCartOpen(true);
  }, []);

  const updateQty = useCallback((key: string, delta: number) => {
    setCart((prev) =>
      prev.flatMap((i) => {
        if (i.key !== key) return [i];
        const qty = i.qty + delta;
        return qty > 0 ? [{ ...i, qty }] : [];
      }),
    );
  }, []);

  const removeItem = useCallback((key: string) => {
    setCart((prev) => prev.filter((i) => i.key !== key));
  }, []);

  const toggleWishlist = useCallback((id: string) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const value = useMemo<ShopContextValue>(() => {
    const items = cart.flatMap((i) => {
      const product = getProduct(i.productId);
      return product ? [{ ...i, product }] : [];
    });
    return {
      items,
      count: items.reduce((n, i) => n + i.qty, 0),
      subtotal: items.reduce((n, i) => n + i.qty * i.product.price, 0),
      addItem,
      updateQty,
      removeItem,
      cartOpen,
      setCartOpen,
      wishlist,
      toggleWishlist,
      sizeGuideOpen,
      setSizeGuideOpen,
    };
  }, [cart, cartOpen, wishlist, sizeGuideOpen, addItem, updateQty, removeItem, toggleWishlist]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error('useShop must be used inside <ShopProvider>');
  return ctx;
}
