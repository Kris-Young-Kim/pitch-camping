# Phase 3 개발 계획: 사업화·운영 확장

## 개요

Phase 3은 MVP 기능 완성 후 프로덕션 배포 및 운영을 위한 인프라 강화 단계입니다. 데이터베이스 보안, 통계 시스템, 리뷰 기능, 모니터링, 성능 최적화를 포함합니다.

## 현재 상태

### 이미 완료된 작업

- ✅ RLS 보안 정책 설계 및 문서화
- ✅ 통계 테이블 생성 (travel_stats, user_activity)
- ✅ 조회수 추적 시스템 (analytics.ts)
- ✅ 인기도/랭킹 계산 시스템 (ranking.ts)
- ✅ 관리자 KPI 대시보드 (app/admin/dashboard/page.tsx)
- ✅ 리뷰 테이블 생성 (reviews, review_helpful)
- ✅ API Rate Limit 핸들러 구현
- ✅ 폴백 로직 구현
- ✅ 로깅 시스템 구현
- ✅ 성능 모니터링 구현
- ✅ 비용 추적 문서 작성

### 미완료 작업

- 없음 (모든 작업 완료)

## 목표

- 프로덕션 배포 준비 (RLS 보안 정책)
- 사용자 행동 분석 및 통계 시스템 구축
- 리뷰·평점 시스템 MVP 구현
- 운영 모니터링 대시보드 생성
- API 안정성 및 성능 최적화

## 작업 항목

### 1. 데이터베이스 보안 및 마이그레이션

#### 1.1 RLS 정책 설계 및 문서화

**파일**: `supabase/migrations/YYYYMMDDHHmmss_enable_rls_policies.sql`

**users 테이블 RLS 정책**:

- SELECT: 자신의 데이터만 조회 가능
- INSERT: 새 사용자 생성 가능
- UPDATE: 자신의 데이터만 수정 가능
- DELETE: 자신의 데이터만 삭제 가능 (선택적)

**bookmarks 테이블 RLS 정책**:

- SELECT: 자신의 북마크만 조회 가능
- INSERT: 자신의 북마크만 추가 가능
- DELETE: 자신의 북마크만 삭제 가능

**참고**: 개발 환경에서는 RLS를 비활성화하되, 프로덕션 배포 전 정책을 검토하고 테스트

#### 1.2 데이터 품질 점검 스크립트

**파일**: `scripts/check-data-quality.ts`

**검사 항목**:

- 북마크 데이터 무결성 검사
- 사용자 데이터 정합성 확인
- 중복 데이터 검증
- NULL 값 및 제약조건 위반 확인

### 2. 통계/랭킹/인기도 시스템

#### 2.1 통계 테이블 생성 ✅

**파일**: `supabase/migrations/20251106210358_create_travel_stats_table.sql`

**travel_stats 테이블**:

```sql
CREATE TABLE travel_stats (
  content_id TEXT PRIMARY KEY,
  view_count INTEGER DEFAULT 0,
  bookmark_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**참고**: content_id는 TourAPI의 contentid를 사용합니다.

**user_activity 테이블**:

```sql
CREATE TABLE user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  content_id TEXT NOT NULL,
  activity_type TEXT NOT NULL, -- 'view', 'bookmark', 'share'
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**인덱스**:

- `travel_stats(content_id)`
- `travel_stats(view_count DESC)`
- `travel_stats(bookmark_count DESC)`
- `user_activity(user_id, created_at DESC)`
- `user_activity(content_id, activity_type)`

#### 2.2 조회수 추적 시스템 ✅

**파일**: `lib/api/analytics.ts`

**기능**:

- 여행지 상세페이지 조회 시 통계 업데이트
- Server Action으로 구현 (`actions/track-view.ts`)
- 클라이언트에서 직접 호출하지 않고 서버 사이드에서 처리
- travel_stats 테이블에 조회수 증가
- user_activity 테이블에 활동 기록

**파일**: `app/travels/[contentId]/page.tsx` 수정

- 상세페이지 로드 시 `trackView` Server Action 호출

#### 2.3 인기도/랭킹 계산 ✅

**파일**: `lib/utils/ranking.ts`

**기능**:

- 인기도 점수 계산 함수 (조회수, 북마크 수 가중치)
- 랭킹 조회 함수 (지역별, 타입별)
- 주기적 업데이트 (Cron Job 또는 Edge Function)

#### 2.4 통계 API 엔드포인트

**파일**: `app/api/stats/route.ts` (또는 Server Actions)

**기능**:

- 인기 여행지 조회
- 지역별 통계
- 타입별 통계 (관광지, 문화시설, 축제, 숙박 등)
- 조회수, 북마크 수, 공유 수 기반 랭킹

### 3. 리뷰·평점 시스템 MVP

#### 3.1 리뷰 테이블 설계

**파일**: `supabase/migrations/YYYYMMDDHHmmss_create_reviews_table.sql`

**reviews 테이블**:

```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_id TEXT NOT NULL,  -- TourAPI의 contentid
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_user_review UNIQUE(user_id, content_id)
);
```

**참고**: content_id는 TourAPI의 contentid를 사용합니다.

**review_helpful 테이블** (선택적):

```sql
CREATE TABLE review_helpful (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_review_helpful UNIQUE(review_id, user_id)
);
```

#### 3.2 리뷰 API 및 컴포넌트

**파일**: `lib/api/reviews.ts`

- 리뷰 작성, 수정, 삭제
- 리뷰 목록 조회
- 평균 평점 계산
- 리뷰 도움됨 기능

**파일**: `components/travel-detail/review-section.tsx`

- 리뷰 목록 표시
- 리뷰 작성 폼
- 평점 표시 (별점)
- 평점 분포 차트 (선택적)

