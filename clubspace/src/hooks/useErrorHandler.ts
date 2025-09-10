'use client';

import { useCallback } from 'react';
import { useToastHelpers } from '@/components/ui';
import { NetworkError } from '@/lib/utils/networkUtils';

export interface ErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  fallbackMessage?: string;
  onError?: (error: Error) => void;
}

/**
 * Get user-friendly error message from various error types
 */
const getErrorMessage = (error: any, fallbackMessage?: string): string => {
  // Firebase Auth errors
  if (error?.code) {
    const firebaseErrorMessages: Record<string, string> = {
      'auth/user-not-found': '등록되지 않은 사용자입니다.',
      'auth/wrong-password': '비밀번호가 올바르지 않습니다.',
      'auth/email-already-in-use': '이미 사용 중인 이메일입니다.',
      'auth/weak-password': '비밀번호는 6자 이상이어야 합니다.',
      'auth/invalid-email': '유효하지 않은 이메일 주소입니다.',
      'auth/too-many-requests': '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.',
      'auth/network-request-failed': '네트워크 연결을 확인해주세요.',
      'auth/popup-closed-by-user': '로그인 창이 닫혔습니다.',
      'auth/cancelled-popup-request': '로그인이 취소되었습니다.',
      'auth/popup-blocked': '팝업이 차단되었습니다. 팝업을 허용해주세요.',
      'auth/operation-not-allowed': '이 로그인 방법이 허용되지 않습니다.',
      'auth/invalid-credential': '인증 정보가 올바르지 않습니다.',
      'auth/user-disabled': '비활성화된 계정입니다.',
      'auth/user-token-expired': '세션이 만료되었습니다. 다시 로그인해주세요.',
      'auth/requires-recent-login': '보안을 위해 다시 로그인해주세요.',
    };

    return firebaseErrorMessages[error.code] || error.message || '인증 오류가 발생했습니다.';
  }

  // Network errors
  if (error instanceof Error && 'status' in error) {
    const networkError = error as NetworkError;
    
    if (!navigator.onLine) {
      return '인터넷 연결을 확인해주세요.';
    }

    switch (networkError.status) {
      case 400:
        return '잘못된 요청입니다.';
      case 401:
        return '인증이 필요합니다. 다시 로그인해주세요.';
      case 403:
        return '접근 권한이 없습니다.';
      case 404:
        return '요청한 리소스를 찾을 수 없습니다.';
      case 429:
        return '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.';
      case 500:
        return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      case 502:
      case 503:
      case 504:
        return '서비스가 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요.';
      default:
        return networkError.message || '네트워크 오류가 발생했습니다.';
    }
  }

  // Standard Error objects
  if (error instanceof Error) {
    return error.message;
  }

  // String errors
  if (typeof error === 'string') {
    return error;
  }

  // Fallback
  return fallbackMessage || '알 수 없는 오류가 발생했습니다.';
};

/**
 * Custom hook for handling errors with consistent UX
 */
export const useErrorHandler = (defaultOptions: ErrorHandlerOptions = {}) => {
  const { error: showErrorToast } = useToastHelpers();

  const handleError = useCallback((
    error: any, 
    options: ErrorHandlerOptions = {}
  ) => {
    const mergedOptions = { ...defaultOptions, ...options };
    const {
      showToast = true,
      logError = true,
      fallbackMessage,
      onError,
    } = mergedOptions;

    // Log error for debugging
    if (logError) {
      console.error('Error handled by useErrorHandler:', error);
    }

    // Get user-friendly error message
    const message = getErrorMessage(error, fallbackMessage);

    // Show toast notification
    if (showToast) {
      showErrorToast('오류 발생', message);
    }

    // Call custom error handler
    if (onError) {
      onError(error instanceof Error ? error : new Error(String(error)));
    }

    return message;
  }, [defaultOptions, showErrorToast]);

  return { handleError };
};

/**
 * Hook for handling async operations with error handling
 */
export const useAsyncError = () => {
  const { handleError } = useErrorHandler();

  const executeAsync = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    options?: ErrorHandlerOptions
  ): Promise<T | null> => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error, options);
      return null;
    }
  }, [handleError]);

  return { executeAsync, handleError };
};

/**
 * Hook for form error handling
 */
export const useFormErrorHandler = () => {
  const { handleError } = useErrorHandler({ showToast: false });

  const handleFormError = useCallback((error: any): string => {
    return handleError(error, { showToast: false });
  }, [handleError]);

  return { handleFormError };
};