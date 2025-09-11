// Safe date utility functions with comprehensive error handling
import { Timestamp } from 'firebase/firestore';

/**
 * 다양한 날짜 타입을 안전하게 Date 객체로 변환
 * @param value - Date, Timestamp, string, number 등 다양한 날짜 타입
 * @returns 유효한 Date 객체 또는 null
 */
export function safeToDate(value: any): Date | null {
  // null 또는 undefined 체크
  if (value == null) {
    return null;
  }

  // 이미 Date 객체인 경우
  if (value instanceof Date) {
    return isValidDate(value) ? value : null;
  }

  // Firebase Timestamp 객체인 경우
  if (value && typeof value.toDate === 'function') {
    try {
      const date = value.toDate();
      return isValidDate(date) ? date : null;
    } catch (error) {
      console.warn('Failed to convert Timestamp to Date:', error);
      return null;
    }
  }

  // Firestore의 seconds/nanoseconds 객체인 경우
  if (value && typeof value === 'object' && 'seconds' in value) {
    try {
      const timestamp = new Timestamp(value.seconds, value.nanoseconds || 0);
      const date = timestamp.toDate();
      return isValidDate(date) ? date : null;
    } catch (error) {
      console.warn('Failed to convert seconds/nanoseconds to Date:', error);
      return null;
    }
  }

  // 문자열 또는 숫자인 경우
  if (typeof value === 'string' || typeof value === 'number') {
    try {
      const date = new Date(value);
      return isValidDate(date) ? date : null;
    } catch (error) {
      console.warn('Failed to parse date from string/number:', error);
      return null;
    }
  }

  console.warn('Unsupported date type:', typeof value, value);
  return null;
}

/**
 * Date 객체가 유효한 날짜인지 확인
 * @param date - 확인할 Date 객체
 * @returns 유효성 여부
 */
export function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * 안전한 날짜 포맷팅 함수
 * @param value - 포맷팅할 날짜 값
 * @param options - Intl.DateTimeFormat 옵션
 * @param locale - 로케일 (기본: 'ko-KR')
 * @param fallback - 날짜가 유효하지 않을 때 표시할 텍스트
 * @returns 포맷팅된 날짜 문자열 또는 fallback
 */
export function formatDateSafe(
  value: any,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  },
  locale: string = 'ko-KR',
  fallback: string = '날짜 없음'
): string {
  const date = safeToDate(value);
  
  if (!date) {
    return fallback;
  }

  try {
    return new Intl.DateTimeFormat(locale, options).format(date);
  } catch (error) {
    console.warn('Failed to format date:', error);
    return fallback;
  }
}

/**
 * 상대적 시간 표시 (예: "3일 전", "방금 전")
 * @param value - 비교할 날짜 값
 * @param fallback - 날짜가 유효하지 않을 때 표시할 텍스트
 * @returns 상대적 시간 문자열
 */
export function formatRelativeTime(
  value: any,
  fallback: string = '알 수 없음'
): string {
  const date = safeToDate(value);
  
  if (!date) {
    return fallback;
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return '방금 전';
  } else if (diffMinutes < 60) {
    return `${diffMinutes}분 전`;
  } else if (diffHours < 24) {
    return `${diffHours}시간 전`;
  } else if (diffDays < 30) {
    return `${diffDays}일 전`;
  } else {
    return formatDateSafe(date, { month: 'short', day: 'numeric' }, 'ko-KR', fallback);
  }
}

/**
 * 날짜 범위 유효성 검사
 * @param startDate - 시작 날짜
 * @param endDate - 종료 날짜
 * @returns 유효성 검사 결과
 */
export function validateDateRange(startDate: any, endDate: any): {
  isValid: boolean;
  error?: string;
} {
  const start = safeToDate(startDate);
  const end = safeToDate(endDate);

  if (!start) {
    return { isValid: false, error: '시작 날짜가 유효하지 않습니다' };
  }

  if (!end) {
    return { isValid: false, error: '종료 날짜가 유효하지 않습니다' };
  }

  if (start > end) {
    return { isValid: false, error: '시작 날짜는 종료 날짜보다 이전이어야 합니다' };
  }

  return { isValid: true };
}