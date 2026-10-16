'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useShop } from '@/context/ShopContext';
import { useLenis } from '@/components/providers/LenisProvider';

const CHART = [
  { size: 'XS', bust: 32, waist: 26, hip: 35 },
  { size: 'S', bust: 34, waist: 28, hip: 37 },
  { size: 'M', bust: 36, waist: 30, hip: 39 },
  { size: 'L', bust: 38, waist: 32, hip: 41 },
  { size: 'XL', bust: 40, waist: 34, hip: 43 },
  { size: 'XXL', bust: 42, waist: 36, hip: 45 },
];

export function SizeGuideModal() {
  const { sizeGuideOpen, setSizeGuideOpen } = useShop();
  const lenis = useLenis();
  const [unit, setUnit] = useState<'in' | 'cm'>('in');

  useEffect(() => {
    if (!sizeGuideOpen) return;
    lenis?.stop();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSizeGuideOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      lenis?.start();
      window.removeEventListener('keydown', onKey);
    };
  }, [sizeGuideOpen, lenis, setSizeGuideOpen]);

  const fmt = (v: number) => (unit === 'in' ? v : Math.round(v * 2.54));

  return (
    <AnimatePresence>
      {sizeGuideOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="size-guide-title">
          <motion.button
            type="button"
            aria-label="Close size guide"
            className="absolute inset-0 h-full w-full cursor-default bg-espresso/40 backdrop-blur-sm"
            onClick={() => setSizeGuideOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="relative w-full max-w-lg rounded-3xl bg-ivory p-7 shadow-2xl md:p-10"
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.98 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              type="button"
              onClick={() => setSizeGuideOpen(false)}
              aria-label="Close size guide"
              className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-espresso/15 hover:border-gold hover:text-gold"
            >
              <X size={16} strokeWidth={1.4} />
            </button>
            <p className="overline text-gold">Fit Notes</p>
            <h2 id="size-guide-title" className="mt-2 font-serif text-4xl">
              Size Guide
            </h2>
            <div className="mt-5 inline-flex rounded-full border border-espresso/15 p-1 text-xs">
              {(['in', 'cm'] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUnit(u)}
                  aria-pressed={unit === u}
                  className={`rounded-full px-4 py-1.5 uppercase tracking-[0.2em] transition-colors ${
                    unit === u ? 'bg-espresso text-ivory' : 'text-espresso/60'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
            <table className="mt-6 w-full text-left text-sm">
              <caption className="sr-only">Body measurements in {unit === 'in' ? 'inches' : 'centimetres'}</caption>
              <thead>
                <tr className="border-b border-gold/50 text-[11px] uppercase tracking-[0.2em] text-espresso/55">
                  <th className="py-3 font-medium">Size</th>
                  <th className="py-3 font-medium">Bust</th>
                  <th className="py-3 font-medium">Waist</th>
                  <th className="py-3 font-medium">Hip</th>
                </tr>
              </thead>
              <tbody>
                {CHART.map((r) => (
                  <tr key={r.size} className="border-b border-espresso/10">
                    <td className="py-3 font-serif text-base">{r.size}</td>
                    <td className="py-3 tabular-nums">{fmt(r.bust)}</td>
                    <td className="py-3 tabular-nums">{fmt(r.waist)}</td>
                    <td className="py-3 tabular-nums">{fmt(r.hip)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-5 text-xs leading-relaxed text-espresso/60">
              Between sizes? Choose <span className="text-gold-deep">Made to Measure</span> at checkout and our atelier will tailor
              your piece to 36 personal measurements.
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
