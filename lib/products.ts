/**
 * Product catalogue. Swap this array for real inventory (CMS / API) —
 * every component reads from the `Product` shape below.
 */

export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;
export type Size = (typeof SIZES)[number];

export type Color = { name: string; hex: string };

export type Occasion = 'Evening' | 'Cocktail' | 'Bridal' | 'Casual Day' | 'Festive Ethnic';

export type Product = {
  id: string;
  name: string;
  /** First image is the primary shot, second is used for the hover crossfade. */
  images: string[];
  price: number;
  mrp: number;
  fabric: string;
  occasion: Occasion;
  sizes: Size[];
  colors: Color[];
  isNew?: boolean;
  /** Present on the four looks that run through the pinned showcase. */
  showcase?: { label: string; accent: string };
};

/** Unsplash helper — remote pattern is whitelisted in next.config.mjs. */
export const unsplash = (id: string, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const IMG = {
  redGown: '1595777457583-95e059d581b8',
  plumGown: '1566174053879-31528523f8ae',
  whiteMini: '1515372039744-b8f02a3ae446',
  floralCocktail: '1572804013309-59a88b7e92f1',
  floralDetail: '1496747611176-843222e1e57c',
  azureMaxi: '1539008835657-9e8e9680c956',
  polkaMidi: '1502716119720-b23a93e5fe1b',
  ivoryAnarkali: '1583391733956-3750e0ff4e8b',
  sareeRed: '1610030469983-98e550d6193c',
  silkSaree: '1617627143750-d86bc21e42bb',
  bordeauxMidi: '1585487000160-6ebcfceb0d03',
  scarletStudio: '1612336307429-8a898d10e223',
  portrait: '1524504388940-b1c1722653e1',
  midnightLace: '1551803091-e20673f15770',
  noirDress: '1550639525-c97d455acf70',
  blushRuffle: '1581044777550-4cfa60707c03',
  stripeTop: '1488716820095-cbe80883c496',
  sunhatWhite: '1617922001439-4a2e6562f328',
  bordeauxCoat: '1483985988355-763728e1935b',
  rack: '1567401893414-76b7b1e5a7a5',
  coralMaxi: '1596783074918-c84cb06531ca',
  oliveRomper: '1618932260643-eee4a2f652a6',
  emeraldGown: '1609357605129-26f69add5d6e',
} as const;

const ALL: Size[] = [...SIZES];

export const products: Product[] = [
  // ── Showcase looks ────────────────────────────────────────────────
  {
    id: 'scarlet-reverie-gown',
    name: 'Scarlet Reverie Gown',
    images: [unsplash(IMG.redGown), unsplash(IMG.scarletStudio)],
    price: 24900,
    mrp: 29900,
    fabric: 'Silk georgette · hand-pleated bodice · floor-sweep hem',
    occasion: 'Evening',
    sizes: ALL,
    colors: [
      { name: 'Scarlet', hex: '#B3202A' },
      { name: 'Noir', hex: '#1C1512' },
      { name: 'Champagne', hex: '#E8D3A9' },
    ],
    showcase: { label: 'Evening Gown', accent: '#F1DAD5' },
  },
  {
    id: 'rosa-cocktail-dress',
    name: 'Rosa Cocktail Dress',
    images: [unsplash(IMG.floralCocktail), unsplash(IMG.polkaMidi)],
    price: 12500,
    mrp: 14900,
    fabric: 'Printed crepe · full circle skirt · obi-tie waist',
    occasion: 'Cocktail',
    sizes: ALL,
    colors: [
      { name: 'Rosa Print', hex: '#C2332F' },
      { name: 'Sky', hex: '#9FB8CF' },
    ],
    showcase: { label: 'Cocktail Dress', accent: '#F6E2CC' },
  },
  {
    id: 'mehr-bridal-lehenga',
    name: 'Mehr Bridal Lehenga',
    images: [unsplash(IMG.silkSaree), unsplash(IMG.sareeRed)],
    price: 148000,
    mrp: 165000,
    fabric: 'Pure Banarasi silk · zari & dabka handwork · 6m can-can',
    occasion: 'Bridal',
    sizes: ALL,
    colors: [
      { name: 'Rani Pink', hex: '#C2185B' },
      { name: 'Sindoor', hex: '#A3201E' },
      { name: 'Antique Gold', hex: '#C9A24B' },
    ],
    showcase: { label: 'Bridal Lehenga', accent: '#F0D6DE' },
  },
  {
    id: 'azure-summer-midi',
    name: 'Azure Summer Midi',
    images: [unsplash(IMG.azureMaxi), unsplash(IMG.sunhatWhite)],
    price: 8900,
    mrp: 9900,
    fabric: 'Linen-viscose blend · wrap front · thigh slit',
    occasion: 'Casual Day',
    sizes: ALL,
    colors: [
      { name: 'Azure', hex: '#A9C2D9' },
      { name: 'Ivory', hex: '#F2ECE1' },
      { name: 'Sage', hex: '#A7B59A' },
    ],
    showcase: { label: 'Summer Midi', accent: '#DCE5EC' },
  },

  // ── New arrivals ──────────────────────────────────────────────────
  {
    id: 'plum-off-shoulder-gown',
    name: 'Plum Off-Shoulder Gown',
    images: [unsplash(IMG.plumGown, 900), unsplash(IMG.noirDress, 900)],
    price: 18900,
    mrp: 21900,
    fabric: 'Stretch satin',
    occasion: 'Evening',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Plum', hex: '#5B1A4A' },
      { name: 'Noir', hex: '#1C1512' },
    ],
    isNew: true,
  },
  {
    id: 'ivory-anarkali-set',
    name: 'Noor Ivory Anarkali',
    images: [unsplash(IMG.ivoryAnarkali, 900), unsplash(IMG.sunhatWhite, 900)],
    price: 15400,
    mrp: 17900,
    fabric: 'Chanderi with chikankari',
    occasion: 'Festive Ethnic',
    sizes: ALL,
    colors: [{ name: 'Ivory', hex: '#F2ECE1' }],
    isNew: true,
  },
  {
    id: 'kanjivaram-silk-saree',
    name: 'Meenakshi Silk Saree',
    images: [unsplash(IMG.sareeRed, 900), unsplash(IMG.silkSaree, 900)],
    price: 32500,
    mrp: 36000,
    fabric: 'Kanjivaram silk, zari border',
    occasion: 'Festive Ethnic',
    sizes: ['M'],
    colors: [
      { name: 'Aubergine', hex: '#4B2245' },
      { name: 'Vermilion', hex: '#C0392B' },
    ],
    isNew: true,
  },
  {
    id: 'bordeaux-shirt-midi',
    name: 'Bordeaux Shirt Midi',
    images: [unsplash(IMG.bordeauxMidi, 900), unsplash(IMG.bordeauxCoat, 900)],
    price: 7900,
    mrp: 8900,
    fabric: 'Cotton poplin',
    occasion: 'Casual Day',
    sizes: ALL,
    colors: [{ name: 'Bordeaux', hex: '#6D1A2E' }],
    isNew: true,
  },
  {
    id: 'coral-tiered-maxi',
    name: 'Coral Tiered Maxi',
    images: [unsplash(IMG.coralMaxi, 900), unsplash(IMG.polkaMidi, 900)],
    price: 9400,
    mrp: 10900,
    fabric: 'Washed modal',
    occasion: 'Casual Day',
    sizes: ALL,
    colors: [{ name: 'Coral', hex: '#E58C76' }],
    isNew: true,
  },
  {
    id: 'midnight-lace-dress',
    name: 'Midnight Lace Dress',
    images: [unsplash(IMG.midnightLace, 900), unsplash(IMG.noirDress, 900)],
    price: 13900,
    mrp: 15900,
    fabric: 'Chantilly-style lace',
    occasion: 'Cocktail',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [{ name: 'Midnight', hex: '#26305E' }],
    isNew: true,
  },
  {
    id: 'blush-ruffle-dress',
    name: 'Blush Ruffle Dress',
    images: [unsplash(IMG.blushRuffle, 900), unsplash(IMG.whiteMini, 900)],
    price: 10900,
    mrp: 12500,
    fabric: 'Silk organza',
    occasion: 'Cocktail',
    sizes: ALL,
    colors: [{ name: 'Blush', hex: '#E9C3C7' }],
    isNew: true,
  },
  {
    id: 'emerald-flow-gown',
    name: 'Emerald Flow Gown',
    images: [unsplash(IMG.emeraldGown, 900), unsplash(IMG.azureMaxi, 900)],
    price: 21500,
    mrp: 24900,
    fabric: 'Chiffon, bishop sleeves',
    occasion: 'Evening',
    sizes: ALL,
    colors: [{ name: 'Emerald', hex: '#1F6F62' }],
    isNew: true,
  },
];

export const showcaseProducts = products.filter((p) => p.showcase);
export const newArrivals = products.filter((p) => p.isNew);
export const getProduct = (id: string) => products.find((p) => p.id === id);
