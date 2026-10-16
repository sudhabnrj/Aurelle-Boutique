const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export const formatPrice = (value: number) => inr.format(value);

export const discountPct = (price: number, mrp: number) =>
  mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
