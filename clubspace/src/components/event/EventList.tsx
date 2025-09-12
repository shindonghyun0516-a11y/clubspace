'use client';

import { useEffect, useState } from 'react';
import { useEventStore } from '@/store/eventStore';
import { EventSearchParams } from '@/types/event';
import EventCard from './EventCard';

interface EventListProps {
  clubId: string;
  searchParams?: EventSearchParams;
  showCreateButton?: boolean;
  showRSVP?: boolean;
  className?: string;
  emptyMessage?: string;
}

export default function EventList({
  clubId,
  searchParams,
  showCreateButton = false,
  showRSVP = true,
  className = '',
  emptyMessage = '아직 등록된 이벤트가 없습니다.'
}: EventListProps) {
  const { 
    events, 
    isLoading, 
    error, 
    fetchClubEvents, 
    subscribeToEvents,
    unsubscribeFromEvents,
    clearError 
  } = useEventStore();

  // Track subscription status for real-time indicator
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Fetch events on mount and when parameters change
  useEffect(() => {
    console.log('📋 [EventList] Loading events for club:', clubId);
    clearError();
    fetchClubEvents(clubId, searchParams);
  }, [clubId, searchParams, fetchClubEvents, clearError]);

  // Set up and cleanup real-time subscription
  useEffect(() => {
    console.log('📡 [EventList] Setting up subscription for club:', clubId);
    const unsubscribe = subscribeToEvents(clubId);
    setIsSubscribed(true);
    
    return () => {
      console.log('🧹 [EventList] Cleaning up subscription for club:', clubId);
      unsubscribe();
      unsubscribeFromEvents(clubId);
      setIsSubscribed(false);
    };
  }, [clubId, subscribeToEvents, unsubscribeFromEvents]);

  const filteredEvents = events.filter(event => {
    if (searchParams?.status && event.status !== searchParams.status) {
      return false;
    }
    return true;
  });

  if (isLoading && events.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(3)].map((_, index) => (
          <div key={index} className="animate-pulse bg-white rounded-lg shadow-md p-6">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-5 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
              <div className="h-8 bg-gray-200 rounded w-full mt-4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-center">
          <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-red-800">이벤트를 불러올 수 없습니다</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
        <button
          onClick={() => fetchClubEvents(clubId, searchParams)}
          className="mt-3 text-sm text-red-600 hover:text-red-500 font-medium"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (filteredEvents.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">이벤트가 없습니다</h3>
        <p className="text-gray-500 mb-6">{emptyMessage}</p>
        
        {showCreateButton && (
          <button
            onClick={() => {
              // This will be handled by the parent component or page
              console.log('Create event button clicked');
            }}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            첫 이벤트 만들기
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Event count and status */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <h3 className="text-lg font-medium text-gray-900 mr-3">
            이벤트 목록
          </h3>
          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm font-medium">
            {filteredEvents.length}개
          </span>
          {isSubscribed && (
            <div className="ml-3 flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
              <span className="text-xs text-green-600">실시간</span>
            </div>
          )}
        </div>

        {isLoading && events.length > 0 && (
          <div className="flex items-center text-sm text-gray-500">
            <svg className="animate-spin h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            업데이트 중...
          </div>
        )}
      </div>

      {/* Events grid */}
      <div className="grid gap-4 md:gap-6">
        {filteredEvents.map((event) => (
          <EventCard
            key={event.eventId}
            event={event}
            showRSVP={showRSVP}
            className="hover:scale-[1.01] transition-transform duration-200"
          />
        ))}
      </div>

      {/* Load more button (for future implementation) */}
      {filteredEvents.length >= 10 && (
        <div className="text-center mt-8">
          <button
            onClick={() => {
              // Implement load more functionality if needed
              console.log('Load more events');
            }}
            className="px-6 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            더 많은 이벤트 보기
          </button>
        </div>
      )}
    </div>
  );
}