'use client';

import Image from 'next/image';
import { X } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { SplitLines } from '@/components/ui/SplitLines';
import { useLenis } from '@/components/providers/LenisProvider';
import { useSilkReveal } from '@/hooks/useSilkReveal';
import { Flip, gsap, useGSAP, DESKTOP, MOTION_OK } from '@/lib/gsap';
import { IMG, unsplash } from '@/lib/products';

const LOOKS = [
  { id: IMG.redGown, caption: 'Look 01 — Scarlet Reverie', alt: 'Scarlet silk gown in motion on a terrace' },
  { id: IMG.emeraldGown, caption: 'Look 02 — Emerald Flow', alt: 'Emerald chiffon gown with bishop sleeves in a meadow' },
  { id: IMG.plumGown, caption: 'Look 03 — Plum Satin', alt: 'Plum off-shoulder satin gown against a lilac backdrop' },
  { id: IMG.ivoryAnarkali, caption: 'Look 04 — Noor Anarkali', alt: 'Ivory chikankari anarkali flowing outdoors' },
  { id: IMG.sareeRed, caption: 'Look 05 — Meenakshi Silk', alt: 'Aubergine Kanjivaram saree with gold zari pallu' },
  { id: IMG.azureMaxi, caption: 'Look 06 — Azure Wrap', alt: 'Azure wrap maxi dress on the beach' },
  { id: IMG.coralMaxi, caption: 'Look 07 — Coral Tier', alt: 'Coral tiered maxi dress in a bright studio' },
  { id: IMG.midnightLace, caption: 'Look 08 — Midnight Lace', alt: 'Midnight blue lace dress by the sea' },
];

const SPEEDS = [6, 12, 4, 10, 8, 14, 5, 11];

