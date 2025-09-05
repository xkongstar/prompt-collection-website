'use client';

import { useState, useCallback, useRef } from 'react';

interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number) => void;
  onMaxRetriesReached?: () => void;
}

interface RetryState {
  isRetrying: boolean;
  retryCount: number;
  lastError: Error | null;
  canRetry: boolean;
}

interface UseRetryReturn extends RetryState {
  executeWithRetry: <T>(fn: () => Promise<T>) => Promise<T>;
  retry: () => void;
  reset: () => void;
}

export const useRetry = (options: RetryOptions = {}): UseRetryReturn => {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    backoffMultiplier = 2,
    onRetry,
    onMaxRetriesReached,
  } = options;

  const [state, setState] = useState<RetryState>({
    isRetrying: false,
    retryCount: 0,
    lastError: null,
    canRetry: true,
  });

  const lastFunctionRef = useRef<(() => Promise<any>) | null>(null);

  const executeWithRetry = useCallback(async <T>(fn: () => Promise<T>): Promise<T> => {
    lastFunctionRef.current = fn;

    const attemptExecution = async (attempt: number): Promise<T> => {
      try {
        setState(prev => ({ ...prev, isRetrying: attempt > 0 }));
        
        if (attempt > 0) {
          onRetry?.(attempt);
          // 计算延迟时间（指数退避）
          const delay = retryDelay * Math.pow(backoffMultiplier, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        const result = await fn();
        
        // 成功时重置状态
        setState({
          isRetrying: false,
          retryCount: 0,
          lastError: null,
          canRetry: true,
        });
        
        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        const nextAttempt = attempt + 1;
        const canRetryAgain = nextAttempt < maxRetries;

        setState({
          isRetrying: false,
          retryCount: nextAttempt,
          lastError: err,
          canRetry: canRetryAgain,
        });

        if (canRetryAgain) {
          return attemptExecution(nextAttempt);
        } else {
          onMaxRetriesReached?.();
          throw err;
        }
      }
    };

    return attemptExecution(0);
  }, [maxRetries, retryDelay, backoffMultiplier, onRetry, onMaxRetriesReached]);

  const retry = useCallback(() => {
    if (lastFunctionRef.current && state.canRetry) {
      executeWithRetry(lastFunctionRef.current);
    }
  }, [executeWithRetry, state.canRetry]);

  const reset = useCallback(() => {
    setState({
      isRetrying: false,
      retryCount: 0,
      lastError: null,
      canRetry: true,
    });
    lastFunctionRef.current = null;
  }, []);

  return {
    ...state,
    executeWithRetry,
    retry,
    reset,
  };
};