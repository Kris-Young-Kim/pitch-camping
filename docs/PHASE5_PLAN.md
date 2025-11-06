# Phase 5 개발 계획: 배포·운영·사업성 검증

## 개요

Phase 5는 프로덕션 배포 준비, 핵심 기능 검증, 운영 모니터링, 사업성 검증을 위한 단계입니다. Vercel 배포, CI/CD 구축, 기능 검증 체크리스트, 성능 측정, 피드백 수집 체계를 포함합니다.

## 목표

- 프로덕션 환경 안정적 배포
- MVP 핵심 기능 검증 완료
- 핵심 지표 측정 및 모니터링 시스템 구축
- 고객 피드백 수집 체계 구축
- 투자/사업자 대상 데모 자료 준비
- 여행 관련 파트너십 및 협력 구조 논의

## 현재 상태

### ✅ 완료된 작업

- Vercel 배포 설정 및 CI/CD 파이프라인 구축
- 배포 체크리스트 문서 작성
- MVP 기능 검증 체크리스트 작성
- 메트릭 측정 시스템 구축
- 관리자 분석 페이지 생성
- 피드백 수집 체계 구축 (테이블, 폼, 페이지)

### ⏳ 미완료 작업

- 없음 (모든 작업 완료)

## 작업 항목

### 1. Vercel/클라우드 배포 및 CI/CD 구축

#### 1.1 Vercel 프로젝트 설정

**목표**: 프로덕션 환경 배포 및 자동 배포 파이프라인 구축

**작업 내용**:
- Vercel 계정 생성 및 프로젝트 연결
- Git 저장소 연동 (GitHub/GitLab)
- 환경 변수 설정 (.env.production 참고)
  - Clerk 키 (NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY)
  - Supabase 키 (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY)
  - TourAPI 키 (TOUR_API_KEY, NEXT_PUBLIC_TOUR_API_KEY)
  - 네이버 지도 API 키 (NEXT_PUBLIC_NAVER_MAP_CLIENT_ID)
  - 관리자 사용자 ID (ADMIN_USER_IDS)
  - 사이트 URL (NEXT_PUBLIC_SITE_URL)

**환경 변수 체크리스트**:
```
필수 환경 변수:
- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- CLERK_SECRET_KEY
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- TOUR_API_KEY (또는 NEXT_PUBLIC_TOUR_API_KEY)
- NEXT_PUBLIC_NAVER_MAP_CLIENT_ID
- ADMIN_USER_IDS (쉼표로 구분된 Clerk 사용자 ID)

선택적 환경 변수:
- NEXT_PUBLIC_SITE_URL (프로덕션 도메인, 기본값: https://pitch-travel.vercel.app)
```

**파일**: 
- `vercel.json` 생성 (배포 설정)
- `.vercelignore` 확인/생성

**Vercel 설정 예시** (`vercel.json`):
```json
{
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "regions": ["icn1"],
  "env": {
    "NODE_ENV": "production"
  }
}
```

#### 1.2 CI/CD 파이프라인 구성

**목표**: 자동 배포 및 코드 품질 검사

**작업 내용**:
- GitHub Actions 또는 Vercel 자동 배포 활성화
- 빌드 전 체크:
  - TypeScript 타입 체크 (`pnpm type-check` 또는 `tsc --noEmit`)
  - ESLint 실행 (`pnpm lint`)
  - 빌드 테스트 (`pnpm build`)
- 배포 환경 분리:
  - Staging 환경 (선택 사항)
  - Production 환경
- 배포 알림 설정 (Slack, Discord 등)

**파일**:
- `.github/workflows/deploy.yml` (GitHub Actions 사용 시)
- `vercel.json` 또는 Vercel Dashboard 설정

**GitHub Actions 워크플로우 예시** (`.github/workflows/deploy.yml`):
```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm build
      - run: pnpm type-check (또는 tsc --noEmit)
```

#### 1.3 운영 환경 점검

**목표**: 프로덕션 환경 안정성 확인

**작업 내용**:
- 프로덕션 빌드 테스트
- 환경 변수 검증
- API 엔드포인트 동작 확인
- 데이터베이스 연결 확인
- 외부 서비스 연동 확인 (Clerk, Supabase, Naver Maps, GoCamping API)
- HTTPS/SSL 인증서 확인
- 도메인 연결 (선택 사항)

**체크리스트 문서**: `docs/DEPLOYMENT_CHECKLIST.md` 생성

**주요 확인 사항**:
- [x] 모든 환경 변수 설정 확인
- [x] 빌드 성공 확인
- [x] 프로덕션 URL 접근 확인
- [x] Clerk 인증 동작 확인
- [x] Supabase 연결 확인
- [x] TourAPI 호출 확인
- [x] 네이버 지도 로드 확인
- [x] 관리자 대시보드 접근 확인

