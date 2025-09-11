# Firestore 설정 가이드

## 인덱스 관리

### 개발 환경 설정
```bash
# Firebase CLI 로그인
firebase login

# 프로젝트 설정 확인
firebase use clubspace-162ad

# 인덱스 배포
firebase deploy --only firestore:indexes
```

### 새로운 인덱스 필요 시
1. 에러 메시지에서 제공되는 링크를 클릭하여 즉시 생성
2. `firestore.indexes.json` 파일에 해당 인덱스 추가
3. `firebase deploy --only firestore:indexes`로 배포

### 현재 설정된 인덱스
- **clubMembers**: clubId + status + joinedAt (멤버 조회)
- **clubMembers**: uid + status (사용자 클럽 조회)
- **clubs**: status + updatedAt (클럽 목록 정렬)
- **clubs**: status + isPublic + updatedAt (공개/비공개 필터링)
- **clubs**: status + createdAt (생성일 정렬)
- **clubs**: status + memberCount (인기순 정렬)

### 트러블슈팅
- 인덱스 생성 에러 시: Firebase Console에서 수동 생성
- 복합 쿼리 에러 시: 에러 메시지의 링크 활용
- 배포 실패 시: Firebase CLI 로그인 상태 확인