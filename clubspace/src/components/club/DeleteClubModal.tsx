'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Club } from '@/types/club';
import { useClubStore } from '@/store/clubStore';

interface DeleteClubModalProps {
  club: Club;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function DeleteClubModal({ club, isOpen, onClose, onSuccess }: DeleteClubModalProps) {
  const router = useRouter();
  const { deleteClub, error, clearError } = useClubStore();

  const [step, setStep] = useState<'warning' | 'confirm' | 'deleting'>('warning');
  const [clubNameInput, setClubNameInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep('warning');
      setClubNameInput('');
      clearError();
    }
  }, [isOpen, clearError]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isDeleting) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, isDeleting, onClose]);

  const handleDelete = async () => {
    if (clubNameInput !== club.clubName) {
      return; // This should be prevented by UI
    }

    try {
      setIsDeleting(true);
      setStep('deleting');
      
      console.log('🗑️ [DeleteClubModal] Deleting club:', club.clubId);
      await deleteClub(club.clubId);
      
      console.log('🎉 [DeleteClubModal] Club deleted successfully');
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/clubs');
      }
    } catch (error) {
      console.error('❌ [DeleteClubModal] Delete failed:', error);
      setStep('confirm'); // Go back to confirm step on error
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  const canConfirm = clubNameInput === club.clubName;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Warning Step */}
        {step === 'warning' && (
          <>
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">클럽 삭제</h3>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        이 작업은 되돌릴 수 없습니다
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>클럽을 삭제하면 다음 데이터가 모두 영구적으로 삭제됩니다:</p>
                      </div>
                    </div>
                  </div>
                </div>

                <ul className="text-sm text-gray-600 space-y-2 ml-4">
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    모든 멤버십 정보 ({club.memberCount || 0}명의 멤버)
                  </li>
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    모든 이벤트 및 RSVP 데이터
                  </li>
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    모든 게시글 및 댓글
                  </li>
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    모든 채팅 메시지
                  </li>
                </ul>

                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm font-medium text-gray-900">삭제할 클럽</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{club.clubName}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    생성일: {new Date((club.createdAt as any).seconds * 1000).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                취소
              </button>
              <button
                onClick={() => setStep('confirm')}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                삭제 진행
              </button>
            </div>
          </>
        )}

        {/* Confirm Step */}
        {step === 'confirm' && (
          <>
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">최종 확인</h3>
                </div>
              </div>
            </div>

            <div className="p-6">
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
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

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-900 mb-2">
                  클럽 삭제를 확인하려면 클럽 이름을 정확히 입력해주세요:
                </p>
                <p className="text-lg font-semibold text-gray-900 bg-gray-100 px-3 py-2 rounded border mb-3">
                  {club.clubName}
                </p>
                <input
                  type="text"
                  value={clubNameInput}
                  onChange={(e) => setClubNameInput(e.target.value)}
                  placeholder="클럽 이름을 입력하세요"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    clubNameInput && !canConfirm
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : canConfirm
                      ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  autoComplete="off"
                  autoFocus
                />
                {clubNameInput && !canConfirm && (
                  <p className="mt-1 text-sm text-red-600">클럽 이름이 일치하지 않습니다.</p>
                )}
                {canConfirm && (
                  <p className="mt-1 text-sm text-green-600">✓ 클럽 이름이 확인되었습니다.</p>
                )}
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setStep('warning')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                뒤로
              </button>
              <button
                onClick={handleDelete}
                disabled={!canConfirm || isDeleting}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  canConfirm && !isDeleting
                    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                {isDeleting ? '삭제 중...' : '클럽 삭제'}
              </button>
            </div>
          </>
        )}

        {/* Deleting Step */}
        {step === 'deleting' && (
          <>
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">클럽 삭제 중...</h3>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  {club.clubName} 클럽을 삭제하고 있습니다.
                </p>
                <p className="text-sm text-gray-500">
                  잠시만 기다려주세요. 이 과정은 몇 초가 걸릴 수 있습니다.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}