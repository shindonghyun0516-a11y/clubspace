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

### MVP-T001: 프로젝트 기본 설정 [필수] - 1주
**Week 1 완료 목표**
- [ ] Next.js 14 프로젝트 생성 (`npx create-next-app@latest clubspace`)
- [ ] TypeScript, Tailwind CSS 설정
- [ ] ESLint, Prettier 기본 설정
- [ ] 폴더 구조 생성 (`app`, `components`, `lib`, `hooks`)
- [ ] Firebase 프로젝트 생성 및 SDK 설치
- [ ] 환경변수 설정 (`.env.local`)
- [ ] Git 저장소 초기화

### MVP-T002: 기본 라우팅 및 레이아웃 [필수] - 1주
**Week 2 완료 목표**
- [ ] Next.js App Router 기본 구조 설정
- [ ] 메인 레이아웃 컴포넌트 (`app/layout.tsx`)
- [ ] 기본 페이지 생성:
  - `/` - 랜딩 페이지
  - `/dashboard` - 대시보드
  - `/clubs/[id]` - 클럽 상세
  - `/events/[id]` - 이벤트 상세
- [ ] 기본 네비게이션 컴포넌트
- [ ] 모바일 반응형 기본 레이아웃

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

### MVP-T006: 멤버 관리 핵심 [필수] - 1주
**Week 6 완료 목표**
- [ ] 초대 링크 생성 기능
- [ ] 클럽 가입/탈퇴 기능
- [ ] 멤버 목록 표시
- [ ] 기본 역할 구분 (organizer/member)
- [ ] Firestore 보안 규칙 기본 설정

---

## 📋 MVP Phase 4: Event System (Weeks 7-8)

### MVP-T007: 이벤트 핵심 기능 [필수] - 1.5주
**Week 7-8 완료 목표**
- [ ] Firestore Event 컬렉션 설계
- [ ] 이벤트 생성 폼 (제목, 날짜, 시간, 장소, 설명)
- [ ] 이벤트 목록 표시 (리스트 뷰만)
- [ ] 이벤트 상세 페이지

### MVP-T008: RSVP 시스템 핵심 [필수] - 0.5주
**Week 8 완료 목표**
- [ ] RSVP 데이터 모델 (going/not_going만)
- [ ] RSVP 버튼 컴포넌트
- [ ] 실시간 참석자 수 표시
- [ ] 참석자 목록 기본 표시

---

## 📋 MVP Phase 5: Basic Communication (Weeks 9-10)

### MVP-T009: 기본 채팅 [필수] - 1.5주
**Week 9-10 완료 목표**
- [ ] 클럽별 채팅방 (1개 채팅방만)
- [ ] 메시지 전송/수신 기본 기능
- [ ] 실시간 메시지 업데이트 (Firestore onSnapshot)
- [ ] 메시지 목록 표시 (페이지네이션 없음)

### MVP-T010: 공지사항 기본 [필수] - 0.5주
**Week 10 완료 목표**
- [ ] 관리자 공지사항 작성 기능
- [ ] 공지사항 목록 표시
- [ ] 일반 게시글과 공지사항 구분

---

## 📋 MVP Phase 6: Polish & Testing (Weeks 11-12)

### MVP-T011: 품질 관리 [필수] - 1주
**Week 11 완료 목표**
- [ ] 기본 오류 처리 및 로딩 상태
- [ ] 모바일 반응형 최적화
- [ ] 기본 성능 최적화
- [ ] Firestore 보안 규칙 완성

### MVP-T012: MVP 완성 및 테스트 [필수] - 1주
**Week 12 완료 목표**
- [ ] 전체 기능 통합 테스트
- [ ] 사용자 플로우 검증
- [ ] 버그 수정 및 안정화
- [ ] 배포 준비 (Vercel + Firebase)

---

## 🎯 MVP 성공 기준

### 기능적 요구사항 ✅
1. **사용자가 클럽을 만들 수 있다**
2. **다른 사용자를 클럽에 초대할 수 있다**
3. **이벤트를 생성하고 RSVP를 받을 수 있다**
4. **클럽 멤버들과 기본적인 채팅이 가능하다**
5. **관리자가 공지사항을 작성할 수 있다**

### 기술적 요구사항 ⚡
- 페이지 로딩: 5초 이내 (MVP 단계)
- 실시간 기능 정상 동작
- 모바일에서 사용 가능
- 기본적인 보안 (인증, 권한)

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
| **Week 10** | 소통 기능 완성 | 채팅 + 공지사항 동작 |
| **Week 12** | **MVP 출시 준비** | 전체 기능 안정화 |

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

### Phase 2 (Weeks 13-16): 고급 기능
- 푸시 알림 (FCM)
- 파일 업로드
- 캘린더 뷰
- 설문조사

### Phase 3 (Weeks 17-20): 확장 기능
- 회비 관리
- 고급 이벤트 기능
- 분석 대시보드
- 모바일 앱 최적화

**MVP 우선 완성 → 사용자 피드백 → 우선순위 재조정**