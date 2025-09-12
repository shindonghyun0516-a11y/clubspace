// Event management related TypeScript types

export interface Event {
  eventId: string;
  clubId: string;
  title: string;
  description: string;
  dateTime: Date;
  location: string;
  creatorUid: string;
  maxAttendees?: number;
  currentAttendees: number;
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'cancelled' | 'completed';
}

export interface RSVP {
  eventId: string;
  uid: string;
  status: 'going' | 'not_going';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEventData {
  clubId: string;
  title: string;
  description: string;
  dateTime: Date;
  location: string;
  maxAttendees?: number;
}

export interface UpdateEventData {
  title?: string;
  description?: string;
  dateTime?: Date;
  location?: string;
  maxAttendees?: number;
  status?: 'active' | 'cancelled' | 'completed';
}

export interface EventSearchParams {
  clubId?: string;
  status?: 'active' | 'cancelled' | 'completed';
  limit?: number;
  startDate?: Date;
  endDate?: Date;
}

export interface RSVPSummary {
  going: number;
  not_going: number;
  total: number;
}

// Validation constants
export const EVENT_VALIDATION = {
  TITLE_MIN_LENGTH: 3,
  TITLE_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 1000,
  LOCATION_MAX_LENGTH: 200,
  MIN_ATTENDEES: 1,
  MAX_ATTENDEES_LIMIT: 1000,
  MAX_ATTENDEES_DEFAULT: 50,
};

// Event status display mappings
export const EVENT_STATUS_LABELS = {
  active: '진행중',
  cancelled: '취소됨',
  completed: '완료됨',
} as const;

// RSVP status display mappings
export const RSVP_STATUS_LABELS = {
  going: '참석',
  not_going: '불참석',
} as const;