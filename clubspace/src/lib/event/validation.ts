// Event validation utilities
import { CreateEventData, UpdateEventData, EVENT_VALIDATION } from '@/types/event';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateEventData = (data: CreateEventData): ValidationResult => {
  const errors: string[] = [];

  // Title validation
  if (!data.title || data.title.trim().length === 0) {
    errors.push('이벤트 제목은 필수입니다.');
  } else {
    const trimmedTitle = data.title.trim();
    if (trimmedTitle.length < EVENT_VALIDATION.TITLE_MIN_LENGTH) {
      errors.push(`이벤트 제목은 최소 ${EVENT_VALIDATION.TITLE_MIN_LENGTH}자 이상이어야 합니다.`);
    }
    if (trimmedTitle.length > EVENT_VALIDATION.TITLE_MAX_LENGTH) {
      errors.push(`이벤트 제목은 최대 ${EVENT_VALIDATION.TITLE_MAX_LENGTH}자까지 가능합니다.`);
    }
  }

  // Description validation
  if (data.description) {
    const trimmedDescription = data.description.trim();
    if (trimmedDescription.length > EVENT_VALIDATION.DESCRIPTION_MAX_LENGTH) {
      errors.push(`이벤트 설명은 최대 ${EVENT_VALIDATION.DESCRIPTION_MAX_LENGTH}자까지 가능합니다.`);
    }
  }

  // Location validation
  if (!data.location || data.location.trim().length === 0) {
    errors.push('이벤트 장소는 필수입니다.');
  } else {
    const trimmedLocation = data.location.trim();
    if (trimmedLocation.length > EVENT_VALIDATION.LOCATION_MAX_LENGTH) {
      errors.push(`이벤트 장소는 최대 ${EVENT_VALIDATION.LOCATION_MAX_LENGTH}자까지 가능합니다.`);
    }
  }

  // DateTime validation
  if (!data.dateTime) {
    errors.push('이벤트 날짜와 시간은 필수입니다.');
  } else {
    const now = new Date();
    if (data.dateTime <= now) {
      errors.push('이벤트 날짜는 현재 시간 이후여야 합니다.');
    }
    
    // Check if the date is not too far in the future (optional)
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    if (data.dateTime > oneYearFromNow) {
      errors.push('이벤트 날짜는 1년 이내로 설정해주세요.');
    }
  }

  // MaxAttendees validation
  if (data.maxAttendees !== undefined) {
    if (data.maxAttendees < EVENT_VALIDATION.MIN_ATTENDEES) {
      errors.push(`최대 참석자 수는 최소 ${EVENT_VALIDATION.MIN_ATTENDEES}명 이상이어야 합니다.`);
    }
    if (data.maxAttendees > EVENT_VALIDATION.MAX_ATTENDEES_LIMIT) {
      errors.push(`최대 참석자 수는 ${EVENT_VALIDATION.MAX_ATTENDEES_LIMIT}명을 초과할 수 없습니다.`);
    }
  }

  // ClubId validation
  if (!data.clubId || data.clubId.trim().length === 0) {
    errors.push('클럽 ID는 필수입니다.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateUpdateEventData = (data: UpdateEventData): ValidationResult => {
  const errors: string[] = [];

  // Title validation (if provided)
  if (data.title !== undefined) {
    if (!data.title || data.title.trim().length === 0) {
      errors.push('이벤트 제목은 필수입니다.');
    } else {
      const trimmedTitle = data.title.trim();
      if (trimmedTitle.length < EVENT_VALIDATION.TITLE_MIN_LENGTH) {
        errors.push(`이벤트 제목은 최소 ${EVENT_VALIDATION.TITLE_MIN_LENGTH}자 이상이어야 합니다.`);
      }
      if (trimmedTitle.length > EVENT_VALIDATION.TITLE_MAX_LENGTH) {
        errors.push(`이벤트 제목은 최대 ${EVENT_VALIDATION.TITLE_MAX_LENGTH}자까지 가능합니다.`);
      }
    }
  }

  // Description validation (if provided)
  if (data.description !== undefined && data.description) {
    const trimmedDescription = data.description.trim();
    if (trimmedDescription.length > EVENT_VALIDATION.DESCRIPTION_MAX_LENGTH) {
      errors.push(`이벤트 설명은 최대 ${EVENT_VALIDATION.DESCRIPTION_MAX_LENGTH}자까지 가능합니다.`);
    }
  }

  // Location validation (if provided)
  if (data.location !== undefined) {
    if (!data.location || data.location.trim().length === 0) {
      errors.push('이벤트 장소는 필수입니다.');
    } else {
      const trimmedLocation = data.location.trim();
      if (trimmedLocation.length > EVENT_VALIDATION.LOCATION_MAX_LENGTH) {
        errors.push(`이벤트 장소는 최대 ${EVENT_VALIDATION.LOCATION_MAX_LENGTH}자까지 가능합니다.`);
      }
    }
  }

  // DateTime validation (if provided)
  if (data.dateTime !== undefined) {
    const now = new Date();
    if (data.dateTime <= now) {
      errors.push('이벤트 날짜는 현재 시간 이후여야 합니다.');
    }
  }

  // MaxAttendees validation (if provided)
  if (data.maxAttendees !== undefined) {
    if (data.maxAttendees < EVENT_VALIDATION.MIN_ATTENDEES) {
      errors.push(`최대 참석자 수는 최소 ${EVENT_VALIDATION.MIN_ATTENDEES}명 이상이어야 합니다.`);
    }
    if (data.maxAttendees > EVENT_VALIDATION.MAX_ATTENDEES_LIMIT) {
      errors.push(`최대 참석자 수는 ${EVENT_VALIDATION.MAX_ATTENDEES_LIMIT}명을 초과할 수 없습니다.`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateRSVPData = (eventId: string, uid: string, status: 'going' | 'not_going'): ValidationResult => {
  const errors: string[] = [];

  if (!eventId || eventId.trim().length === 0) {
    errors.push('이벤트 ID는 필수입니다.');
  }

  if (!uid || uid.trim().length === 0) {
    errors.push('사용자 ID는 필수입니다.');
  }

  if (!['going', 'not_going'].includes(status)) {
    errors.push('올바르지 않은 RSVP 상태입니다.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};