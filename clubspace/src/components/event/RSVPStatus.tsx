'use client';

import { useEffect } from 'react';
import { useEventStore } from '@/store/eventStore';

interface RSVPStatusProps {
  eventId: string;
  maxAttendees?: number;
  className?: string;
  variant?: 'default' | 'detailed' | 'compact';
}

export default function RSVPStatus({ 
  eventId, 
  maxAttendees, 
  className = '',
  variant = 'default'
}: RSVPStatusProps) {
  const { rsvpSummaries, fetchRSVPSummary } = useEventStore();
  const rsvpSummary = rsvpSummaries.get(eventId);

  useEffect(() => {
    fetchRSVPSummary(eventId);
  }, [eventId, fetchRSVPSummary]);

  if (!rsvpSummary) {
    return (
      <div className={`flex items-center ${className}`}>
        <div className="animate-pulse flex items-center">
          <div className="h-4 w-4 bg-gray-200 rounded mr-2"></div>
          <div className="h-4 w-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const { going, not_going, total } = rsvpSummary;
  const hasLimit = maxAttendees !== undefined;
  const isFull = hasLimit && going >= maxAttendees;
  const availableSpots = hasLimit ? maxAttendees - going : null;

  const getStatusColor = () => {
    if (isFull) return 'text-red-600';
    if (hasLimit && going > (maxAttendees * 0.8)) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getIcon = () => {
    if (variant === 'compact') {
      return (
        <svg className="h-4 w-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      );
    }
    
    return (
      <svg className="h-5 w-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    );
  };

  if (variant === 'compact') {
    return (
      <div className={`flex items-center ${getStatusColor()} ${className}`}>
        {getIcon()}
        <span className="font-medium">
          {hasLimit ? `${going}/${maxAttendees}` : `${going}명`}
        </span>
        {isFull && (
          <span className="ml-1 text-xs">(마감)</span>
        )}
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-700">
            {getIcon()}
            <span className="font-medium">참석 현황</span>
          </div>
          {isFull && (
            <span className="text-xs text-red-600 font-medium bg-red-50 px-2 py-1 rounded">
              마감
            </span>
          )}
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="font-semibold text-green-600">{going}</div>
            <div className="text-gray-500">참석</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-600">{not_going}</div>
            <div className="text-gray-500">불참석</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-blue-600">{total}</div>
            <div className="text-gray-500">총 응답</div>
          </div>
        </div>

        {hasLimit && (
          <div className="pt-2 border-t border-gray-200">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">최대 참석자</span>
              <span className="font-medium">{maxAttendees}명</span>
            </div>
            {availableSpots !== null && (
              <div className="flex justify-between items-center text-sm mt-1">
                <span className="text-gray-600">남은 자리</span>
                <span className={`font-medium ${availableSpots === 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {availableSpots}명
                </span>
              </div>
            )}
          </div>
        )}

        {/* Progress bar for capacity */}
        {hasLimit && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>참석률</span>
              <span>{Math.round((going / maxAttendees) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  isFull 
                    ? 'bg-red-500' 
                    : going > (maxAttendees * 0.8) 
                    ? 'bg-yellow-500' 
                    : 'bg-green-500'
                }`}
                style={{ width: `${Math.min((going / maxAttendees) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className={`flex items-center ${getStatusColor()} ${className}`}>
      {getIcon()}
      <div className="flex items-center space-x-2">
        <span className="font-medium">
          {going}명 참석
        </span>
        {hasLimit && (
          <>
            <span className="text-gray-400">•</span>
            <span className="text-sm">
              최대 {maxAttendees}명
            </span>
          </>
        )}
        {isFull && (
          <>
            <span className="text-gray-400">•</span>
            <span className="text-xs text-red-600 font-medium">마감</span>
          </>
        )}
      </div>
    </div>
  );
}