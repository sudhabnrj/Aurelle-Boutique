import type { CartItem } from '@/context/ShopContext';

/**
 * Checkout entry point. Wire Razorpay here:
 *   1. POST the cart to your API route to create a Razorpay order (amount in paise).
 *   2. Load https://checkout.razorpay.com/v1/checkout.js and open `new Razorpay({ key, order_id, ... })`.
 *   3. Verify the payment signature server-side in the handler callback.
 */
export async function startCheckout(items: CartItem[], subtotal: number) {
  const payload = {
    amount: subtotal * 100,
    currency: 'INR',
    items: items.map(({ productId, size, color, qty }) => ({ productId, size, color, qty })),
  };
  return payload;
}
