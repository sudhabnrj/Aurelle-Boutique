'use client';

import Lenis from '@studio-freight/lenis';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

const LenisContext = createContext<Lenis | null>(null);

/** Smooth scroll, driven by GSAP's ticker so ScrollTrigger and Lenis share one clock. */
export function LenisProvider({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const instance = new Lenis({ lerp: 0.085, smoothWheel: true });
    instance.on('scroll', ScrollTrigger.update);
    const raf = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    setLenis(instance);

    return () => {
      gsap.ticker.remove(raf);
      instance.destroy();
      setLenis(null);
    };
  }, []);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}

export const useLenis = () => useContext(LenisContext);

/** Smooth-scroll to an in-page anchor, falling back to native scrolling. */
export function useScrollTo() {
  const lenis = useLenis();
  return (hash: string) => {
    const el = document.querySelector(hash);
    if (!el) return;
    if (lenis) lenis.scrollTo(el as HTMLElement, { duration: 1.6 });
    else el.scrollIntoView({ behavior: 'smooth' });
  };
}
