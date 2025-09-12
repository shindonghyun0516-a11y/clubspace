'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PlusIcon, ArrowLeftIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { AuthGuard } from '@/components/auth';
import { useAuth } from '@/hooks/useAuth';
import { useClubStore } from '@/store/clubStore';
import { EventSearchParams } from '@/types/event';
import EventList from '@/components/event/EventList';

export default function ClubEventsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { currentClub, getClub, getUserClubRole } = useClubStore();
  
  const clubId = params.clubId as string;
  const [userRole, setUserRole] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState<EventSearchParams>({
    status: 'active',
    limit: 50,
  });
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'past'>('active');

  // Load club data and user role
  useEffect(() => {
    if (!clubId) return;
    
    const loadData = async () => {
      await getClub(clubId);
      if (user) {
        const role = await getUserClubRole(clubId, user.uid);
        setUserRole(role);
      }
    };

    loadData();
  }, [clubId, user, getClub, getUserClubRole]);

  // Check if user can create events
  const canCreateEvents = userRole && ['owner', 'organizer'].includes(userRole);

  const handleFilterChange = (filter: 'all' | 'active' | 'past') => {
    setActiveFilter(filter);
    
    const newSearchParams: EventSearchParams = {
      limit: 50,
    };
    
    if (filter === 'active') {
      newSearchParams.status = 'active';
    } else if (filter === 'past') {
      newSearchParams.status = 'completed';
    }
    // 'all' doesn't set a status filter
    
    setSearchParams(newSearchParams);
  };

  if (!currentClub) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-gray-200 rounded mr-4"></div>
                  <div className="h-8 w-48 bg-gray-200 rounded"></div>
                </div>
                <div className="h-10 w-32 bg-gray-200 rounded"></div>
              </div>
              <div className="h-12 w-full bg-gray-200 rounded"></div>
            </div>
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
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
                <span className="text-gray-900 font-medium">이벤트</span>
              </nav>

              {/* Page Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <button
                    onClick={() => router.back()}
                    className="mr-4 p-2 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
                  </button>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {currentClub.clubName} 이벤트
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                      클럽 멤버들과 함께하는 이벤트를 확인하고 참여하세요
                    </p>
                  </div>
                </div>
                
                {canCreateEvents && (
                  <Link
                    href={`/clubs/${clubId}/events/new`}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    이벤트 만들기
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FunnelIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">필터</span>
                </div>
                <div className="flex space-x-1">
                  {[
                    { key: 'active', label: '진행중', count: null },
                    { key: 'all', label: '전체', count: null },
                    { key: 'past', label: '완료됨', count: null },
                  ].map((filter) => (
                    <button
                      key={filter.key}
                      onClick={() => handleFilterChange(filter.key as 'all' | 'active' | 'past')}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                        activeFilter === filter.key
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Event List */}
          <EventList
            clubId={clubId}
            searchParams={searchParams}
            showCreateButton={!!canCreateEvents}
            showRSVP={true}
            emptyMessage={
              activeFilter === 'active' 
                ? '진행중인 이벤트가 없습니다. 새로운 이벤트를 만들어보세요!' 
                : activeFilter === 'past' 
                ? '완료된 이벤트가 없습니다.'
                : '등록된 이벤트가 없습니다.'
            }
          />
        </div>
      </div>
    </AuthGuard>
  );
}