/**
 * Availability Service Tests
 *
 * Tests the stock status derivation logic.
 * These are pure function tests — no data store dependency needed.
 */

import { describe, it, expect } from 'vitest';
import { deriveStockStatus } from '../src/services/availabilityService.js';

describe('deriveStockStatus', () => {
  it('returns "out_of_stock" for 0 units', () => {
    expect(deriveStockStatus(0)).toBe('out_of_stock');
  });

  it('returns "out_of_stock" for negative units (defensive)', () => {
    expect(deriveStockStatus(-5)).toBe('out_of_stock');
  });

  it('returns "low_stock" for 1 unit', () => {
    expect(deriveStockStatus(1)).toBe('low_stock');
  });

  it('returns "low_stock" for exactly 3 units (threshold boundary)', () => {
    expect(deriveStockStatus(3)).toBe('low_stock');
  });

  it('returns "in_stock" for 4 units (just above threshold)', () => {
    expect(deriveStockStatus(4)).toBe('in_stock');
  });

  it('returns "in_stock" for 100 units', () => {
    expect(deriveStockStatus(100)).toBe('in_stock');
  });
});
