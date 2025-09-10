'use client';

import { useAuth } from '@/hooks/useAuth';

interface AuthErrorProps {
  error?: string | null;
  errors?: string[];
  className?: string;
  showIcon?: boolean;
  onClose?: () => void;
}

export default function AuthError({ 
  error, 
  errors = [], 
  className = '',
  showIcon = true,
  onClose 
}: AuthErrorProps) {
  const { error: authError, clearError } = useAuth();
  
  // Use prop error first, then auth error from context
  const displayError = error || authError;
  const displayErrors = errors.length > 0 ? errors : (displayError ? [displayError] : []);

  if (displayErrors.length === 0) {
    return null;
  }

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else if (authError) {
      clearError();
    }
  };

  return (
    <div className={`rounded-md bg-red-50 p-4 ${className}`}>
      <div className="flex">
        {showIcon && (
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path 
                fillRule="evenodd" 
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                clipRule="evenodd" 
              />
            </svg>
          </div>
        )}
        <div className={showIcon ? 'ml-3' : ''}>
          <div className="text-sm text-red-700">
            {displayErrors.length === 1 ? (
              <div>{displayErrors[0]}</div>
            ) : (
              <ul className="list-disc list-inside space-y-1">
                {displayErrors.map((errorMsg, index) => (
                  <li key={index}>{errorMsg}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
        {(onClose || authError) && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={handleClose}
                className="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
              >
                <span className="sr-only">닫기</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path 
                    fillRule="evenodd" 
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}