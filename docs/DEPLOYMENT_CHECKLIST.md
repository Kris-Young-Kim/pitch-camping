# Deployment Checklist for Pitch Camping

이 문서는 프로덕션 배포 전에 확인해야 할 항목들을 체크리스트로 정리한 것입니다.

## 배포 전 체크리스트

### 1. 환경 변수 설정

모든 필수 환경 변수가 Vercel에 설정되어 있는지 확인:

#### Clerk 인증
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (⚠️ **프로덕션 키 사용 필수**)
- [ ] `CLERK_SECRET_KEY` (⚠️ **프로덕션 키 사용 필수**)
- [ ] `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- [ ] `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL`
- [ ] `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL`

**⚠️ 중요: Clerk 프로덕션 키 설정 방법**
1. [Clerk Dashboard](https://dashboard.clerk.com) 접속
2. 프로젝트 선택 → **API Keys** 메뉴
3. **Production** 환경의 키 복사 (Development 키가 아닌 Production 키 사용)
4. Vercel 환경 변수에 설정
5. 개발 환경에서는 "Clerk has been loaded with development keys" 경고가 정상입니다. 프로덕션 배포 시에는 이 경고가 나타나지 않아야 합니다.

#### Supabase
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `NEXT_PUBLIC_STORAGE_BUCKET`

#### 고캠핑 API
- [ ] `NEXT_PUBLIC_GOCAMPING_API_KEY` 또는 `GOCAMPING_API_KEY`
- [ ] `NEXT_PUBLIC_GOCAMPING_API_BASE_URL` (선택 사항)

#### 네이버 지도 API
- [ ] `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID`

#### 관리자 설정
- [ ] `ADMIN_USER_IDS` (쉼표로 구분된 Clerk 사용자 ID)

#### 사이트 URL
- [ ] `NEXT_PUBLIC_SITE_URL` (프로덕션 도메인, 예: https://pitch-camping.vercel.app)

### 2. 빌드 확인

로컬에서 프로덕션 빌드 테스트:

```bash
pnpm build
pnpm start
```

- [ ] 빌드 성공 확인
- [ ] 빌드 경고/에러 없음 확인
- [ ] 프로덕션 서버 정상 실행 확인

### 3. 코드 품질 검사

```bash
pnpm lint
npx tsc --noEmit  # TypeScript 타입 체크
```

- [ ] ESLint 에러 없음
- [ ] TypeScript 타입 에러 없음

### 4. 데이터베이스 확인

Supabase 프로덕션 데이터베이스:

- [ ] 마이그레이션 모두 적용 확인
- [ ] 테이블 구조 확인:
  - [ ] `users` 테이블
  - [ ] `bookmarks` 테이블
  - [ ] `camping_stats` 테이블
  - [ ] `user_activity` 테이블
  - [ ] `reviews` 테이블
  - [ ] `review_helpful` 테이블
- [ ] RLS 정책 확인 (프로덕션에서는 활성화 권장)
- [ ] Storage 버킷 설정 확인

### 5. 외부 서비스 연동 확인

#### Clerk
- [ ] 프로덕션 환경 설정 확인
- [ ] 콜백 URL 설정 확인
- [ ] 한국어 로컬라이제이션 확인

#### Supabase
- [ ] 프로덕션 프로젝트 연결 확인
- [ ] API 키 유효성 확인
- [ ] Database 연결 확인
- [ ] Storage 권한 확인

#### 고캠핑 API
- [ ] API 키 유효성 확인
- [ ] API 응답 정상 확인
- [ ] Rate Limit 확인

#### 네이버 지도 API
- [ ] NCP Client ID 설정 확인
- [ ] 지도 로드 확인
- [ ] 사용량 제한 확인

### 6. 기능 동작 확인

프로덕션 배포 후 주요 기능 테스트:

#### 인증
- [ ] 회원가입 동작 확인
- [ ] 로그인 동작 확인
- [ ] 로그아웃 동작 확인
- [ ] 사용자 프로필 확인

#### 캠핑장 목록
- [ ] 목록 표시 확인
- [ ] 필터 동작 확인
- [ ] 검색 기능 확인
- [ ] 페이지네이션 확인

#### 지도
- [ ] 지도 로드 확인
- [ ] 마커 표시 확인
- [ ] 마커 클릭 동작 확인
- [ ] 리스트-지도 연동 확인

#### 상세페이지
- [ ] 상세 정보 표시 확인
- [ ] 이미지 갤러리 확인
- [ ] 공유 기능 확인
- [ ] 북마크 기능 확인
- [ ] 리뷰 기능 확인

#### 관리자
- [ ] 관리자 대시보드 접근 확인
- [ ] 통계 데이터 표시 확인

### 7. 성능 확인

- [ ] Lighthouse 점수 확인 (목표: 80+)
- [ ] 페이지 로드 시간 확인
- [ ] API 응답 시간 확인
- [ ] 이미지 최적화 확인

### 8. 보안 확인

- [ ] HTTPS 연결 확인
- [ ] 환경 변수 노출 안 됨 확인
- [ ] API 키 노출 안 됨 확인
- [ ] CORS 설정 확인
- [ ] RLS 정책 확인 (프로덕션)

### 9. 모니터링 설정

- [ ] 에러 로깅 확인
- [ ] 성능 모니터링 확인
- [ ] 알림 설정 확인 (선택 사항)

### 10. 문서 확인

- [ ] README.md 업데이트
- [ ] 환경 변수 문서 확인
- [ ] API 문서 확인 (필요 시)

## 배포 후 확인

### 즉시 확인
- [ ] 프로덕션 URL 접근 확인
- [ ] 메인 페이지 로드 확인
- [ ] 주요 기능 동작 확인

### 24시간 후 확인
- [ ] 에러 로그 확인
- [ ] 성능 지표 확인
- [ ] 사용자 활동 확인

### 1주일 후 확인
- [ ] 사용자 피드백 확인
- [ ] 성능 트렌드 분석
- [ ] 비용 모니터링

## 롤백 절차

문제 발생 시 롤백 방법:

1. Vercel Dashboard에서 이전 배포로 롤백
2. 환경 변수 확인
3. 데이터베이스 상태 확인
4. 문제 해결 후 재배포

## 연락처

배포 관련 문의:
- 기술 지원: [연락처 정보]
- 긴급 상황: [연락처 정보]

