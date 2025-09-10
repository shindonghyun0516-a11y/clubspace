'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useClubStore } from '@/store/clubStore';
import { CreateClubData, CLUB_VALIDATION } from '@/types/club';
import { validateCreateClubData } from '@/lib/club/validation';

interface CreateClubFormProps {
  onSuccess?: (clubId: string) => void;
  onCancel?: () => void;
}

export default function CreateClubForm({ onSuccess, onCancel }: CreateClubFormProps) {
  const { user } = useAuth();
  const { createClub, isLoading, error, clearError } = useClubStore();
  const router = useRouter();

  const [formData, setFormData] = useState<CreateClubData>({
    clubName: '',
    description: '',
    isPublic: true,
    maxMembers: undefined,
    tags: [],
    settings: {},
  });
  
  const [currentTag, setCurrentTag] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear validation errors when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors([]);
      clearError();
    }
  };

  const handleMaxMembersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      maxMembers: value ? parseInt(value, 10) : undefined
    }));
  };

  const handleTagAdd = () => {
    if (currentTag.trim() && formData.tags.length < CLUB_VALIDATION.MAX_TAGS) {
      const newTag = currentTag.trim().toLowerCase();
      if (!formData.tags.includes(newTag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag]
        }));
      }
      setCurrentTag('');
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
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

    clearError();
    setValidationErrors([]);

    // Validate form data
    const validation = validateCreateClubData(formData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    try {
      const newClub = await createClub(user.uid, formData);
      
      if (onSuccess) {
        onSuccess(newClub.clubId);
      } else {
        router.push(`/clubs/${newClub.clubId}`);
      }
    } catch (error) {
      console.error('Club creation error:', error);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">새 클럽 만들기</h2>
          <p className="mt-2 text-sm text-gray-600">
            클럽을 만들어 멤버들과 함께 활동을 시작하세요
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="클럽 이름을 입력하세요"
              value={formData.clubName}
              onChange={handleInputChange}
            />
            <p className="mt-1 text-xs text-gray-500">
              {formData.clubName.length}/{CLUB_VALIDATION.NAME_MAX_LENGTH}자
            </p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              클럽 소개 *
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              maxLength={CLUB_VALIDATION.DESCRIPTION_MAX_LENGTH}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="클럽에 대해 소개해주세요"
              value={formData.description}
              onChange={handleInputChange}
            />
            <p className="mt-1 text-xs text-gray-500">
              {formData.description.length}/{CLUB_VALIDATION.DESCRIPTION_MAX_LENGTH}자
            </p>
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
              태그
            </label>
            <div className="mt-1 flex flex-wrap gap-2 p-3 border border-gray-300 rounded-md min-h-[42px]">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleTagRemove(tag)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
              {formData.tags.length < CLUB_VALIDATION.MAX_TAGS && (
                <input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={handleTagKeyPress}
                  onBlur={handleTagAdd}
                  maxLength={CLUB_VALIDATION.TAG_MAX_LENGTH}
                  className="flex-1 min-w-[100px] outline-none text-sm"
                  placeholder="태그를 입력하고 Enter를 누르세요"
                />
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {formData.tags.length}/{CLUB_VALIDATION.MAX_TAGS}개의 태그
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
              <span className="ml-2 text-sm text-gray-700">
                공개 클럽 (누구나 검색하고 가입 요청할 수 있습니다)
              </span>
            </label>
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
                className={`ml-1 h-4 w-4 transform transition-transform ${
                  showAdvanced ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showAdvanced && (
              <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-md">
                {/* Max Members */}
                <div>
                  <label htmlFor="maxMembers" className="block text-sm font-medium text-gray-700">
                    최대 멤버 수
                  </label>
                  <input
                    type="number"
                    id="maxMembers"
                    name="maxMembers"
                    min={CLUB_VALIDATION.MIN_MEMBERS}
                    max={CLUB_VALIDATION.MAX_MEMBERS_LIMIT}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder={`기본값: ${CLUB_VALIDATION.MAX_MEMBERS_DEFAULT}명`}
                    value={formData.maxMembers || ''}
                    onChange={handleMaxMembersChange}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    비워두면 기본값 {CLUB_VALIDATION.MAX_MEMBERS_DEFAULT}명으로 설정됩니다
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Error Display */}
          {(validationErrors.length > 0 || error) && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">
                {validationErrors.length > 0 && (
                  <ul className="list-disc list-inside space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                )}
                {error && <div>{error}</div>}
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '클럽 생성 중...' : '클럽 만들기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}