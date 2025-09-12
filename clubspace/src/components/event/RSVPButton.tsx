'use client';

import { useState } from 'react';
import { useEventStore } from '@/store/eventStore';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/ToastProvider';
import { RSVP_STATUS_LABELS } from '@/types/event';

interface RSVPButtonProps {
  eventId: string;
  currentStatus?: 'going' | 'not_going';
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact';
}

export default function RSVPButton({
  eventId,
  currentStatus,
  disabled = false,
  className = '',
  size = 'md',
  variant = 'default'
}: RSVPButtonProps) {
  const { user } = useAuth();
  const { updateUserRSVP, isUpdatingRSVP } = useEventStore();
  const { showToast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);

  const handleRSVPUpdate = async (status: 'going' | 'not_going') => {
    if (!user) {
      showToast('error', '로그인이 필요합니다.');
      return;
    }

    if (currentStatus === status) {
      return; // No change needed
    }

    try {
      setIsLoading(true);
      console.log('📝 [RSVPButton] Updating RSVP:', { eventId, status });

      await updateUserRSVP(eventId, user.uid, status);
      
      showToast(
        'success',
        status === 'going' 
          ? '참석으로 변경되었습니다!' 
          : '불참석으로 변경되었습니다!'
      );

    } catch (error) {
      console.error('❌ [RSVPButton] Error updating RSVP:', error);
      const errorMessage = error instanceof Error ? error.message : 'RSVP 업데이트 실패';
      showToast('error', `RSVP 변경 실패: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'lg':
        return 'px-6 py-3 text-lg';
      default:
        return 'px-4 py-2 text-sm';
    }
  };

  const isProcessing = isLoading || isUpdatingRSVP;
  const canInteract = !disabled && !isProcessing && user;

  if (variant === 'compact') {
    return (
      <div className={`flex gap-2 ${className}`}>
        <button
          onClick={() => handleRSVPUpdate('going')}
          disabled={!canInteract}
          className={`flex-1 ${getSizeClasses()} font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
            currentStatus === 'going'
              ? 'bg-green-600 text-white hover:bg-green-700'
              : canInteract
              ? 'bg-white text-green-600 border border-green-300 hover:bg-green-50'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isProcessing && currentStatus !== 'going' ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              처리중
            </div>
          ) : (
            '참석'
          )}
        </button>
        
        <button
          onClick={() => handleRSVPUpdate('not_going')}
          disabled={!canInteract}
          className={`flex-1 ${getSizeClasses()} font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 ${
            currentStatus === 'not_going'
              ? 'bg-gray-600 text-white hover:bg-gray-700'
              : canInteract
              ? 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isProcessing && currentStatus !== 'not_going' ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              처리중
            </div>
          ) : (
            '불참석'
          )}
        </button>
      </div>
    );
  }

  // Default variant - single toggle button
  const getButtonText = () => {
    if (isProcessing) {
      return '처리 중...';
    }
    
    if (!currentStatus) {
      return 'RSVP 응답하기';
    }
    
    return `현재: ${RSVP_STATUS_LABELS[currentStatus]}`;
  };

  const getButtonStyle = () => {
    if (!canInteract) {
      return 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200';
    }
    
    if (currentStatus === 'going') {
      return 'bg-green-600 text-white hover:bg-green-700 border border-transparent focus:ring-green-500';
    }
    
    if (currentStatus === 'not_going') {
      return 'bg-gray-600 text-white hover:bg-gray-700 border border-transparent focus:ring-gray-500';
    }
    
    return 'bg-blue-600 text-white hover:bg-blue-700 border border-transparent focus:ring-blue-500';
  };

  const handleClick = () => {
    if (!currentStatus) {
      // Show options for first-time RSVP
      handleRSVPUpdate('going');
    } else {
      // Toggle current status
      const newStatus = currentStatus === 'going' ? 'not_going' : 'going';
      handleRSVPUpdate(newStatus);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={!canInteract}
      className={`${getSizeClasses()} ${getButtonStyle()} font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${className}`}
    >
      {isProcessing ? (
        <div className="flex items-center justify-center">
          <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          {getButtonText()}
        </div>
      ) : (
        getButtonText()
      )}
    </button>
  );
}