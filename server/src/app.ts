/**
 * Express Application Factory
 *
 * Separated from server.ts so that:
 *  1. Tests can import the app without starting an HTTP listener
 *  2. The app creation is deterministic and side-effect free
 *     (beyond the data initialisation, which is intentional)
 *
 * Middleware order matters:
 *  - CORS first (unblocks preflight)
 *  - JSON body parser (for future POST endpoints)
 *  - Routes
 *  - Global error handler last (catches anything upstream)
 */

import express from 'express';
import cors from 'cors';
import { initializeData } from './data/dataStore.js';
import { productRoutes } from './routes/products.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

export function createApp(): express.Application {
  // ── Initialise seed data before anything else ──
  const counts = initializeData();
  console.log(
    `[data] Loaded ${counts.products} products, ${counts.inventory} inventory rows, ${counts.sellers} sellers`,
  );

  const app = express();

  // ── Global middleware ──
  app.use(cors());
  app.use(express.json());

  // ── Health check ──
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      data: counts,
    });
  });

  // ── API routes ──
  app.use('/products', productRoutes);

  // ── Global error handler (must be registered last) ──
  app.use(errorHandler);

  return app;
}
