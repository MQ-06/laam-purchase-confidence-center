/**
 * Availability Service
 *
 * Responsible for determining the stock status of each size for a product.
 * The threshold for "low stock" is a documented constant (LOW_STOCK_THRESHOLD = 3),
 * making it easy to tune without touching business logic.
 *
 * Design decision: this service is a pure function of data — it reads from
 * the data store but has no side effects. This makes it trivially testable.
 */

import { getInventoryForProduct, getInventoryForProductSize } from '../data/dataStore.js';
import type { Size, StockStatus, SizeAvailability } from '../types/index.js';

/** Units at or below this count are flagged as "low stock" */
const LOW_STOCK_THRESHOLD = 3;

/**
 * Maps a raw stock count to a human-meaningful status.
 * Exported for direct unit testing.
 */
export function deriveStockStatus(stock: number): StockStatus {
  if (stock <= 0) return 'out_of_stock';
  if (stock <= LOW_STOCK_THRESHOLD) return 'low_stock';
  return 'in_stock';
}

/**
 * Returns availability info for every size of a given product.
 * The result is ordered by the natural size progression (XS → XXL).
 */
export function getSizeAvailability(productId: string): SizeAvailability[] {
  const rows = getInventoryForProduct(productId);

  // Maintain a consistent display order regardless of data insertion order
  const sizeOrder: Size[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  return rows
    .sort((a, b) => sizeOrder.indexOf(a.size) - sizeOrder.indexOf(b.size))
    .map((row) => ({
      size: row.size,
      status: deriveStockStatus(row.stock),
      stock: row.stock,
    }));
}

/**
 * Returns the stock status for a specific product + size combination.
 * Returns 'out_of_stock' if the size doesn't exist in inventory
 * (defensive — treats missing data as unavailable rather than crashing).
 */
export function getStockStatusForSize(productId: string, size: Size): StockStatus {
  const row = getInventoryForProductSize(productId, size);
  if (!row) return 'out_of_stock';
  return deriveStockStatus(row.stock);
}

/**
 * Returns the list of valid sizes for a product (useful for 400 error responses).
 */
export function getValidSizes(productId: string): Size[] {
  const rows = getInventoryForProduct(productId);
  const sizeOrder: Size[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  return rows
    .map((r) => r.size)
    .sort((a, b) => sizeOrder.indexOf(a) - sizeOrder.indexOf(b));
}
