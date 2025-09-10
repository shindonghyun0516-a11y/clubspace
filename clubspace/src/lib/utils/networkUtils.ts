// Network utilities for handling API requests with retry logic and error handling

export interface NetworkError extends Error {
  status?: number;
  statusText?: string;
  data?: any;
}

export interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  retryCondition?: (error: NetworkError) => boolean;
}

/**
 * Default retry condition - retries on network errors and 5xx server errors
 */
const defaultRetryCondition = (error: NetworkError): boolean => {
  // Retry on network errors (no status) or server errors (5xx)
  return !error.status || (error.status >= 500 && error.status < 600);
};

/**
 * Delay function for retry attempts
 */
const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Enhanced fetch with retry logic and proper error handling
 */
export async function fetchWithRetry(
  url: string | URL,
  options: RequestInit = {},
  retryOptions: RetryOptions = {}
): Promise<Response> {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    retryCondition = defaultRetryCondition,
  } = retryOptions;

  let lastError: NetworkError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      // If response is ok, return it
      if (response.ok) {
        return response;
      }

      // Create error for non-ok responses
      const error: NetworkError = new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      error.status = response.status;
      error.statusText = response.statusText;
      
      try {
        error.data = await response.json();
      } catch {
        // If response is not JSON, ignore
      }

      lastError = error;

      // Check if we should retry
      if (attempt < maxRetries && retryCondition(error)) {
        await delay(retryDelay * Math.pow(2, attempt)); // Exponential backoff
        continue;
      }

      throw error;

    } catch (error) {
      const networkError = error as NetworkError;
      lastError = networkError;

      // Check if we should retry
      if (attempt < maxRetries && retryCondition(networkError)) {
        await delay(retryDelay * Math.pow(2, attempt)); // Exponential backoff
        continue;
      }

      throw networkError;
    }
  }

  throw lastError!;
}

/**
 * API request wrapper with JSON parsing and error handling
 */
export async function apiRequest<T = any>(
  url: string | URL,
  options: RequestInit = {},
  retryOptions?: RetryOptions
): Promise<T> {
  const response = await fetchWithRetry(url, options, retryOptions);
  
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
  
  return await response.text() as T;
}

/**
 * Common API methods with retry logic
 */
export const api = {
  get: <T = any>(url: string, options?: RequestInit, retryOptions?: RetryOptions): Promise<T> =>
    apiRequest<T>(url, { ...options, method: 'GET' }, retryOptions),

  post: <T = any>(url: string, data?: any, options?: RequestInit, retryOptions?: RetryOptions): Promise<T> =>
    apiRequest<T>(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }, retryOptions),

  put: <T = any>(url: string, data?: any, options?: RequestInit, retryOptions?: RetryOptions): Promise<T> =>
    apiRequest<T>(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }, retryOptions),

  patch: <T = any>(url: string, data?: any, options?: RequestInit, retryOptions?: RetryOptions): Promise<T> =>
    apiRequest<T>(url, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }, retryOptions),

  delete: <T = any>(url: string, options?: RequestInit, retryOptions?: RetryOptions): Promise<T> =>
    apiRequest<T>(url, { ...options, method: 'DELETE' }, retryOptions),
};

/**
 * Check if user is online
 */
export const isOnline = (): boolean => {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
};

/**
 * Wait for network connection
 */
export const waitForConnection = (): Promise<void> => {
  return new Promise((resolve) => {
    if (isOnline()) {
      resolve();
      return;
    }

    const handleOnline = () => {
      window.removeEventListener('online', handleOnline);
      resolve();
    };

    window.addEventListener('online', handleOnline);
  });
};

/**
 * Network status hook (for use in React components)
 */
export const getNetworkStatus = () => {
  if (typeof window === 'undefined') {
    return { isOnline: true, isOffline: false };
  }

  return {
    isOnline: navigator.onLine,
    isOffline: !navigator.onLine,
  };
};