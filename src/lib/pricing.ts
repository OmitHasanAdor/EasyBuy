// Keep in sync with easybuy-server/src/lib/pricing.ts — the server uses the
// same rules to calculate what the buyer is charged at checkout.

// Business rule: the biggest discount a product may carry
export const MAX_DISCOUNT_PERCENT = 90;

type DiscountFields = {
  price: number;
  discountPercent?: number | null;
  saleEndsAt?: string | Date | null;
};

// A discount counts while it is set and its sale (if it has an end date)
// has not finished yet.
export function isDiscountActive(product: DiscountFields, now = Date.now()) {
  if (!product.discountPercent || product.discountPercent <= 0) return false;
  if (!product.saleEndsAt) return true;
  return new Date(product.saleEndsAt).getTime() > now;
}

// Price of one unit: the variant price override (if any) minus the active
// discount, rounded to whole taka.
export function unitPrice(
  product: DiscountFields,
  variantPrice?: number | null,
  now = Date.now()
) {
  const base = variantPrice ?? product.price;
  if (!isDiscountActive(product, now)) return base;

  const discounted = Math.round(base * (1 - product.discountPercent! / 100));
  return Math.max(discounted, 1);
}
