'use client';

import Image from 'next/image';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { useEffect, useRef, type CSSProperties } from 'react';
import { SplitLines } from '@/components/ui/SplitLines';
import { useScrollTo } from '@/components/providers/LenisProvider';
import { gsap, useGSAP, MOTION_OK } from '@/lib/gsap';
import { unsplash } from '@/lib/products';

/**
 * Cinematic one-take hero — the camera dollies from the street, through the boutique's glass door,
 * past the racks and the zari, and settles on a bride seated in the store.
 *
 * Each shot pushes in toward its focal point; the next shot irises open from that same point with a
 * zoom-blur, so the cuts read as one continuous camera move. A red film grade, grain, vignette and
 * letterbox bars sit on top.
 *
 * For a truly seamless take, render the move as a video (AI or shot on set), export it as a JPG frame
 * sequence and pass `sequence` — the stills are then replaced by canvas frame-scrubbing, exactly as the
 * reference site does. All overlays and copy stay the same.
 */

type Shot = {
  id: string;
  alt: string;
  /** Focal point (% of the frame) the camera pushes toward — the next shot opens from here. */
  focus: [number, number];
  /** Scale at the start and end of this shot's dolly. */
  push: [number, number];
  scene: string;
};

const SHOTS: Shot[] = [
  {
    id: '1761549924624-6a00e5dfabb7',
    alt: 'Saree boutique storefront — mannequins draped in silk saris behind the glass door',
    focus: [42, 50],
    push: [1, 2.8],
    scene: 'The Doorway',
  },
  {
    id: '1773218373348-34db6bb11662',
    alt: 'Hand-woven saris hanging on racks inside the boutique',
    focus: [52, 45],
    push: [1.05, 2.4],
    scene: 'The Weave',
  },
  {
    id: '1617627143750-d86bc21e42bb',
    alt: 'Model in a silk saree with a heavy gold zari border against a red wall',
    focus: [52, 48],
    push: [1.05, 2.2],
    scene: 'The Zari',
  },
  {
    id: '1638964327749-53436bcccdca',
    alt: 'Bride in red and gold seated on a carved throne chair inside the boutique',
    focus: [62, 32],
    push: [1.25, 1.02],
    scene: 'The Bride',
  },
];

const CAPTIONS: Record<number, [string, string]> = {
  1: ['Six weavers, one thread —', 'months of patient hands.'],
  2: ['Zari catches the light the way', 'memory catches a moment.'],
};

/** Portion of each shot spent opening into the next one. */
const OVERLAP = 0.32;

export type FrameSequence = {
  /** Number of frames, e.g. 240. */
  frames: number;
  /** Path pattern; `####` becomes the 1-based, zero-padded frame number, e.g. '/hero/frame_####.jpg'. */
  src: string;
};

