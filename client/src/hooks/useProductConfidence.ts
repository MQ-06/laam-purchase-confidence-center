import { useState, useEffect, useCallback } from 'react';
import { apiClient, ApiRequestError } from '../api/client';
import type { ConfidenceResponse, Size } from '../types/product.types';

interface UseProductConfidenceResult {
  data: ConfidenceResponse | null;
  loading: boolean;
  error: string | null;
  selectedSize: Size | null;
  setSelectedSize: (size: Size) => void;
  refetch: () => void;
}

export function useProductConfidence(productId: string, initialSize?: Size): UseProductConfidenceResult {
  const [data, setData] = useState<ConfidenceResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSizeState] = useState<Size | null>(initialSize ?? null);

  const fetchData = useCallback(
    async (sizeToFetch?: Size | null) => {
      if (!productId) return;
      setLoading(true);
      setError(null);
      try {
        const query = sizeToFetch ? `?size=${sizeToFetch}` : '';
        const res = await apiClient.get<ConfidenceResponse>(`/products/${productId}/confidence${query}`);
        setData(res);
        if (res.selectedSize) {
          setSelectedSizeState(res.selectedSize);
        }
      } catch (err) {
        if (err instanceof ApiRequestError) {
          setError(err.message || `Error ${err.statusCode}: ${err.code}`);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to load confidence data.');
        }
      } finally {
        setLoading(false);
      }
    },
    [productId]
  );

  useEffect(() => {
    fetchData(selectedSize);
  }, [productId, selectedSize, fetchData]);

  const setSelectedSize = useCallback((newSize: Size) => {
    setSelectedSizeState(newSize);
  }, []);

  const refetch = useCallback(() => {
    fetchData(selectedSize);
  }, [fetchData, selectedSize]);

  return {
    data,
    loading,
    error,
    selectedSize,
    setSelectedSize,
    refetch,
  };
}
