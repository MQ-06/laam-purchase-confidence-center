/**
 * Delivery Service
 *
 * Generates delivery estimates based on the seller's profile and
 * the chosen delivery method. All values are mocked but structured
 * to mirror a real courier integration's response shape.
 *
 * Design decisions:
 *  1. Express is always available (LAAM's existing pattern).
 *  2. Delivery windows are seller-dependent — better-rated sellers
 *     with higher on-time rates get tighter estimated windows.
 *  3. Shipping cost scales with delivery speed (express costs more).
 *  4. The reliability percentage comes directly from the seller's
 *     on-time delivery rate — no fabrication, just passthrough.
 */

import type { Seller, DeliveryEstimate, DeliveryMethod } from '../types/index.js';

/** Base shipping costs by method (USD) */
const SHIPPING_COSTS: Record<DeliveryMethod, number> = {
  express: 9.99,
  standard: 4.99,
};

/** Base dispatch windows by method (hours) */
const DISPATCH_HOURS: Record<DeliveryMethod, number> = {
  express: 24,
  standard: 48,
};

/**
 * Generates a delivery estimate for a given seller and delivery method.
 *
 * The estimated delivery window is influenced by the seller's on-time
 * delivery rate: sellers with better track records get tighter estimates.
 *
 * @param seller - The seller/brand fulfilling the order
 * @param method - 'express' or 'standard'
 * @returns A complete delivery estimate
 */
export function getDeliveryEstimate(
  seller: Seller,
  method: DeliveryMethod = 'express',
): DeliveryEstimate {
  const baseDays = method === 'express' ? [2, 4] as [number, number] : [5, 8] as [number, number];

  // High-reliability sellers (>90%) get tighter windows
  // This rewards good sellers with better UX and incentivises performance
  const reliabilityBonus = seller.onTimeDeliveryRate >= 90 ? -1 : 0;
  const estimatedDays: [number, number] = [
    Math.max(1, baseDays[0] + reliabilityBonus),
    Math.max(2, baseDays[1] + reliabilityBonus),
  ];

  return {
    method,
    dispatchWithinHours: DISPATCH_HOURS[method],
    estimatedDays,
    shippingCost: SHIPPING_COSTS[method],
    reliabilityPercent: seller.onTimeDeliveryRate,
  };
}

/**
 * Free shipping threshold — orders above $39 get free shipping (LAAM standard).
 */
const FREE_SHIPPING_THRESHOLD = 39.00;

/**
 * Returns the effective shipping cost, applying free shipping for
 * orders above the threshold (standard only).
 */
export function getEffectiveShippingCost(
  method: DeliveryMethod,
  orderValue: number,
): number {
  if (method === 'standard' && orderValue >= FREE_SHIPPING_THRESHOLD) {
    return 0;
  }
  return SHIPPING_COSTS[method];
}
