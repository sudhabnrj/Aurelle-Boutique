'use client';

import type { RefObject } from 'react';
import { gsap, useGSAP, MOTION_OK, SILK_DURATION, SILK_EASE, SILK_FROM, SILK_STAGGER } from '@/lib/gsap';

/**
 * Declarative scroll reveals, scoped to a section ref.
 *
 *  [data-silk-group]  → its [data-silk] children enter together, staggered 0.08
 *  [data-silk]        → (outside any group) enters on its own
 *  [data-silk-lines]  → .line-inner children slide up out of their masks (110% → 0)
 *  [data-kenburns]    → scrubbed 1.15 → 1 scale while its frame crosses the viewport
 *
 * Under prefers-reduced-motion nothing is tweened, so the static layout shows.
 * Call this AFTER any pin set up in the same component so trigger positions
 * account for pin spacing.
 */
export function useSilkReveal<T extends HTMLElement>(scope: RefObject<T>) {
  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        const willChange = (targets: Element[], value: string) => gsap.set(targets, { willChange: value });

        const silk = (targets: Element[], trigger: Element) => {
          if (!targets.length) return;
          gsap.from(targets, {
            ...SILK_FROM,
            duration: SILK_DURATION,
            ease: SILK_EASE,
            stagger: SILK_STAGGER,
            scrollTrigger: { trigger, start: 'top 85%', once: true },
            onStart: () => void willChange(targets, 'transform, opacity'),
            onComplete: () => void gsap.set(targets, { clearProps: 'willChange' }),
          });
        };

        const all = <E extends Element>(sel: string) => [
          ...(root.matches(sel) ? [root as unknown as E] : []),
          ...Array.from(root.querySelectorAll<E & Element>(sel)),
        ];

        all('[data-silk-group]').forEach((group) => silk(Array.from(group.querySelectorAll('[data-silk]')), group));
        all('[data-silk]')
          .filter((el) => !el.closest('[data-silk-group]'))
          .forEach((el) => silk([el], el));

        all('[data-silk-lines]').forEach((block) => {
          const lines = Array.from(block.querySelectorAll('.line-inner'));
          gsap.from(lines, {
            yPercent: 110,
            duration: 1.2,
            ease: SILK_EASE,
            stagger: 0.1,
            scrollTrigger: { trigger: block, start: 'top 88%', once: true },
            onStart: () => void willChange(lines, 'transform'),
            onComplete: () => void gsap.set(lines, { clearProps: 'willChange' }),
          });
        });

        all<HTMLElement>('[data-kenburns]').forEach((el) => {
          gsap.fromTo(
            el,
            { scale: 1.15 },
            {
              scale: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: el.parentElement ?? el,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
                onToggle: (self) => willChange([el], self.isActive ? 'transform' : 'auto'),
              },
            },
          );
        });
      });

      return () => mm.revert();
    },
    { scope },
  );
}
