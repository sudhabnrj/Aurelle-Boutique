'use client';

import { ArrowRight, MessageCircle } from 'lucide-react';
import { useRef, useState, type FormEvent } from 'react';
import { useShop } from '@/context/ShopContext';
import { useSilkReveal } from '@/hooks/useSilkReveal';

const COLUMNS = [
  { title: 'Shop', links: ['New In', 'Dresses', 'Gowns', 'Lehengas', 'Sarees', 'Occasion Wear'] },
  { title: 'Help', links: ['Size Guide', 'Shipping & Returns', 'Made to Measure', 'Track Order', 'FAQs'] },
  { title: 'Contact', links: ['WhatsApp +91 98200 00000', 'care@aurelle.in', 'Book an Atelier Visit', 'Mumbai · Jaipur'] },
];

export function Footer() {
  const root = useRef<HTMLElement>(null);
  const { setSizeGuideOpen } = useShop();
  const [email, setEmail] = useState('');
  const [joined, setJoined] = useState(false);
  useSilkReveal(root);

  const subscribe = (e: FormEvent) => {
    e.preventDefault();
    if (email) setJoined(true);
  };

  return (
    <footer id="contact" ref={root} className="relative overflow-hidden bg-espresso pb-8 pt-24 text-ivory md:pt-32">
      <p
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-[-0.12em] select-none text-center font-serif text-[24vw] leading-none tracking-[0.04em] text-ivory/[0.07]"
      >
        AURELLE
      </p>

      <div className="relative mx-auto max-w-[1400px] px-4 md:px-10">
        <div data-silk className="rounded-3xl bg-ivory p-7 text-espresso shadow-[0_50px_100px_-40px_rgba(0,0,0,0.6)] md:p-14">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="overline text-gold-deep">The AURELLE Letter</p>
              <h2 className="mt-4 font-serif text-4xl leading-[1.05] md:text-5xl">
                Get 10% off your <em>first dress.</em>
              </h2>
              <p className="mt-4 max-w-sm text-sm text-espresso/60">
                First look at new collections, atelier stories and private trunk-show invitations.
              </p>
              <form onSubmit={subscribe} className="mt-8">
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <div className="flex items-center gap-2 rounded-full border border-espresso/15 bg-blush/50 p-1.5 pl-6 focus-within:border-gold">
                  <input
                    id="newsletter-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-espresso/40"
                  />
                  <button type="submit" className="pill-gold !px-5 !py-3" aria-label="Subscribe">
                    <span className="hidden sm:inline">Subscribe</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
                <p role="status" className="mt-3 h-4 text-xs text-gold-deep">
                  {joined && 'Welcome to AURELLE — your code WELCOME10 is on its way.'}
                </p>
              </form>
            </div>

            <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
              {COLUMNS.map((col) => (
                <div key={col.title}>
                  <h3 className="overline text-espresso/50">{col.title}</h3>
                  <ul className="mt-5 space-y-3 text-sm">
                    {col.links.map((l) => (
                      <li key={l}>
                        {l === 'Size Guide' ? (
                          <button type="button" onClick={() => setSizeGuideOpen(true)} className="hover:text-gold-deep">
                            {l}
                          </button>
                        ) : l.startsWith('WhatsApp') ? (
                          <a href="https://wa.me/919820000000" className="inline-flex items-center gap-2 hover:text-gold-deep">
                            <MessageCircle size={14} strokeWidth={1.5} /> {l}
                          </a>
                        ) : (
                          <a href="#main" className="hover:text-gold-deep">
                            {l}
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>

          <div className="hairline mt-12" />

          <div className="mt-7 flex flex-col-reverse items-start justify-between gap-6 md:flex-row md:items-center">
            <p className="text-xs text-espresso/50">© 2026 AURELLE Couture Pvt. Ltd. All rights reserved.</p>
            <ul aria-label="Accepted payment methods" className="flex flex-wrap items-center gap-2">
              <PayBadge label="UPI">
                <span className="font-bold italic tracking-tight">
                  UPI<span className="text-gold">›</span>
                </span>
              </PayBadge>
              <PayBadge label="Visa">
                <span className="font-black italic tracking-tight text-[#1A1F71]">VISA</span>
              </PayBadge>
              <PayBadge label="Mastercard">
                <span className="relative flex h-4 w-7" aria-hidden>
                  <span className="absolute left-0 h-4 w-4 rounded-full bg-[#EB001B]" />
                  <span className="absolute right-0 h-4 w-4 rounded-full bg-[#F79E1B] mix-blend-multiply" />
                </span>
              </PayBadge>
              <PayBadge label="Razorpay">
                <span className="font-semibold tracking-tight text-[#0C2451]">Razorpay</span>
              </PayBadge>
            </ul>
          </div>
        </div>

        <div className="h-[18vw] md:h-[14vw]" aria-hidden />
      </div>
    </footer>
  );
}

function PayBadge({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <li
      aria-label={label}
      className="flex h-9 min-w-[64px] items-center justify-center rounded-lg border border-espresso/10 bg-white px-3 text-[13px]"
    >
      {children}
    </li>
  );
}
