'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireEmailVerification?: boolean;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export default function AuthGuard({
  children,
  requireAuth = true,
  requireEmailVerification = false,
  redirectTo,
  fallback = null,
}: AuthGuardProps) {
  const { 
    isAuthenticated, 
    isEmailVerified, 
    isLoading, 
    isReady 
  } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isReady || isLoading) {
      return; // Still loading, wait
    }

    if (requireAuth && !isAuthenticated) {
      // Redirect to sign in if authentication is required but user is not authenticated
      router.push(redirectTo || '/auth/signin');
      return;
    }

    if (requireEmailVerification && isAuthenticated && !isEmailVerified) {
      // Redirect to email verification if email verification is required but not verified
      router.push('/auth/verify-email');
      return;
    }

    if (!requireAuth && isAuthenticated) {
      // Redirect authenticated users away from auth pages
      router.push(redirectTo || '/dashboard');
      return;
    }
  }, [
    isAuthenticated,
    isEmailVerified,
    isLoading,
    isReady,
    requireAuth,
    requireEmailVerification,
    redirectTo,
    router,
  ]);

  // Show loading state while authentication is being checked
  if (!isReady || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // If auth is required but user is not authenticated, show fallback or nothing (will redirect)
  if (requireAuth && !isAuthenticated) {
    return fallback || null;
  }

  // If email verification is required but not verified, show fallback or nothing (will redirect)
  if (requireEmailVerification && isAuthenticated && !isEmailVerified) {
    return fallback || null;
  }

  // If user shouldn't be here (e.g., authenticated user on auth pages), show fallback or nothing (will redirect)
  if (!requireAuth && isAuthenticated) {
    return fallback || null;
  }

  // All checks passed, render children
  return <>{children}</>;
}