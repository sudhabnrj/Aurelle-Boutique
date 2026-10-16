'use client';

import { ArrowRight } from 'lucide-react';
import { useRef } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { SplitLines } from '@/components/ui/SplitLines';
import { useSilkReveal } from '@/hooks/useSilkReveal';
import { newArrivals } from '@/lib/products';

export function NewArrivals() {
  const root = useRef<HTMLElement>(null);
  useSilkReveal(root);

  return (
    <section id="new-in" ref={root} aria-labelledby="new-in-title" className="bg-blush py-24 md:py-36">
      <div className="mx-auto max-w-[1500px] px-5 md:px-10 lg:px-16">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p data-silk className="overline flex items-center gap-4 text-gold-deep">
              <span className="h-px w-10 bg-gold" aria-hidden /> Just In
            </p>
            <SplitLines id="new-in-title" lines={['New Arrivals']} className="mt-4 font-serif text-5xl leading-none md:text-7xl" />
          </div>
          <a data-silk href="#new-in" className="group flex items-center gap-3 overline text-espresso/70 hover:text-espresso">
            View all
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/60 transition-all duration-500 group-hover:bg-gold">
              <ArrowRight size={15} strokeWidth={1.4} />
            </span>
          </a>
        </div>
        <div className="hairline mt-10 md:mt-14" />

        <div data-silk-group className="mt-10 grid grid-cols-2 gap-x-4 gap-y-12 md:mt-14 lg:grid-cols-4 lg:gap-x-7">
          {newArrivals.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
