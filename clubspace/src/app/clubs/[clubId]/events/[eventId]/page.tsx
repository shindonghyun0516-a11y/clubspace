'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, CalendarIcon, MapPinIcon, UsersIcon, PencilIcon } from '@heroicons/react/24/outline';
import { AuthGuard } from '@/components/auth';
import { useAuth } from '@/hooks/useAuth';
import { useClubStore } from '@/store/clubStore';
import { useEventStore } from '@/store/eventStore';
import { Event, EVENT_STATUS_LABELS } from '@/types/event';
import { formatDateSafe } from '@/lib/utils/dateUtils';
import RSVPButton from '@/components/event/RSVPButton';
import RSVPStatus from '@/components/event/RSVPStatus';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { currentClub, getClub, getUserClubRole } = useClubStore();
  const { 
    currentEvent, 
    userRSVPs, 
    fetchEventById, 
    fetchUserRSVP, 
    setCurrentEvent,
    isLoading,
    error 
  } = useEventStore();
  
  const clubId = params.clubId as string;
  const eventId = params.eventId as string;
  const [userRole, setUserRole] = useState<string | null>(null);
  const [canEdit, setCanEdit] = useState(false);

  const userRSVP = userRSVPs.get(eventId);

  // Load data on mount
  useEffect(() => {
    if (!clubId || !eventId) return;
    
    const loadData = async () => {
      try {
        // Load club and event data
        await Promise.all([
          getClub(clubId),
          fetchEventById(eventId)
        ]);

        // Load user role and RSVP if user is logged in
        if (user) {
          const role = await getUserClubRole(clubId, user.uid);
          setUserRole(role);
          await fetchUserRSVP(eventId, user.uid);
        }
      } catch (error) {
        console.error('❌ [EventDetailPage] Error loading data:', error);
      }
    };

    loadData();
  }, [clubId, eventId, user, getClub, fetchEventById, getUserClubRole, fetchUserRSVP]);

  // Check edit permissions
  useEffect(() => {
    if (!currentEvent || !user) {
      setCanEdit(false);
      return;
    }

    // Can edit if user is the event creator or has club management permissions
    const isCreator = currentEvent.creatorUid === user.uid;
    const isClubManager = userRole && ['owner', 'organizer'].includes(userRole);
    
    setCanEdit(isCreator || !!isClubManager);
  }, [currentEvent, user, userRole]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setCurrentEvent(null);
    };
  }, [setCurrentEvent]);

  const formatEventDateTime = (dateTime: Date) => {
    try {
      return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
      }).format(dateTime);
    } catch (error) {
      console.error('Error formatting date:', error);
      return formatDateSafe(dateTime);
    }
  };

  const getEventStatus = (event: Event) => {
    if (event.status === 'cancelled') return { status: 'cancelled', label: EVENT_STATUS_LABELS.cancelled, color: 'text-red-600 bg-red-100' };
    if (event.status === 'completed') return { status: 'completed', label: EVENT_STATUS_LABELS.completed, color: 'text-green-600 bg-green-100' };
    
    const now = new Date();
    if (event.dateTime < now) return { status: 'past', label: '종료됨', color: 'text-gray-600 bg-gray-100' };
    
    return { status: 'upcoming', label: EVENT_STATUS_LABELS.active, color: 'text-blue-600 bg-blue-100' };
  };

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-gray-200 rounded mr-4"></div>
                <div className="h-8 w-64 bg-gray-200 rounded"></div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1 space-y-3">
                    <div className="h-8 w-3/4 bg-gray-200 rounded"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-6 w-16 bg-gray-200 rounded"></div>
                </div>
                <div className="space-y-4">
                  <div className="h-4 w-full bg-gray-200 rounded"></div>
                  <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
                  <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (error || !currentEvent) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">이벤트를 찾을 수 없습니다</h3>
            <p className="text-gray-500 mb-6">
              {error || '요청하신 이벤트가 존재하지 않거나 접근 권한이 없습니다.'}
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

  const eventStatus = getEventStatus(currentEvent);
  const isUpcoming = eventStatus.status === 'upcoming';
  const showRSVP = user && isUpcoming;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-white to-gray-50 shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              {/* Enhanced Breadcrumb Navigation */}
              <nav className="flex items-center space-x-1 text-sm mb-6">
                <Link href="/clubs" className="flex items-center px-3 py-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-200">
                  <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6"/>
                  </svg>
                  클럽
                </Link>
                <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <Link href={`/clubs/${clubId}`} className="flex items-center px-3 py-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-200 max-w-xs">
                  <span className="truncate">{currentClub?.clubName || '클럽'}</span>
                </Link>
                <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <Link href={`/clubs/${clubId}/events`} className="flex items-center px-3 py-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-200">
                  <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  이벤트
                </Link>
                <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="px-3 py-1.5 text-gray-900 bg-gray-100 rounded-md font-medium max-w-xs">
                  <span className="truncate block" title={currentEvent.title}>
                    {currentEvent.title.length > 20 ? `${currentEvent.title.slice(0, 20)}...` : currentEvent.title}
                  </span>
                </span>
              </nav>

              {/* Enhanced Page Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <button
                    onClick={() => router.back()}
                    className="flex-shrink-0 p-3 text-gray-400 hover:text-gray-600 hover:bg-white rounded-full shadow-sm border border-gray-200 transition-all duration-200 hover:shadow-md"
                    title="뒤로 가기"
                  >
                    <ArrowLeftIcon className="h-5 w-5" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-4 mb-3">
                      <div className="min-w-0 flex-1">
                        <div className="group relative">
                          <h1 className="text-3xl font-bold text-gray-900 leading-tight hover:text-blue-900 transition-colors duration-200">
                            {currentEvent.title.length > 50 ? `${currentEvent.title.slice(0, 50)}...` : currentEvent.title}
                          </h1>
                          {currentEvent.title.length > 50 && (
                            <div className="absolute invisible group-hover:visible bg-gray-900 text-white text-sm rounded-lg px-3 py-2 -top-12 left-0 whitespace-nowrap z-20 shadow-lg border border-gray-700">
                              <div className="max-w-sm truncate">{currentEvent.title}</div>
                              <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="relative">
                          <span className={`inline-flex items-center px-4 py-2.5 text-sm font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-200 ${
                            eventStatus.status === 'upcoming' ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-2 border-blue-300' :
                            eventStatus.status === 'completed' ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-2 border-green-300' :
                            eventStatus.status === 'cancelled' ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-2 border-red-300' : 
                            'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-2 border-gray-300'
                          }`}>
                            <div className={`w-2.5 h-2.5 rounded-full mr-2 ${
                              eventStatus.status === 'upcoming' ? 'bg-blue-500 animate-pulse shadow-sm' :
                              eventStatus.status === 'completed' ? 'bg-green-500 shadow-sm' :
                              eventStatus.status === 'cancelled' ? 'bg-red-500 shadow-sm' : 'bg-gray-500 shadow-sm'
                            }`}></div>
                            {eventStatus.label}
                          </span>
                          {eventStatus.status === 'upcoming' && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-ping"></div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-gray-600">
                      <div className="flex items-center">
                        <svg className="h-4 w-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6"/>
                        </svg>
                        {currentClub?.clubName} 이벤트
                      </div>
                      <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                      <div className="flex items-center">
                        <svg className="h-4 w-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                        {currentEvent.currentAttendees}명 참석
                      </div>
                      {currentEvent.maxAttendees && (
                        <>
                          <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                          <div>최대 {currentEvent.maxAttendees}명</div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                {canEdit && isUpcoming && (
                  <div className="flex-shrink-0 ml-4">
                    <button
                      onClick={() => {
                        // TODO: Implement event edit functionality
                        console.log('Edit event:', eventId);
                      }}
                      className="group relative inline-flex items-center px-5 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 hover:from-blue-700 hover:via-purple-700 hover:to-purple-800 border border-transparent rounded-xl shadow-lg hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 active:scale-95"
                    >
                      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300"></div>
                      <PencilIcon className="h-4 w-4 mr-2 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
                      <span className="relative z-10">편집</span>
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-300 rounded-full opacity-75 group-hover:scale-150 transition-transform duration-300"></div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
            {/* Primary Content - Event Details & Description */}
            <div className="xl:col-span-3 space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">이벤트 정보</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Date and Time */}
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <CalendarIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 mb-1">
                        {formatEventDateTime(currentEvent.dateTime)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {currentEvent.dateTime < new Date() ? '완료된 이벤트입니다' : '예정된 이벤트입니다'}
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <MapPinIcon className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 mb-1">{currentEvent.location}</div>
                      <div className="text-sm text-gray-500">이벤트 장소</div>
                    </div>
                  </div>
                </div>

                {/* Attendees - Full Width */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <UsersIcon className="h-4 w-4 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">참석 현황</h3>
                  </div>
                  <RSVPStatus 
                    eventId={eventId} 
                    maxAttendees={currentEvent.maxAttendees}
                    variant="detailed"
                  />
                </div>
              </div>

              {/* Description */}
              {currentEvent.description && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">이벤트 설명</h2>
                  <div className="prose prose-gray max-w-none">
                    <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">
                      {currentEvent.description}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar - RSVP & Meta Information */}
            <div className="xl:col-span-2 space-y-6">
              {showRSVP && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">참석 여부</h3>
                  <RSVPButton
                    eventId={eventId}
                    currentStatus={userRSVP?.status}
                    variant="compact"
                    size="lg"
                    className="w-full mb-4"
                  />
                  {userRSVP && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        마지막 업데이트: {formatDateSafe(userRSVP.updatedAt, undefined, 'ko-KR', '날짜 형식 오류')}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Event Meta Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">이벤트 정보</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-600">생성일</span>
                    <span className="text-gray-900">
                      {formatDateSafe(currentEvent.createdAt, undefined, 'ko-KR', '날짜 형식 오류')}
                    </span>
                  </div>
                  {currentEvent.updatedAt !== currentEvent.createdAt && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-600">최종 수정</span>
                      <span className="text-gray-900">
                        {formatDateSafe(currentEvent.updatedAt, undefined, 'ko-KR', '날짜 형식 오류')}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-600">현재 참석자</span>
                    <span className="text-gray-900 font-semibold">{currentEvent.currentAttendees}명</span>
                  </div>
                  {currentEvent.maxAttendees && (
                    <div className="flex justify-between items-center py-2">
                      <span className="font-medium text-gray-600">최대 참석자</span>
                      <span className="text-gray-900 font-semibold">{currentEvent.maxAttendees}명</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Actions */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">빠른 액션</h4>
                <div className="space-y-3">
                  <Link
                    href={`/clubs/${clubId}/events`}
                    className="block w-full text-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-200 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    다른 이벤트 보기
                  </Link>
                  <Link
                    href={`/clubs/${clubId}`}
                    className="block w-full text-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    클럽 페이지로
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}