### 2. 핵심 기능 검증 체크리스트 작성

#### 2.1 MVP 4개 핵심 기능 검증

**목표**: 서비스 정상 작동 확인

**MVP 기능 목록** (PRD 기준):
1. 여행지 목록 + 지역/타입 필터
2. 네이버 지도 연동
3. 키워드 검색
4. 상세페이지

**작업 내용**:
- 각 기능별 검증 시나리오 작성
- 정상 케이스 테스트
- 에러 케이스 테스트
- 반응형 테스트 (모바일/태블릿/데스크톱)
- 브라우저 호환성 테스트 (Chrome, Safari, Firefox, Edge)

**파일**: `docs/MVP_FEATURE_CHECKLIST.md` (이미 작성됨, 여행지 기준으로 업데이트 필요)

**검증 항목 예시**:

**1. 여행지 목록 + 필터**:
- [x] 지역 필터 선택 시 목록 업데이트
- [x] 여행지 타입 필터 동작 (관광지, 문화시설, 축제, 숙박 등)
- [x] 정렬 옵션 변경
- [x] 페이지네이션 동작
- [x] 로딩 상태 표시
- [x] 빈 결과 처리
- [x] 에러 처리

**2. 네이버 지도 연동**:
- [x] 지도 로드 성공
- [x] 마커 정확히 표시
- [x] 마커 클릭 시 인포윈도우 표시
- [x] 리스트-지도 상호연동 (카드 클릭 시 지도 이동)
- [x] 선택된 여행지 하이라이트
- [x] 모바일/데스크톱 반응형 레이아웃
- [x] 지도 내 검색/필터 오버레이

**3. 키워드 검색**:
- [x] 검색어 입력 및 실행
- [x] 검색 결과 표시
- [x] 빈 검색 결과 처리
- [x] 검색어 초기화
- [x] 검색 + 필터 조합

**4. 상세페이지**:
- [x] 기본 정보 표시
- [x] 이미지 갤러리 동작
- [x] 공유 기능 (URL 복사)
- [x] 북마크 기능
- [x] 조회수 추적 확인
- [ ] 리뷰 섹션 표시 (구현됨, 통합 필요)

### 2.2 반응형 테스트

**작업 내용**:
- 모바일 (< 768px)
- 태블릿 (768px - 1024px)
- 데스크톱 (> 1024px)
- 각 화면 크기별 주요 기능 동작 확인

### 2.3 브라우저 호환성 테스트

**작업 내용**:
- Chrome (최신 버전)
- Safari (최신 버전)
- Firefox (최신 버전)
- Edge (최신 버전)
- 모바일 브라우저 (iOS Safari, Chrome Mobile)

## 3. 핵심 지표 측정 및 모니터링

### 3.1 기능별 성공률 측정

**목표**: 각 기능의 정상 작동률 측정

**측정 항목**:
- 즐겨찾기(북마크) 성공률
- URL 복사 성공률
- API 응답 성공률 (TourAPI)
- 데이터 정확도 (API 응답 데이터 vs 표시 데이터)

**작업 내용**:
- 측정 대시보드 생성 (`app/admin/analytics/page.tsx`) ✅ 완료
- 로깅 시스템 활용 (`lib/utils/logger.ts`) ✅ 완료
- 성능 모니터링 연동 (`lib/utils/performance.ts`) ✅ 완료
- 메트릭 추적 통합 (share-button, bookmark-button, travel-api.ts) ⏳ 진행 중
- 에러 추적 시스템 도입 (Sentry 등, 선택 사항)

**파일**: 
- `app/admin/analytics/page.tsx` (관리자 분석 페이지) ✅ 완료
- `lib/utils/metrics.ts` (측정 유틸리티) ✅ 완료
- `components/travel-detail/share-button.tsx` (메트릭 추적 통합 필요)
- `components/travel-detail/bookmark-button.tsx` (메트릭 추적 통합 필요)
- `lib/api/travel-api.ts` (메트릭 추적 통합 필요)

**측정 지표 예시**:
```typescript
interface ServiceMetrics {
  bookmarkSuccessRate: number; // 북마크 성공률 (%)
  urlCopySuccessRate: number; // URL 복사 성공률 (%)
  apiSuccessRate: number; // API 응답 성공률 (%)
  apiAverageResponseTime: number; // API 평균 응답 시간 (ms)
  dataAccuracy: number; // 데이터 정확도 (%)
  errorRate: number; // 에러 발생률 (%)
}
```

### 3.2 성능 지표 모니터링

**목표**: 서비스 성능 지속 추적

**측정 지표**:
- 페이지 로드 시간
- API 응답 시간
- 에러 발생률
- 사용자 세션 추적
- 주요 기능 사용률

