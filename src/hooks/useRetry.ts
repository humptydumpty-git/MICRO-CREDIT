import { useState, useCallback } from 'react';

interface RetryOptions {
  maxRetries?: number;
  delay?: number;
  onRetry?: (attempt: number) => void;
}

/**
 * Custom hook for retrying failed operations
 */
export const useRetry = <T,>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
) => {
  const { maxRetries = 3, delay = 1000, onRetry } = options;
  const [isRetrying, setIsRetrying] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const executeWithRetry = useCallback(async (): Promise<T> => {
    let lastError: Error | null = null;

    for (let i = 0; i <= maxRetries; i++) {
      try {
        setAttempt(i + 1);
        if (i > 0) {
          setIsRetrying(true);
          if (onRetry) onRetry(i);
          await sleep(delay * i); // Exponential backoff
        }
        const result = await operation();
        setIsRetrying(false);
        setAttempt(0);
        return result;
      } catch (error) {
        lastError = error as Error;
        if (i === maxRetries) {
          setIsRetrying(false);
          setAttempt(0);
          throw lastError;
        }
      }
    }

    setIsRetrying(false);
    setAttempt(0);
    throw lastError || new Error('Operation failed after retries');
  }, [operation, maxRetries, delay, onRetry]);

  return { executeWithRetry, isRetrying, attempt };
};

