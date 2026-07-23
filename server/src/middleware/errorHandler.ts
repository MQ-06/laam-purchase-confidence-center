/**
 * Global Error Handler Middleware
 *
 * Catches any unhandled errors thrown or passed via next(err) in route
 * handlers. Returns a consistent JSON error envelope to the client
 * without leaking internal details (stack traces, file paths, etc.).
 *
 * In development, the full error is logged to the console for debugging.
 */

import type { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const statusCode = err.statusCode ?? 500;
  const code = err.code ?? 'INTERNAL_ERROR';

  // Log the full error server-side (never send to client)
  console.error(`[error] ${statusCode} ${code}:`, err.message);
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    error: code,
    message: statusCode === 500 ? 'An unexpected error occurred' : err.message,
  });
}

/**
 * Factory for typed, throwable HTTP errors.
 * Keeps route handlers clean — throw instead of manually setting status codes.
 *
 * Usage:
 *   throw createHttpError(404, 'PRODUCT_NOT_FOUND', 'No product with id "xyz"');
 */
export function createHttpError(statusCode: number, code: string, message: string): AppError {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.code = code;
  return error;
}
