'use client';

import Image from 'next/image';
import { Heart, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { useShop } from '@/context/ShopContext';
import { discountPct, formatPrice } from '@/lib/format';
import type { Product } from '@/lib/products';

export function ProductCard({ product }: { product: Product }) {
  const { addItem, wishlist, toggleWishlist } = useShop();
  const wished = wishlist.has(product.id);
  const [primary, secondary = primary] = product.images;
  const off = discountPct(product.price, product.mrp);
  const defaultSize = product.sizes.includes('M') ? 'M' : product.sizes[0];

  return (
    <article data-silk className="group">
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-ivory">
        <div data-kenburns className="absolute inset-0">
          <Image
            src={primary}
            alt={`${product.name} in ${product.colors[0]?.name ?? 'signature'} colour`}
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-cover transition-transform duration-[1400ms] ease-silk group-hover:scale-[1.06]"
          />
          <Image
            src={secondary}
            alt=""
            aria-hidden
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-cover opacity-0 transition-all duration-[1000ms] ease-silk group-hover:scale-[1.06] group-hover:opacity-100"
          />
        </div>

        {product.isNew && (
          <span className="absolute left-3 top-3 rounded-full bg-gold px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-espresso">
            New
          </span>
        )}

        <motion.button
          type="button"
          whileTap={{ scale: 0.85 }}
          onClick={() => toggleWishlist(product.id)}
          aria-label={wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          aria-pressed={wished}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-ivory/85 backdrop-blur transition-colors hover:text-gold-deep"
        >
          <Heart
            size={16}
            strokeWidth={1.5}
            className={`transition-all duration-300 ${wished ? 'scale-110 fill-gold text-gold' : ''}`}
          />
        </motion.button>

        <button
          type="button"
          onClick={() => addItem(product, defaultSize)}
          className="absolute inset-x-3 bottom-3 flex translate-y-0 items-center justify-center gap-2 rounded-full bg-espresso/90 py-3 text-[11px] font-medium uppercase tracking-[0.22em] text-ivory backdrop-blur transition-all duration-500 ease-silk hover:bg-gold hover:text-espresso focus-visible:translate-y-0 focus-visible:opacity-100 md:translate-y-[140%] md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100"
        >
          <ShoppingBag size={14} strokeWidth={1.5} /> <span className="hidden sm:inline">Add to Bag</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-serif text-lg leading-snug md:text-xl">{product.name}</h3>
          <p className="mt-0.5 truncate text-xs text-espresso/55">{product.fabric}</p>
        </div>
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-medium text-gold-deep">{formatPrice(product.price)}</span>
        {off > 0 && (
          <>
            <s className="text-xs text-espresso/40">{formatPrice(product.mrp)}</s>
            <span className="text-[10px] uppercase tracking-[0.15em] text-gold-deep">{off}% off</span>
          </>
        )}
      </div>
    </article>
  );
}
