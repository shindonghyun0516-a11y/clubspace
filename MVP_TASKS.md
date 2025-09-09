# ClubSpace MVP 태스크 리스트

**목표**: 8주 만에 핵심 가치를 증명할 수 있는 최소 기능 제품 완성  
**핵심 가치**: 클럽 이벤트 관리 + RSVP + 기본 소통

## 🎯 MVP 범위 정의

### ✅ 포함 기능 (Must Have)
- 사용자 인증 및 프로필 관리
- 클럽 생성 및 기본 관리
- 이벤트 생성 및 RSVP 시스템
- 기본 채팅 기능

### ❌ 제외 기능 (Won't Have)
- 푸시 알림 (FCM)
- 설문조사/투표
- 파일 업로드/사진 공유
- 고급 이벤트 기능 (대기자 명단, 반복 이벤트)
- 회비 관리, 마켓플레이스

---

## 📋 MVP Phase 1: Foundation (Weeks 1-2)

### MVP-T001: 프로젝트 기본 설정 [필수] - 1주 ✅ **완료**
**Week 1 완료 목표**
- [x] Next.js 14 프로젝트 생성 (`npx create-next-app@latest clubspace`)
- [x] TypeScript, Tailwind CSS 설정
- [x] ESLint, Prettier 기본 설정
- [x] 폴더 구조 생성 (`app`, `components`, `lib`, `hooks`)
- [x] Firebase 프로젝트 생성 및 SDK 설치
- [x] 환경변수 설정 (`.env.local`)
- [x] Git 저장소 초기화

### MVP-T002: 기본 라우팅 및 레이아웃 [필수] - 1주 ✅ **완료**
**Week 2 완료 목표**
- [x] Next.js App Router 기본 구조 설정
- [x] 메인 레이아웃 컴포넌트 (`app/layout.tsx`)
- [x] 기본 페이지 생성:
  - `/` - 랜딩 페이지
  - `/dashboard` - 대시보드
  - `/clubs` - 클럽 목록
  - `/events` - 이벤트 목록
- [x] 기본 네비게이션 컴포넌트
- [x] 모바일 반응형 기본 레이아웃

---

## 📋 MVP Phase 2: Authentication (Weeks 3-4)

### MVP-T003: Firebase Auth 핵심 구현 [필수] - 1.5주
**Week 3-4 완료 목표**
- [ ] Firebase Auth 설정 (Google, Email/Password만)
- [ ] 로그인/회원가입 페이지 구현
- [ ] `useAuth` 훅 구현
- [ ] 사용자 상태 관리 (Zustand)
- [ ] 보호된 라우트 구현 (`AuthGuard`)

### MVP-T004: 사용자 데이터 기본 설정 [필수] - 0.5주
**Week 4 완료 목표**
- [ ] Firestore User 컬렉션 구조 설계 (기본 정보만)
- [ ] 사용자 기본 정보 자동 저장 (Auth 연동)

---

## 📋 MVP Phase 3: Club Management (Weeks 5-6)

### MVP-T005: 클럽 핵심 기능 [필수] - 1주
**Week 5 완료 목표**
- [ ] Firestore Club 컬렉션 설계
- [ ] 클럽 생성 폼 (이름, 설명만)
- [ ] 클럽 목록 페이지
- [ ] 클럽 상세 페이지 기본 UI

### MVP-T006: 멤버 관리 최소 [필수] - 0.5주
**Week 6 완료 목표**
- [ ] 클럽 가입/탈퇴 기능 (기본 구현만)

---

## 📋 MVP Phase 4: Event System (Weeks 7-8)

### MVP-T007: 이벤트 최소 기능 [필수] - 2주
**Week 7-8 완료 목표**
- [ ] 이벤트 기본 CRUD (생성/조회만)
- [ ] 간단한 RSVP (참석/불참석 선택만)

---

## 📋 MVP Phase 5: 품질 관리 및 완성 (Weeks 9-10)

### MVP-T008: 최종 안정화 [필수] - 2주
**Week 9-10 완료 목표**
- [ ] 기본 오류 처리 및 로딩 상태
- [ ] 핵심 기능 통합 테스트
- [ ] 사용자 플로우 검증 (가입→클럽생성→이벤트생성→RSVP)
- [ ] 버그 수정 및 안정화
- [ ] 배포 준비 (Vercel + Firebase)

---

## 🎯 MVP 성공 기준

### 기능적 요구사항 ✅
1. **사용자가 클럽을 만들 수 있다**
2. **다른 사용자가 클럽에 가입할 수 있다**
3. **이벤트를 생성하고 RSVP를 받을 수 있다**

### 기술적 요구사항 ⚡
- 페이지 로딩: 5초 이내 (MVP 단계)
- 모바일에서 사용 가능
- 기본적인 보안 (인증)

### 사용자 경험 🎨
- 직관적인 네비게이션
- 명확한 오류 메시지
- 로딩 상태 표시
- 기본적인 반응형 디자인

---

## 📅 MVP 개발 일정

| 주차 | 마일스톤 | 완료 기준 |
|------|----------|-----------|
| **Week 2** | 프로젝트 기반 완성 | Next.js + Firebase 연결 확인 |
| **Week 4** | 인증 시스템 완성 | 로그인/회원가입 동작 |
| **Week 6** | 클럽 관리 완성 | 클럽 생성/가입 가능 |
| **Week 8** | **핵심 MVP 완성** | 이벤트 + RSVP 동작 |
| **Week 10** | **MVP 출시 준비** | 전체 기능 안정화 및 배포 |

---

## 🚀 첫 주 즉시 시작 가이드

### Day 1-2: 프로젝트 설정
```bash
npx create-next-app@latest clubspace --typescript --tailwind --eslint --app
cd clubspace
npm install firebase zustand
```

### Day 3-4: Firebase 설정
1. Firebase 콘솔에서 프로젝트 생성
2. Authentication, Firestore 활성화
3. 웹 앱 등록 후 설정 정보 복사
4. `lib/firebase.ts` 파일 생성

### Day 5: 기본 페이지 구조
1. 레이아웃 컴포넌트 생성
2. 기본 라우팅 설정
3. 네비게이션 컴포넌트

---

## 💡 MVP 이후 확장 계획

### Phase 2 (Weeks 11-14): 사용자 경험 개선
- 사용자 프로필 생성/수정 기능
- 프로필 페이지 UI
- 초대 링크 생성 기능
- 멤버 목록 및 역할 구분
- 이벤트 상세 페이지 및 목록 표시
- RSVP 참석자 목록 표시

### Phase 3 (Weeks 15-18): 소통 기능
- 클럽별 채팅방 기능
- 실시간 메시지 시스템
- 공지사항 시스템
- 푸시 알림 (FCM)
- 파일 업로드

### Phase 4 (Weeks 19-22): 확장 기능
- 설문조사/투표 기능
- 캘린더 뷰
- 회비 관리
- 고급 이벤트 기능 (대기자 명단, 반복 이벤트)
- 분석 대시보드

**MVP 우선 완성 → 사용자 피드백 → 우선순위 재조정**