const frameUrl = (seq: FrameSequence, i: number) => seq.src.replace(/#+/, (m) => String(i + 1).padStart(m.length, '0'));

export function HeroCinematic({ sequence }: { sequence?: FrameSequence }) {
  const root = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const frameRef = useRef(0);
  const scrollTo = useScrollTo();

  // Frame-sequence mode: preload and draw cover-fit frames.
  const draw = (index: number) => {
    const canvas = canvasRef.current;
    const img = framesRef.current[index];
    if (!canvas || !img?.complete || !img.naturalWidth) return;
    const ctx = canvas.getContext('2d')!;
    const { width: cw, height: ch } = canvas;
    const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    const w = img.naturalWidth * s;
    const h = img.naturalHeight * s;
    ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
  };

  useEffect(() => {
    if (!sequence) return;
    framesRef.current = Array.from({ length: sequence.frames }, (_, i) => {
      const img = new window.Image();
      img.src = frameUrl(sequence, i);
      if (i === 0) img.onload = () => draw(0);
      return img;
    });
    const resize = () => {
      const c = canvasRef.current;
      if (!c) return;
      const dpr = Math.min(window.devicePixelRatio, 2);
      c.width = c.clientWidth * dpr;
      c.height = c.clientHeight * dpr;
      draw(frameRef.current);
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sequence]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const sceneLabel = root.current!.querySelector<HTMLElement>('[data-hc-scene]')!;
        const N = SHOTS.length;

        // Intro: letterbox opens like an eyelid on the street, title rises.
        gsap
          .timeline({ defaults: { ease: 'power4.out' } })
          .fromTo('[data-hc-bar]', { height: '50.5vh' }, { height: '7vh', duration: 2, ease: 'expo.inOut' })
          .from('[data-hc-shot="0"]', { scale: 1.25, duration: 3.2, ease: 'power3.out' }, 0)
          .from('[data-hc-title] .line-inner', { yPercent: 110, duration: 1.4, stagger: 0.12 }, 1.2)
          .from('[data-hc-fade]', { opacity: 0, y: 40, duration: 1.1, stagger: 0.08 }, 1.5);

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: '+=520%',
            pin: true,
            scrub: 1.4,
            onUpdate: (self) => {
              const i = Math.min(N - 1, Math.floor(self.progress * N * 0.999 + OVERLAP * 0.5));
              const label = `${String(i + 1).padStart(2, '0')} / ${String(N).padStart(2, '0')} — ${SHOTS[i].scene}`;
              if (sceneLabel.textContent !== label) sceneLabel.textContent = label;
              if (sequence) {
                const f = Math.round(self.progress * (sequence.frames - 1));
                if (f !== frameRef.current) {
                  frameRef.current = f;
                  requestAnimationFrame(() => draw(f));
                }
              }
            },
          },
        });

        // Title leaves as the camera starts moving.
        tl.to('[data-hc-copy]', { opacity: 0, y: -60, filter: 'blur(8px)', duration: 0.3 }, 0.05).to(
          '[data-hc-cue]',
          { opacity: 0, duration: 0.1 },
          0,
        );

        if (!sequence) {
          SHOTS.forEach((shot, i) => {
            const sel = `[data-hc-shot="${i}"]`;
            const start = i === 0 ? 0 : i - OVERLAP;
            const end = i === N - 1 ? N : i + 1;

            // The dolly — accelerates into the next shot like a real push-in.
            tl.fromTo(
              `${sel} [data-hc-push]`,
              { scale: shot.push[0] },
              { scale: shot.push[1], duration: end - start, ease: i === N - 1 ? 'power2.out' : 'sine.in' },
              start,
            );

            if (i > 0) {
              // Iris open from the previous shot's focal point, sharpening as it lands.
              tl.fromTo(sel, { '--r': '0%' }, { '--r': '140%', duration: OVERLAP, ease: 'power2.in' }, start)
                .fromTo(`${sel} [data-hc-push]`, { filter: 'blur(10px) brightness(1.4)' }, { filter: 'blur(0px) brightness(1)', duration: OVERLAP }, start)
                // Previous shot smears with zoom blur as we pass through it.
                .fromTo(`[data-hc-shot="${i - 1}"]`, { '--zb': 0 }, { '--zb': 0.45, duration: OVERLAP, ease: 'power2.in' }, start)
                .fromTo(
                  `[data-hc-shot="${i - 1}"] [data-hc-push]`,
                  { filter: 'blur(0px)' },
                  { filter: 'blur(6px)', duration: OVERLAP, ease: 'power2.in', immediateRender: false },
                  start,
                )
                // Warm light leak sweeps across each cut.
                .fromTo(
                  '[data-hc-leak]',
                  { xPercent: -120, opacity: 0 },
                  { xPercent: 120, opacity: 0.85, duration: OVERLAP * 1.6, ease: 'power1.inOut', immediateRender: false },
                  start - OVERLAP * 0.3,
                );
            }
          });
        }

        // Captions ride the middle of their shots.
        gsap.utils.toArray<HTMLElement>('[data-hc-caption]').forEach((el) => {
          const i = Number(el.dataset.hcCaption);
          tl.fromTo(el, { opacity: 0, y: 30, filter: 'blur(6px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.18 }, i + 0.05).to(
            el,
            { opacity: 0, y: -20, filter: 'blur(6px)', duration: 0.15 },
            i + 1 - OVERLAP - 0.12,
          );
        });

        // Finale: the bride, the line, the ribbon; letterbox retracts to hand off to the page.
        tl.fromTo('[data-hc-outro] [data-hc-out]', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.25, stagger: 0.06 }, N - 0.6)
          .to('[data-hc-bar]', { height: 0, duration: 0.3 }, N - 0.3)
          .fromTo('[data-hc-ribbon]', { yPercent: 100 }, { yPercent: 0, duration: 0.2 }, N - 0.2)
          .fromTo('[data-hc-progress]', { scaleX: 0 }, { scaleX: 1, duration: N }, 0);

        gsap.to('[data-hc-marquee]', { xPercent: -50, duration: 30, ease: 'none', repeat: -1 });
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [sequence] },
  );

  return (
    <section ref={root} aria-label="Step inside the saree boutique" className="relative h-screen overflow-hidden bg-[#0d0405] text-ivory">
      {/* Footage */}
      {sequence ? (
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />
      ) : (
        SHOTS.map((shot, i) => {
          const prev = SHOTS[i - 1]?.focus ?? shot.focus;
          return (
            <div
              key={shot.id}
              data-hc-shot={i}
              className="absolute inset-0 overflow-hidden"
              style={
                {
                  '--r': i === 0 ? '140%' : '0%',
                  '--zb': 0,
                  WebkitMaskImage: `radial-gradient(circle at ${prev[0]}% ${prev[1]}%, #000 var(--r), transparent calc(var(--r) + 22%))`,
                  maskImage: `radial-gradient(circle at ${prev[0]}% ${prev[1]}%, #000 var(--r), transparent calc(var(--r) + 22%))`,
                } as CSSProperties
              }
            >
              <div
                data-hc-push
                className="absolute inset-0 will-change-transform"
                style={{ transformOrigin: `${shot.focus[0]}% ${shot.focus[1]}%` }}
              >
                <Image
                  src={unsplash(shot.id, 2400)}
                  alt={shot.alt}
                  fill
                  priority={i < 2}
                  sizes="100vw"
                  className="object-cover [filter:saturate(1.12)_contrast(1.08)]"
                  style={{ objectPosition: `${shot.focus[0]}% ${shot.focus[1]}%` }}
                />
                {/* Zoom-blur ghosts — faded in while the camera rushes through this shot. */}
                {[1.035, 1.075].map((s) => (
                  <div
                    key={s}
                    aria-hidden
                    className="absolute inset-0"
                    style={{
                      transform: `scale(${s})`,
                      transformOrigin: `${shot.focus[0]}% ${shot.focus[1]}%`,
                      opacity: 'var(--zb)',
                    }}
                  >
                    <Image
                      src={unsplash(shot.id, 2400)}
                      alt=""
                      fill
                      sizes="100vw"
                      className="object-cover"
                      style={{ objectPosition: `${shot.focus[0]}% ${shot.focus[1]}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}

      {/* Grade: crimson toning, warm highlights, crushed edges, grain. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-[1]">
        <div className="absolute inset-0 bg-[#8a0a1c] opacity-35 mix-blend-multiply" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_35%,rgba(255,170,90,0.35),transparent_60%)] mix-blend-soft-light" />
        <div className="absolute inset-0 bg-[#5a0012] opacity-40 mix-blend-color" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(10,0,2,0.85)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#120204]/70 via-transparent to-transparent" />
        <div
          data-hc-leak
          className="absolute -inset-y-1/4 left-0 w-[70vw] rotate-12 bg-[radial-gradient(ellipse_at_center,rgba(255,120,60,0.55),rgba(200,30,40,0.25)_40%,transparent_70%)] opacity-0 mix-blend-screen blur-2xl"
        />
        <div className="film-grain absolute -inset-[50%] opacity-[0.09] mix-blend-overlay" />
      </div>

      {/* Opening title over the storefront */}
      <div data-hc-copy className="relative z-10 flex h-full items-center">
        <div className="mx-auto w-full max-w-[1600px] px-6 md:px-16">
          <div className="max-w-2xl">
            <p data-hc-fade className="overline flex items-center gap-4 text-gold-soft">
              <span className="h-px w-10 bg-gold" aria-hidden />
              Tradition meets tomorrow
            </p>
            <div data-hc-title>
              <SplitLines
                as="h1"
                reveal={false}
                lines={['More', <>Than a <em className="font-normal italic text-gold-soft">Saree.</em></>]}
                className="mt-6 font-serif text-[clamp(3.4rem,9vw,8.5rem)] font-normal leading-[0.95] tracking-tight drop-shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
              />
            </div>
            <p data-hc-fade className="mt-7 max-w-md text-[15px] leading-relaxed text-ivory/80">
              Banarasi, Kanjivaram and Paithani silks — woven by hand, draped for the moments you will remember.
            </p>
            <div data-hc-fade className="mt-9 flex flex-wrap gap-4">
              <a href="#new-in" onClick={(e) => (e.preventDefault(), scrollTo('#new-in'))} className="pill-gold">
                Explore Collection <ArrowRight size={14} strokeWidth={1.6} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Captions */}
      {Object.entries(CAPTIONS).map(([i, [a, b]]) => (
        <p
          key={i}
          data-hc-caption={i}
          aria-hidden
          className={`pointer-events-none absolute z-10 max-w-[85vw] font-serif text-[clamp(1.3rem,2.6vw,2.3rem)] italic leading-snug opacity-0 drop-shadow-[0_2px_16px_rgba(0,0,0,0.6)] ${
            i === '1' ? 'bottom-[18vh] left-6 md:left-16' : 'right-6 top-[24vh] text-right md:right-16'
          }`}
        >
          {a}
          <br />
          {b}
        </p>
      ))}

      {/* Finale over the seated bride */}
      <div data-hc-outro className="absolute inset-x-0 bottom-[16vh] z-10">
        <div className="mx-auto w-full max-w-[1600px] px-6 md:px-16">
          <p data-hc-out className="overline text-gold-soft opacity-0">The bridal edit</p>
          <p data-hc-out className="mt-4 max-w-xl font-serif text-[clamp(2.2rem,5vw,4.6rem)] leading-[1.02] opacity-0">
            Woven to be <em className="italic text-gold-soft">remembered.</em>
          </p>
          <div data-hc-out className="mt-8 opacity-0">
            <a href="#new-in" onClick={(e) => (e.preventDefault(), scrollTo('#new-in'))} className="pill-ghost text-ivory">
              Shop Bridal Sarees
            </a>
          </div>
        </div>
      </div>

      {/* Letterbox */}
      <div data-hc-bar aria-hidden className="absolute inset-x-0 top-0 z-20 h-[7vh] bg-black" />
      <div data-hc-bar aria-hidden className="absolute inset-x-0 bottom-0 z-20 h-[7vh] bg-black" />

      {/* Scene HUD */}
      <div className="pointer-events-none absolute inset-x-0 bottom-[calc(7vh+18px)] z-20 mx-auto flex max-w-[1600px] items-center gap-6 px-6 md:px-16">
        <span data-hc-scene className="overline whitespace-nowrap text-[10px] text-ivory/60">
          01 / 04 — {SHOTS[0].scene}
        </span>
        <span className="relative hidden h-px flex-1 bg-ivory/15 md:block" aria-hidden>
          <span data-hc-progress className="absolute inset-0 origin-left scale-x-0 bg-gold" />
        </span>
      </div>

      <div data-hc-cue className="absolute bottom-[calc(7vh+56px)] left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 text-ivory/70">
        <span className="overline text-[10px]">Scroll to step inside</span>
        <ArrowDown size={14} strokeWidth={1.2} className="animate-bounce" />
      </div>

      {/* Ribbon hand-off to the next section */}
      <div data-hc-ribbon className="absolute inset-x-0 bottom-0 z-30 overflow-hidden bg-[#6e0f2a] py-3 text-ivory/90">
        <div data-hc-marquee className="flex w-max whitespace-nowrap font-serif text-sm italic">
          {[0, 1].map((k) => (
            <span key={k} className="flex" aria-hidden={k === 1}>
              {['Pure zari, tested & certified', 'New festive silk', 'Made-to-drape blouse stitching', 'Easy 7-day returns', 'Handwoven in India'].map((m) => (
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
