'use client';

import Image from 'next/image';
import { Instagram } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useLenis } from '@/components/providers/LenisProvider';
import { gsap } from '@/lib/gsap';
import { IMG } from '@/lib/products';

const square = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=600&h=600&q=75`;

const FEED = [
  IMG.redGown,
  IMG.silkSaree,
  IMG.polkaMidi,
  IMG.emeraldGown,
  IMG.floralDetail,
  IMG.ivoryAnarkali,
  IMG.blushRuffle,
  IMG.azureMaxi,
  IMG.sareeRed,
  IMG.coralMaxi,
];

const BASE_SPEED = 0.6; // px per frame at 60fps

export function InstagramStrip() {
  const track = useRef<HTMLDivElement>(null);
  const lenis = useLenis();

  useEffect(() => {
    const el = track.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const setX = gsap.quickSetter(el, 'x', 'px');
    let x = 0;
    let speed = BASE_SPEED;

    // Drift continuously; scroll velocity from Lenis eases the marquee faster, then it settles back.
    const tick = (_time: number, deltaMs: number) => {
      const boost = Math.min(Math.abs((lenis as { velocity?: number } | null)?.velocity ?? 0) * 0.35, 9);
      speed += (BASE_SPEED + boost - speed) * 0.08;
      x -= speed * (deltaMs / 16.67);
      const half = el.scrollWidth / 2;
      if (-x >= half) x += half;
      setX(x);
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [lenis]);

  return (
    <section aria-label="AURELLE on Instagram" className="relative overflow-hidden bg-blush py-16 md:py-24">
      <div className="no-scrollbar overflow-x-auto motion-safe:overflow-hidden">
        <div ref={track} className="flex w-max gap-3 md:gap-4">
          {[...FEED, ...FEED].map((id, i) => (
            <a
              key={i}
              href="https://instagram.com/aurelle.official"
              target="_blank"
              rel="noreferrer"
              aria-hidden={i >= FEED.length}
              tabIndex={i >= FEED.length ? -1 : undefined}
              className="group relative block aspect-square w-[44vw] shrink-0 overflow-hidden rounded-2xl sm:w-[28vw] md:w-[17vw]"
            >
              <Image
                src={square(id)}
                alt={i < FEED.length ? 'AURELLE Instagram post' : ''}
                fill
                sizes="(min-width: 768px) 17vw, 44vw"
                className="object-cover transition-transform duration-[1200ms] ease-silk group-hover:scale-110"
              />
              <span className="absolute inset-0 flex items-center justify-center bg-espresso/0 text-ivory opacity-0 transition-all duration-500 group-hover:bg-espresso/35 group-hover:opacity-100">
                <Instagram size={22} strokeWidth={1.4} />
              </span>
            </a>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <a
          href="https://instagram.com/aurelle.official"
          target="_blank"
          rel="noreferrer"
          className="pointer-events-auto flex items-center gap-3 rounded-full bg-ivory/90 px-6 py-3.5 shadow-xl backdrop-blur-md transition-colors duration-500 hover:bg-gold md:px-8 md:py-4"
        >
          <Instagram size={17} strokeWidth={1.4} />
          <span className="font-serif text-base md:text-lg">@aurelle.official</span>
          <span className="hidden h-4 w-px bg-espresso/25 sm:block" aria-hidden />
          <span className="overline hidden sm:inline">Follow Us</span>
        </a>
      </div>
    </section>
  );
}
