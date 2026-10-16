'use client';

import Image from 'next/image';
import { Star } from 'lucide-react';
import { useRef } from 'react';
import { SplitLines } from '@/components/ui/SplitLines';
import { useSilkReveal } from '@/hooks/useSilkReveal';
import { IMG } from '@/lib/products';

const avatar = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&crop=faces&w=160&h=160&q=80`;

const AVATARS = [IMG.portrait, IMG.noirDress, IMG.blushRuffle, IMG.stripeTop, IMG.sunhatWhite];

const REVIEWS = [
  {
    quote:
      'My reception lehenga felt weightless — I danced for four hours. The zari caught every light in the hall. Everyone asked who made it.',
    name: 'Ananya R.',
    detail: 'Mehr Bridal Lehenga · Mumbai',
    img: IMG.portrait,
  },
  {
    quote:
      'The made-to-measure service is unreal. They took my measurements on a video call and the gown fit like it was draped on me.',
    name: 'Kavya S.',
    detail: 'Scarlet Reverie Gown · Bengaluru',
    img: IMG.blushRuffle,
  },
  {
    quote:
      'Beautifully packed, arrived in two days, and the linen is so soft. I have already ordered it in a second colour.',
    name: 'Meera J.',
    detail: 'Azure Summer Midi · Delhi',
    img: IMG.sunhatWhite,
  },
];

export function Testimonials() {
  const root = useRef<HTMLElement>(null);
  useSilkReveal(root);

  return (
    <section ref={root} aria-labelledby="reviews-title" className="bg-ivory py-24 md:py-36">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="flex flex-col items-center text-center">
          <p data-silk className="overline text-gold-deep">
            Reviews
          </p>
          <SplitLines
            id="reviews-title"
            lines={['Loved by Every', <em key="s">Silhouette</em>]}
            className="mt-4 font-serif text-[clamp(2.6rem,6vw,5rem)] leading-[1]"
          />
          <div data-silk className="mt-8 flex items-center gap-4">
            <div className="flex -space-x-3">
              {AVATARS.map((id) => (
                <span key={id} className="relative h-11 w-11 overflow-hidden rounded-full border-2 border-ivory">
                  <Image src={avatar(id)} alt="" fill sizes="44px" className="object-cover" />
                </span>
              ))}
            </div>
            <div className="text-left">
              <div className="flex gap-0.5 text-gold" aria-hidden>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={13} fill="currentColor" strokeWidth={0} />
                ))}
              </div>
              <p className="mt-1 text-sm">
                <span className="font-semibold">4.9/5</span> · 500+ Happy Customers
              </p>
            </div>
          </div>
        </div>

        <ul data-silk-group className="mt-16 grid gap-6 md:mt-24 md:grid-cols-3 md:gap-8">
          {REVIEWS.map((r, i) => (
            <li key={r.name} className={i === 1 ? 'md:translate-y-16' : ''}>
              <figure data-silk className="relative h-full overflow-hidden rounded-2xl border border-gold/30 bg-blush/60 p-8 md:p-10">
                <span aria-hidden className="pointer-events-none absolute -top-6 right-6 font-serif text-[160px] leading-none text-gold/25">
                  &ldquo;
                </span>
                <div className="flex gap-0.5 text-gold" aria-label="5 out of 5 stars">
                  {Array.from({ length: 5 }).map((_, k) => (
                    <Star key={k} size={13} fill="currentColor" strokeWidth={0} />
                  ))}
                </div>
                <blockquote className="relative mt-6 font-serif text-xl leading-relaxed md:text-[22px]">{r.quote}</blockquote>
                <figcaption className="mt-8 flex items-center gap-3">
                  <span className="relative h-11 w-11 overflow-hidden rounded-full">
                    <Image src={avatar(r.img)} alt="" fill sizes="44px" className="object-cover" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{r.name}</span>
                    <span className="block text-xs text-espresso/55">{r.detail}</span>
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
