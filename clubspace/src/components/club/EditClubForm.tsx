'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useClubStore } from '@/store/clubStore';
import { Club, UpdateClubData, CLUB_VALIDATION } from '@/types/club';
import { validateUpdateClubData } from '@/lib/club/validation';
import { useToastHelpers } from '@/components/ui';
import DeleteClubModal from './DeleteClubModal';

interface EditClubFormProps {
  club: Club;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function EditClubForm({ club, onSuccess, onCancel }: EditClubFormProps) {
  const { user } = useAuth();
  const { updateClub, isLoading, error, clearError } = useClubStore();
  const router = useRouter();
  const { success, error: showError } = useToastHelpers();

  const [formData, setFormData] = useState<UpdateClubData>({
    clubName: club.clubName,
    description: club.description || '',
    isPublic: club.isPublic,
    maxMembers: club.maxMembers,
    tags: club.tags || [],
    settings: club.settings || {},
  });
  
  const [originalData, setOriginalData] = useState<UpdateClubData>({
    clubName: club.clubName,
    description: club.description || '',
    isPublic: club.isPublic,
    maxMembers: club.maxMembers,
    tags: club.tags || [],
    settings: club.settings || {},
  });

  const [currentTag, setCurrentTag] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Check for changes whenever formData updates
  useEffect(() => {
    const dataChanged = JSON.stringify(formData) !== JSON.stringify(originalData);
    setHasChanges(dataChanged);
  }, [formData, originalData]);

  // Update form data when club prop changes
  useEffect(() => {
    const newData = {
      clubName: club.clubName,
      description: club.description || '',
      isPublic: club.isPublic,
      maxMembers: club.maxMembers,
      tags: club.tags || [],
      settings: club.settings || {},
    };
    setFormData(newData);
    setOriginalData(newData);
  }, [club]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    const finalValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));

