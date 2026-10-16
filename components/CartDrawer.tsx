'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useShop } from '@/context/ShopContext';
import { useLenis } from '@/components/providers/LenisProvider';
import { formatPrice } from '@/lib/format';
import { startCheckout } from '@/lib/checkout';

const EASE = [0.22, 1, 0.36, 1] as const;

export function CartDrawer() {
  const { items, count, subtotal, cartOpen, setCartOpen, updateQty, removeItem } = useShop();
  const lenis = useLenis();
  const [note, setNote] = useState('');

  useEffect(() => {
    if (cartOpen) lenis?.stop();
    else lenis?.start();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setCartOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [cartOpen, lenis, setCartOpen]);

  const checkout = async () => {
    await startCheckout(items, subtotal);
    setNote('Secure Razorpay checkout is being connected — your bag is saved for this session.');
  };

  return (
    <AnimatePresence>
      {cartOpen && (
        <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Shopping bag">
          <motion.button
            type="button"
            aria-label="Close bag"
            onClick={() => setCartOpen(false)}
            className="absolute inset-0 h-full w-full cursor-default bg-espresso/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />

          <motion.aside
            className="absolute right-0 top-0 flex h-full w-full max-w-[440px] flex-col bg-ivory shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.75, ease: EASE }}
          >
            <header className="flex items-center justify-between px-7 pb-5 pt-7">
              <div>
                <p className="overline text-gold">Your Bag</p>
                <h2 className="mt-1 font-serif text-3xl">
                  {count} {count === 1 ? 'piece' : 'pieces'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                aria-label="Close bag"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-espresso/15 transition-colors hover:border-gold hover:text-gold"
              >
                <X size={18} strokeWidth={1.4} />
              </button>
            </header>
            <div className="hairline" />

            <div className="flex-1 overflow-y-auto px-7 py-6" data-lenis-prevent>
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <ShoppingBag size={36} strokeWidth={1} className="text-gold" />
                  <p className="mt-5 font-serif text-2xl">Your bag is waiting</p>
                  <p className="mt-2 max-w-[260px] text-sm text-espresso/60">
                    Discover gowns, lehengas and occasion wear, hand-finished in our atelier.
                  </p>
                  <button type="button" onClick={() => setCartOpen(false)} className="pill-dark mt-8">
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <ul className="space-y-6">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.li
                        key={item.key}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 40 }}
                        transition={{ duration: 0.45, ease: EASE }}
                        className="flex gap-4"
                      >
                        <div className="relative aspect-[3/4] w-[88px] shrink-0 overflow-hidden rounded-xl bg-blush">
                          <Image src={item.product.images[0]} alt={item.product.name} fill sizes="88px" className="object-cover" />
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="font-serif text-lg leading-tight">{item.product.name}</h3>
                            <button
                              type="button"
                              onClick={() => removeItem(item.key)}
                              aria-label={`Remove ${item.product.name}`}
                              className="text-espresso/40 transition-colors hover:text-espresso"
                            >
                              <Trash2 size={15} strokeWidth={1.4} />
                            </button>
                          </div>
                          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-espresso/55">
                            {item.size} · {item.color}
                          </p>
                          <div className="mt-auto flex items-center justify-between pt-3">
                            <div className="flex items-center rounded-full border border-espresso/15">
                              <button
                                type="button"
                                onClick={() => updateQty(item.key, -1)}
                                aria-label="Decrease quantity"
                                className="flex h-8 w-8 items-center justify-center hover:text-gold"
                              >
                                <Minus size={13} />
                              </button>
                              <span className="w-6 text-center text-sm tabular-nums" aria-live="polite">
                                {item.qty}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQty(item.key, 1)}
                                aria-label="Increase quantity"
                                className="flex h-8 w-8 items-center justify-center hover:text-gold"
                              >
                                <Plus size={13} />
                              </button>
                            </div>
                            <p className="font-medium text-gold-deep">{formatPrice(item.product.price * item.qty)}</p>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <footer className="border-t border-gold/40 px-7 pb-7 pt-5">
                <div className="flex items-baseline justify-between">
                  <span className="overline text-espresso/60">Subtotal</span>
                  <span className="font-serif text-2xl text-gold-deep">{formatPrice(subtotal)}</span>
                </div>
                <p className="mt-1 text-xs text-espresso/50">Taxes included. Complimentary shipping across India.</p>
                <button type="button" onClick={checkout} className="pill-gold mt-5 w-full">
                  Checkout
                </button>
                {note && (
                  <p className="mt-3 text-center text-xs text-espresso/60" role="status">
                    {note}
                  </p>
                )}
              </footer>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
