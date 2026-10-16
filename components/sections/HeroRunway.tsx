'use client';

import { ArrowDown, ArrowRight } from 'lucide-react';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { SplitLines } from '@/components/ui/SplitLines';
import { useScrollTo } from '@/components/providers/LenisProvider';
import { gsap, useGSAP, MOTION_OK } from '@/lib/gsap';

/**
 * Runway hero — scroll scrubs a 240-frame WebP sequence of a model walking the ramp while her saree
 * re-weaves itself from crimson to royal blue, emerald and wine. Each colour is a chapter with its own
 * caption and swatch.
 *
 * Frames live in /public/hero-runway, cut from Model_walking_on_fashion_runway.mp4 (1920×1080, 24fps):
 *   desktop/  1600×900, full frame
 *   mobile/   608×1080, a native-resolution 9:16 crop around the model for tall screens
 */

const FRAMES = 240;
const SETS = {
  desktop: '/hero-runway/desktop/frame_####.webp',
  mobile: '/hero-runway/mobile/frame_####.webp',
} as const;
type SetName = keyof typeof SETS;

/** Tall viewports get the portrait crop. */
const PORTRAIT = '(max-aspect-ratio: 4/5)';

/** Share of the scroll spent scrubbing frames; the rest holds the last frame for the finale. */
const SCRUB = 0.92;

type Chapter = {
  name: string;
  weave: string;
  line: string;
  swatch: string;
  /** Frames where this saree is fully on screen (between the sparkle transitions). */
  frames: [number, number];
};

const CHAPTERS: Chapter[] = [
  {
    name: 'Crimson Banarasi',
    weave: 'Katan silk · kadhua zari buti',
    line: 'Woven in Varanasi over forty-two days.',
    swatch: '#9e1b24',
    frames: [0, 33],
  },
  {
    name: 'Royal Kanjivaram',
    weave: 'Mulberry silk · temple border',
    line: 'Korvai-joined pallu, interlocked by hand.',
    swatch: '#1f3a8a',
    frames: [45, 98],
  },
  {
    name: 'Emerald Paithani',
    weave: 'Silk · gold-dipped zari pallu',
    line: 'A Yeola heirloom weave, peacock-bright.',
    swatch: '#0f6b47',
    frames: [108, 159],
  },
  {
    name: 'Wine Bridal Banarasi',
    weave: 'Katan silk · real zari meenakari',
    line: 'For the walk you will remember.',
    swatch: '#7a1530',
    frames: [169, 239],
  },
];

