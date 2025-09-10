'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { validateDisplayName } from '@/lib/auth/validation';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    photoURL: '',
  });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const { 
    user, 
    isAuthenticated, 
    isEmailVerified,
    needsEmailVerification,
    updateProfile, 
    resendEmailVerification, 
    deleteAccount,
    signOut,
    error, 
    clearError 
  } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/signin');
      return;
    }

    if (user) {
      setFormData({
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
      });
    }
  }, [isAuthenticated, user, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    clearError();
    setValidationErrors([]);

    // Validate display name
    const validation = validateDisplayName(formData.displayName);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      setIsLoading(false);
      return;
    }

    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Profile update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      displayName: user?.displayName || '',
      photoURL: user?.photoURL || '',
    });
    setIsEditing(false);
    setValidationErrors([]);
    clearError();
  };

  const handleResendVerification = async () => {
    setIsLoading(true);
    clearError();

    try {
      await resendEmailVerification();
    } catch (error) {
      console.error('Resend verification error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    setIsLoading(true);
    clearError();

    try {
      await deleteAccount();
      router.push('/');
    } catch (error) {
      console.error('Delete account error:', error);
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!isAuthenticated || !user) {
    return null; // Will redirect to signin
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">프로필 설정</h1>
            <p className="text-sm text-gray-600 mt-1">
              계정 정보를 관리하고 보안 설정을 변경할 수 있습니다.
            </p>
          </div>

          {/* Email Verification Status */}
          {needsEmailVerification && (
            <div className="px-6 py-4 bg-yellow-50 border-b border-yellow-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-yellow-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      이메일 인증이 필요합니다
                    </p>
                    <p className="text-sm text-yellow-700">
                      {user.email}로 인증 이메일을 보내주세요.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleResendVerification}
                  disabled={isLoading}
                  className="ml-4 text-sm bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 disabled:opacity-50"
                >
                  {isLoading ? '전송 중...' : '인증 이메일 보내기'}
                </button>
              </div>
            </div>
          )}

          {/* Profile Information */}
          <div className="px-6 py-6">
            <form onSubmit={handleSaveProfile}>
              <div className="space-y-6">
                {/* Profile Photo */}
                <div className="flex items-center space-x-6">
                  <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-gray-500">
                        {user.displayName?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">
                      프로필 사진 URL (선택사항)
                    </label>
                    <input
                      type="url"
                      name="photoURL"
                      value={formData.photoURL}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      placeholder="https://example.com/photo.jpg"
                    />
                  </div>
                </div>

                {/* Display Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    이름
                  </label>
                  <input
                    type="text"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    placeholder="이름을 입력하세요"
                  />
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    이메일 주소
                  </label>
                  <div className="mt-1 flex items-center">
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="flex-1 block border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-100"
                    />
                    {isEmailVerified ? (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        인증됨
                      </span>
                    ) : (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        미인증
                      </span>
                    )}
                  </div>
                </div>

                {/* Account Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    계정 상태
                  </label>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status === 'active' ? '활성' : '비활성'}
                    </span>
                  </div>
                </div>

                {/* Account Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      가입일
                    </label>
                    <div className="mt-1 text-sm text-gray-600">
                      {user.createdAt?.toLocaleDateString('ko-KR')}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      마지막 로그인
                    </label>
                    <div className="mt-1 text-sm text-gray-600">
                      {user.lastLoginAt?.toLocaleDateString('ko-KR')}
                    </div>
                  </div>
                </div>

                {/* Validation Errors */}
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

                {/* Action Buttons */}
                <div className="flex justify-between pt-6">
                  <div className="space-x-3">
                    {isEditing ? (
                      <>
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          {isLoading ? '저장 중...' : '저장'}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          disabled={isLoading}
                          className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          취소
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        편집
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={signOut}
                    className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    로그아웃
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Danger Zone */}
          <div className="px-6 py-4 bg-red-50 border-t border-red-200">
            <h3 className="text-lg font-medium text-red-900 mb-2">위험 구역</h3>
            <p className="text-sm text-red-700 mb-4">
              계정을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
            </p>
            
            {showDeleteConfirm ? (
              <div className="space-y-3">
                <div className="bg-white border border-red-300 rounded-md p-4">
                  <p className="text-sm text-red-800 font-medium mb-2">
                    정말로 계정을 삭제하시겠습니까?
                  </p>
                  <p className="text-sm text-red-700">
                    이 작업은 되돌릴 수 없습니다. 모든 데이터가 영구적으로 삭제됩니다.
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={isLoading}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    {isLoading ? '삭제 중...' : '네, 계정을 삭제합니다'}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isLoading}
                    className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex justify-center py-2 px-4 border border-red-600 shadow-sm text-sm font-medium rounded-md text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                계정 삭제
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/dashboard"
            className="text-sm text-gray-600 hover:text-gray-500"
          >
            ← 대시보드로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}