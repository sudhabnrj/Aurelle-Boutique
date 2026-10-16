import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';
import { useGSAP } from '@gsap/react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, Flip, useGSAP);
}

/** The house "silk" entrance — shared by every section reveal. */
export const SILK_FROM = { opacity: 0, y: 60, skewY: 4 } as const;
export const SILK_EASE = 'power4.out';
export const SILK_DURATION = 1.1;
export const SILK_STAGGER = 0.08;

export const MOTION_OK = '(prefers-reduced-motion: no-preference)';
export const DESKTOP = '(min-width: 768px)';

export { gsap, ScrollTrigger, Flip, useGSAP };