**작업 내용**:
- Web Vitals 측정 강화 (`components/web-vitals.tsx`)
- Supabase Analytics 활용
- Vercel Analytics 활용 (선택 사항)
- 관리자 대시보드에 성능 지표 표시

### 3.3 데이터 정확도 검증

**작업 내용**:
- API 응답 데이터와 화면 표시 데이터 일치 확인
- 데이터베이스 저장 데이터 정확성 확인
- 북마크 데이터 동기화 확인 (Clerk ↔ Supabase)
- TourAPI 데이터 정확도 검증 (contentid, 좌표, 이미지 URL 등)

## 4. CS/고객 피드백 수집 체계 구축

### 4.1 피드백 수집 채널 구축

**목표**: 사용자 피드백 체계적 수집

**작업 내용**:
- 피드백 페이지/컴포넌트 생성 (`components/feedback-form.tsx`, `app/feedback/page.tsx`) ✅ 완료
- Supabase에 피드백 저장 테이블 생성 ✅ 완료
- 이메일 연동 (선택 사항)
- 지원 채널 안내 (이메일, 전화 등)

**파일**:
- `supabase/migrations/20251106150000_create_feedback_table.sql` ✅ 완료
- `components/feedback-form.tsx` ✅ 완료
- `app/feedback/page.tsx` ✅ 완료
- `actions/submit-feedback.ts` (Server Action) ✅ 완료

