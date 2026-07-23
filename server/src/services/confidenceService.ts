/**
 * Confidence Service
 *
 * The centerpiece of the Purchase Confidence Center. Computes a single
 * 0–100 score from four independent signals, each with a documented,
 * deterministic weight.
 *
 * Scoring philosophy:
 *  - Stock availability is weighted highest (0.35) because out-of-stock
 *    is the #1 reason a customer cannot complete a purchase.
 *  - Delivery reliability (0.30) is next — customers care deeply about
 *    whether their order will actually arrive on time.
 *  - Seller trust (0.20) matters for first-time buyers or lesser-known brands.
 *  - Price stability (0.15) is lowest — an expired discount is annoying
 *    but doesn't prevent a purchase.
 *
 * Every factor exposes its raw value, weighted contribution, AND maximum
 * possible contribution so the UI can render both a progress bar and a
 * fraction (e.g. "28/35 for Stock").
 *
 * This is NOT an ML model. The weights are simple, documented constants
 * that could be A/B tested against conversion data in production.
 */

import type { StockStatus, ConfidenceBreakdown, ConfidenceLabel, ConfidenceFactor } from '../types/index.js';

// ─── Weights (must sum to 1.0) ──────────────────────────────
const WEIGHTS = {
  stock: 0.35,
  delivery: 0.30,
  seller: 0.20,
  price: 0.15,
} as const;

// ─── Score Bands ────────────────────────────────────────────
const HIGH_CONFIDENCE_THRESHOLD = 85;
const GOOD_CONFIDENCE_THRESHOLD = 60;

export interface ConfidenceInput {
  stockStatus: StockStatus;
  deliveryReliability: number;  // 0–100
  sellerRating: number;         // 0–5
  priceStable: boolean;
}

/**
 * Maps a stock status to a 0–100 factor score.
 * Exported for direct unit testing.
 */
export function stockToScore(status: StockStatus): number {
  switch (status) {
    case 'in_stock':     return 100;
    case 'low_stock':    return 60;
    case 'out_of_stock': return 0;
  }
}

/**
 * Converts a 0–5 seller rating to a 0–100 scale.
 */
export function sellerRatingToScore(rating: number): number {
  return Math.min(100, Math.max(0, (rating / 5) * 100));
}

/**
 * Maps price stability to a factor score.
 * An expired discount doesn't prevent purchase but reduces confidence.
 */
export function priceStabilityToScore(stable: boolean): number {
  return stable ? 100 : 50;
}

/**
 * Derives the human-readable confidence label from a numeric score.
 */
export function scoreToLabel(score: number): ConfidenceLabel {
  if (score >= HIGH_CONFIDENCE_THRESHOLD) return 'High Confidence';
  if (score >= GOOD_CONFIDENCE_THRESHOLD) return 'Good';
  return 'Limited Confidence';
}

/**
 * Computes the full confidence breakdown.
 *
 * This is a pure function — no side effects, no data fetching.
 * All inputs are pre-computed by the calling code.
 */
export function calculateConfidence(input: ConfidenceInput): ConfidenceBreakdown {
  const stockScore = stockToScore(input.stockStatus);
  const deliveryScore = Math.min(100, Math.max(0, input.deliveryReliability));
  const sellerScore = sellerRatingToScore(input.sellerRating);
  const priceScore = priceStabilityToScore(input.priceStable);

  const factors: ConfidenceFactor[] = [
    {
      name: 'Stock Availability',
      value: input.stockStatus,
      contribution: round1(stockScore * WEIGHTS.stock),
      maxContribution: 100 * WEIGHTS.stock,
    },
    {
      name: 'Delivery Reliability',
      value: input.deliveryReliability,
      contribution: round1(deliveryScore * WEIGHTS.delivery),
      maxContribution: 100 * WEIGHTS.delivery,
    },
    {
      name: 'Seller Trust',
      value: input.sellerRating,
      contribution: round1(sellerScore * WEIGHTS.seller),
      maxContribution: 100 * WEIGHTS.seller,
    },
    {
      name: 'Price Stability',
      value: input.priceStable,
      contribution: round1(priceScore * WEIGHTS.price),
      maxContribution: 100 * WEIGHTS.price,
    },
  ];

  const score = Math.round(
    factors.reduce((sum, f) => sum + f.contribution, 0),
  );

  return {
    score,
    label: scoreToLabel(score),
    factors,
  };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
