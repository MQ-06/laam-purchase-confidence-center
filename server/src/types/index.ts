/**
 * LAAM Purchase Confidence Center — Core Domain Types
 *
 * These types represent the data model for the entire application.
 * All entities are designed to be serialisable to/from JSON seed files,
 * and the computed types (ConfidenceBreakdown, PricingSummary) are derived
 * at request-time by the service layer — never persisted.
 *
 * Naming conventions:
 *  - Stored entities: Product, Inventory, Seller
 *  - Computed responses: ConfidenceBreakdown, PricingSummary, DeliveryEstimate
 *  - API response shapes: ProductListItem, ConfidenceResponse
 */

// ─────────────────────────────────────────────
// 1. Stored Entities (seeded via JSON)
// ─────────────────────────────────────────────

export interface Product {
  id: string;
  title: string;
  brandId: string;
  category: ProductCategory;
  basePrice: number;
  discountPercent: number;
  /** ISO-8601 date string, or null if discount never expires */
  discountExpiresAt: string | null;
  images: string[];
  attributes: Record<string, string>;
  returnEligible: boolean;
}

export type ProductCategory = 'Kurta Set' | 'Lehenga' | 'Saree' | 'Anarkali' | 'Sharara Set';

export interface InventoryRow {
  id: string;
  productId: string;
  size: Size;
  stock: number;
  warehouse: string;
  /** ISO-8601 timestamp — used for staleness checks */
  lastUpdated: string;
}

export type Size = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';

export interface Seller {
  id: string;
  name: string;
  /** 0–5 scale, one decimal place */
  rating: number;
  reviewCount: number;
  /** 0–100 percentage */
  onTimeDeliveryRate: number;
  verified: boolean;
}

// ─────────────────────────────────────────────
// 2. Computed / Derived Types (never persisted)
// ─────────────────────────────────────────────

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface SizeAvailability {
  size: Size;
  status: StockStatus;
  stock: number;
}

export type DeliveryMethod = 'express' | 'standard';

export interface DeliveryEstimate {
  method: DeliveryMethod;
  dispatchWithinHours: number;
  /** [min, max] business days */
  estimatedDays: [number, number];
  shippingCost: number;
  /** 0–100 — copied from Seller.onTimeDeliveryRate */
  reliabilityPercent: number;
}

export interface PricingSummary {
  basePrice: number;
  discountPercent: number;
  discountAmount: number;
  /** Whether the discount is still active (not expired) */
  discountExpired: boolean;
  shippingCost: number;
  tax: number;
  total: number;
}

export type ConfidenceLabel = 'High Confidence' | 'Good' | 'Limited Confidence';

export interface ConfidenceFactor {
  name: string;
  /** The raw value used for this factor (for display) */
  value: string | number | boolean;
  /** Weighted contribution to the overall score (0–100 scale after weighting) */
  contribution: number;
  /** Maximum possible contribution for this factor */
  maxContribution: number;
}

export interface ConfidenceBreakdown {
  /** 0–100, rounded to nearest integer */
  score: number;
  label: ConfidenceLabel;
  factors: ConfidenceFactor[];
}

export interface AlternativeProduct {
  id: string;
  title: string;
  image: string;
  price: number;
  brandName: string;
  category: ProductCategory;
  /** Whether at least one size is in stock */
  inStock: boolean;
}

// ─────────────────────────────────────────────
// 3. API Response Shapes
// ─────────────────────────────────────────────

/** GET /products — browse view item */
export interface ProductListItem {
  id: string;
  title: string;
  brandName: string;
  image: string;
  price: number;
  discountPercent: number;
  category: ProductCategory;
}

/** GET /products/:id/confidence — the main composed response */
export interface ConfidenceResponse {
  product: {
    id: string;
    title: string;
    brand: {
      id: string;
      name: string;
      rating: number;
      reviewCount: number;
      verified: boolean;
    };
    images: string[];
    attributes: Record<string, string>;
    returnEligible: boolean;
    category: ProductCategory;
  };
  sizes: SizeAvailability[];
  selectedSize: Size | null;
  pricing: PricingSummary;
  delivery: DeliveryEstimate;
  confidence: ConfidenceBreakdown;
  /** Present only when selectedSize is out of stock */
  alternatives?: AlternativeProduct[];
}

/** Standard API error envelope */
export interface ApiError {
  error: string;
  message?: string;
  validSizes?: Size[];
}
