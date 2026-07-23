/**
 * Recommendation Service
 *
 * Finds alternative products when a customer's selected size is out of stock.
 * This prevents dead-end experiences — instead of "sorry, unavailable", the
 * customer sees 2–3 comparable options they can buy right now.
 *
 * Matching strategy (in priority order):
 *  1. Same category AND same brand (strongest match)
 *  2. Same category, different brand (category match)
 *  3. Same brand, different category (brand loyalty match)
 *
 * Results are ranked by a simple relevance score that prefers:
 *  - Products in a similar price range (within 40% of the original)
 *  - Products with the customer's size in stock (if size is known)
 *
 * Limited to MAX_ALTERNATIVES (3) to avoid decision paralysis.
 */

import { getCandidateAlternatives, getSellerById, getInventoryForProduct } from '../data/dataStore.js';
import type { Product, AlternativeProduct, Size } from '../types/index.js';

const MAX_ALTERNATIVES = 3;

/** Price similarity threshold — products within ±40% are considered "similar" */
const PRICE_SIMILARITY_RANGE = 0.40;

/**
 * Finds up to 3 alternative products for a given product + size combination.
 *
 * @param product - The product that is out of stock
 * @param preferredSize - The customer's preferred size (to check availability in alternatives)
 * @returns Sorted list of alternatives, best match first
 */
export function findAlternatives(
  product: Product,
  preferredSize?: Size,
): AlternativeProduct[] {
  const candidates = getCandidateAlternatives(product.id, product.category, product.brandId);

  if (candidates.length === 0) return [];

  // Score and sort candidates
  const scored = candidates.map((candidate) => ({
    product: candidate,
    score: computeRelevanceScore(product, candidate, preferredSize),
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored
    .slice(0, MAX_ALTERNATIVES)
    .map((s) => toAlternativeProduct(s.product));
}

/**
 * Computes a relevance score (0–100) for a candidate alternative.
 *
 * Scoring breakdown:
 *  - Category match: +40 points
 *  - Brand match: +25 points
 *  - Price similarity: +20 points (within PRICE_SIMILARITY_RANGE of original)
 *  - Preferred size in stock: +15 points
 */
function computeRelevanceScore(
  original: Product,
  candidate: Product,
  preferredSize?: Size,
): number {
  let score = 0;

  // Category match (strongest signal for fashion — shoppers browse by category)
  if (candidate.category === original.category) {
    score += 40;
  }

  // Brand match (brand loyalty)
  if (candidate.brandId === original.brandId) {
    score += 25;
  }

  // Price similarity
  const effectiveOriginalPrice = original.basePrice * (1 - original.discountPercent / 100);
  const effectiveCandidatePrice = candidate.basePrice * (1 - candidate.discountPercent / 100);
  const priceDiff = Math.abs(effectiveOriginalPrice - effectiveCandidatePrice);
  const priceThreshold = effectiveOriginalPrice * PRICE_SIMILARITY_RANGE;
  if (priceDiff <= priceThreshold) {
    score += 20;
  }

  // Preferred size availability
  if (preferredSize) {
    const inventory = getInventoryForProduct(candidate.id);
    const sizeRow = inventory.find((r) => r.size === preferredSize);
    if (sizeRow && sizeRow.stock > 0) {
      score += 15;
    }
  }

  return score;
}

/**
 * Maps a Product entity to the minimal AlternativeProduct shape
 * needed by the frontend card component.
 */
function toAlternativeProduct(product: Product): AlternativeProduct {
  const seller = getSellerById(product.brandId);
  const inventory = getInventoryForProduct(product.id);
  const hasAnyStock = inventory.some((row) => row.stock > 0);

  return {
    id: product.id,
    title: product.title,
    image: product.images[0] ?? '',
    price: product.basePrice * (1 - product.discountPercent / 100),
    brandName: seller?.name ?? 'Unknown Brand',
    category: product.category,
    inStock: hasAnyStock,
  };
}
