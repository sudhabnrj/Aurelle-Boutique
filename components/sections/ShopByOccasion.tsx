'use client';

import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { useRef } from 'react';
import { SplitLines } from '@/components/ui/SplitLines';
import { useSilkReveal } from '@/hooks/useSilkReveal';
import { IMG, unsplash } from '@/lib/products';

const OCCASIONS = [
  {
    title: 'Wedding & Bridal',
    note: 'Lehengas, trousseau sarees & reception gowns',
    img: IMG.silkSaree,
    alt: 'Bride in a rani-pink Banarasi silk saree with gold jewellery',
    className: 'col-span-2 row-span-2 md:col-span-2 md:row-span-2',
  },
  {
    title: 'Evening',
    note: 'Gowns for galas & soirées',
    img: IMG.scarletStudio,
    alt: 'Model in a scarlet thigh-slit evening gown',
    className: 'col-span-2 md:col-span-2',
  },
  {
    title: 'Casual Day',
    note: 'Linen, cotton & easy midis',
    img: IMG.sunhatWhite,
    alt: 'Woman in a white day dress and sun hat on a palm-lined street',
    className: 'col-span-1',
  },
  {
    title: 'Festive Ethnic',
    note: 'Anarkalis, sarees & sets',
    img: IMG.ivoryAnarkali,
    alt: 'Woman in a flowing ivory anarkali walking outdoors',
    className: 'col-span-1',
  },
];

export function ShopByOccasion() {
  const root = useRef<HTMLElement>(null);
  useSilkReveal(root);

  return (
    <section id="occasion" ref={root} aria-labelledby="occasion-title" className="bg-ivory py-24 md:py-36">
      <div className="mx-auto max-w-[1500px] px-5 md:px-10 lg:px-16">
        <div className="text-center">
          <p data-silk className="overline text-gold-deep">
            Curated Edits
          </p>
          <SplitLines
            id="occasion-title"
            lines={['Shop by Occasion']}
            className="mt-4 font-serif text-5xl leading-none md:text-7xl"
          />
        </div>

        <ul
          data-silk-group
          className="mt-14 grid auto-rows-[220px] grid-cols-2 gap-3 md:mt-20 md:h-[86vh] md:max-h-[860px] md:auto-rows-auto md:grid-cols-4 md:grid-rows-2 md:gap-5"
        >
          {OCCASIONS.map((o) => (
            <li key={o.title} data-silk className={o.className}>
              <a
                href="#new-in"
                className="group relative block h-full overflow-hidden rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
              >
                <div data-kenburns className="absolute inset-0">
                  <Image
                    src={unsplash(o.img, 1400)}
                    alt={o.alt}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover transition-transform duration-[1600ms] ease-silk group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-espresso/75 via-espresso/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 md:p-8">
                  <div className="text-ivory">
                    <h3 className="font-serif text-2xl leading-tight md:text-4xl">{o.title}</h3>
                    <p className="mt-1 hidden text-sm text-ivory/75 sm:block">{o.note}</p>
                  </div>
                  <span className="pill-gold hidden shrink-0 translate-x-6 !px-5 !py-2.5 opacity-0 transition-all duration-700 ease-silk group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 md:inline-flex">
                    Explore <ArrowUpRight size={14} />
                  </span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
