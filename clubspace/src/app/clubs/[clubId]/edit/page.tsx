'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { AuthGuard } from '@/components/auth';
import { useAuth } from '@/hooks/useAuth';
import { useClubStore } from '@/store/clubStore';
import { ClubRole } from '@/types/club';
import EditClubForm from '@/components/club/EditClubForm';

export default function ClubEditPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const {
    currentClub,
    isLoading,
    error,
    getClub,
    checkPermissions,
    clearError,
  } = useClubStore();

  const [isCheckingPermission, setIsCheckingPermission] = useState(true);
  const [hasEditPermission, setHasEditPermission] = useState(false);

  const clubId = params.clubId as string;

  // Load club data and check permissions
  useEffect(() => {
    const loadClubAndCheckPermissions = async () => {
      if (!clubId || !user) return;

      try {
        setIsCheckingPermission(true);
        clearError();
        
        // Load club data if not already loaded
        if (!currentClub || currentClub.clubId !== clubId) {
          await getClub(clubId);
        }

        // Check edit permissions
        const permissions = checkPermissions(clubId, user.uid);
        
        if (!permissions?.canEdit) {
          // Redirect to club detail if no edit permission
          router.replace(`/clubs/${clubId}`);
          return;
        }

        setHasEditPermission(true);
      } catch (error) {
        console.error('Failed to load club or check permissions:', error);
        router.replace(`/clubs/${clubId}`);
      } finally {
        setIsCheckingPermission(false);
      }
    };

    loadClubAndCheckPermissions();
  }, [clubId, user, currentClub, getClub, checkPermissions, clearError, router]);

  // Loading states
  if (isLoading || isCheckingPermission) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header skeleton */}
            <div className="mb-8">
              <div className="flex items-center space-x-4 mb-4">
                <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* Form skeleton */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="space-y-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i}>
                    <div className="h-4 w-24 bg-gray-200 rounded mb-2 animate-pulse"></div>
                    <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
                <div className="flex justify-end space-x-4">
                  <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-10 w-24 bg-blue-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  // Error state
  if (error || !currentClub) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">클럽을 찾을 수 없습니다</h3>
              <p className="text-sm text-gray-500 mb-6">
                {error || '클럽이 삭제되었거나 접근 권한이 없습니다.'}
              </p>
              <Link
                href="/clubs"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                클럽 목록으로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  // Check permission (shouldn't happen due to useEffect redirect, but safety check)
  if (!hasEditPermission) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-yellow-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-4a2 2 0 00-2-2H6a2 2 0 00-2 2v4a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">접근 권한이 없습니다</h3>
              <p className="text-sm text-gray-500 mb-6">
                클럽을 편집하려면 클럽 소유자여야 합니다.
              </p>
              <Link
                href={`/clubs/${clubId}`}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                클럽 상세로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  // Main edit page content
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <Link
                href={`/clubs/${clubId}`}
                className="inline-flex items-center text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-1" />
                클럽으로 돌아가기
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">클럽 편집</h1>
            <p className="mt-2 text-gray-600">
              {currentClub.clubName} 클럽의 정보를 수정할 수 있습니다.
            </p>
          </div>

          {/* Edit Form */}
          <EditClubForm 
            club={currentClub}
            onSuccess={() => {
              router.push(`/clubs/${clubId}`);
            }}
            onCancel={() => {
              router.push(`/clubs/${clubId}`);
            }}
          />
        </div>
      </div>
    </AuthGuard>
  );
}