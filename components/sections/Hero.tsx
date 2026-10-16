'use client';

import Image from 'next/image';
import { ArrowDown, Play } from 'lucide-react';
import { useRef } from 'react';
import { SplitLines } from '@/components/ui/SplitLines';
import { useScrollTo } from '@/components/providers/LenisProvider';
import { gsap, useGSAP, DESKTOP, MOTION_OK } from '@/lib/gsap';
import { IMG, unsplash } from '@/lib/products';

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const scrollTo = useScrollTo();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add({ motion: MOTION_OK, desktop: DESKTOP }, (ctx) => {
        const { motion, desktop } = ctx.conditions as { motion: boolean; desktop: boolean };
        if (!motion) return;

        // Load-in: image settles, headline lines rise out of their masks, the rest silks in.
        gsap
          .timeline({ defaults: { ease: 'power4.out' } })
          .from('[data-hero-media]', { scale: 1.2, duration: 2.6, ease: 'power3.out' })
          .from('[data-hero-title] .line-inner', { yPercent: 110, duration: 1.4, stagger: 0.12 }, 0.35)
          .from('[data-hero-fade]', { opacity: 0, y: 60, skewY: 4, duration: 1.1, stagger: 0.08 }, 0.85);

        // Scroll: full-bleed photo scales down into a rounded frame; copy drifts up slower.
        gsap
          .timeline({
            scrollTrigger: {
              trigger: root.current,
              start: 'top top',
              end: '+=90%',
              pin: true,
              scrub: 1,
              onToggle: (self) =>
                gsap.set('[data-hero-frame]', { willChange: self.isActive ? 'clip-path, transform' : 'auto' }),
            },
          })
          .fromTo(
            '[data-hero-frame]',
            { clipPath: 'inset(0% 0% 0% 0% round 0px)' },
            {
              clipPath: desktop ? 'inset(13% 5% 5% 5% round 24px)' : 'inset(12% 4% 6% 4% round 24px)',
              ease: 'none',
            },
            0,
          )
          .to('[data-hero-parallax]', { scale: 1.08, ease: 'none' }, 0)
          .to('[data-hero-copy]', { yPercent: -28, ease: 'none' }, 0)
          .to('[data-hero-cue]', { opacity: 0, ease: 'none', duration: 0.2 }, 0);
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-label="Spring Summer 2026 collection" className="relative h-screen overflow-hidden bg-ivory">
      <div data-hero-frame className="absolute inset-0 overflow-hidden">
        <div data-hero-parallax className="absolute inset-0">
          <div data-hero-media className="absolute inset-0">
            <Image
              src={unsplash(IMG.redGown, 2400)}
              alt="Model in a flowing scarlet silk gown mid-twirl on a sunlit terrace"
              fill
              priority
              sizes="100vw"
              className="object-cover object-[60%_30%]"
            />
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-espresso/75 via-espresso/35 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-espresso/40 to-transparent" />
      </div>

      <div data-hero-copy className="relative z-10 flex h-full items-center">
        <div className="mx-auto w-full max-w-[1600px] px-6 md:px-16">
          <div className="max-w-2xl text-ivory">
            <p data-hero-fade className="overline flex items-center gap-4 text-gold-soft">
              <span className="h-px w-10 bg-gold" aria-hidden />
              Spring · Summer &rsquo;26
            </p>
            <div data-hero-title>
              <SplitLines
                as="h1"
                reveal={false}
                lines={['Dressed in', <em key="p" className="font-normal italic">Poetry.</em>]}
                className="mt-6 font-serif text-[clamp(3.4rem,9vw,8.5rem)] font-normal leading-[0.95] tracking-tight"
              />
            </div>
            <p data-hero-fade className="mt-7 max-w-md text-[15px] leading-relaxed text-ivory/80">
              Silhouettes cut from silk, georgette and Banarasi weaves — hand-finished in our atelier for the moments you
              will remember.
            </p>
            <div data-hero-fade className="mt-10 flex flex-wrap items-center gap-4">
              <a href="#new-in" onClick={(e) => (e.preventDefault(), scrollTo('#new-in'))} className="pill-gold">
                Shop the Collection
              </a>
              <a href="#lookbook" onClick={(e) => (e.preventDefault(), scrollTo('#lookbook'))} className="pill-ghost text-ivory">
                <Play size={13} fill="currentColor" strokeWidth={0} /> Watch the Film
              </a>
            </div>
          </div>
        </div>
      </div>

      <div data-hero-cue className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-ivory/70">
        <span className="overline text-[10px]">Scroll</span>
        <ArrowDown size={14} strokeWidth={1.2} className="animate-bounce" />
      </div>
    </section>
  );
}