const pad = (n: number) => String(n).padStart(2, '0');
const frameUrl = (set: SetName, i: number) => SETS[set].replace(/#+/, (m) => String(i + 1).padStart(m.length, '0'));
/** Frame index → timeline position (the frame tween runs from 0 to SCRUB). */
const at = (frame: number) => (frame / (FRAMES - 1)) * SCRUB;

/** Coarse-to-fine load order: every 16th frame first, then 8th, 4th… so a fast scroll always has a near frame. */
const loadOrder = () => {
  const seen = new Set<number>();
  const order: number[] = [];
  for (let step = 16; step >= 1; step /= 2)
    for (let i = 0; i < FRAMES; i += step) if (!seen.has(i)) (seen.add(i), order.push(i));
  return order;
};

export function HeroRunway() {
  const root = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const frameRef = useRef(0);
  const [set, setSet] = useState<SetName | null>(null);
  const [loaded, setLoaded] = useState(0);
  const scrollTo = useScrollTo();

  /** Cover-fit the frame, or the nearest one that has loaded so far. */
  const draw = (index: number) => {
    const canvas = canvasRef.current;
    const frames = framesRef.current;
    if (!canvas || !frames.length) return;
    let img: HTMLImageElement | undefined;
    for (let d = 0; d < FRAMES && !img; d++) {
      for (const j of [index - d, index + d]) {
        const f = frames[j];
        if (f?.complete && f.naturalWidth) {
          img = f;
          break;
        }
      }
    }
    if (!img) return;
    const ctx = canvas.getContext('2d')!;
    const { width: cw, height: ch } = canvas;
    const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    const w = img.naturalWidth * s;
    const h = img.naturalHeight * s;
    ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
  };

  // Pick the frame set for this viewport shape, and swap if it flips (rotation, resize).
  useEffect(() => {
    const mq = window.matchMedia(PORTRAIT);
    const pick = () => setSet(mq.matches ? 'mobile' : 'desktop');
    pick();
    mq.addEventListener('change', pick);
    return () => mq.removeEventListener('change', pick);
  }, []);

  // Preload the chosen set and keep the canvas sized to the viewport.
  useEffect(() => {
    if (!set) return;
    let done = 0;
    const frames: HTMLImageElement[] = new Array(FRAMES);
    for (const i of loadOrder()) {
      const img = new window.Image();
      img.decoding = 'async';
      img.onload = img.onerror = () => {
        if (++done % 12 === 0 || done === FRAMES) setLoaded(done);
        // Repaint if this frame is a better match than whatever is on screen.
        if (Math.abs(i - frameRef.current) < 16) draw(frameRef.current);
      };
      img.src = frameUrl(set, i);
      frames[i] = img;
    }
    framesRef.current = frames;

    const resize = () => {
      const c = canvasRef.current;
      if (!c) return;
      const dpr = Math.min(window.devicePixelRatio, 2);
      c.width = Math.round(c.clientWidth * dpr);
      c.height = Math.round(c.clientHeight * dpr);
      draw(frameRef.current);
    };
    resize();
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      frames.forEach((img) => (img.onload = img.onerror = null));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [set]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      // Reduced motion gets no pin or scrub: a still of the first walk with the intro copy.
      mm.add(MOTION_OK, () => {
        const q = gsap.utils.selector(root);
        const swatches = q('[data-hr-swatch]');
        const counter = q('[data-hr-counter]')[0];
        const playhead = { frame: 0 };
        let chapter = 0;

        // Intro: frame settles from a slow push, title rises out of its masks.
        gsap
          .timeline({ defaults: { ease: 'power4.out' } })
          .from('[data-hr-stage]', { scale: 1.12, duration: 2.6, ease: 'power3.out' })
          .from('[data-hr-title] .line-inner', { yPercent: 110, duration: 1.3, stagger: 0.12 }, 0.4)
          .from('[data-hr-fade]', { opacity: 0, y: 30, duration: 1, stagger: 0.08 }, 0.8);

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: '+=420%',
            pin: true,
            scrub: 1,
          },
        });

        // Paint from the tween itself, not ScrollTrigger's onUpdate — the scrub keeps easing after the scroll stops.
        const render = () => {
          const f = Math.round(playhead.frame);
          if (f === frameRef.current) return;
          frameRef.current = f;
          draw(f);
          // Chapter flips at the midpoint of each sparkle transition.
          const next = CHAPTERS.findLastIndex((c, i) => i === 0 || f >= (CHAPTERS[i - 1].frames[1] + c.frames[0]) / 2);
          if (next !== chapter) {
            chapter = next;
            swatches.forEach((s, i) => s.toggleAttribute('data-active', i === chapter));
            counter.textContent = pad(chapter + 1);
          }
        };

        tl.to(playhead, { frame: FRAMES - 1, duration: SCRUB, onUpdate: render }, 0)
          .to('[data-hr-intro]', { opacity: 0, y: -50, filter: 'blur(8px)', duration: 0.07 }, 0.03)
          .to('[data-hr-cue]', { opacity: 0, duration: 0.03 }, 0)
          .fromTo('[data-hr-progress]', { scaleY: 0 }, { scaleY: 1, duration: SCRUB }, 0);

        // Each caption holds while its saree is on screen and leaves before the sparkle swap.
        CHAPTERS.forEach((c, i) => {
          const sel = `[data-hr-chapter="${i}"]`;
          const lines = `${sel} .line-inner`;
          if (i > 0) {
            tl.fromTo(lines, { yPercent: 110 }, { yPercent: 0, duration: 0.05, stagger: 0.012, ease: 'power3.out' }, at(c.frames[0]))
              .fromTo(sel, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 }, at(c.frames[0]));
          }
          if (i < CHAPTERS.length - 1) {
            tl.to(lines, { yPercent: -110, duration: 0.04, stagger: 0.008, ease: 'power2.in' }, at(c.frames[1]) - 0.045);
          }
        });

        // Finale: the call to action lands once the last walk is under way.
        tl.fromTo('[data-hr-outro] a',{ autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.06, stagger: 0.02, ease: 'power3.out' }, at(205))
          .to({}, { duration: 1 - SCRUB }, SCRUB);
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  const progress = set ? loaded / FRAMES : 0;

  return (
    <section ref={root} aria-label="The silk runway" className="relative h-screen overflow-hidden bg-[#120a06] text-ivory">
      {/* Footage */}
      <div data-hr-stage className="absolute inset-0">
        {/* Shown until the canvas paints its first frame. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={frameUrl('desktop', 0)}
          alt=""
          aria-hidden
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="A model walks the runway in a silk saree that changes from crimson to royal blue, emerald and wine"
          className="absolute inset-0 h-full w-full"
        />
      </div>

      {/* Grade: warm wash, legibility gradients, vignette. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,transparent_40%,rgba(18,10,6,0.75)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#120a06]/80 via-[#120a06]/10 to-[#120a06]/60" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#120a06]/85 to-transparent md:h-1/3" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#120a06]/60 to-transparent" />
      </div>

      {/* Opening title */}
      <div data-hr-intro className="absolute inset-x-0 bottom-[14vh] z-10 md:bottom-auto md:top-1/2 md:-translate-y-1/2">
        <div className="mx-auto w-full max-w-[1600px] px-6 md:px-16">
          <div className="max-w-xl">
            <p data-hr-fade className="overline flex items-center gap-4 text-gold-soft">
              <span className="h-px w-10 bg-gold" aria-hidden />
              The Festive Silk Show · SS&rsquo;26
            </p>
            <div data-hr-title>
              <SplitLines
                as="h1"
                reveal={false}
                lines={['Walk in', <em key="silk" className="font-normal italic text-gold-soft">Silk.</em>]}
                className="mt-5 font-serif text-[clamp(3.4rem,8.5vw,8rem)] font-normal leading-[0.95] tracking-tight drop-shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
              />
            </div>
            <p data-hr-fade className="mt-6 max-w-sm text-[15px] leading-relaxed text-ivory/80">
              Four handwoven sarees, one walk. Scroll to watch the silk change on the runway.
            </p>
          </div>
        </div>
      </div>

      {/* Chapter captions */}
      <div className="pointer-events-none absolute inset-x-0 bottom-[17vh] z-10 md:bottom-auto md:top-1/2 md:-translate-y-1/2">
        <div className="mx-auto grid w-full max-w-[1600px] px-6 md:px-16">
          {CHAPTERS.map((c, i) => (
            <div
              key={c.name}
              data-hr-chapter={i}
              // Hidden in the markup too, so nothing stacks before GSAP takes over.
              className={`[grid-area:1/1] md:ml-auto md:w-[380px] md:text-right lg:mr-20 ${i === 0 ? 'max-md:hidden' : 'invisible opacity-0'}`}
            >
              <span className="masked-line">
                <span className="line-inner overline block text-gold-soft">
                  Look {pad(i + 1)} — {c.weave}
                </span>
              </span>
              <p className="mt-3 font-serif text-[clamp(2rem,3.4vw,3.2rem)] leading-[1.02] drop-shadow-[0_2px_20px_rgba(0,0,0,0.5)]">
                <span className="masked-line">
                  <span className="line-inner block">{c.name.split(' ').slice(0, -1).join(' ')}</span>
                </span>
                <span className="masked-line">
                  <span className="line-inner block italic">{c.name.split(' ').slice(-1)}</span>
                </span>
              </p>
              <span className="masked-line mt-3">
                <span className="line-inner block text-sm text-ivory/70">{c.line}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Finale */}
      <div data-hr-outro className="absolute inset-x-0 bottom-[5vh] z-10 md:bottom-[12vh]">
        <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-center gap-4 px-6 md:px-16">
          <a
            href="#new-in"
            onClick={(e) => (e.preventDefault(), scrollTo('#new-in'))}
            className="pill-gold invisible opacity-0"
          >
            Shop the Saree Edit <ArrowRight size={14} strokeWidth={1.6} />
          </a>
          <a
            href="#showcase"
            onClick={(e) => (e.preventDefault(), scrollTo('#showcase'))}
            className="pill-ghost invisible text-ivory opacity-0 max-md:hidden"
          >
            Book a Bridal Fitting
          </a>
        </div>
      </div>

      {/* Swatch rail: one chip per saree, progress line between them. */}
      <div
        aria-hidden
        className="absolute right-6 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-center gap-5 lg:flex"
        style={{ right: 'max(1.5rem, calc((100vw - 1600px) / 2 + 4rem))' } as CSSProperties}
      >
        <span data-hr-counter className="font-serif text-2xl leading-none">
          01
        </span>
        <span className="overline text-[10px] text-ivory/50">/ {pad(CHAPTERS.length)}</span>
        <span className="relative mt-2 flex flex-col gap-4">
          <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-ivory/15">
            <span data-hr-progress className="absolute inset-0 origin-top scale-y-0 bg-gold" />
          </span>
          {CHAPTERS.map((c, i) => (
            <span
              key={c.name}
              data-hr-swatch
              data-active={i === 0 ? '' : undefined}
              className="relative h-3.5 w-3.5 rounded-full ring-1 ring-ivory/40 ring-offset-2 ring-offset-[#120a06] transition-transform duration-500 ease-silk data-[active]:scale-[1.6] data-[active]:ring-gold"
              style={{ background: c.swatch }}
            />
          ))}
        </span>
      </div>

      {/* Scroll cue + loader */}
      <div data-hr-cue className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 text-ivory/70">
        <span className="overline text-[10px]">
          {progress < 1 ? `Loading the runway · ${Math.round(progress * 100)}%` : 'Scroll to walk'}
        </span>
        <ArrowDown size={14} strokeWidth={1.2} className="animate-bounce" />
      </div>
    </section>
  );
}
