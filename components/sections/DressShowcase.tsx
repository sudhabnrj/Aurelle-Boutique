'use client';

import Image from 'next/image';
import { Ruler, ShoppingBag } from 'lucide-react';
import { useRef, useState, type CSSProperties } from 'react';
import { useShop } from '@/context/ShopContext';
import { useSilkReveal } from '@/hooks/useSilkReveal';
import { gsap, useGSAP, DESKTOP, MOTION_OK } from '@/lib/gsap';
import { formatPrice } from '@/lib/format';
import { SIZES, showcaseProducts as LOOKS } from '@/lib/products';

const pad = (n: number) => String(n).padStart(2, '0');

/** Pre-hydration state of looks 2–4, matching the timeline's start — otherwise all four stacks render on top of each other until GSAP runs. */
const hiddenCard = (i: number): CSSProperties | undefined => (i ? { opacity: 0 } : undefined);
const hiddenLine = (i: number): CSSProperties | undefined => (i ? { transform: 'translateY(110%)' } : undefined);
const hiddenFill = (i: number): CSSProperties | undefined => (i ? { transform: 'scaleX(0)' } : undefined);

/** "Scarlet Reverie Gown" → ["Scarlet Reverie", "Gown"] — two masked lines per name. */
const splitName = (name: string) => {
  const words = name.split(' ');
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')].filter(Boolean);
};

