/**
 * Data Access Layer
 *
 * Loads JSON seed files once at startup and exposes typed lookup functions.
 * This is intentionally simple — a production system would use a proper
 * database, but for a 3–4 hour assessment, an in-memory store backed by
 * JSON files is the right trade-off: zero setup, instant reads, and the
 * service layer doesn't know or care where the data comes from.
 *
 * Design decision: data is loaded eagerly and cached in module-level Maps
 * for O(1) lookups by ID. This is fine for a small seed dataset. The Maps
 * are populated once via `initializeData()` which MUST be called before
 * the Express server starts listening.
 */

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Product, InventoryRow, Seller, Size } from '../types/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── In-memory stores ──────────────────────────────────────────
const productsMap = new Map<string, Product>();
const inventoryByProduct = new Map<string, InventoryRow[]>();
const sellersMap = new Map<string, Seller>();

// ─── Loader ────────────────────────────────────────────────────

function loadJsonFile<T>(filename: string): T {
  const filePath = join(__dirname, filename);
  const raw = readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

/**
 * Initialises the in-memory data stores from JSON seed files.
 * Call this once during server startup, before any routes are registered.
 *
 * @returns summary counts for a startup health-check log line
 */
export function initializeData(): { products: number; inventory: number; sellers: number } {
  const products = loadJsonFile<Product[]>('products.json');
  const inventory = loadJsonFile<InventoryRow[]>('inventory.json');
  const sellers = loadJsonFile<Seller[]>('sellers.json');

  productsMap.clear();
  inventoryByProduct.clear();
  sellersMap.clear();

  for (const product of products) {
    productsMap.set(product.id, product);
  }

  for (const row of inventory) {
    const existing = inventoryByProduct.get(row.productId) ?? [];
    existing.push(row);
    inventoryByProduct.set(row.productId, existing);
  }

  for (const seller of sellers) {
    sellersMap.set(seller.id, seller);
  }

  return {
    products: productsMap.size,
    inventory: inventory.length,
    sellers: sellersMap.size,
  };
}

// ─── Query Functions ───────────────────────────────────────────

export function getAllProducts(): Product[] {
  return Array.from(productsMap.values());
}

export function getProductById(id: string): Product | undefined {
  return productsMap.get(id);
}

export function getInventoryForProduct(productId: string): InventoryRow[] {
  return inventoryByProduct.get(productId) ?? [];
}

export function getInventoryForProductSize(productId: string, size: Size): InventoryRow | undefined {
  const rows = inventoryByProduct.get(productId) ?? [];
  return rows.find((r) => r.size === size);
}

export function getSellerById(id: string): Seller | undefined {
  return sellersMap.get(id);
}

export function getAllSellers(): Seller[] {
  return Array.from(sellersMap.values());
}

/**
 * Returns products that could serve as alternatives:
 * - Same category OR same brand
 * - At least one size in stock
 * - Excludes the given product itself
 */
export function getCandidateAlternatives(
  excludeProductId: string,
  category: string,
  brandId: string,
): Product[] {
  const results: Product[] = [];
  for (const product of productsMap.values()) {
    if (product.id === excludeProductId) continue;
    if (product.category !== category && product.brandId !== brandId) continue;

    // Check that at least one size is in stock
    const inventory = inventoryByProduct.get(product.id) ?? [];
    const hasStock = inventory.some((row) => row.stock > 0);
    if (!hasStock) continue;

    results.push(product);
  }
  return results;
}