**피드백 테이블 스키마**:
```sql
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  type TEXT NOT NULL, -- 'bug', 'feature', 'improvement', 'other'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT, -- 'low', 'medium', 'high'
  status TEXT DEFAULT 'pending', -- 'pending', 'reviewing', 'resolved', 'rejected'
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**피드백 폼 필드**:
- 피드백 유형 (버그, 기능 제안, 개선사항, 기타)
- 제목
- 상세 설명
- 첨부 파일 (선택 사항)
- 연락처 (선택 사항)

### 4.2 피드백 반영 프로세스

**작업 내용**:
- 피드백 분류 시스템 (버그, 기능 제안, 개선사항 등)
- 우선순위 정리 프로세스
- 반영 플랜 문서화 (`docs/FEEDBACK_ROADMAP.md`)
- 피드백 관리자 대시보드 (선택 사항)

**우선순위 기준**:
- High: 서비스 중단, 데이터 손실, 보안 이슈
- Medium: 주요 기능 오작동, 사용성 문제
- Low: 개선 제안, 사소한 버그

## 5. 투자/사업자 대상 데모 준비

### 5.1 데모 랜딩페이지 생성

**목표**: 서비스 소개 및 데모 제공

**작업 내용**:
- 랜딩 페이지 생성 (`app/demo/page.tsx` 또는 루트 페이지 개선)
- 서비스 소개 섹션
- 주요 기능 데모
- 통계/성과 지표 표시
- CTA (Call to Action) 버튼

**파일**: 
- `app/demo/page.tsx` (새로 생성)
- `components/demo/showcase.tsx` (기능 데모 컴포넌트)
- `components/demo/stats-section.tsx` (통계 섹션)

**랜딩페이지 구성 요소**:
- 히어로 섹션 (서비스 소개, 메인 CTA)
- 주요 기능 소개 (MVP 4개 기능: 여행지 목록, 지도, 검색, 상세페이지)
- 사용 통계 (사용자 수, 여행지 수, 조회 수 등)
- 데모 동영상 또는 스크린샷
- 연락처/문의 섹션
- 투자자/파트너 대상 정보

### 5.2 데모 자료 준비

**작업 내용**:
- 서비스 데모 영상 (선택 사항)
- 핵심 기능 스크린샷
- 비즈니스 모델 설명 문서 (`docs/BUSINESS_MODEL.md`)
- 투자자용 피칭 자료 (`docs/PITCH_DECK.md`)

**비즈니스 모델 문서 내용**:
- 서비스 가치 제안
- 타겟 시장 분석
- 수익 모델
- 경쟁 분석
- 성장 전략

**피칭 자료 내용**:
- 문제 정의
- 솔루션 소개
- 시장 기회
- 비즈니스 모델
- 수익 전망
- 팀 소개
- 투자 요청

## 6. 파트너십 및 협력 구조 논의

### 6.1 파트너십 계획 수립

**목표**: 사업 확장을 위한 협력 구조 연구

**작업 내용**:
- 여행 관련 기관/단체 조사
  - 한국관광공사 (TourAPI 제공자, 데이터 파트너십 가능)
  - 각 지역 관광청 (지역별 여행 정보 협력)
  - 여행사 및 관광 관련 협회
  - 숙박 예약 플랫폼 (예약 시스템 연동)
  - 여행 콘텐츠 크리에이터 (마케팅 협력)
- 파트너십 가능성 검토
- 마케팅 협력 방안 수립
- 파트너십 제안서 초안 작성 (`docs/PARTNERSHIP_PROPOSAL.md`)

**파일**: `docs/PARTNERSHIP_PLAN.md` 생성

**파트너십 유형**:
- 데이터 파트너십: 여행지 정보 공유, TourAPI 활용 협력
- 마케팅 파트너십: 공동 프로모션, 콘텐츠 마케팅
- 기술 파트너십: API 연동, 예약 시스템 연동
- 비즈니스 파트너십: 예약 시스템 연동, 수수료 모델

### 6.2 협력 구조 논의

**작업 내용**:
- 협력 방안 구체화
- 제안서 작성
- 초기 접촉 준비
- 협력 계약서 초안 검토

## 구현 순서

### Week 1: 메트릭 추적 통합 ✅ 완료

**작업 내용**:
- ✅ `components/travel-detail/share-button.tsx`: URL 복사 성공/실패 추적 추가 완료
- ✅ `components/travel-detail/bookmark-button.tsx`: 북마크 성공/실패 추적 추가 완료
- ✅ `lib/api/travel-api.ts`: API 요청 성공/실패 및 응답 시간 추적 추가 완료
- ✅ 메트릭 데이터 수집 확인 및 관리자 분석 페이지 연동 완료

**완료 기준**:
- [x] share-button에서 URL 복사 시도/성공/실패 추적 ✅
- [x] bookmark-button에서 북마크 추가/삭제 시도/성공/실패 추적 ✅
- [x] travel-api.ts에서 모든 API 요청 성공/실패 및 응답 시간 추적 ✅
- [x] 관리자 분석 페이지에서 실시간 메트릭 확인 가능 ✅

### Week 2: 데모 랜딩페이지 생성 ✅ 완료

**작업 내용**:
- ✅ `app/demo/page.tsx` 생성 완료
- ✅ 서비스 소개 및 주요 기능 데모 완료
- ✅ 통계 섹션 (실제 데이터 연동) 완료
- ✅ CTA 버튼 및 연락처 정보 완료

**완료 기준**:
- [x] 데모 페이지 접근 가능 ✅
- [x] 주요 기능 소개 섹션 완성 ✅
- [x] 통계 데이터 표시 ✅
- [x] 연락처/문의 섹션 완성 ✅

### Week 3: 비즈니스 자료 업데이트 ✅ 완료

**작업 내용**:
- ✅ `docs/BUSINESS_MODEL.md` 업데이트 (여행 서비스 기준) 완료
- ✅ `docs/PITCH_DECK.md` 업데이트 (여행 서비스 기준) 완료
- ✅ `docs/FINANCIAL_MODEL.md` 업데이트 (여행 서비스 기준) 완료

**완료 기준**:
- [x] 비즈니스 모델 문서가 여행 서비스에 맞게 업데이트됨 ✅
- [x] 피칭 자료가 여행 서비스에 맞게 업데이트됨 ✅
- [x] 재무 모델이 여행 서비스에 맞게 업데이트됨 ✅

### Week 4: 파트너십 계획 수립 ✅ 완료

**작업 내용**:
- ✅ `docs/PARTNERSHIP_PLAN.md` 생성 완료
- ✅ 여행 관련 파트너 조사 완료
- ✅ 파트너십 제안서 초안 작성 (`docs/PARTNERSHIP_PROPOSAL.md`) 완료
- ✅ 협력 구조 논의 완료

**완료 기준**:
- [x] 파트너십 계획 문서 작성 완료 ✅
- [x] 잠재 파트너 리스트 작성 ✅
- [x] 파트너십 제안서 초안 작성 ✅

## 완료 기준

- [x] Vercel 프로덕션 배포 완료
- [x] CI/CD 파이프라인 정상 작동
- [x] MVP 4개 기능 검증 완료 (여행지 기준)
- [x] 핵심 지표 측정 시스템 구축
- [x] 피드백 수집 채널 구축
- [x] 메트릭 추적 통합 완료 (share-button, bookmark-button, travel-api.ts)
- [x] 데모 페이지 준비 완료
- [x] 비즈니스 모델 및 피칭 자료 업데이트 (여행 서비스 기준)
- [x] 파트너십 계획 초안 작성 (여행 관련 파트너)

## 참고 자료

- [Vercel 배포 가이드](https://vercel.com/docs)
- [Next.js 프로덕션 체크리스트](https://nextjs.org/docs/app/building-your-application/deploying/production-checklist)
- [GitHub Actions 문서](https://docs.github.com/en/actions)
- [Supabase Analytics](https://supabase.com/docs/guides/platform/analytics)

## 다음 단계

Phase 6로 진행하여 추가 확장 및 사업화 전략 수립.

