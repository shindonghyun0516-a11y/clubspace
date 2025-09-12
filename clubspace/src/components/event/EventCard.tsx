'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Event, RSVP_STATUS_LABELS, EVENT_STATUS_LABELS } from '@/types/event';
import { useEventStore } from '@/store/eventStore';
import { useAuth } from '@/hooks/useAuth';
import { formatDateSafe } from '@/lib/utils/dateUtils';
import RSVPButton from './RSVPButton';
import RSVPStatus from './RSVPStatus';

interface EventCardProps {
  event: Event;
  showRSVP?: boolean;
  showClubName?: boolean;
  className?: string;
}

export default function EventCard({ 
  event, 
  showRSVP = true, 
  showClubName = false,
  className = ''
}: EventCardProps) {
  const { user } = useAuth();
  const { userRSVPs, rsvpSummaries, fetchUserRSVP } = useEventStore();
  
  const [isExpanded, setIsExpanded] = useState(false);
  
  const userRSVP = userRSVPs.get(event.eventId);
  const rsvpSummary = rsvpSummaries.get(event.eventId);

  // Fetch user RSVP on mount
  useEffect(() => {
    if (user && showRSVP) {
      fetchUserRSVP(event.eventId, user.uid);
    }
  }, [user, event.eventId, showRSVP, fetchUserRSVP]);

  const getEventStatus = () => {
    if (event.status === 'cancelled') return 'cancelled';
    if (event.status === 'completed') return 'completed';
    
    const now = new Date();
    if (event.dateTime < now) return 'past';
    
    return 'upcoming';
  };

  const eventStatus = getEventStatus();
  
  const getStatusColor = () => {
    switch (eventStatus) {
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'past':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-blue-600 bg-blue-100';
    }
  };

  const getStatusLabel = () => {
    switch (eventStatus) {
      case 'cancelled':
        return EVENT_STATUS_LABELS.cancelled;
      case 'completed':
        return EVENT_STATUS_LABELS.completed;
      case 'past':
        return '종료됨';
      default:
        return EVENT_STATUS_LABELS.active;
    }
  };

  const formatEventDateTime = (dateTime: Date) => {
    try {
      return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }).format(dateTime);
    } catch (error) {
      console.error('Error formatting date:', error);
      return formatDateSafe(dateTime);
    }
  };

  const shouldShowDescription = event.description && event.description.trim().length > 0;
  const truncatedDescription = shouldShowDescription && event.description.length > 100 
    ? event.description.slice(0, 100) + '...' 
    : event.description;

  return (
    <div className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 ${className}`}>
      {/* Event Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                <Link 
                  href={`/clubs/${event.clubId}/events/${event.eventId}`}
                  className="hover:text-blue-600 transition-colors"
                >
                  {event.title}
                </Link>
              </h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor()}`}>
                {getStatusLabel()}
              </span>
            </div>
            
            {showClubName && (
              <p className="text-sm text-gray-600 mb-2">
                클럽: {/* TODO: Add club name lookup */}
              </p>
            )}
          </div>
        </div>

        {/* Event Details */}
        <div className="space-y-2 mb-4">
          {/* Date and Time */}
          <div className="flex items-center text-sm text-gray-600">
            <svg className="h-4 w-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formatEventDateTime(event.dateTime)}</span>
          </div>

          {/* Location */}
          <div className="flex items-center text-sm text-gray-600">
            <svg className="h-4 w-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{event.location}</span>
          </div>

          {/* Attendee Info */}
          <div className="flex items-center justify-between">
            <RSVPStatus 
              eventId={event.eventId}
              maxAttendees={event.maxAttendees}
              className="text-sm"
            />
            
            {userRSVP && (
              <span className={`text-xs px-2 py-1 rounded-full ${
                userRSVP.status === 'going' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {RSVP_STATUS_LABELS[userRSVP.status]}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        {shouldShowDescription && (
          <div className="mb-4">
            <p className="text-sm text-gray-700 leading-relaxed">
              {isExpanded ? event.description : truncatedDescription}
            </p>
            {event.description.length > 100 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs text-blue-600 hover:text-blue-800 mt-1 font-medium"
              >
                {isExpanded ? '접기' : '더 보기'}
              </button>
            )}
          </div>
        )}

        {/* RSVP Section */}
        {showRSVP && user && eventStatus === 'upcoming' && (
          <div className="pt-4 border-t border-gray-200">
            <RSVPButton 
              eventId={event.eventId}
              currentStatus={userRSVP?.status}
              disabled={event.maxAttendees !== undefined && 
                       rsvpSummary?.going >= event.maxAttendees && 
                       userRSVP?.status !== 'going'}
              className="w-full"
            />
          </div>
        )}
      </div>
    </div>
  );
}