export function Lookbook() {
  const root = useRef<HTMLElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const flipState = useRef<Flip.FlipState | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const lenis = useLenis();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`${DESKTOP} and ${MOTION_OK}`, () => {
        const el = track.current!;
        const distance = () => el.scrollWidth - window.innerWidth;

        // x = -(scrollWidth - viewport) * progress
        const slide = gsap.to(el, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => gsap.set(bar.current, { scaleX: self.progress }),
            onToggle: (self) => gsap.set(el, { willChange: self.isActive ? 'transform' : 'auto' }),
          },
        });

        // Each frame's photo parallaxes at its own speed inside the moving row.
        gsap.utils.toArray<HTMLElement>('[data-lb-img]', el).forEach((img) => {
          const speed = Number(img.dataset.speed);
          gsap.fromTo(
            img,
            { xPercent: -speed },
            {
              xPercent: speed,
              ease: 'none',
              scrollTrigger: {
                trigger: img.parentElement,
                containerAnimation: slide,
                start: 'left right',
                end: 'right left',
                scrub: true,
              },
            },
          );
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  useSilkReveal(root);

  // Native horizontal scroll (mobile / reduced motion) still drives the gold progress line.
  const onNativeScroll = () => {
    const s = scroller.current;
    if (!s || !bar.current) return;
    const max = s.scrollWidth - s.clientWidth;
    bar.current.style.transform = `scaleX(${max > 0 ? s.scrollLeft / max : 0})`;
  };

  // ── Flip lightbox ────────────────────────────────────────────────
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const openLook = (i: number) => {
    flipState.current = Flip.getState(`[data-flip-id="look-${i}"]`);
    setOpen(i);
  };

  useLayoutEffect(() => {
    if (open === null || !overlay.current) return;
    lenis?.stop();
    const frame = overlay.current.querySelector('[data-flip-id]');
    gsap.fromTo(overlay.current, { backgroundColor: 'rgba(28,21,18,0)' }, { backgroundColor: 'rgba(28,21,18,0.88)', duration: 0.6 });
    if (flipState.current && frame && !reduced()) {
      Flip.from(flipState.current, { targets: frame, duration: 0.9, ease: 'power3.inOut', scale: true });
    }
    gsap.fromTo(overlay.current.querySelectorAll('[data-lb-ui]'), { opacity: 0, y: 16 }, { opacity: 1, y: 0, delay: 0.5, duration: 0.6 });
  }, [open, lenis]);

  const closeLook = () => {
    if (open === null || !overlay.current) return;
    const frame = overlay.current.querySelector('[data-flip-id]');
    const source = document.querySelector(`[data-lb-source="${open}"]`);
    const done = () => {
      setOpen(null);
      lenis?.start();
    };
    if (!frame || !source || reduced()) return done();
    gsap.to(overlay.current.querySelectorAll('[data-lb-ui]'), { opacity: 0, duration: 0.25 });
    gsap.to(overlay.current, { backgroundColor: 'rgba(28,21,18,0)', duration: 0.8 });
    Flip.fit(frame, source, { duration: 0.8, ease: 'power3.inOut', scale: true, onComplete: done });
  };

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeLook();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <section
      id="lookbook"
      ref={root}
      aria-labelledby="lookbook-title"
      className="relative overflow-hidden bg-ivory py-20 md:motion-safe:flex md:motion-safe:h-screen md:motion-safe:flex-col md:motion-safe:justify-center md:motion-safe:pb-0 md:motion-safe:pt-20"
    >
      <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-end justify-between gap-4 px-5 md:px-10 lg:px-16">
        <div>
          <p data-silk className="overline text-gold-deep">
            Lookbook · SS&rsquo;26
          </p>
          <SplitLines
            id="lookbook-title"
            lines={['The Summer of', <em key="s">Soft Light.</em>]}
            className="mt-3 font-serif text-[clamp(2.4rem,5vw,4.5rem)] leading-[1]"
          />
        </div>
        <p data-silk className="max-w-xs text-sm text-espresso/60">
          Shot on the coast of Goa — eight looks, one long golden hour. Tap any frame to view.
        </p>
      </div>

      <div
        ref={scroller}
        onScroll={onNativeScroll}
        className="no-scrollbar mt-10 snap-x snap-mandatory overflow-x-auto md:mt-14 md:motion-safe:snap-none md:motion-safe:overflow-visible"
      >
        <ul ref={track} className="flex w-max gap-4 px-5 md:gap-8 md:px-16">
          {LOOKS.map((look, i) => (
            <li key={look.id} className={`shrink-0 snap-center ${i % 2 ? 'md:mt-12' : ''}`}>
              <button
                type="button"
                onClick={() => openLook(i)}
                aria-label={`View ${look.caption}`}
                className="group block text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
              >
                <div
                  data-flip-id={open === i ? undefined : `look-${i}`}
                  data-lb-source={i}
                  className={`relative aspect-[3/4] h-[52vh] max-h-[580px] overflow-hidden rounded-2xl ${open === i ? 'opacity-0' : ''}`}
                >
                  <div data-lb-img data-speed={SPEEDS[i]} className="absolute -inset-x-[15%] inset-y-0">
                    <Image
                      src={unsplash(look.id, 1200)}
                      alt={look.alt}
                      fill
                      sizes="(min-width: 768px) 32vw, 70vw"
                      className="object-cover transition-transform duration-[1400ms] ease-silk group-hover:scale-105"
                    />
                  </div>
                </div>
                <p className="mt-4 font-serif text-lg italic text-espresso/80">{look.caption}</p>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="mx-auto mt-8 w-full max-w-[1600px] px-5 md:mt-10 md:px-16" aria-hidden>
        <div className="relative h-px bg-espresso/10">
          <span ref={bar} className="absolute inset-0 origin-left scale-x-0 bg-gold" />
        </div>
      </div>

      {open !== null && createPortal(
        <div
          ref={overlay}
          role="dialog"
          aria-modal="true"
          aria-label={LOOKS[open].caption}
          className="fixed inset-0 z-[90] flex items-center justify-center p-6"
          onClick={closeLook}
        >
          <div
            data-flip-id={`look-${open}`}
            className="relative aspect-[3/4] h-[84vh] max-w-full overflow-hidden rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image src={unsplash(LOOKS[open].id, 1600)} alt={LOOKS[open].alt} fill sizes="60vw" className="object-cover" />
          </div>
          <p data-lb-ui className="absolute bottom-6 left-1/2 -translate-x-1/2 font-serif text-xl italic text-ivory">
            {LOOKS[open].caption}
          </p>
          <button
            data-lb-ui
            type="button"
            onClick={closeLook}
            aria-label="Close lookbook image"
            autoFocus
            className="absolute right-6 top-6 flex h-11 w-11 items-center justify-center rounded-full border border-ivory/40 text-ivory hover:border-gold hover:text-gold"
          >
            <X size={18} strokeWidth={1.4} />
          </button>
        </div>,
        document.body,
      )}
    </section>
  );
}
