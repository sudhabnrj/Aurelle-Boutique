# AURELLE — Luxury Boutique Storefront

A single-page storefront for a luxury boutique selling designer dresses, gowns, bridal lehengas and handwoven sarees. It is built around scroll-driven storytelling: pinned sections, scrubbed timelines and a hero that plays a runway walk frame by frame as you scroll.

**Live demo:** https://sudhabnrj.github.io/Aurelle-Boutique/

> This is a front-end showcase. Products, reviews and copy are placeholder content, and checkout is a stub (see [Checkout](#checkout)).

---

## Highlights

- **Runway hero.** A 240-frame WebP sequence drawn to a `<canvas>` and scrubbed by scroll. A model walks the ramp while her saree changes from crimson to royal blue, emerald and wine. Captions and a swatch rail switch on the exact frames where each colour change happens.
- **Pinned storytelling sections.** A 4-look product cross-swap, a fabric and craft story, and a lookbook, each pinned and driven by GSAP ScrollTrigger.
- **Smooth scrolling.** Lenis runs on GSAP's ticker, so smooth scroll and ScrollTrigger share one clock.
- **Header that steps aside.** The fixed header slides away while any pinned section is on screen and returns when it scrolls off.
- **Shopping UI.** Size and colour selection, cart drawer, wishlist and size-guide modal, all held in React context.
- **Responsive and accessible.** Separate portrait frames for phones, a skip link, labelled controls, and a `prefers-reduced-motion` fallback that drops pinning and scrubbing.

## Tech stack

| | |
|---|---|
| Framework | [Next.js 14](https://nextjs.org/) (App Router), React 18, TypeScript |
| Styling | Tailwind CSS 3 |
| Animation | GSAP 3 + ScrollTrigger + Flip, `@gsap/react`, Framer Motion |
| Smooth scroll | Lenis |
| Icons | lucide-react |
| Images | Unsplash (products), local WebP sequence (hero) |
| Hosting | GitHub Pages via GitHub Actions (static export) |

## Getting started

Requires Node.js 18.17 or later (CI uses Node 20).

```bash
git clone https://github.com/sudhabnrj/Aurelle-Boutique.git
cd Aurelle-Boutique
npm install
npm run dev
```

Open http://localhost:3000.

| Script | What it does |
|---|---|
| `npm run dev` | Start the dev server with hot reload |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |

## Project structure

```
app/
  layout.tsx            Fonts, metadata, Shop + Lenis providers
  page.tsx              Assembles the homepage sections
  globals.css           Tailwind layers, shared utilities (pills, masked lines, grain)
components/
  Navbar.tsx            Fixed header; hides while a pinned section is active
  CartDrawer.tsx        Slide-out bag
  ProductCard.tsx
  SizeGuideModal.tsx
  providers/
    LenisProvider.tsx   Smooth scroll + useScrollTo() for anchor links
  sections/
    HeroRunway.tsx      Current hero: scroll-scrubbed runway sequence
    Hero.tsx            Alternate heroes, kept for swapping back in
    Hero3D.tsx
    HeroCinematic.tsx
    DressShowcase.tsx   Pinned 4-look product cross-swap
    NewArrivals.tsx
    ShopByOccasion.tsx
    FabricCraft.tsx     "Hand-finished, thread by thread"
    Lookbook.tsx        "The Summer of Soft Light"
    Testimonials.tsx
    InstagramStrip.tsx
    Footer.tsx
  ui/SplitLines.tsx     Headline split into masked, revealable lines
context/ShopContext.tsx Cart, wishlist and modal state
hooks/useSilkReveal.ts  Declarative scroll reveals via data attributes
lib/
  products.ts           Product catalogue and Unsplash helpers
  gsap.ts               Plugin registration + shared motion constants
  checkout.ts           Checkout stub
  format.ts             INR price formatting
public/hero-runway/     Hero frame sequences (desktop/ and mobile/)
```

## How it works

### Runway hero

`HeroRunway.tsx` pins the hero for 420% of the viewport height and tweens a playhead from frame 0 to 239. Each update draws the nearest frame to a canvas, cover-fitted to the screen.

- **Two frame sets.** `desktop/` holds the full 16:9 frame at 1600×900. `mobile/` holds a native-resolution 9:16 crop around the model, used when the viewport is taller than 4:5.
- **Coarse-to-fine preloading.** Frames load every 16th first, then every 8th, and so on, so a fast scroll always has a nearby frame to show. Until a frame arrives, the closest loaded one is drawn.
- **Chapter timing.** Each saree's frame range lives in the `CHAPTERS` array, measured from the source video.

#### Regenerating the frames

The frames were cut from `Model_walking_on_fashion_runway.mp4` (1920×1080, 24 fps, 10 s) with [ffmpeg](https://ffmpeg.org/):

```bash
# Desktop: full frame, 1600px wide
ffmpeg -i Model_walking_on_fashion_runway.mp4 -an -vf scale=1600:-2 \
  -c:v libwebp -quality 70 -compression_level 6 -start_number 1 \
  public/hero-runway/desktop/frame_%04d.webp

# Mobile: centred 9:16 crop at native resolution
ffmpeg -i Model_walking_on_fashion_runway.mp4 -an -vf "crop=608:1080:656:0" \
  -c:v libwebp -quality 70 -compression_level 6 -start_number 1 \
  public/hero-runway/mobile/frame_%04d.webp
```

If you swap in a new video, update `FRAMES` and the `CHAPTERS` frame ranges in `HeroRunway.tsx`.

### Swapping the hero

The alternate heroes stay in `components/sections/`. To use one, change the hero component in `app/page.tsx`:

```tsx
<HeroRunway />   // replace with <Hero3D />, <HeroCinematic /> or <Hero />
```

### Scroll reveals

Sections opt into entrance animations with data attributes, handled by `useSilkReveal`:

| Attribute | Effect |
|---|---|
| `data-silk` | Element rises and fades in when it enters the viewport |
| `data-silk-group` | Its `data-silk` children enter together, staggered |
| `data-silk-lines` | `.line-inner` children slide up out of their masks |
| `data-kenburns` | Slow scale-down while the element crosses the viewport |

All motion is registered inside `gsap.matchMedia()` with `prefers-reduced-motion: no-preference`, so users who ask for reduced motion get the static layout.

### Checkout

`lib/checkout.ts` only builds the order payload; there is no payment integration and no backend. The file's comments outline wiring up Razorpay (create the order in an API route, open Razorpay Checkout, verify the signature on the server). That needs a server runtime, so it can't run on GitHub Pages.

## Deployment

Every push to `main` runs [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml), which builds a static export and publishes it to GitHub Pages.

The Pages settings are applied only when `GITHUB_PAGES=true` (see [`next.config.mjs`](next.config.mjs)):

- `output: 'export'` writes a static site to `out/`
- `basePath` is set to `/<repo-name>`, because Pages serves the site from a subpath
- Image optimisation is turned off, since static hosting has no image server

Local development is unaffected. To reproduce the Pages build locally:

```bash
GITHUB_PAGES=true npm run build   # output in out/
```

> Plain `<img>` and canvas URLs don't get `basePath` automatically. Prefix them with `process.env.NEXT_PUBLIC_BASE_PATH`, as `HeroRunway.tsx` does.

## Credits

- Product and lifestyle photography from [Unsplash](https://unsplash.com/).
- Runway hero frames come from `Model_walking_on_fashion_runway.mp4` (included in the repo). The desktop frames keep the small ✦ mark from the source video's bottom-right corner.
