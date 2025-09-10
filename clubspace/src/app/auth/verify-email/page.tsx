'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function VerifyEmailPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  const { 
    user, 
    isAuthenticated, 
    resendEmailVerification, 
    refreshUserProfile, 
    error, 
    clearError 
  } = useAuth();
  const router = useRouter();

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Check email verification status periodically
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/signin');
      return;
    }

    const checkVerification = async () => {
      await refreshUserProfile();
      if (user?.emailVerified) {
        router.push('/dashboard');
      }
    };

    // Check immediately and then every 5 seconds
    checkVerification();
    const interval = setInterval(checkVerification, 5000);

    return () => clearInterval(interval);
  }, [isAuthenticated, user?.emailVerified, router, refreshUserProfile]);

  const handleResendEmail = async () => {
    setIsLoading(true);
    clearError();

    try {
      await resendEmailVerification();
      setCountdown(60);
      setCanResend(false);
    } catch (error) {
      console.error('Resend verification error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshStatus = async () => {
    setIsLoading(true);
    await refreshUserProfile();
    setIsLoading(false);
  };

  if (!isAuthenticated) {
    return null; // Will redirect to signin
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-yellow-500 rounded-lg flex items-center justify-center">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            이메일 인증이 필요합니다
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            ClubSpace를 사용하기 위해 이메일을 인증해주세요
          </p>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="text-center space-y-4">
            <div className="text-sm text-gray-700">
              <strong>{user?.email}</strong>로 인증 이메일을 보냈습니다.
            </div>
            
            <div className="text-sm text-gray-600">
              이메일을 확인하고 인증 링크를 클릭해주세요. 
              이메일을 받지 못하셨다면 스팸 폴더를 확인해보세요.
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    이메일 인증을 완료하면 자동으로 대시보드로 이동됩니다.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="pt-4 space-y-3">
              <button
                onClick={handleRefreshStatus}
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '확인 중...' : '인증 상태 새로고침'}
              </button>

              <button
                onClick={handleResendEmail}
                disabled={isLoading || !canResend}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '재전송 중...' : canResend ? '인증 이메일 다시 보내기' : `다시 보내기 (${countdown}초)`}
              </button>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-3">
                나중에 인증하고 싶으시나요?
              </p>
              <Link
                href="/dashboard"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                임시로 대시보드 사용하기 →
              </Link>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        <div className="text-center">
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-gray-500"
          >
            ← 홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}