**파일**: `components/travel-detail/review-card.tsx`

- 개별 리뷰 카드 컴포넌트
- 리뷰 도움됨 버튼
- 리뷰 수정/삭제 기능 (작성자만)

**파일**: `app/travels/[contentId]/page.tsx` 수정

- 리뷰 섹션 추가

#### 3.3 TourAPI 리뷰 데이터 통합 (선택적)

**참고**: TourAPI는 리뷰 데이터를 제공하지 않으므로, 자체 DB 리뷰 시스템만 사용합니다.

### 4. 서비스 운영 KPI 대시보드

#### 4.1 관리자 대시보드 페이지 ✅

**파일**: `app/admin/dashboard/page.tsx`

**기능**:

- 접근 제어: 관리자 권한 확인 (Clerk role 기반 또는 환경변수 ADMIN_USER_IDS)
- 주요 지표 표시:
  - 총 사용자 수
  - 총 여행지 조회 수
  - 총 북마크 수
  - 총 리뷰 수
  - 인기 여행지 TOP 10
  - 지역별 통계
  - 타입별 통계 (관광지, 문화시설, 축제, 숙박 등)

#### 4.2 통계 컴포넌트

**파일**: `components/admin/stats-card.tsx`

- 통계 카드 컴포넌트 (재사용 가능)

**파일**: `components/admin/popular-travels.tsx`

- 인기 여행지 목록
- 조회수, 북마크 수, 리뷰 수 표시

**파일**: `components/admin/user-growth-chart.tsx`

- 사용자 증가 추이 (선택적, 차트 라이브러리 필요)

#### 4.3 Server Actions

**파일**: `actions/admin-stats.ts`

- 관리자 통계 조회 Server Actions
- 인증 및 권한 확인

### 5. 클라우드 인프라/비용 모니터링

#### 5.1 로깅 시스템

**파일**: `lib/utils/logger.ts`

- 구조화된 로깅 유틸리티
- 에러, 경고, 정보 로그 분리
- 프로덕션: Vercel Logs 연동

#### 5.2 성능 모니터링

**파일**: `lib/utils/performance.ts`

- API 응답 시간 측정
- 페이지 로드 시간 추적
- Web Vitals 측정 (선택적)

#### 5.3 비용 추적

**문서**: `docs/COST_TRACKING.md`

- Vercel 사용량 모니터링
- Supabase 사용량 추적
- 네이버 지도 API 호출 수 추적
- 월별 비용 예상치 문서화

### 6. API Rate Limit/품질 이슈 대응

#### 6.1 Rate Limit 감지 및 처리

**파일**: `lib/api/rate-limit-handler.ts`

- API 응답 상태 코드 확인 (429 Too Many Requests)
- Rate Limit 도달 시 대기 후 재시도
- Exponential backoff 구현

**파일**: `lib/api/travel-api.ts` 수정

- rate limit 핸들러 통합
- 에러 타입 정의 및 처리
- TourAPI Rate Limit 대응

#### 6.2 캐싱 전략 강화

**파일**: `lib/api/travel-api.ts` 수정

- Next.js fetch 캐싱 옵션 추가 (`next: { revalidate }`)
  - 상세 정보: 6시간 캐시
  - 목록 조회: 1시간 캐시
- 캐시 태그 활용 (on-demand revalidation)

**참고**: `docs/CACHING_STRATEGY.md` 문서 참고하여 구현 (이미 travel-api.ts에 적용됨)

#### 6.3 폴백 로직

**파일**: `lib/api/fallback-handler.ts`

- API 호출 실패 시 캐시된 데이터 반환
- 오프라인 상태 감지 및 대응
- 에러 메시지 사용자 친화적 표시

**파일**: `components/travel-list.tsx` 수정

- 폴백 핸들러 통합
- TourAPI 호출 실패 시 캐시된 데이터 표시

## 구현 순서

✅ **모든 작업 완료**

1. ✅ **Week 1**: 통계 테이블 생성 및 업데이트 (travel_stats, user_activity)
2. ✅ **Week 2**: 통계 시스템 (조회수 추적, 인기도 계산)
3. ✅ **Week 3**: 리뷰 시스템 컴포넌트 업데이트 (travel-detail 경로로 이동)
4. ✅ **Week 4**: KPI 대시보드 및 모니터링
5. ✅ **Week 5**: API 안정성 강화 (Rate Limit, 폴백) 및 테스트

**참고**: 모든 작업이 완료되었습니다. RLS 정책, 리뷰 테이블, Rate Limit 핸들러, 폴백 로직, 로깅, 성능 모니터링, 통계 시스템, KPI 대시보드 모두 구현 완료.

## 주의사항

- RLS 정책은 프로덕션 배포 전 충분한 테스트 필요 (현재 개발 환경에서는 비활성화)
- 통계 데이터는 점진적으로 축적되므로 초기에는 샘플 데이터로 테스트
- 리뷰 시스템은 스팸 방지 로직 고려 (추후 확장)
- 관리자 대시보드 접근 권한은 Clerk role 기반 또는 환경변수 ADMIN_USER_IDS로 구현
- TourAPI Rate Limit은 실제 사용량 모니터링 후 조정
- travel_stats 테이블은 기존 camping_stats 테이블을 마이그레이션하거나 새로 생성

## 성공 지표

- RLS 정책 적용 및 테스트 완료
- 통계 데이터 정확도 > 95%
- 리뷰 시스템 안정성 (에러율 < 1%)
- API 호출 성공률 > 98% (Rate Limit 대응 포함)
- 대시보드 로드 시간 < 2초

## 다음 단계

Phase 4로 진행하여 UI/UX 개선 및 접근성 강화.
