import { useState, useCallback } from 'react';
import { getApiErrorMessage } from '@/utils/apiErrorMessage';

export function useApiError() {
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((err: unknown) => {
    const message = getApiErrorMessage(err);
    setError(message);
    return message;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { error, setError, handleError, clearError };
}
