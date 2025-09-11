'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AuthGuard } from '@/components/auth';
import { useAuth } from '@/hooks/useAuth';
import { useClubStore } from '@/store/clubStore';
import { ClubSearchParams } from '@/types/club';
import { formatDateSafe, formatRelativeTime } from '@/lib/utils/dateUtils';

export default function ClubsPage() {
  const { user } = useAuth();
  const {
    clubs,
    myClubs,
    isLoading,
    error,
    pagination,
    searchClubs,
    loadUserClubs,
    nextPage,
    resetPagination,
    clearError,
  } = useClubStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags] = useState<string[]>([]);
  const [showPublicOnly, setShowPublicOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'memberCount' | 'createdAt' | 'lastActivity'>('createdAt');
  const [activeTab, setActiveTab] = useState<'my' | 'discover'>('my');

  // Load initial data
  useEffect(() => {
    if (user) {
      loadUserClubs(user.uid);
    }
  }, [user, loadUserClubs]);

  // Search clubs when filters change
  useEffect(() => {
    if (activeTab === 'discover') {
      handleSearch();
    }
  }, [activeTab, showPublicOnly, sortBy]);

  const handleSearch = async () => {
    resetPagination();
    clearError();

    const searchParams: ClubSearchParams = {
      query: searchQuery.trim() || undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      isPublic: showPublicOnly ? true : undefined,
      sortBy,
      sortOrder: 'desc',
      page: 1,
      limit: 20,
    };

    await searchClubs(searchParams);
  };

  const handleLoadMore = async () => {
    if (pagination.hasMore && !isLoading) {
      nextPage();
      
      const searchParams: ClubSearchParams = {
        query: searchQuery.trim() || undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        isPublic: showPublicOnly ? true : undefined,
        sortBy,
        sortOrder: 'desc',
        page: pagination.page + 1,
        limit: 20,
      };

      await searchClubs(searchParams);
    }
  };

  // ❌ 제거됨: 안전하지 않은 formatDate 함수

  const formatMemberCount = (count: number) => {
    return count.toLocaleString() + '명';
  };

  return (
    <AuthGuard requireAuth={true}>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">클럽</h1>
            <p className="mt-2 text-gray-600">관심사를 공유하는 사람들과 함께하세요</p>
          </div>
          <Link
            href="/clubs/new"
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            새 클럽 만들기
          </Link>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('my')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'my'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              내 클럽 ({myClubs.length})
            </button>
            <button
              onClick={() => setActiveTab('discover')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'discover'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              클럽 찾기
            </button>
          </nav>
        </div>

        {/* Search and Filters */}
        {activeTab === 'discover' && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Search Input */}
              <div className="lg:col-span-2">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  클럽 검색
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="클럽 이름, 설명, 태그로 검색..."
                    className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  <button
                    onClick={handleSearch}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-2">
                  정렬
                </label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'memberCount' | 'createdAt' | 'lastActivity')}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="createdAt">최신순</option>
                  <option value="memberCount">멤버 수</option>
                  <option value="name">이름순</option>
                  <option value="lastActivity">활동순</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showPublicOnly}
                  onChange={(e) => setShowPublicOnly(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">공개 클럽만 보기</span>
              </label>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'my' ? (
            // My Clubs
            <div>
              {myClubs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myClubs.map((club) => (
                    <Link key={club.clubId} href={`/clubs/${club.clubId}`}>
                      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 h-full">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {club.clubName}
                          </h3>
                          {!club.isPublic && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              비공개
                            </span>
                          )}
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {club.description}
                        </p>

                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            {formatMemberCount(club.memberCount)}
                          </div>
                          <div>{formatDateSafe(club.updatedAt, { month: 'short', day: 'numeric' }, 'ko-KR', '날짜 없음')}</div>
                        </div>

                        {club.tags.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {club.tags.slice(0, 3).map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {tag}
                              </span>
                            ))}
                            {club.tags.length > 3 && (
                              <span className="text-xs text-gray-500">
                                +{club.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">참여 중인 클럽이 없습니다</h3>
                  <p className="mt-1 text-sm text-gray-500">새로운 클럽을 만들거나 기존 클럽에 가입해보세요</p>
                  <div className="mt-6">
                    <Link
                      href="/clubs/new"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      클럽 만들기
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Discover Clubs
            <div>
              {clubs.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {clubs.map((club) => (
                      <div key={club.clubId} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {club.clubName}
                          </h3>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            공개
                          </span>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {club.description}
                        </p>

                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            {formatMemberCount(club.memberCount)}
                          </div>
                          <div>{formatDateSafe(club.createdAt, { month: 'short', day: 'numeric' }, 'ko-KR', '날짜 없음')}</div>
                        </div>

                        {club.tags.length > 0 && (
                          <div className="mb-4 flex flex-wrap gap-1">
                            {club.tags.slice(0, 3).map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {tag}
                              </span>
                            ))}
                            {club.tags.length > 3 && (
                              <span className="text-xs text-gray-500">
                                +{club.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        <Link
                          href={`/clubs/${club.clubId}`}
                          className="block w-full text-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          클럽 보기
                        </Link>
                      </div>
                    ))}
                  </div>

                  {/* Load More Button */}
                  {pagination.hasMore && (
                    <div className="text-center mt-8">
                      <button
                        onClick={handleLoadMore}
                        disabled={isLoading}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            로딩 중...
                          </>
                        ) : (
                          '더 보기'
                        )}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">검색 결과가 없습니다</h3>
                  <p className="mt-1 text-sm text-gray-500">다른 검색어를 시도해보세요</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Loading Indicator */}
        {isLoading && clubs.length === 0 && (
          <div className="text-center py-12">
            <svg className="animate-spin mx-auto h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}