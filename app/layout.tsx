import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { LenisProvider } from '@/components/providers/LenisProvider';
import { ShopProvider } from '@/context/ShopContext';
import './globals.css';

const serif = Playfair_Display({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

const sans = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });

export const metadata: Metadata = {
  title: 'AURELLE — Designer Dresses, Gowns & Occasion Wear',
  description:
    'AURELLE is a luxury boutique for designer dresses, evening gowns, bridal lehengas, sarees and occasion wear — hand-finished, made to measure.',
};

export const viewport: Viewport = { themeColor: '#FAF7F2' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body className="font-sans text-espresso">
        <ShopProvider>
          <LenisProvider>{children}</LenisProvider>
        </ShopProvider>
      </body>
    </html>
  );
}