export function DressShowcase() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);
  const [size, setSize] = useState<string>('M');
  const [colors, setColors] = useState<Record<string, string>>({});
  const { addItem, setSizeGuideOpen } = useShop();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`${DESKTOP} and ${MOTION_OK}`, () => {
        const q = gsap.utils.selector(stage);
        const cards = q('[data-look-card]');
        const fills = q('[data-look-fill]');
        // Each look owns two text stacks: the big index and the details block.
        const lines = (i: number) => q(`[data-look="${i}"] .line-inner`);
        const steps = LOOKS.length - 1;

        // The markup already renders looks 2–4 hidden (see `hidden*` below); restate it in GSAP's terms.
        // `y: 0` drops the px offset GSAP parses from the inline translateY(110%).
        gsap.set(cards.slice(1), { opacity: 0 });
        for (let i = 1; i <= steps; i++) gsap.set(lines(i), { y: 0, yPercent: 110 });
        gsap.set(fills.slice(1), { scaleX: 0 });

        const tl = gsap.timeline({
          defaults: { ease: 'power2.inOut' },
          scrollTrigger: {
            trigger: stage.current,
            start: 'top top',
            end: `+=${steps * 100}%`,
            pin: true,
            scrub: 1,
            snap: { snapTo: 1 / steps, duration: { min: 0.3, max: 0.8 }, delay: 0.1, ease: 'power2.inOut' },
            onToggle: (self) => gsap.set(cards, { willChange: self.isActive ? 'transform, opacity, filter' : 'auto' }),
            onUpdate: (self) => {
              const i = Math.round(self.progress * steps);
              if (i !== activeRef.current) {
                activeRef.current = i;
                setActive(i);
              }
            },
          },
        });

        for (let i = 1; i <= steps; i++) {
          const at = i - 1;
          // Outgoing look blurs and drifts left…
          tl.to(cards[i - 1], { xPercent: -28, opacity: 0, filter: 'blur(14px)', scale: 0.94, duration: 1 }, at)
            // …while the incoming one settles from 0.85 with a soft turn — a cross-swap, never a cut.
            .fromTo(
              cards[i],
              { scale: 0.85, rotateY: -22, xPercent: 14, opacity: 0, filter: 'blur(10px)' },
              { scale: 1, rotateY: 0, xPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 1 },
              at,
            )
            .to(root.current, { '--accent': LOOKS[i].showcase!.accent, duration: 1, ease: 'none' }, at)
            .to(lines(i - 1), { yPercent: -110, duration: 0.45, stagger: 0.04, ease: 'power3.in' }, at + 0.05)
            .to(lines(i), { yPercent: 0, duration: 0.55, stagger: 0.05, ease: 'power4.out' }, at + 0.45)
            .to(fills[i], { scaleX: 1, duration: 1, ease: 'none' }, at);
        }
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  useSilkReveal(root);

  const look = LOOKS[active];
  const colorOf = (id: string, fallback: string) => colors[id] ?? fallback;

  return (
    <section
      id="showcase"
      ref={root}
      aria-labelledby="showcase-title"
      className="relative bg-[var(--accent)]"
      style={{ '--accent': LOOKS[0].showcase!.accent } as CSSProperties}
    >
      <h2 id="showcase-title" className="sr-only">
        The Edit — four featured looks
      </h2>

      {/* Desktop: pinned 4-look cross-swap */}
      <div ref={stage} className="hidden h-screen md:motion-safe:block">
        <div className="mx-auto grid h-full max-w-[1500px] grid-cols-12 items-center gap-10 px-10 pt-20 lg:px-16">
          <div className="col-span-7 flex h-full items-center justify-center" style={{ perspective: 1400 }}>
            <div className="relative aspect-[3/4] h-[74vh] max-h-[780px]">
              {LOOKS.map((p, i) => (
                <figure
                  key={p.id}
                  data-look-card
                  className="absolute inset-0 overflow-hidden rounded-2xl shadow-[0_40px_80px_-30px_rgba(28,21,18,0.45)]"
                  style={{ zIndex: i + 1, ...hiddenCard(i) }}
                >
                  <Image
                    src={p.images[0]}
                    alt={`${p.name} — ${p.showcase!.label}`}
                    fill
                    sizes="(min-width: 768px) 40vw, 80vw"
                    className="object-cover"
                  />
                </figure>
              ))}
              <span
                aria-hidden
                className="pointer-events-none absolute -left-16 top-1/2 -translate-y-1/2 -rotate-90 overline text-espresso/40"
              >
                The Edit · SS&rsquo;26
              </span>
            </div>
          </div>

          <div className="col-span-5">
            <div className="flex items-end gap-6">
              <div className="grid">
                {LOOKS.map((p, i) => (
                  <div key={p.id} data-look={i} className="[grid-area:1/1]" aria-hidden={i !== active}>
                    <div className="flex items-baseline font-serif leading-none">
                      <span className="masked-line">
                        <span className="line-inner block text-[clamp(4rem,8vw,7.5rem)]" style={hiddenLine(i)}>{pad(i + 1)}</span>
                      </span>
                      <span className="masked-line">
                        <span className="line-inner block pl-2 text-2xl text-espresso/40" style={hiddenLine(i)}>/{pad(LOOKS.length)}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex gap-2" aria-hidden>
              {LOOKS.map((p, i) => (
                <span key={p.id} className="relative h-[2px] flex-1 overflow-hidden bg-espresso/10">
                  <span data-look-fill className="absolute inset-0 origin-left bg-gold" style={hiddenFill(i)} />
                </span>
              ))}
            </div>

            <div className="mt-10 grid">
              {LOOKS.map((p, i) => (
                <div key={p.id} data-look={i} className="[grid-area:1/1]" aria-hidden={i !== active}>
                  <span className="masked-line">
                    <span className="line-inner overline block text-gold-deep" style={hiddenLine(i)}>{p.showcase!.label}</span>
                  </span>
                  <h3 className="mt-3 font-serif text-[clamp(2.4rem,4vw,3.75rem)] leading-[1.02]">
                    {splitName(p.name).map((part, k) => (
                      <span key={k} className="masked-line">
                        <span className={`line-inner block ${k ? 'italic' : ''}`} style={hiddenLine(i)}>{part}</span>
                      </span>
                    ))}
                  </h3>
                  <span className="masked-line mt-4">
                    <span className="line-inner block text-sm text-espresso/65" style={hiddenLine(i)}>{p.fabric}</span>
                  </span>
                  <span className="masked-line mt-5">
                    <span className="line-inner flex items-baseline gap-3" style={hiddenLine(i)}>
                      <span className="font-serif text-3xl text-gold-deep">{formatPrice(p.price)}</span>
                      <s className="text-sm text-espresso/40">{formatPrice(p.mrp)}</s>
                    </span>
                  </span>
                </div>
              ))}
            </div>

            <div className="hairline mt-8" />

            <fieldset className="mt-7">
              <div className="flex items-center justify-between">
                <legend className="overline text-espresso/60">Size</legend>
                <button
                  type="button"
                  onClick={() => setSizeGuideOpen(true)}
                  className="flex items-center gap-1.5 text-xs underline-offset-4 hover:text-gold-deep hover:underline"
                >
                  <Ruler size={13} strokeWidth={1.4} /> Size Guide
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {SIZES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    aria-pressed={size === s}
                    className={`h-10 min-w-[48px] rounded-full border px-3 text-xs tracking-[0.15em] transition-all duration-300 ${
                      size === s ? 'border-espresso bg-espresso text-ivory' : 'border-espresso/20 hover:border-gold'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="mt-6">
              <legend className="overline text-espresso/60">
                Colour · <span className="text-espresso">{colorOf(look.id, look.colors[0].name)}</span>
              </legend>
              <div key={look.id} className="mt-3 flex gap-3">
                {look.colors.map((c) => {
                  const selected = colorOf(look.id, look.colors[0].name) === c.name;
                  return (
                    <button
                      key={c.name}
                      type="button"
                      aria-label={c.name}
                      aria-pressed={selected}
                      onClick={() => setColors((prev) => ({ ...prev, [look.id]: c.name }))}
                      className={`h-8 w-8 rounded-full ring-offset-2 ring-offset-[var(--accent)] transition-all duration-300 ${
                        selected ? 'ring-1 ring-espresso' : 'ring-0 hover:ring-1 hover:ring-gold'
                      }`}
                      style={{ background: c.hex }}
                    />
                  );
                })}
              </div>
            </fieldset>

            <button
              type="button"
              onClick={() => addItem(look, size, colorOf(look.id, look.colors[0].name))}
              className="pill-dark mt-9 w-full sm:w-auto sm:px-12"
            >
              <ShoppingBag size={15} strokeWidth={1.5} /> Add to Bag
            </button>
          </div>
        </div>
      </div>

      {/* Mobile & reduced motion: swipeable cards */}
      <div className="py-20 md:motion-safe:hidden">
        <div className="px-5 md:px-10" data-silk-group>
          <p data-silk className="overline text-gold-deep">
            The Edit
          </p>
          <h2 data-silk className="mt-3 font-serif text-4xl md:text-5xl">
            Four looks, <em>one season.</em>
          </h2>
        </div>
        <ul className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 md:grid md:grid-cols-4 md:overflow-visible md:px-10">
          {LOOKS.map((p, i) => (
            <li key={p.id} className="w-[78vw] shrink-0 snap-center md:w-auto">
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
                <Image src={p.images[0]} alt={p.name} fill sizes="(min-width: 768px) 25vw, 78vw" className="object-cover" />
                <span className="absolute left-4 top-4 rounded-full bg-ivory/85 px-3 py-1 font-serif text-sm backdrop-blur">
                  {pad(i + 1)}/{pad(LOOKS.length)}
                </span>
              </div>
              <p className="overline mt-4 text-gold-deep">{p.showcase!.label}</p>
              <h3 className="mt-1 font-serif text-2xl">{p.name}</h3>
              <p className="mt-1 text-xs text-espresso/60">{p.fabric}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="font-serif text-xl text-gold-deep">{formatPrice(p.price)}</span>
                <button type="button" onClick={() => addItem(p, 'M')} className="pill-dark !px-5 !py-2.5">
                  Add to Bag
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
