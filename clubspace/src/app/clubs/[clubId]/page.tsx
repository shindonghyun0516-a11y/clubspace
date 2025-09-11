'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthGuard } from '@/components/auth';
import { useAuth } from '@/hooks/useAuth';
import { useClubStore } from '@/store/clubStore';
import { ClubRole } from '@/types/club';
import MemberManagementItem from '@/components/club/MemberManagementItem';
import { formatDateSafe } from '@/lib/utils/dateUtils';

export default function ClubDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const {
    currentClub,
    clubMembers,
    isLoading,
    error,
    getClub,
    loadClubMembers,
    getUserClubRole,
    joinClub,
    leaveClub,
    checkPermissions,
    clearError,
  } = useClubStore();

  const [userRole, setUserRole] = useState<ClubRole | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [showAllMembers, setShowAllMembers] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<ClubRole | 'all'>('all');

  const clubId = params.clubId as string;

  // Load club data
  useEffect(() => {
    if (clubId) {
      loadClubData();
    }
  }, [clubId]);

  // Load user role
  useEffect(() => {
    if (clubId && user) {
      loadUserRole();
    }
  }, [clubId, user]);

  const loadClubData = async () => {
    try {
      clearError();
      await getClub(clubId);
      await loadClubMembers(clubId);
    } catch (error) {
      console.error('Error loading club data:', error);
    }
  };

  const loadUserRole = async () => {
    if (user) {
      const role = await getUserClubRole(clubId, user.uid);
      setUserRole(role);
    }
  };

  const handleJoinClub = async () => {
    if (!user || !currentClub) return;

    setIsJoining(true);
    try {
      await joinClub(clubId, user.uid);
      await loadUserRole();
      await loadClubData();
    } catch (error) {
      console.error('Error joining club:', error);
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveClub = async () => {
    if (!user || !currentClub) return;

    if (currentClub.ownerUid === user.uid) {
      alert('클럽 소유자는 탈퇴할 수 없습니다.');
      return;
    }

    if (confirm('정말로 이 클럽을 떠나시겠습니까?')) {
      setIsLeaving(true);
      try {
        await leaveClub(clubId, user.uid);
        router.push('/clubs');
      } catch (error) {
        console.error('Error leaving club:', error);
      } finally {
        setIsLeaving(false);
      }
    }
  };

  // ❌ 제거됨: 안전하지 않은 formatDate 함수 (dateUtils.formatDateSafe 사용)

  const getRoleDisplayName = (role: ClubRole) => {
    const roleNames = {
      owner: '소유자',
      organizer: '운영진',
      member: '멤버',
      guest: '게스트',
    };
    return roleNames[role];
  };

  const getRoleBadgeColor = (role: ClubRole) => {
    const colors = {
      owner: 'bg-purple-100 text-purple-800',
      organizer: 'bg-blue-100 text-blue-800',
      member: 'bg-green-100 text-green-800',
      guest: 'bg-gray-100 text-gray-800',
    };
    return colors[role];
  };

  if (isLoading && !currentClub) {
    return (
      <AuthGuard requireAuth={true}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <svg className="animate-spin mx-auto h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-2 text-sm text-gray-600">클럽 정보를 불러오는 중...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (!currentClub) {
    return (
      <AuthGuard requireAuth={true}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">클럽을 찾을 수 없습니다</h3>
            <p className="mt-1 text-sm text-gray-500">클럽이 삭제되었거나 접근 권한이 없습니다</p>
            <div className="mt-6">
              <Link
                href="/clubs"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                클럽 목록으로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  const isMember = userRole !== null;
  const permissions = user ? checkPermissions(clubId, user.uid) : null;
  
  // Filter and search logic for members
  const filteredMembers = clubMembers.filter((member) => {
    const matchesSearch = memberSearchQuery === '' || 
      member.uid.toLowerCase().includes(memberSearchQuery.toLowerCase());
    const matchesRole = selectedRoleFilter === 'all' || member.role === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });
  
  const displayedMembers = showAllMembers ? filteredMembers : filteredMembers.slice(0, 6);

  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-6 max-w-6xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{currentClub.clubName}</h1>
                  {!currentClub.isPublic && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      비공개
                    </span>
                  )}
                  {userRole && (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(userRole)}`}>
                      {getRoleDisplayName(userRole)}
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mb-4">{currentClub.description}</p>
                
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    멤버 {currentClub.memberCount.toLocaleString()}명
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 6v6m-5-10h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8a2 2 0 012-2z" />
                    </svg>
                    {formatDateSafe(currentClub.createdAt, { year: 'numeric', month: 'long', day: 'numeric' }, 'ko-KR', '날짜 없음')} 생성
                  </div>
                </div>

                {/* Tags */}
                {currentClub.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {currentClub.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 sm:mt-0 sm:ml-6 flex-shrink-0">
                <div className="flex space-x-3">
                  {isMember ? (
                    <>
                      {permissions?.canEdit && (
                        <Link
                          href={`/clubs/${clubId}/edit`}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          클럽 편집
                        </Link>
                      )}
                      
                      {!permissions?.isOwner && (
                        <button
                          onClick={handleLeaveClub}
                          disabled={isLeaving}
                          className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLeaving ? '탈퇴 중...' : '클럽 탈퇴'}
                        </button>
                      )}
                    </>
                  ) : (
                    <button
                      onClick={handleJoinClub}
                      disabled={isJoining}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isJoining ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          가입 중...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          클럽 가입
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="container mx-auto px-4 py-4 max-w-6xl">
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Navigation Tabs */}
              {isMember && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                      <Link
                        href={`/clubs/${clubId}/events`}
                        className="py-2 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      >
                        이벤트
                      </Link>
                      <Link
                        href={`/clubs/${clubId}/posts`}
                        className="py-2 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      >
                        게시글
                      </Link>
                      <Link
                        href={`/clubs/${clubId}/chat`}
                        className="py-2 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      >
                        채팅
                      </Link>
                    </nav>
                  </div>
                  <div className="mt-6 text-center text-gray-500">
                    <p>클럽 기능들이 곧 추가될 예정입니다!</p>
                  </div>
                </div>
              )}

              {/* Welcome Message for Non-Members */}
              {!isMember && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">클럽에 가입하세요</h3>
                  <p className="text-gray-600 mb-4">
                    {currentClub.clubName}의 멤버가 되어 다양한 활동에 참여하고 새로운 사람들을 만나보세요.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      이벤트 참여 및 RSVP
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      멤버들과 채팅
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      게시글 작성 및 댓글
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Club Members */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">멤버</h3>
                  <span className="text-sm text-gray-500">{currentClub.memberCount}명</span>
                </div>

                {/* Member Search and Filter */}
                <div className="mb-4 space-y-3">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="멤버 검색..."
                      value={memberSearchQuery}
                      onChange={(e) => setMemberSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  
                  <select
                    value={selectedRoleFilter}
                    onChange={(e) => setSelectedRoleFilter(e.target.value as ClubRole | 'all')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">모든 역할</option>
                    <option value="owner">소유자</option>
                    <option value="organizer">운영진</option>
                    <option value="member">멤버</option>
                    <option value="guest">게스트</option>
                  </select>
                </div>

                {clubMembers.length > 0 ? (
                  <div className="space-y-2">
                    {displayedMembers.map((member) => (
                      <MemberManagementItem
                        key={member.uid}
                        member={member}
                        clubId={currentClub.clubId}
                        currentUserUid={user?.uid || ''}
                        currentUserRole={userRole}
                        onMemberUpdate={() => {
                          loadClubMembers(currentClub.clubId);
                          getClub(currentClub.clubId);
                        }}
                      />
                    ))}

                    {filteredMembers.length > 6 && (
                      <button
                        onClick={() => setShowAllMembers(!showAllMembers)}
                        className="w-full text-center text-sm text-blue-600 hover:text-blue-500 py-2"
                      >
                        {showAllMembers ? '접기' : `${filteredMembers.length - 6}명 더 보기`}
                      </button>
                    )}
                    
                    {filteredMembers.length === 0 && (memberSearchQuery || selectedRoleFilter !== 'all') && (
                      <div className="text-center py-4 text-gray-500">
                        검색 결과가 없습니다.
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">멤버 정보를 불러오는 중...</p>
                )}
              </div>

              {/* Club Info */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">클럽 정보</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">생성일</span>
                    <span className="text-gray-900">{formatDateSafe(currentClub.createdAt, { year: 'numeric', month: 'long', day: 'numeric' }, 'ko-KR', '날짜 없음')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">공개 여부</span>
                    <span className="text-gray-900">{currentClub.isPublic ? '공개' : '비공개'}</span>
                  </div>
                  {currentClub.maxMembers && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">최대 멤버</span>
                      <span className="text-gray-900">{currentClub.maxMembers.toLocaleString()}명</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}