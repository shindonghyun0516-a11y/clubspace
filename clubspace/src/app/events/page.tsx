import Link from "next/link";

export default function Events() {
  // 임시 데이터 - 나중에 데이터베이스에서 가져올 예정
  const events = [
    {
      id: 1,
      title: "월간 독서 모임",
      description: "이달의 추천 도서를 함께 읽고 토론하는 시간",
      date: "2024-09-15",
      time: "14:00",
      location: "중앙 도서관 세미나실",
      attendees: 8,
      maxAttendees: 15,
      clubName: "독서 클럽",
    },
    {
      id: 2,
      title: "주말 등산 (북한산)",
      description: "가을 단풍을 만끽하며 북한산을 함께 등반해요",
      date: "2024-09-21",
      time: "07:00",
      location: "북한산 입구 (정릉 방면)",
      attendees: 6,
      maxAttendees: 10,
      clubName: "등산 동호회",
    },
    {
      id: 3,
      title: "이탈리안 요리 클래스",
      description: "파스타와 피자 만들기를 배우는 특별한 시간",
      date: "2024-09-28",
      time: "18:00",
      location: "요리 스튜디오 A동",
      attendees: 12,
      maxAttendees: 15,
      clubName: "요리 연구회",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">이벤트</h1>
          <p className="text-gray-600">다가오는 이벤트를 확인하고 참여해보세요</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
          새 이벤트 만들기
        </button>
      </div>

      {/* Events List */}
      <div className="space-y-6">
        {events.map((event) => (
          <div key={event.id} className="bg-white rounded-lg shadow-md">
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      {event.clubName}
                    </span>
                    <span className="text-sm text-gray-500">
                      {event.attendees}/{event.maxAttendees} 참석
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {event.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4">{event.description}</p>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 text-sm text-gray-500">
                    <div className="flex items-center space-x-1 mb-2 sm:mb-0">
                      <span>📅</span>
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center space-x-1 mb-2 sm:mb-0">
                      <span>🕐</span>
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>📍</span>
                      <span>{event.location}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 md:mt-0 md:ml-6 flex space-x-2">
                  <Link
                    href={`/events/${event.id}`}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors"
                  >
                    자세히 보기
                  </Link>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
                    참석하기
                  </button>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between items-center text-sm mb-1">
                  <span className="text-gray-600">참석률</span>
                  <span className="text-gray-600">
                    {Math.round((event.attendees / event.maxAttendees) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${(event.attendees / event.maxAttendees) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State (임시로 숨김) */}
      {events.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📅</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            예정된 이벤트가 없습니다
          </h2>
          <p className="text-gray-600 mb-6">
            새로운 이벤트를 만들어서 사람들과 함께 활동해보세요
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
            이벤트 만들기
          </button>
        </div>
      )}
    </div>
  );
}