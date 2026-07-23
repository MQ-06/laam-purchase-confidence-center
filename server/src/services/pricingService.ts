/**
 * Pricing Service
 *
 * Computes the full price breakdown for a product, including:
 *  - Base price
 *  - Discount (amount + percentage), with expiry detection
 *  - Shipping cost (passed in from the delivery service)
 *  - Tax (GST at a flat 5% for textile goods — simplified but realistic)
 *  - Final total
 *
 * Design decisions:
 *  1. Tax is calculated on (discounted price + shipping), matching Indian GST rules
 *     for e-commerce where shipping is part of the taxable supply.
 *  2. Expired discounts set discountExpired = true but still show the original
 *     discount percentage — the UI uses this to flag "price may have changed".
 *  3. All amounts are rounded to 2 decimal places to avoid floating-point display issues.
 */

import type { Product, PricingSummary } from '../types/index.js';

/** GST rate for textile goods (simplified flat rate) */
const TAX_RATE = 0.05;

/**
 * Determines whether a product's discount has expired.
 * A null expiry means the discount is permanent (never expires).
 */
export function isDiscountExpired(discountExpiresAt: string | null): boolean {
  if (discountExpiresAt === null) return false;
  return new Date(discountExpiresAt).getTime() < Date.now();
}

/**
 * Computes the full pricing breakdown for a product.
 *
 * @param product - The product to price
 * @param shippingCost - Shipping cost from the delivery service (varies by method)
 * @returns Complete pricing summary with all line items
 */
export function calculatePricing(product: Product, shippingCost: number): PricingSummary {
  const discountExpired = isDiscountExpired(product.discountExpiresAt);

  // If discount has expired, the customer pays full price
  const effectiveDiscountPercent = discountExpired ? 0 : product.discountPercent;
  const discountAmount = round2((product.basePrice * effectiveDiscountPercent) / 100);
  const discountedPrice = round2(product.basePrice - discountAmount);

  // GST on (item price after discount + shipping)
  const taxableAmount = discountedPrice + shippingCost;
  const tax = round2(taxableAmount * TAX_RATE);

  const total = round2(discountedPrice + shippingCost + tax);

  return {
    basePrice: product.basePrice,
    discountPercent: product.discountPercent,
    discountAmount,
    discountExpired,
    shippingCost,
    tax,
    total,
  };
}

/** Rounds a number to 2 decimal places (currency precision). */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
