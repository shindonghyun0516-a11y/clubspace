'use client';

import Link from "next/link";
import { AuthGuard } from '@/components/auth';

export default function Clubs() {
  // 임시 데이터 - 나중에 데이터베이스에서 가져올 예정
  const clubs = [
    {
      id: 1,
      name: "독서 클럽",
      description: "매주 모여서 책을 읽고 토론하는 클럽입니다",
      memberCount: 12,
      category: "문화",
    },
    {
      id: 2,
      name: "등산 동호회",
      description: "주말마다 산을 오르며 건강을 챙기는 클럽입니다",
      memberCount: 8,
      category: "스포츠",
    },
    {
      id: 3,
      name: "요리 연구회",
      description: "다양한 요리를 함께 만들고 나누는 클럽입니다",
      memberCount: 15,
      category: "취미",
    },
  ];

  return (
    <AuthGuard requireAuth={true}>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">클럽</h1>
          <p className="text-gray-600">관심있는 클럽을 찾아보고 참여해보세요</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
          새 클럽 만들기
        </button>
      </div>

      {/* Club Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clubs.map((club) => (
          <div key={club.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {club.category}
                </span>
                <span className="text-sm text-gray-500">{club.memberCount}명</span>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {club.name}
              </h3>
              
              <p className="text-gray-600 mb-4 line-clamp-2">
                {club.description}
              </p>
              
              <div className="flex space-x-2">
                <Link
                  href={`/clubs/${club.id}`}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-lg transition-colors"
                >
                  자세히 보기
                </Link>
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors">
                  참여하기
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State (임시로 숨김) */}
      {clubs.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👥</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            아직 클럽이 없습니다
          </h2>
          <p className="text-gray-600 mb-6">
            첫 번째 클럽을 만들어서 사람들과 함께 활동해보세요
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
            클럽 만들기
          </button>
        </div>
      )}
      </div>
    </AuthGuard>
  );
}