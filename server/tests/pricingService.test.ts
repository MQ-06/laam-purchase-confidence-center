/**
 * Pricing Service Tests
 *
 * Tests the price calculation pipeline:
 *  - Base price → discount → shipping → tax → total
 *  - Expired discount detection
 *  - Rounding behaviour (no floating-point surprises)
 *
 * These are the second-highest-value tests because price accuracy
 * directly affects customer trust — showing the wrong total is worse
 * than showing no total at all.
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { calculatePricing, isDiscountExpired } from '../src/services/pricingService.js';
import type { Product } from '../src/types/index.js';

// ─── Test Fixtures ──────────────────────────────────────────

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'test-001',
    title: 'Test Product',
    brandId: 'seller-001',
    category: 'Kurta Set',
    basePrice: 5000,
    discountPercent: 20,
    discountExpiresAt: null,
    images: [],
    attributes: {},
    returnEligible: true,
    ...overrides,
  };
}

// ─── isDiscountExpired ──────────────────────────────────────

describe('isDiscountExpired', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns false for null expiry (permanent discount)', () => {
    expect(isDiscountExpired(null)).toBe(false);
  });

  it('returns true for a past date', () => {
    expect(isDiscountExpired('2020-01-01T00:00:00Z')).toBe(true);
  });

  it('returns false for a future date', () => {
    expect(isDiscountExpired('2099-12-31T23:59:59Z')).toBe(false);
  });
});

// ─── calculatePricing ───────────────────────────────────────

describe('calculatePricing', () => {
  it('calculates correct pricing with active discount', () => {
    const product = makeProduct({ basePrice: 100, discountPercent: 20 });
    const result = calculatePricing(product, 9.99);

    // Discounted price: 100 - 20 = 80
    // Tax: (80 + 9.99) * 0.05 = 4.5
    // Total: 80 + 9.99 + 4.5 = 94.49
    expect(result.basePrice).toBe(100);
    expect(result.discountPercent).toBe(20);
    expect(result.discountAmount).toBe(20);
    expect(result.discountExpired).toBe(false);
    expect(result.shippingCost).toBe(9.99);
    expect(result.tax).toBe(4.5);
    expect(result.total).toBe(94.49);
  });

  it('calculates correct pricing with no discount', () => {
    const product = makeProduct({ basePrice: 50, discountPercent: 0 });
    const result = calculatePricing(product, 4.99);

    // Discounted price: 50
    // Tax: (50 + 4.99) * 0.05 = 2.75
    // Total: 50 + 4.99 + 2.75 = 57.74
    expect(result.discountAmount).toBe(0);
    expect(result.tax).toBe(2.75);
    expect(result.total).toBe(57.74);
  });

  it('calculates correct pricing with free shipping', () => {
    const product = makeProduct({ basePrice: 200, discountPercent: 10 });
    const result = calculatePricing(product, 0);

    // Discounted price: 200 - 20 = 180
    // Tax: 180 * 0.05 = 9
    // Total: 180 + 0 + 9 = 189
    expect(result.shippingCost).toBe(0);
    expect(result.tax).toBe(9);
    expect(result.total).toBe(189);
  });

  it('zeros discount amount when discount is expired', () => {
    const product = makeProduct({
      basePrice: 100,
      discountPercent: 30,
      discountExpiresAt: '2020-01-01T00:00:00Z', // expired
    });
    const result = calculatePricing(product, 9.99);

    // Discount expired → customer pays full price
    // Tax: (100 + 9.99) * 0.05 = 5.5
    // Total: 100 + 9.99 + 5.5 = 115.49
    expect(result.discountExpired).toBe(true);
    expect(result.discountAmount).toBe(0);
    expect(result.discountPercent).toBe(30); // original percent preserved for display
    expect(result.total).toBe(115.49);
  });

  it('handles 100% discount (free item)', () => {
    const product = makeProduct({ basePrice: 2000, discountPercent: 100 });
    const result = calculatePricing(product, 49);

    // Discounted price: 0
    // Tax: (0 + 49) * 0.05 = 2.45
    // Total: 0 + 49 + 2.45 = 51.45
    expect(result.discountAmount).toBe(2000);
    expect(result.tax).toBe(2.45);
    expect(result.total).toBe(51.45);
  });

  it('rounds all amounts to 2 decimal places', () => {
    // 3333 * 0.15 = 499.95 — tests that discount doesn't produce floating-point noise
    const product = makeProduct({ basePrice: 3333, discountPercent: 15 });
    const result = calculatePricing(product, 99);

    expect(result.discountAmount).toBe(499.95);
    const expectedDiscounted = 3333 - 499.95; // 2833.05
    const expectedTax = Math.round((expectedDiscounted + 99) * 0.05 * 100) / 100; // 146.6
    expect(result.tax).toBe(expectedTax);
    expect(Number.isFinite(result.total)).toBe(true);
    // Verify no more than 2 decimal places
    expect(result.total.toString().split('.')[1]?.length ?? 0).toBeLessThanOrEqual(2);
  });
});
