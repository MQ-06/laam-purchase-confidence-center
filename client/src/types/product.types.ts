/**
 * Frontend Type Definitions
 *
 * These mirror the API response shapes defined on the server.
 * In a monorepo setup you'd share these via a packages/types workspace;
 * for this assessment, a manually-synced copy is the pragmatic choice.
 *
 * Any mismatch between these and the server types is a bug.
 */

// ─── Enums & Literals ──────────────────────────────────────────

export type ProductCategory = 'Kurta Set' | 'Lehenga' | 'Saree' | 'Anarkali' | 'Sharara Set';
export type Size = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';
export type DeliveryMethod = 'express' | 'standard';
export type ConfidenceLabel = 'High Confidence' | 'Good' | 'Limited Confidence';

// ─── API Responses ─────────────────────────────────────────────

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

export interface SizeAvailability {
  size: Size;
  status: StockStatus;
  stock: number;
}

export interface DeliveryEstimate {
  method: DeliveryMethod;
  dispatchWithinHours: number;
  estimatedDays: [number, number];
  shippingCost: number;
  reliabilityPercent: number;
}

export interface PricingSummary {
  basePrice: number;
  discountPercent: number;
  discountAmount: number;
  discountExpired: boolean;
  shippingCost: number;
  tax: number;
  total: number;
}

export interface ConfidenceFactor {
  name: string;
  value: string | number | boolean;
  contribution: number;
  maxContribution: number;
}

export interface ConfidenceBreakdown {
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
  inStock: boolean;
}

/** GET /products/:id/confidence — main composed response */
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
  alternatives?: AlternativeProduct[];
}

/** Standard API error envelope */
export interface ApiError {
  error: string;
  message?: string;
  validSizes?: Size[];
}
