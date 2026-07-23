/**
 * API Integration Tests
 *
 * Tests the HTTP layer end-to-end: request → route → services → response.
 * Uses the app factory directly (no network listener needed) to test
 * the actual Express middleware chain.
 *
 * These tests verify:
 *  - Happy path: correct response shape and status
 *  - 404: unknown product
 *  - 400: invalid size
 *  - Size-specific behaviour: out-of-stock triggers alternatives
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { createApp } from '../src/app.js';
import type { Express } from 'express';
import type { ConfidenceResponse } from '../src/types/index.js';

let app: Express;

/**
 * Lightweight test helper that calls the Express app directly
 * using Node's built-in http module — no supertest dependency needed.
 */
async function request(app: Express, path: string): Promise<{ status: number; body: Record<string, unknown> }> {
  return new Promise((resolve, reject) => {
    // Import http inline to avoid top-level side effects
    import('node:http').then(({ createServer }) => {
      const server = createServer(app);
      server.listen(0, () => {
        const addr = server.address();
        if (!addr || typeof addr === 'string') {
          server.close();
          return reject(new Error('Failed to get server address'));
        }
        const port = addr.port;

        import('node:http').then(({ get }) => {
          get(`http://localhost:${port}${path}`, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
              server.close();
              try {
                resolve({
                  status: res.statusCode ?? 500,
                  body: JSON.parse(data),
                });
              } catch {
                resolve({
                  status: res.statusCode ?? 500,
                  body: { raw: data },
                });
              }
            });
          }).on('error', (err) => {
            server.close();
            reject(err);
          });
        });
      });
    });
  });
}

beforeAll(() => {
  app = createApp();
});

// ─── GET /products ──────────────────────────────────────────

describe('GET /products', () => {
  it('returns a list of products with correct shape', async () => {
    const res = await request(app, '/products');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    const items = res.body as unknown as Array<Record<string, unknown>>;
    expect(items.length).toBeGreaterThan(0);

    const first = items[0];
    expect(first).toHaveProperty('id');
    expect(first).toHaveProperty('title');
    expect(first).toHaveProperty('brandName');
    expect(first).toHaveProperty('image');
    expect(first).toHaveProperty('price');
    expect(first).toHaveProperty('discountPercent');
    expect(first).toHaveProperty('category');
  });
});

// ─── GET /products/:id/confidence ───────────────────────────

describe('GET /products/:id/confidence', () => {
  it('returns a full confidence response for a valid product', async () => {
    const res = await request(app, '/products/prod-001/confidence');
    expect(res.status).toBe(200);

    const body = res.body as unknown as ConfidenceResponse;
    expect(body.product.id).toBe('prod-001');
    expect(body.product.brand.name).toBe('Bin Tayyab');
    expect(body.sizes.length).toBeGreaterThan(0);
    expect(body.selectedSize).toBeTruthy();
    expect(body.pricing.basePrice).toBe(42.99);
    expect(body.delivery.method).toBe('express');
    expect(body.confidence.score).toBeGreaterThanOrEqual(0);
    expect(body.confidence.score).toBeLessThanOrEqual(100);
    expect(body.confidence.factors).toHaveLength(4);
  });

  it('returns confidence for a specific size', async () => {
    const res = await request(app, '/products/prod-001/confidence?size=M');
    expect(res.status).toBe(200);

    const body = res.body as unknown as ConfidenceResponse;
    expect(body.selectedSize).toBe('M');
  });

  it('includes alternatives when selected size is out of stock', async () => {
    // prod-001 size XL has 0 stock
    const res = await request(app, '/products/prod-001/confidence?size=XL');
    expect(res.status).toBe(200);

    const body = res.body as unknown as ConfidenceResponse;
    expect(body.selectedSize).toBe('XL');
    expect(body.alternatives).toBeDefined();
    expect(Array.isArray(body.alternatives)).toBe(true);
  });

  it('does NOT include alternatives when selected size is in stock', async () => {
    // prod-001 size M has 12 stock
    const res = await request(app, '/products/prod-001/confidence?size=M');
    expect(res.status).toBe(200);

    const body = res.body as unknown as ConfidenceResponse;
    expect(body.alternatives).toBeUndefined();
  });

  it('returns 404 for unknown product', async () => {
    const res = await request(app, '/products/nonexistent/confidence');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('PRODUCT_NOT_FOUND');
  });

  it('returns 400 for invalid size', async () => {
    const res = await request(app, '/products/prod-001/confidence?size=XXXL');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('INVALID_SIZE');
  });

  it('auto-selects the first in-stock size when no size is specified', async () => {
    const res = await request(app, '/products/prod-001/confidence');
    expect(res.status).toBe(200);

    const body = res.body as unknown as ConfidenceResponse;
    // prod-001 sizes: S(5), M(12), L(2), XL(0), XXL(0)
    // First in-stock (>3) is S with 5 units
    expect(body.selectedSize).toBe('S');
  });
});

// ─── GET /health ────────────────────────────────────────────

describe('GET /health', () => {
  it('returns ok status with data counts', async () => {
    const res = await request(app, '/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.data).toHaveProperty('products');
    expect(res.body.data).toHaveProperty('inventory');
    expect(res.body.data).toHaveProperty('sellers');
  });
});
