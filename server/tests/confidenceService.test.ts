/**
 * Confidence Service Tests
 *
 * These are the highest-value tests in the project:
 *  - The confidence score is the centerpiece feature
 *  - The scoring function is pure (no I/O), so tests are fast and deterministic
 *  - Every edge of the scoring bands is tested to prevent regressions
 *
 * Test strategy: test individual factor conversions first, then test
 * the composed calculateConfidence function with known inputs to verify
 * the weighted sum and label assignment.
 */

import { describe, it, expect } from 'vitest';
import {
  stockToScore,
  sellerRatingToScore,
  priceStabilityToScore,
  scoreToLabel,
  calculateConfidence,
} from '../src/services/confidenceService.js';

// ─── Factor Conversion Tests ────────────────────────────────

describe('stockToScore', () => {
  it('returns 100 for in_stock', () => {
    expect(stockToScore('in_stock')).toBe(100);
  });

  it('returns 60 for low_stock', () => {
    expect(stockToScore('low_stock')).toBe(60);
  });

  it('returns 0 for out_of_stock', () => {
    expect(stockToScore('out_of_stock')).toBe(0);
  });
});

describe('sellerRatingToScore', () => {
  it('converts 5.0 rating to 100', () => {
    expect(sellerRatingToScore(5)).toBe(100);
  });

  it('converts 0 rating to 0', () => {
    expect(sellerRatingToScore(0)).toBe(0);
  });

  it('converts 4.0 rating to 80', () => {
    expect(sellerRatingToScore(4)).toBe(80);
  });

  it('converts 2.5 rating to 50', () => {
    expect(sellerRatingToScore(2.5)).toBe(50);
  });

  it('clamps values above 5 to 100', () => {
    expect(sellerRatingToScore(6)).toBe(100);
  });

  it('clamps negative values to 0', () => {
    expect(sellerRatingToScore(-1)).toBe(0);
  });
});

describe('priceStabilityToScore', () => {
  it('returns 100 for stable price', () => {
    expect(priceStabilityToScore(true)).toBe(100);
  });

  it('returns 50 for unstable price (expired discount)', () => {
    expect(priceStabilityToScore(false)).toBe(50);
  });
});

describe('scoreToLabel', () => {
  it('returns "High Confidence" for scores >= 85', () => {
    expect(scoreToLabel(85)).toBe('High Confidence');
    expect(scoreToLabel(100)).toBe('High Confidence');
    expect(scoreToLabel(92)).toBe('High Confidence');
  });

  it('returns "Good" for scores 60–84', () => {
    expect(scoreToLabel(60)).toBe('Good');
    expect(scoreToLabel(84)).toBe('Good');
    expect(scoreToLabel(72)).toBe('Good');
  });

  it('returns "Limited Confidence" for scores < 60', () => {
    expect(scoreToLabel(59)).toBe('Limited Confidence');
    expect(scoreToLabel(0)).toBe('Limited Confidence');
    expect(scoreToLabel(30)).toBe('Limited Confidence');
  });
});

// ─── Composed Confidence Calculation Tests ──────────────────

describe('calculateConfidence', () => {
  it('computes a high confidence score for an ideal product', () => {
    const result = calculateConfidence({
      stockStatus: 'in_stock',     // 100 * 0.35 = 35
      deliveryReliability: 95,     // 95  * 0.30 = 28.5
      sellerRating: 4.8,           // 96  * 0.20 = 19.2
      priceStable: true,           // 100 * 0.15 = 15
    });

    // Expected: 35 + 28.5 + 19.2 + 15 = 97.7 → rounded to 98
    expect(result.score).toBe(98);
    expect(result.label).toBe('High Confidence');
    expect(result.factors).toHaveLength(4);
  });

  it('computes a low score for out-of-stock + expired discount + bad seller', () => {
    const result = calculateConfidence({
      stockStatus: 'out_of_stock',  // 0   * 0.35 = 0
      deliveryReliability: 50,      // 50  * 0.30 = 15
      sellerRating: 2.0,            // 40  * 0.20 = 8
      priceStable: false,           // 50  * 0.15 = 7.5
    });

    // Expected: 0 + 15 + 8 + 7.5 = 30.5 → rounded to 31
    expect(result.score).toBe(31);
    expect(result.label).toBe('Limited Confidence');
  });

  it('computes a "Good" score for mixed signals', () => {
    const result = calculateConfidence({
      stockStatus: 'low_stock',    // 60  * 0.35 = 21
      deliveryReliability: 88,     // 88  * 0.30 = 26.4
      sellerRating: 4.2,           // 84  * 0.20 = 16.8
      priceStable: true,           // 100 * 0.15 = 15
    });

    // Expected: 21 + 26.4 + 16.8 + 15 = 79.2 → rounded to 79
    expect(result.score).toBe(79);
    expect(result.label).toBe('Good');
  });

  it('returns exactly 4 factors', () => {
    const result = calculateConfidence({
      stockStatus: 'in_stock',
      deliveryReliability: 90,
      sellerRating: 4.0,
      priceStable: true,
    });

    expect(result.factors).toHaveLength(4);
    expect(result.factors.map((f) => f.name)).toEqual([
      'Stock Availability',
      'Delivery Reliability',
      'Seller Trust',
      'Price Stability',
    ]);
  });

  it('maxContribution of all factors sums to 100', () => {
    const result = calculateConfidence({
      stockStatus: 'in_stock',
      deliveryReliability: 100,
      sellerRating: 5,
      priceStable: true,
    });

    const totalMax = result.factors.reduce((sum, f) => sum + f.maxContribution, 0);
    expect(totalMax).toBe(100);
  });

  it('a perfect input yields a score of 100', () => {
    const result = calculateConfidence({
      stockStatus: 'in_stock',
      deliveryReliability: 100,
      sellerRating: 5.0,
      priceStable: true,
    });

    expect(result.score).toBe(100);
    expect(result.label).toBe('High Confidence');
  });

  it('the worst possible input yields a score of 8', () => {
    // out_of_stock = 0, delivery 0% = 0, seller 0 = 0, price unstable = 50*0.15 = 7.5
    const result = calculateConfidence({
      stockStatus: 'out_of_stock',
      deliveryReliability: 0,
      sellerRating: 0,
      priceStable: false,
    });

    expect(result.score).toBe(8); // 7.5 rounded
    expect(result.label).toBe('Limited Confidence');
  });
});
