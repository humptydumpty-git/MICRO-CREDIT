import { useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';

/**
 * Custom hook for handling API errors consistently
 */
export const useApiError = () => {
  const handleError = useCallback((error: any, defaultMessage?: string) => {
    console.error('API Error:', error);

    // Extract error message
    let errorMessage = defaultMessage || 'An unexpected error occurred';
    
    if (error?.message) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    // Show toast notification
    toast({
      title: 'Error',
      description: errorMessage,
      variant: 'destructive',
    });

    return errorMessage;
  }, []);

  const handleSuccess = useCallback((message: string) => {
    toast({
      title: 'Success',
      description: message,
    });
  }, []);

  return { handleError, handleSuccess };
};

