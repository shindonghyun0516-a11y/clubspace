'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreateEventData, EVENT_VALIDATION } from '@/types/event';
import { useEventStore } from '@/store/eventStore';
import { useAuth } from '@/hooks/useAuth';
import { validateEventData } from '@/lib/event/validation';
import { useToast } from '@/components/ui/ToastProvider';

interface CreateEventFormProps {
  clubId: string;
  onSuccess?: (eventId: string) => void;
  onCancel?: () => void;
}

interface FormErrors {
  title?: string;
  description?: string;
  dateTime?: string;
  location?: string;
  maxAttendees?: string;
}

export default function CreateEventForm({ clubId, onSuccess, onCancel }: CreateEventFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { createEvent, isCreating, error } = useEventStore();
  const { showToast } = useToast();

  const [formData, setFormData] = useState<CreateEventData>({
    clubId,
    title: '',
    description: '',
    dateTime: new Date(),
    location: '',
    maxAttendees: EVENT_VALIDATION.MAX_ATTENDEES_DEFAULT,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = (name: keyof CreateEventData, value: any) => {
    const tempData = { ...formData, [name]: value };
    const validation = validateEventData(tempData);
    
    const newErrors = { ...errors };
    
    switch (name) {
      case 'title':
        if (!value || value.trim().length === 0) {
          newErrors.title = '이벤트 제목은 필수입니다.';
        } else if (value.trim().length < EVENT_VALIDATION.TITLE_MIN_LENGTH) {
          newErrors.title = `이벤트 제목은 최소 ${EVENT_VALIDATION.TITLE_MIN_LENGTH}자 이상이어야 합니다.`;
        } else if (value.trim().length > EVENT_VALIDATION.TITLE_MAX_LENGTH) {
          newErrors.title = `이벤트 제목은 최대 ${EVENT_VALIDATION.TITLE_MAX_LENGTH}자까지 가능합니다.`;
        } else {
          delete newErrors.title;
        }
        break;
      
      case 'description':
        if (value && value.length > EVENT_VALIDATION.DESCRIPTION_MAX_LENGTH) {
          newErrors.description = `이벤트 설명은 최대 ${EVENT_VALIDATION.DESCRIPTION_MAX_LENGTH}자까지 가능합니다.`;
        } else {
          delete newErrors.description;
        }
        break;
      
      case 'location':
        if (!value || value.trim().length === 0) {
          newErrors.location = '이벤트 장소는 필수입니다.';
        } else if (value.trim().length > EVENT_VALIDATION.LOCATION_MAX_LENGTH) {
          newErrors.location = `이벤트 장소는 최대 ${EVENT_VALIDATION.LOCATION_MAX_LENGTH}자까지 가능합니다.`;
        } else {
          delete newErrors.location;
        }
        break;
      
      case 'dateTime':
        const now = new Date();
        if (value <= now) {
          newErrors.dateTime = '이벤트 날짜는 현재 시간 이후여야 합니다.';
        } else {
          delete newErrors.dateTime;
        }
        break;
      
      case 'maxAttendees':
        if (value !== undefined && value !== null && value !== '') {
          const numValue = Number(value);
          if (isNaN(numValue) || numValue < 1) {
            newErrors.maxAttendees = '최대 참석자 수는 1 이상이어야 합니다.';
          } else if (numValue > EVENT_VALIDATION.MAX_ATTENDEES_LIMIT) {
            newErrors.maxAttendees = `최대 참석자 수는 ${EVENT_VALIDATION.MAX_ATTENDEES_LIMIT}명을 초과할 수 없습니다.`;
          } else {
            delete newErrors.maxAttendees;
          }
        }
        break;
    }
    
    setErrors(newErrors);
  };

  const handleInputChange = (name: keyof CreateEventData, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateTimeString = e.target.value;
    const dateTime = new Date(dateTimeString);
    handleInputChange('dateTime', dateTime);
  };

  const getDateTimeInputValue = () => {
    // Convert Date to datetime-local input format
    const date = formData.dateTime;
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      showToast('error', '로그인이 필요합니다.');
      return;
    }

    // Final validation
    const validation = validateEventData(formData);
    if (!validation.isValid) {
      showToast('error', `입력 오류: ${validation.errors[0]}`);
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('🎉 [CreateEventForm] Creating event with data:', formData);

      const newEvent = await createEvent(formData, user.uid);
      
      showToast('success', `이벤트 "${newEvent.title}"가 성공적으로 생성되었습니다!`);
      
      if (onSuccess) {
        onSuccess(newEvent.eventId);
      } else {
        router.push(`/clubs/${clubId}/events/${newEvent.eventId}`);
      }

    } catch (error) {
      console.error('❌ [CreateEventForm] Error creating event:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create event';
      showToast('error', `이벤트 생성 실패: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = !isSubmitting && !isCreating && Object.keys(errors).length === 0 && formData.title.trim().length > 0;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">새 이벤트 만들기</h2>
        <p className="text-gray-600">클럽 멤버들과 함께할 이벤트를 생성하세요.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            이벤트 제목 <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            maxLength={EVENT_VALIDATION.TITLE_MAX_LENGTH}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              errors.title 
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }`}
            placeholder="이벤트 제목을 입력하세요"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            {formData.title.length}/{EVENT_VALIDATION.TITLE_MAX_LENGTH}자
          </p>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            이벤트 설명
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            maxLength={EVENT_VALIDATION.DESCRIPTION_MAX_LENGTH}
            rows={4}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              errors.description 
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }`}
            placeholder="이벤트에 대한 자세한 설명을 작성해주세요"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            {formData.description.length}/{EVENT_VALIDATION.DESCRIPTION_MAX_LENGTH}자
          </p>
        </div>

        {/* DateTime */}
        <div>
          <label htmlFor="dateTime" className="block text-sm font-medium text-gray-700 mb-1">
            날짜 및 시간 <span className="text-red-500">*</span>
          </label>
          <input
            id="dateTime"
            type="datetime-local"
            value={getDateTimeInputValue()}
            onChange={handleDateTimeChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              errors.dateTime 
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }`}
          />
          {errors.dateTime && (
            <p className="mt-1 text-sm text-red-600">{errors.dateTime}</p>
          )}
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            장소 <span className="text-red-500">*</span>
          </label>
          <input
            id="location"
            type="text"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            maxLength={EVENT_VALIDATION.LOCATION_MAX_LENGTH}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              errors.location 
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }`}
            placeholder="이벤트가 열릴 장소를 입력하세요"
          />
          {errors.location && (
            <p className="mt-1 text-sm text-red-600">{errors.location}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            {formData.location.length}/{EVENT_VALIDATION.LOCATION_MAX_LENGTH}자
          </p>
        </div>

        {/* Max Attendees */}
        <div>
          <label htmlFor="maxAttendees" className="block text-sm font-medium text-gray-700 mb-1">
            최대 참석자 수 (선택사항)
          </label>
          <input
            id="maxAttendees"
            type="number"
            value={formData.maxAttendees || ''}
            onChange={(e) => handleInputChange('maxAttendees', e.target.value ? Number(e.target.value) : undefined)}
            min={EVENT_VALIDATION.MIN_ATTENDEES}
            max={EVENT_VALIDATION.MAX_ATTENDEES_LIMIT}
            placeholder={`기본값: ${EVENT_VALIDATION.MAX_ATTENDEES_DEFAULT}명`}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              errors.maxAttendees 
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }`}
          />
          {errors.maxAttendees && (
            <p className="mt-1 text-sm text-red-600">{errors.maxAttendees}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            비워두면 기본값 {EVENT_VALIDATION.MAX_ATTENDEES_DEFAULT}명으로 설정됩니다
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              취소
            </button>
          )}
          <button
            type="submit"
            disabled={!canSubmit}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              canSubmit
                ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {isSubmitting || isCreating ? '생성 중...' : '이벤트 생성'}
          </button>
        </div>
      </form>
    </div>
  );
}