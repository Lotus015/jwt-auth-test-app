import { useState, useCallback } from 'react';
import { AxiosError, AxiosRequestConfig } from 'axios';
import { api } from '../services/api';

// API call state
export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// API call result with execute function
export interface UseApiResult<T> extends ApiState<T> {
  execute: (config?: AxiosRequestConfig) => Promise<T | null>;
  reset: () => void;
}

/**
 * Custom hook for making API calls with loading and error state management
 * @param defaultConfig - Default axios request configuration
 * @returns API state and execute function
 */
export function useApi<T = unknown>(
  defaultConfig?: AxiosRequestConfig
): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (config?: AxiosRequestConfig): Promise<T | null> => {
      setLoading(true);
      setError(null);

      try {
        const mergedConfig = { ...defaultConfig, ...config };
        const response = await api.request<T>(mergedConfig);
        setData(response.data);
        return response.data;
      } catch (err) {
        const axiosError = err as AxiosError<{ message?: string; error?: string }>;
        const errorMessage =
          axiosError.response?.data?.message ||
          axiosError.response?.data?.error ||
          axiosError.message ||
          'An unexpected error occurred';
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [defaultConfig]
  );

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return { data, loading, error, execute, reset };
}
