'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { SplitLines } from '@/components/ui/SplitLines';
import { useSilkReveal } from '@/hooks/useSilkReveal';
import { gsap, useGSAP, DESKTOP, MOTION_OK } from '@/lib/gsap';
import { IMG, unsplash } from '@/lib/products';

const COPY =
  'Every AURELLE piece begins as a bolt of pure silk, georgette or Banarasi weave. Our karigars hand-set each sequin, knot every tassel and trace zari borders thread by thread — then we cut it to you, so it moves the way only something made for you can.';

const STATS = [
  { value: 120, suffix: '+', unit: 'hrs', label: 'Handwork on every bridal piece' },
  { value: 100, suffix: '%', unit: '', label: 'Pure, natural fabrics' },
  { value: 36, suffix: '', unit: 'pt', label: 'Made-to-measure fit profile' },
];

export function FabricCraft() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add({ motion: MOTION_OK, desktop: DESKTOP }, (ctx) => {
        const { motion, desktop } = ctx.conditions as { motion: boolean; desktop: boolean };
        if (!motion) return;
        const q = gsap.utils.selector(root);

        if (desktop) {
          // Pinned: macro image drifts in a slow Ken Burns while the copy writes itself word by word.
          gsap
            .timeline({
              scrollTrigger: { trigger: root.current, start: 'top top', end: '+=120%', pin: true, scrub: 1 },
            })
            .fromTo(q('[data-craft-macro]'), { scale: 1.3 }, { scale: 1, ease: 'none' }, 0)
            .fromTo(q('[data-craft-inset]'), { yPercent: 30 }, { yPercent: -20, ease: 'none' }, 0)
            .fromTo(q('[data-word]'), { opacity: 0.12 }, { opacity: 1, stagger: 0.04, ease: 'none', duration: 0.3 }, 0.05);
        } else {
          gsap.fromTo(q('[data-craft-macro]'), { scale: 1.25 }, {
            scale: 1,
            ease: 'none',
            scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
          });
          gsap.fromTo(q('[data-word]'), { opacity: 0.12 }, {
            opacity: 1,
            stagger: 0.04,
            ease: 'none',
            scrollTrigger: { trigger: q('[data-craft-copy]')[0], start: 'top 85%', end: 'bottom 55%', scrub: true },
          });
        }

        // Counters tick up once they enter view; the final values are already in the markup for no-JS / reduced motion.
        q('[data-count]').forEach((el) => {
          const target = Number(el.dataset.count);
          const counter = { v: 0 };
          gsap.to(counter, {
            v: target,
            duration: 2.2,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 90%', once: true },
            onUpdate: () => void (el.textContent = String(Math.round(counter.v))),
          });
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  useSilkReveal(root);

  return (
    <section
      id="craft"
      ref={root}
      aria-labelledby="craft-title"
      className="relative overflow-hidden bg-blush md:h-screen"
    >
      <div className="grid h-full md:grid-cols-2">
        <div className="relative h-[70vh] overflow-hidden md:h-full">
          <div data-craft-macro className="absolute inset-0">
            <Image
              src={unsplash(IMG.floralDetail, 2000)}
              alt="Close-up of a hand-printed floral silk dress catching the light"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-espresso/40 to-transparent" />
          <figure
            data-craft-inset
            className="absolute bottom-[10%] right-[8%] aspect-[3/4] w-[34%] overflow-hidden rounded-2xl border-4 border-ivory shadow-2xl"
          >
            <Image
              src={unsplash(IMG.sareeRed, 700)}
              alt="Zari-woven Kanjivaram silk saree border in aubergine and gold"
              fill
              sizes="20vw"
              className="object-cover"
            />
          </figure>
          <p className="overline absolute left-6 top-28 text-ivory/85 md:left-10">Silk · Zari · Dabka</p>
        </div>

        <div className="flex items-center px-6 py-20 md:px-12 md:py-0 lg:px-20">
          <div className="max-w-xl">
            <p data-silk className="overline flex items-center gap-4 text-gold-deep">
              <span className="h-px w-10 bg-gold" aria-hidden /> The Atelier
            </p>
            <SplitLines
              id="craft-title"
              lines={['Hand-finished,', <em key="t">thread by thread.</em>]}
              className="mt-5 font-serif text-[clamp(2.6rem,5vw,4.5rem)] leading-[1.02]"
            />
            <p data-craft-copy className="mt-8 text-lg leading-relaxed text-espresso md:text-xl">
              {COPY.split(' ').map((w, i) => (
                <span key={i} data-word className="inline-block">
                  {w}&nbsp;
                </span>
              ))}
            </p>

            <div className="hairline mt-10" />
            <dl data-silk-group className="mt-8 grid grid-cols-3 gap-4 md:gap-8">
              {STATS.map((s) => (
                <div key={s.label} data-silk>
                  <dt className="sr-only">{s.label}</dt>
                  <dd>
                    <span className="font-serif text-4xl text-gold-deep md:text-5xl">
                      <span data-count={s.value} className="tabular-nums">
                        {s.value}
                      </span>
                      {s.suffix}
                    </span>
                    {s.unit && <span className="ml-1 text-sm text-espresso/60">{s.unit}</span>}
                    <span aria-hidden className="mt-2 block text-xs leading-snug text-espresso/65">
                      {s.label}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
