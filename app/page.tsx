import { Navbar } from '@/components/Navbar';
import { CartDrawer } from '@/components/CartDrawer';
import { SizeGuideModal } from '@/components/SizeGuideModal';
// Alternate heroes are kept in components/sections/ (Hero.tsx, Hero3D.tsx, HeroCinematic.tsx) — swap one back in below if needed.
import { HeroCinematic } from '@/components/sections/HeroCinematic';
import { DressShowcase } from '@/components/sections/DressShowcase';
import { NewArrivals } from '@/components/sections/NewArrivals';
import { ShopByOccasion } from '@/components/sections/ShopByOccasion';
import { FabricCraft } from '@/components/sections/FabricCraft';
import { Lookbook } from '@/components/sections/Lookbook';
import { Testimonials } from '@/components/sections/Testimonials';
import { InstagramStrip } from '@/components/sections/InstagramStrip';
import { Footer } from '@/components/sections/Footer';
import { Hero3D } from '@/components/sections/Hero3D';
import { HeroRunway } from '@/components/sections/HeroRunway';

export default function Home() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-espresso focus:px-5 focus:py-3 focus:text-ivory"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main">
        <HeroRunway />
        <DressShowcase />
        <NewArrivals />
        <ShopByOccasion />
        <FabricCraft />
        <Lookbook />
        <Testimonials />
        <InstagramStrip />
      </main>
      <Footer />
      <CartDrawer />
      <SizeGuideModal />
    </>
  );
}
