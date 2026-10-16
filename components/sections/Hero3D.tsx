'use client';

import Image from 'next/image';
import { ArrowDown, ArrowRight, BadgeCheck, RotateCcw, Truck } from 'lucide-react';
import { useRef } from 'react';
import { SplitLines } from '@/components/ui/SplitLines';
import { useScrollTo } from '@/components/providers/LenisProvider';
import { gsap, useGSAP, MOTION_OK } from '@/lib/gsap';
import { IMG, unsplash } from '@/lib/products';

/**
 * 3D scroll hero — a camera "walks" into the boutique.
 *
 * Full-bleed image planes sit at increasing depths inside a perspective stage. Scrolling pushes the camera
 * forward (translateZ); each plane swells past the viewer, blurs and dissolves into the next room.
 * Smaller framed looks float at in-between depths so they parallax past the edges of the screen.
 */

/** CSS perspective (px). */
const P = 1000;
/** Depth at which a full-bleed plane renders at exactly 100% — also the spacing between rooms. */
const GAP = 1400;
/** How far past a plane the camera travels while that plane dissolves. */
const FADE = 400;

const ROOMS = [
  {
    src: unsplash(IMG.rack, 2400),
    alt: 'Inside the boutique — racks of silk sarees under warm light',
    chapter: 'The Store',
  },
  {
    src: unsplash(IMG.silkSaree, 2400),
    alt: 'Close view of a hand-woven silk saree drape',
    chapter: 'The Weave',
    caption: ['Six weavers, one thread —', 'months of patient hands.'],
    align: 'bottom-left',
  },
  {
    src: unsplash(IMG.sareeRed, 2400),
    alt: 'Model in a red Banarasi saree with gold zari border',
    chapter: 'The Zari',
    caption: ['Zari catches the light the way', 'memory catches a moment.'],
    align: 'top-right',
  },
  {
    src: unsplash(IMG.scarletStudio, 2400),
    alt: 'Portrait of a bride in scarlet silk',
    chapter: 'The Bride',
  },
] as const;

const DEPTHS = ROOMS.map((_, i) => i * GAP);
/** Camera stops once the last room has fully taken over. */
const Z_END = DEPTHS[DEPTHS.length - 1] - GAP + FADE;

/** Framed looks that drift past the camera between rooms: x/y in vw/vh, z in px. */
const FLOATERS = [
  { src: unsplash(IMG.ivoryAnarkali, 700), x: -34, y: -8, z: 650, label: 'Ivory Anarkali' },
  { src: unsplash(IMG.emeraldGown, 700), x: 30, y: 10, z: 900, label: 'Emerald Kanjivaram' },
  { src: unsplash(IMG.bordeauxMidi, 700), x: -30, y: 12, z: 2100, label: 'Bordeaux Tissue' },
  { src: unsplash(IMG.plumGown, 700), x: 33, y: -12, z: 2350, label: 'Plum Organza' },
];

const MARQUEE = ['Pure zari, tested & certified', 'New festive silk', 'Made-to-drape blouse stitching', 'Easy 7-day returns', 'Handwoven in India'];

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
/** Timeline position (0–1) at which the camera reaches depth `z`. */
const at = (z: number) => z / Z_END;