    // Clear validation errors when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors([]);
      clearError();
    }

    // Real-time field validation
    validateField(name, finalValue);
  };

  const handleMaxMembersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const maxMembers = value ? parseInt(value, 10) : undefined;
    
    setFormData(prev => ({
      ...prev,
      maxMembers
    }));

    // Clear validation errors when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors([]);
      clearError();
    }

    // Real-time field validation
    validateField('maxMembers', maxMembers);
  };

  const handleTagAdd = () => {
    const tags = formData.tags || [];
    if (currentTag.trim() && tags.length < CLUB_VALIDATION.MAX_TAGS) {
      const newTag = currentTag.trim().toLowerCase();
      if (!tags.includes(newTag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...(prev.tags || []), newTag]
        }));
      }
      setCurrentTag('');
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTagAdd();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setValidationErrors(['로그인이 필요합니다.']);
      return;
    }

    if (!hasChanges) {
      setValidationErrors(['변경사항이 없습니다.']);
      return;
    }

    clearError();
    setValidationErrors([]);

    // Validate form data
    const validation = validateUpdateClubData(formData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    try {
      console.log('📝 [EditClubForm] handleSubmit called - Version 2.0');
      console.log('📝 [EditClubForm] Form data:', formData);
      console.log('📝 [EditClubForm] Club info:', { clubId: club.clubId, memberCount: club.memberCount });
      
      // Validate maxMembers constraint
      if (formData.maxMembers && formData.maxMembers < (club.memberCount || 0)) {
        setValidationErrors([`최대 멤버 수는 현재 멤버 수(${club.memberCount}명)보다 적을 수 없습니다.`]);
        return;
      }
      
      // Prepare clean update data
      const updateData: UpdateClubData = {
        clubName: formData.clubName?.trim() || club.clubName,
        description: formData.description?.trim() || '',
        isPublic: formData.isPublic,
        tags: formData.tags || [],
        settings: formData.settings as any,
      };
      
      // Only include maxMembers if it's a valid number
      if (formData.maxMembers && formData.maxMembers > 0) {
        updateData.maxMembers = formData.maxMembers;
      }
      
      console.log('Clean update data:', updateData);
      
      await updateClub(club.clubId, updateData);
      
      // Update original data to reflect changes
      setOriginalData({ ...formData });
      setHasChanges(false);
      
      // Show success toast
      success('클럽 정보가 성공적으로 저장되었습니다', `${formData.clubName} 클럽 정보가 업데이트되었습니다.`);
      
      if (onSuccess) {
        onSuccess();
      } else {
        // Delay navigation slightly to show the toast
        setTimeout(() => {
          router.push(`/clubs/${club.clubId}`);
        }, 1000);
      }
    } catch (error) {
      console.error('Club update error:', error);
      
      // Show error toast and validation errors
      const errorMessage = error instanceof Error ? error.message : '클럽 정보를 업데이트하는 중 오류가 발생했습니다.';
      showError('클럽 정보 저장 실패', errorMessage);
      
      if (error instanceof Error) {
        setValidationErrors([error.message]);
      } else {
        setValidationErrors(['클럽 정보를 업데이트하는 중 오류가 발생했습니다.']);
      }
    }
  };

  // Real-time field validation
  const validateField = (fieldName: string, value: any) => {
    const errors = { ...fieldErrors };
    
    switch (fieldName) {
      case 'clubName':
        if (!value || value.trim().length === 0) {
          errors.clubName = '클럽 이름은 필수입니다.';
        } else if (value.trim().length < CLUB_VALIDATION.NAME_MIN_LENGTH) {
          errors.clubName = `클럽 이름은 최소 ${CLUB_VALIDATION.NAME_MIN_LENGTH}자 이상이어야 합니다.`;
        } else if (value.trim().length > CLUB_VALIDATION.NAME_MAX_LENGTH) {
          errors.clubName = `클럽 이름은 최대 ${CLUB_VALIDATION.NAME_MAX_LENGTH}자까지 가능합니다.`;
        } else {
          delete errors.clubName;
        }
        break;
        
      case 'description':
        if (value && value.length > CLUB_VALIDATION.DESCRIPTION_MAX_LENGTH) {
          errors.description = `설명은 최대 ${CLUB_VALIDATION.DESCRIPTION_MAX_LENGTH}자까지 가능합니다.`;
        } else {
          delete errors.description;
        }
        break;
        
      case 'maxMembers':
        if (value !== undefined && value !== null && value !== '') {
          const numValue = Number(value);
          if (isNaN(numValue) || numValue < 1) {
            errors.maxMembers = '최대 멤버 수는 1 이상이어야 합니다.';
          } else if (numValue > CLUB_VALIDATION.MAX_MEMBERS_LIMIT) {
            errors.maxMembers = `최대 멤버 수는 ${CLUB_VALIDATION.MAX_MEMBERS_LIMIT}명까지 가능합니다.`;
          } else if (numValue < (club.memberCount || 0)) {
            errors.maxMembers = `최대 멤버 수는 현재 멤버 수(${club.memberCount}명)보다 적을 수 없습니다.`;
          } else {
            delete errors.maxMembers;
          }
        } else {
          delete errors.maxMembers;
        }
        break;
        
      default:
        break;
    }
    
    setFieldErrors(errors);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.push(`/clubs/${club.clubId}`);
    }
  };

  const handleReset = () => {
    setFormData({ ...originalData });
    setValidationErrors([]);
    clearError();
  };

  // Warn about unsaved changes
  const handlePageLeave = (e: BeforeUnloadEvent) => {
    if (hasChanges) {
      e.preventDefault();
      e.returnValue = '변경사항이 저장되지 않았습니다. 페이지를 떠나시겠습니까?';
    }
  };

  useEffect(() => {
    if (hasChanges) {
      window.addEventListener('beforeunload', handlePageLeave);
      return () => window.removeEventListener('beforeunload', handlePageLeave);
    }
  }, [hasChanges]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">클럽 편집</h2>
          <p className="mt-2 text-sm text-gray-600">
            {club.clubName} 클럽의 정보를 수정할 수 있습니다
          </p>
          {hasChanges && (
            <div className="mt-2 text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded">
              변경사항이 있습니다. 저장하지 않고 페이지를 떠나면 변경사항이 사라집니다.
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Messages */}
          {(error || validationErrors.length > 0) && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">오류가 발생했습니다</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <ul className="list-disc pl-5 space-y-1">
                      {error && <li>{error}</li>}
                      {validationErrors.map((err, index) => (
                        <li key={index}>{err}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Club Name */}
          <div>
            <label htmlFor="clubName" className="block text-sm font-medium text-gray-700">
              클럽 이름 *
            </label>
            <input
              type="text"
              id="clubName"
              name="clubName"
              required
              maxLength={CLUB_VALIDATION.NAME_MAX_LENGTH}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm ${
                fieldErrors.clubName
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
              placeholder="클럽 이름을 입력하세요"
              value={formData.clubName || ''}
              onChange={handleInputChange}
              aria-invalid={fieldErrors.clubName ? 'true' : 'false'}
              aria-describedby="clubName-error clubName-help"
            />
            {fieldErrors.clubName && (
              <p id="clubName-error" className="mt-1 text-sm text-red-600">
                {fieldErrors.clubName}
              </p>
            )}
            <p id="clubName-help" className="mt-1 text-xs text-gray-500">
              {(formData.clubName || '').length}/{CLUB_VALIDATION.NAME_MAX_LENGTH}자
            </p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              클럽 소개
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              maxLength={CLUB_VALIDATION.DESCRIPTION_MAX_LENGTH}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm resize-none overflow-y-auto ${
                fieldErrors.description
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
              style={{ minHeight: '100px', maxHeight: '150px' }}
              placeholder="클럽에 대해 간단히 소개해주세요"
              value={formData.description || ''}
              onChange={handleInputChange}
              aria-invalid={fieldErrors.description ? 'true' : 'false'}
              aria-describedby="description-error description-help"
            />
            {fieldErrors.description && (
              <p id="description-error" className="mt-1 text-sm text-red-600">
                {fieldErrors.description}
              </p>
            )}
            <p id="description-help" className="mt-1 text-xs text-gray-500">
              {(formData.description || '').length}/{CLUB_VALIDATION.DESCRIPTION_MAX_LENGTH}자
            </p>
          </div>

          {/* Public/Private */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">공개 클럽</span>
            </label>
            <p className="mt-1 text-xs text-gray-500">
              공개 클럽은 누구나 찾아볼 수 있고 가입 요청을 할 수 있습니다.
            </p>
          </div>

          {/* Advanced Settings */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center text-sm text-blue-600 hover:text-blue-500"
            >
              <span>고급 설정</span>
              <svg 
                className={`ml-1 h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showAdvanced && (
              <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg">
                {/* Max Members */}
                <div>
                  <label htmlFor="maxMembers" className="block text-sm font-medium text-gray-700">
                    최대 멤버 수
                  </label>
                  <input
                    type="number"
                    id="maxMembers"
                    min="1"
                    max={CLUB_VALIDATION.MAX_MEMBERS_LIMIT}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm ${
                      fieldErrors.maxMembers
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    placeholder="제한 없음"
                    value={formData.maxMembers || ''}
                    onChange={handleMaxMembersChange}
                    aria-invalid={fieldErrors.maxMembers ? 'true' : 'false'}
                    aria-describedby="maxMembers-error maxMembers-help"
                  />
                  {fieldErrors.maxMembers && (
                    <p id="maxMembers-error" className="mt-1 text-sm text-red-600">
                      {fieldErrors.maxMembers}
                    </p>
                  )}
                  <p id="maxMembers-help" className="mt-1 text-xs text-gray-500">
                    현재 멤버: {club.memberCount || 0}명
                  </p>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">태그</label>
                  <div className="mt-1 flex space-x-2">
                    <input
                      type="text"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyPress={handleTagKeyPress}
                      placeholder="태그 입력"
                      maxLength={20}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleTagAdd}
                      disabled={!currentTag.trim() || (formData.tags || []).length >= CLUB_VALIDATION.MAX_TAGS}
                      className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      추가
                    </button>
                  </div>
                  {(formData.tags || []).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(formData.tags || []).map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleTagRemove(tag)}
                            className="ml-1 inline-flex items-center justify-center w-4 h-4 text-blue-400 hover:text-blue-600"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    {(formData.tags || []).length}/{CLUB_VALIDATION.MAX_TAGS}개
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Danger Zone */}
          <div className="mt-8 pt-6 border-t border-red-200">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <svg className="h-6 w-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <h3 className="text-lg font-medium text-red-900">위험 구역</h3>
              </div>
              
              <p className="text-sm text-red-700 mb-4">
                클럽을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
              </p>
              
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                클럽 삭제
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <div className="space-x-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                취소
              </button>
              {hasChanges && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  되돌리기
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoading || !hasChanges}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  저장 중...
                </>
              ) : (
                '변경사항 저장'
              )}
            </button>
          </div>
        </form>

        {/* Delete Club Modal */}
        <DeleteClubModal
          club={club}
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onSuccess={() => {
            setIsDeleteModalOpen(false);
            // Show success toast
            success('클럽이 성공적으로 삭제되었습니다', `${club.clubName} 클럽이 영구적으로 삭제되었습니다.`);
            // Navigate to clubs list after successful deletion
            setTimeout(() => {
              router.push('/clubs');
            }, 1000);
          }}
        />
      </div>
    </div>
  );
}