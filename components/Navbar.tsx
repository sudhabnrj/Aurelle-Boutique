'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Heart, Menu, Search, ShoppingBag, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useShop } from '@/context/ShopContext';
import { useScrollTo } from '@/components/providers/LenisProvider';
import { ScrollTrigger } from '@/lib/gsap';

export const NAV_LINKS = [
  { label: 'New In', href: '#new-in' },
  { label: 'Dresses', href: '#showcase' },
  { label: 'Occasion', href: '#occasion' },
  { label: 'Ethnic', href: '#lookbook' },
  { label: 'About', href: '#craft' },
];

export function Navbar() {
  const { count, wishlist, setCartOpen } = useShop();
  const scrollTo = useScrollTo();
  const [scrolled, setScrolled] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      setScrolled(window.scrollY > 60);
      // Read pin state a frame later so ScrollTrigger has processed this scroll first.
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() =>
        // The bar steps aside while any pinned, scroll-driven section owns the screen.
        setPinned(window.scrollY > 60 && ScrollTrigger.getAll().some((t) => t.pin && t.isActive)),
      );
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const go = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuOpen(false);
    scrollTo(href);
  };

  const solid = scrolled || menuOpen;
  const hidden = pinned && !menuOpen;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-700 ease-silk focus-within:translate-y-0 ${
        hidden ? '-translate-y-full' : ''
      } ${
        solid ? 'bg-ivory/80 text-espresso shadow-[0_1px_0_rgba(201,162,75,0.35)] backdrop-blur-xl' : 'bg-transparent text-ivory'
      }`}
    >
      <nav aria-label="Primary" className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-5 md:h-20 md:px-10">
        <a href="#main" onClick={go('#main')} className="font-serif text-2xl tracking-[0.18em] md:text-[28px]">
          AURELLE
        </a>

        <ul className="hidden items-center gap-9 lg:flex">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} onClick={go(l.href)} className="group relative overline !tracking-[0.25em]">
                {l.label}
                <span className="absolute -bottom-1.5 left-0 h-px w-full origin-right scale-x-0 bg-gold transition-transform duration-500 ease-silk group-hover:origin-left group-hover:scale-x-100" />
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1 md:gap-2">
          <IconButton label="Search">
            <Search size={19} strokeWidth={1.4} />
          </IconButton>
          <IconButton label={`Wishlist, ${wishlist.size} items`} badge={wishlist.size} className="hidden sm:inline-flex">
            <Heart size={19} strokeWidth={1.4} />
          </IconButton>
          <IconButton label={`Open bag, ${count} items`} badge={count} onClick={() => setCartOpen(true)}>
            <ShoppingBag size={19} strokeWidth={1.4} />
          </IconButton>
          <IconButton label={menuOpen ? 'Close menu' : 'Open menu'} className="lg:hidden" onClick={() => setMenuOpen((o) => !o)}>
            {menuOpen ? <X size={20} strokeWidth={1.4} /> : <Menu size={20} strokeWidth={1.4} />}
          </IconButton>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-gold/30 lg:hidden"
          >
            <ul className="flex flex-col px-5 py-6">
              {NAV_LINKS.map((l, i) => (
                <motion.li
                  key={l.href}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.05 * i + 0.1, duration: 0.5 }}
                >
                  <a href={l.href} onClick={go(l.href)} className="block py-3 font-serif text-3xl">
                    {l.label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function IconButton({
  label,
  badge,
  className = '',
  onClick,
  children,
}: {
  label: string;
  badge?: number;
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`relative inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-300 hover:text-gold focus-visible:outline focus-visible:outline-1 focus-visible:outline-gold ${className}`}
    >
      {children}
      <AnimatePresence>
        {!!badge && (
          <motion.span
            key={badge}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 22 }}
            className="absolute right-0.5 top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-gold px-1 text-[10px] font-semibold text-espresso"
          >
            {badge}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