export function Hero3D() {
  const root = useRef<HTMLElement>(null);
  const scrollTo = useScrollTo();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const camera = root.current!.querySelector<HTMLElement>('[data-h3-camera]')!;
        const rooms = gsap.utils.toArray<HTMLElement>('[data-h3-room]');
        const floaters = gsap.utils.toArray<HTMLElement>('[data-h3-floater]');
        const ticks = gsap.utils.toArray<HTMLElement>('[data-h3-tick]');
        const cam = { z: 0 };

        const render = () => {
          const z = cam.z;
          camera.style.transform = `translate3d(0,0,${z}px)`;

          rooms.forEach((el, i) => {
            const dist = DEPTHS[i] - z; // > 0: still ahead, < 0: swelling past the viewer
            const t = i === rooms.length - 1 ? 0 : clamp01(-dist / FADE);
            el.style.opacity = String(1 - t);
            el.style.filter = t > 0.01 ? `blur(${(t * 12).toFixed(1)}px)` : 'none';
            el.style.visibility = t >= 1 || dist > GAP * 1.6 ? 'hidden' : 'visible';
          });

          floaters.forEach((el, i) => {
            const dist = FLOATERS[i].z - z;
            const fadeIn = clamp01((GAP * 1.2 - dist) / 500);
            const fadeOut = clamp01(-dist / (P * 0.35));
            el.style.opacity = String(fadeIn * (1 - fadeOut));
          });

          // Chapter rail: whichever room is currently in front.
          const active = Math.min(ROOMS.length - 1, Math.max(0, Math.floor((z + GAP - FADE) / GAP)));
          ticks.forEach((el, i) => el.toggleAttribute('data-active', i === active));
        };
        render();

        // Intro: the silk swings open like a curtain to reveal the store, then the copy rises.
        gsap
          .timeline({ defaults: { ease: 'power4.out' } })
          .fromTo('[data-h3-fabric-img]', { scale: 1.35, xPercent: 4 }, { scale: 1.2, xPercent: -2, duration: 1.4, ease: 'sine.inOut' })
          .to('[data-h3-fabric]', { rotateY: -82, xPercent: -30, opacity: 0, duration: 1.7, ease: 'power3.inOut' }, 1)
          .set('[data-h3-fabric]', { display: 'none' })
          .from('[data-h3-stage]', { scale: 1.15, duration: 2.2, ease: 'power3.out' }, 1.1)
          .from('[data-h3-title] .line-inner', { yPercent: 110, duration: 1.4, stagger: 0.12 }, 1.9)
          .from('[data-h3-fade]', { opacity: 0, y: 50, skewY: 3, duration: 1.1, stagger: 0.08 }, 2.2);

        // Scroll: one scrubbed timeline drives the camera plus every overlay that rides on it.
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: '+=420%',
            pin: true,
            scrub: 1.2,
            onToggle: (self) => gsap.set(rooms, { willChange: self.isActive ? 'transform, opacity, filter' : 'auto' }),
          },
        });

        tl.to(cam, { z: Z_END, duration: 1, ease: 'power1.inOut', onUpdate: render }, 0)
          .to('[data-h3-copy]', { opacity: 0, y: -80, duration: at(380) }, 0)
          .to('[data-h3-cue]', { opacity: 0, duration: 0.05 }, 0);

        gsap.utils.toArray<HTMLElement>('[data-h3-caption]').forEach((el) => {
          const i = Number(el.dataset.h3Caption);
          const enter = at(DEPTHS[i] - GAP + FADE * 0.6);
          const leave = at(DEPTHS[i] - FADE * 0.4);
          tl.fromTo(el, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.06 }, enter).to(
            el,
            { opacity: 0, y: -30, duration: 0.06 },
            Math.min(leave, 0.9),
          );
        });

        tl.fromTo('[data-h3-outro]', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.1 }, 0.88)
          .fromTo('[data-h3-ribbon]', { yPercent: 100 }, { yPercent: 0, duration: 0.1 }, 0.9)
          .fromTo('[data-h3-progress]', { scaleY: 0 }, { scaleY: 1, duration: 1 }, 0);

        // Endless ribbon marquee.
        gsap.to('[data-h3-marquee]', { xPercent: -50, duration: 28, repeat: -1 });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      aria-label="Step inside the saree boutique"
      className="relative h-screen overflow-hidden bg-espresso text-ivory"
    >
      {/* 3D stage */}
      <div data-h3-stage className="absolute inset-0" style={{ perspective: `${P}px`, perspectiveOrigin: '50% 50%' }}>
        <div data-h3-camera className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
          {ROOMS.map((room, i) => {
            // Scaled so it fills the screen exactly when the camera is GAP away — i.e. when it becomes the front room.
            const scale = i === 0 ? 1 : (P + GAP) / P;
            return (
              <div
                key={room.src}
                data-h3-room
                className="absolute inset-0 overflow-hidden"
                style={{
                  transform: `translate3d(0,0,${-DEPTHS[i]}px) scale(${scale})`,
                  visibility: i < 2 ? 'visible' : 'hidden',
                }}
              >
                <Image
                  src={room.src}
                  alt={room.alt}
                  fill
                  priority={i < 2}
                  sizes="100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-espresso/70 via-espresso/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-espresso/60 to-transparent" />
              </div>
            );
          })}

          {FLOATERS.map((f) => (
            <figure
              key={f.label}
              data-h3-floater
              className="absolute left-1/2 top-1/2 w-[28vw] max-w-[300px] opacity-0 md:w-[17vw]"
              style={{ transform: `translate(-50%,-50%) translate3d(${f.x}vw,${f.y}vh,${-f.z}px)` }}
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-[14px] shadow-2xl shadow-black/50 ring-1 ring-gold/40">
                <Image src={f.src} alt="" fill sizes="(min-width: 768px) 17vw, 28vw" className="object-cover" />
              </div>
              <figcaption className="mt-3 font-serif text-sm italic text-ivory/85">{f.label}</figcaption>
            </figure>
          ))}
        </div>

        {/* Silk curtain intro — hinged on its left edge so it swings open in 3D. */}
        <div
          data-h3-fabric
          aria-hidden
          className="absolute inset-0 z-30 overflow-hidden bg-[#b3121b] motion-reduce:hidden"
          style={{ transformOrigin: '0% 50%', backfaceVisibility: 'hidden' }}
        >
          <div data-h3-fabric-img className="absolute inset-0">
            <Image src={unsplash(IMG.silkSaree, 2000)} alt="" fill priority sizes="100vw" className="object-cover" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-[#c8102e]/55 via-[#a10d1d]/35 to-[#d9a441]/40 mix-blend-multiply" />
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-black/40 to-transparent" />
        </div>
      </div>

      {/* Opening copy */}
      <div data-h3-copy className="relative z-10 flex h-full items-center">
        <div className="mx-auto w-full max-w-[1600px] px-6 md:px-16">
          <div className="max-w-2xl">
            <p data-h3-fade className="overline flex items-center gap-4 text-gold-soft">
              <span className="h-px w-10 bg-gold" aria-hidden />
              Tradition meets tomorrow
            </p>
            <div data-h3-title>
              <SplitLines
                as="h1"
                reveal={false}
                lines={['More', <>Than a <em className="font-normal italic text-gold-soft">Saree</em></>]}
                className="mt-6 font-serif text-[clamp(3.4rem,9vw,8.5rem)] font-normal leading-[0.95] tracking-tight"
              />
            </div>
            <p data-h3-fade className="overline mt-5 text-ivory/70">A story told in silk</p>
            <p data-h3-fade className="mt-5 max-w-md text-[15px] leading-relaxed text-ivory/80">
              Timeless weaves, modern expression. For every you, and every moment worth remembering.
            </p>
            <div data-h3-fade className="mt-9 flex flex-wrap items-center gap-4">
              <a href="#new-in" onClick={(e) => (e.preventDefault(), scrollTo('#new-in'))} className="pill-gold">
                Explore Collection <ArrowRight size={14} strokeWidth={1.6} />
              </a>
            </div>
            <ul data-h3-fade className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-[12px] text-ivory/75">
              <li className="flex items-center gap-2"><BadgeCheck size={15} strokeWidth={1.4} className="text-gold" /> 100% Authentic Weaves</li>
              <li className="flex items-center gap-2"><Truck size={15} strokeWidth={1.4} className="text-gold" /> Free Shipping across India</li>
              <li className="flex items-center gap-2"><RotateCcw size={15} strokeWidth={1.4} className="text-gold" /> Easy 7-day Returns</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Room captions */}
      {ROOMS.map((room, i) =>
        'caption' in room ? (
          <p
            key={room.chapter}
            data-h3-caption={i}
            aria-hidden
            className={`pointer-events-none absolute z-10 max-w-[80vw] font-serif text-[clamp(1.25rem,2.4vw,2.1rem)] italic leading-snug text-ivory opacity-0 drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)] ${
              room.align === 'bottom-left' ? 'bottom-[16vh] left-6 md:left-16' : 'right-6 top-[22vh] text-right md:right-16'
            }`}
          >
            {room.caption[0]}
            <br />
            {room.caption[1]}
          </p>
        ) : null,
      )}

      {/* Closing copy over the final room */}
      <div data-h3-outro className="pointer-events-none absolute inset-x-0 bottom-[18vh] z-10 opacity-0">
        <div className="mx-auto w-full max-w-[1600px] px-6 md:px-16">
          <p className="overline text-gold-soft">The bridal edit</p>
          <p className="mt-4 font-serif text-[clamp(2.2rem,5vw,4.5rem)] leading-[1.02]">
            Woven to be <em className="italic text-gold-soft">remembered.</em>
          </p>
        </div>
      </div>

      {/* Chapter rail */}
      <div className="absolute right-6 top-1/2 z-10 hidden -translate-y-1/2 items-stretch gap-4 md:flex">
        <ol className="flex flex-col justify-between gap-6 text-right">
          {ROOMS.map((room, i) => (
            <li
              key={room.chapter}
              data-h3-tick
              data-active={i === 0 ? '' : undefined}
              className="overline text-[10px] text-ivory/40 transition-colors duration-500 data-[active]:text-gold-soft"
            >
              {String(i + 1).padStart(2, '0')} · {room.chapter}
            </li>
          ))}
        </ol>
        <span className="relative w-px bg-ivory/20" aria-hidden>
          <span data-h3-progress className="absolute inset-0 origin-top scale-y-0 bg-gold" />
        </span>
      </div>

      <div data-h3-cue className="absolute bottom-20 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-ivory/70">
        <span className="overline text-[10px]">Scroll to step inside</span>
        <ArrowDown size={14} strokeWidth={1.2} className="animate-bounce" />
      </div>

      {/* Ribbon that hands off to the next section */}
      <div data-h3-ribbon className="absolute inset-x-0 bottom-0 z-20 overflow-hidden bg-[#6e0f2a] py-3 text-ivory/90">
        <div data-h3-marquee className="flex w-max whitespace-nowrap font-serif text-sm italic">
          {[0, 1].map((k) => (
            <span key={k} className="flex" aria-hidden={k === 1}>
              {MARQUEE.map((m) => (
                <span key={m} className="flex items-center gap-8 px-8">
                  {m} <span className="text-gold">✦</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
