import Link from "next/link";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          ClubSpace에 오신 것을 환영합니다
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          통합 클럽 관리 플랫폼으로 이벤트 관리, RSVP 추적, 멤버 소통을 한 곳에서 간편하게
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/dashboard"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            시작하기
          </Link>
          <Link
            href="/clubs"
            className="bg-white hover:bg-gray-50 text-blue-600 font-semibold py-3 px-6 rounded-lg border-2 border-blue-600 transition-colors"
          >
            클럽 둘러보기
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-3xl mb-4">📅</div>
          <h3 className="text-xl font-semibold mb-2">이벤트 관리</h3>
          <p className="text-gray-600">
            클럽 이벤트를 쉽게 생성하고 관리하세요. RSVP 추적과 참석자 관리가 간편합니다.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-3xl mb-4">👥</div>
          <h3 className="text-xl font-semibold mb-2">멤버 관리</h3>
          <p className="text-gray-600">
            클럽 멤버들을 체계적으로 관리하고 역할에 따른 권한을 설정할 수 있습니다.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-3xl mb-4">📊</div>
          <h3 className="text-xl font-semibold mb-2">실시간 대시보드</h3>
          <p className="text-gray-600">
            클럽 활동 현황을 한눈에 보고 중요한 정보를 놓치지 마세요.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center bg-blue-50 rounded-lg p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          지금 시작해보세요
        </h2>
        <p className="text-gray-600 mb-6">
          ClubSpace로 클럽 관리를 더욱 효율적으로 만들어보세요
        </p>
        <Link
          href="/dashboard"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors inline-block"
        >
          대시보드로 이동
        </Link>
      </section>
    </div>
  );
}
