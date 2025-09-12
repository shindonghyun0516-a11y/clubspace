'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { AuthGuard } from '@/components/auth';
import { useAuth } from '@/hooks/useAuth';
import { useClubStore } from '@/store/clubStore';
import CreateEventForm from '@/components/event/CreateEventForm';

export default function NewEventPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { currentClub, getClub, getUserClubRole } = useClubStore();
  
  const clubId = params.clubId as string;
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);

  // Load club data and check permissions
  useEffect(() => {
    if (!clubId || !user) return;
    
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load club data
        await getClub(clubId);
        
        // Check user permissions
        const role = await getUserClubRole(clubId, user.uid);
        setUserRole(role);
        
        // Check if user can create events
        const canCreate = role && ['owner', 'organizer'].includes(role);
        setHasPermission(!!canCreate);
        
      } catch (error) {
        console.error('❌ [NewEventPage] Error loading data:', error);
        setHasPermission(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [clubId, user, getClub, getUserClubRole]);

  const handleEventCreated = (eventId: string) => {
    // Redirect to the newly created event
    router.push(`/clubs/${clubId}/events/${eventId}`);
  };

  const handleCancel = () => {
    // Go back to events list
    router.push(`/clubs/${clubId}/events`);
  };

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 p-4">
          <div className="max-w-2xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-gray-200 rounded mr-4"></div>
                <div className="h-8 w-48 bg-gray-200 rounded"></div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
                <div className="h-6 w-32 bg-gray-200 rounded"></div>
                <div className="h-10 w-full bg-gray-200 rounded"></div>
                <div className="h-24 w-full bg-gray-200 rounded"></div>
                <div className="h-10 w-full bg-gray-200 rounded"></div>
                <div className="h-10 w-full bg-gray-200 rounded"></div>
                <div className="flex justify-end space-x-3">
                  <div className="h-10 w-20 bg-gray-200 rounded"></div>
                  <div className="h-10 w-28 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (!currentClub) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">클럽을 찾을 수 없습니다</h3>
            <p className="text-gray-500 mb-6">요청하신 클럽이 존재하지 않거나 접근 권한이 없습니다.</p>
            <Link
              href="/clubs"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              클럽 목록으로 돌아가기
            </Link>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (!hasPermission) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="mx-auto w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">권한이 부족합니다</h3>
            <p className="text-gray-500 mb-6">
              이벤트를 생성하려면 클럽의 소유자 또는 운영진이어야 합니다.
              <br />
              현재 권한: {userRole ? `${userRole}` : '권한 없음'}
            </p>
            <Link
              href={`/clubs/${clubId}/events`}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              이벤트 목록으로 돌아가기
            </Link>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              {/* Breadcrumb Navigation */}
              <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                <Link 
                  href="/clubs" 
                  className="hover:text-gray-700 transition-colors"
                >
                  클럽
                </Link>
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <Link 
                  href={`/clubs/${clubId}`}
                  className="hover:text-gray-700 transition-colors"
                >
                  {currentClub.clubName}
                </Link>
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <Link 
                  href={`/clubs/${clubId}/events`}
                  className="hover:text-gray-700 transition-colors"
                >
                  이벤트
                </Link>
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-900 font-medium">새 이벤트</span>
              </nav>

              {/* Page Header */}
              <div className="flex items-center">
                <Link
                  href={`/clubs/${clubId}/events`}
                  className="mr-4 p-2 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">새 이벤트 만들기</h1>
                  <p className="text-sm text-gray-600 mt-1">
                    {currentClub.clubName} 멤버들과 함께할 이벤트를 생성하세요
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <CreateEventForm
            clubId={clubId}
            onSuccess={handleEventCreated}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </AuthGuard>
  );
}