/**
 * Product Routes
 *
 * All endpoints under /products.
 *
 * Route design:
 *  - GET /products           → Browse view (minimal list)
 *  - GET /products/:id/confidence?size=M  → The composed Confidence Panel endpoint
 *
 * The confidence endpoint is the heart of the application. It calls 5
 * separate service functions internally but returns a single, composed
 * JSON response — the separation lives in the code, not in the network.
 * This eliminates waterfall requests on the frontend and guarantees
 * data consistency (all fields come from the same point in time).
 *
 * Error strategy:
 *  - 404 for unknown product IDs
 *  - 400 for invalid size parameters (includes valid sizes in the response)
 *  - 500 for unexpected errors (caught by global error handler)
 */

import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { getAllProducts, getProductById, getSellerById } from '../data/dataStore.js';
import { getSizeAvailability, getStockStatusForSize, getValidSizes } from '../services/availabilityService.js';
import { calculatePricing, isDiscountExpired } from '../services/pricingService.js';
import { getDeliveryEstimate, getEffectiveShippingCost } from '../services/deliveryService.js';
import { calculateConfidence } from '../services/confidenceService.js';
import { findAlternatives } from '../services/recommendationService.js';
import { createHttpError } from '../middleware/errorHandler.js';
import type { ProductListItem, ConfidenceResponse, Size } from '../types/index.js';

export const productRoutes = Router();

// ─── Valid sizes (used for request validation) ──────────────
const ALL_SIZES: Size[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

function isValidSize(s: string): s is Size {
  return ALL_SIZES.includes(s as Size);
}

// ─────────────────────────────────────────────────────────────
// GET /products — Browse view
// ─────────────────────────────────────────────────────────────

productRoutes.get('/', (_req: Request, res: Response, next: NextFunction) => {
  try {
    const products = getAllProducts();
    const items: ProductListItem[] = products.map((p) => {
      const seller = getSellerById(p.brandId);
      return {
        id: p.id,
        title: p.title,
        brandName: seller?.name ?? 'Unknown Brand',
        image: p.images[0] ?? '',
        price: p.basePrice,
        discountPercent: p.discountPercent,
        category: p.category,
      };
    });
    res.json(items);
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────
// GET /products/:id/confidence — The main composed endpoint
// ─────────────────────────────────────────────────────────────

productRoutes.get('/:id/confidence', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const sizeParam = req.query.size as string | undefined;

    // ── 1. Validate product exists ──
    const product = getProductById(id);
    if (!product) {
      throw createHttpError(404, 'PRODUCT_NOT_FOUND', `No product found with id "${id}"`);
    }

    // ── 2. Resolve seller ──
    const seller = getSellerById(product.brandId);
    if (!seller) {
      throw createHttpError(500, 'DATA_INTEGRITY_ERROR', `Seller "${product.brandId}" not found for product "${id}"`);
    }

    // ── 3. Get size availability ──
    const sizes = getSizeAvailability(product.id);

    // ── 4. Validate and resolve selected size ──
    let selectedSize: Size | null = null;

    if (sizeParam) {
      if (!isValidSize(sizeParam)) {
        throw createHttpError(400, 'INVALID_SIZE', `"${sizeParam}" is not a valid size`);
      }
      // Check that this size exists for the product
      const productSizes = getValidSizes(product.id);
      if (!productSizes.includes(sizeParam)) {
        const error = createHttpError(
          400,
          'INVALID_SIZE',
          `Size "${sizeParam}" is not available for this product`,
        );
        // Attach valid sizes to the error response
        (error as Record<string, unknown>).validSizes = productSizes;
        throw error;
      }
      selectedSize = sizeParam;
    } else {
      // Default to the first in-stock size, or the first size if all are out of stock
      const firstInStock = sizes.find((s) => s.status === 'in_stock');
      const firstLowStock = sizes.find((s) => s.status === 'low_stock');
      selectedSize = (firstInStock ?? firstLowStock ?? sizes[0])?.size ?? null;
    }

    // ── 5. Determine stock status for selected size ──
    const stockStatus = selectedSize
      ? getStockStatusForSize(product.id, selectedSize)
      : 'out_of_stock';

    // ── 6. Compute delivery estimate ──
    const deliveryMethod = 'express' as const;
    const delivery = getDeliveryEstimate(seller, deliveryMethod);

    // ── 7. Compute effective shipping cost (free shipping for orders > ₹4,999) ──
    const discountedPrice = product.basePrice * (1 - product.discountPercent / 100);
    const effectiveShipping = getEffectiveShippingCost(deliveryMethod, discountedPrice);
    delivery.shippingCost = effectiveShipping;

    // ── 8. Compute pricing ──
    const pricing = calculatePricing(product, effectiveShipping);

    // ── 9. Compute confidence score ──
    const priceStable = !isDiscountExpired(product.discountExpiresAt);
    const confidence = calculateConfidence({
      stockStatus,
      deliveryReliability: seller.onTimeDeliveryRate,
      sellerRating: seller.rating,
      priceStable,
    });

    // ── 10. Find alternatives (only if selected size is out of stock) ──
    const alternatives = stockStatus === 'out_of_stock'
      ? findAlternatives(product, selectedSize ?? undefined)
      : undefined;

    // ── 11. Compose response ──
    const response: ConfidenceResponse = {
      product: {
        id: product.id,
        title: product.title,
        brand: {
          id: seller.id,
          name: seller.name,
          rating: seller.rating,
          reviewCount: seller.reviewCount,
          verified: seller.verified,
        },
        images: product.images,
        attributes: product.attributes,
        returnEligible: product.returnEligible,
        category: product.category,
      },
      sizes,
      selectedSize,
      pricing,
      delivery,
      confidence,
      alternatives,
    };

    res.json(response);
  } catch (err) {
    next(err);
  }
});
