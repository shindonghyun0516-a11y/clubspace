export default function Dashboard() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">대시보드</h1>
        <p className="text-gray-600">클럽 활동 현황을 한눈에 확인하세요</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="text-3xl mr-4">👥</div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">참여 중인 클럽</h3>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="text-3xl mr-4">📅</div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">예정된 이벤트</h3>
              <p className="text-2xl font-bold text-gray-900">5</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="text-3xl mr-4">✅</div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">RSVP 대기</h3>
              <p className="text-2xl font-bold text-gray-900">2</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">최근 활동</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-gray-800">새로운 이벤트 &ldquo;월간 모임&rdquo;에 초대되었습니다</p>
              <span className="text-sm text-gray-500">2시간 전</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-gray-800">&ldquo;주말 워크샵&rdquo; 이벤트 RSVP를 완료했습니다</p>
              <span className="text-sm text-gray-500">1일 전</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-yellow-500 rounded-full"></div>
              <p className="text-gray-800">&ldquo;독서 클럽&rdquo;에 새로운 멤버가 참여했습니다</p>
              <span className="text-sm text-gray-500">3일 전</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}