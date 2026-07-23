/**
 * API Client
 *
 * Thin wrapper around fetch() that:
 *  - Prepends the base URL (defaults to '' because Vite proxies /products)
 *  - Parses JSON responses
 *  - Throws typed errors for non-2xx responses
 *
 * No external HTTP library needed — fetch is built into modern browsers
 * and is more than sufficient for this use case.
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async get<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`);

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({
        error: 'UNKNOWN_ERROR',
        message: response.statusText,
      }));
      throw new ApiRequestError(
        response.status,
        errorBody.error ?? 'UNKNOWN_ERROR',
        errorBody.message ?? response.statusText,
        errorBody.validSizes,
      );
    }

    return response.json() as Promise<T>;
  }
}

export class ApiRequestError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly validSizes?: string[];

  constructor(statusCode: number, code: string, message: string, validSizes?: string[]) {
    super(message);
    this.name = 'ApiRequestError';
    this.statusCode = statusCode;
    this.code = code;
    this.validSizes = validSizes;
  }
}

export const apiClient = new ApiClient(BASE_URL);
