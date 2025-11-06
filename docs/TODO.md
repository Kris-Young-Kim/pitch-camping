# TODO.md – 캠핑장 정보 서비스(Pitch Camping)

---

## 목적과 비전

고캠핑 API를 활용한 캠핑장 정보 서비스 사업화 준비를 위한 실전 TODO. 모든 단계는 품질, 사용자 경험, 확장성을 최우선으로 한다. 단순 MVP를 넘어 사업 성공 기반을 마련하는 개발·운영·사업화 실천 계획이다.

---

## [Phase 1] 프로젝트 셋업 및 공통 인프라

- [x] Next.js 기반 프로젝트 세팅 (버전: 15.x, App Router)
- [x] 필수 패키지 설치: React, TypeScript, TailwindCSS(v4), shadcn/ui, lucide-react, Supabase client
- [x] 환경변수 관리: .env, 보안 적합성 확인
- [x] 공공 API 인증키 적용, API 모듈 구조 설계 (lib/api/camping-api.ts)
- [x] Supabase DB 구조 설계 (bookmarks·user·review 등 확장성 반영)
- [x] Clerk 연동, 유저 인증 플로우 기본 구현
- [ ] UI디자인 초안: 직원 및 투자자 대상 피드백 회의
- [ ] 오너/팀원의 사업 아이디어 피칭 & 최종 비전 검토

### Phase 1 완료 상세

- [x] TypeScript 타입 정의 (`types/camping.ts`)
  - CampingSite, CampingSiteDetail, CampingFacility, CampingFilter 타입 정의
- [x] 고캠핑 API 클라이언트 (`lib/api/camping-api.ts`)
  - CampingApiClient 클래스 구현
  - getCampingList(), getCampingDetail(), searchCamping() 메서드
- [x] 캠핑장 관련 상수 정의 (`constants/camping.ts`)
  - 캠핑 타입, 지역, 시설, 정렬 옵션 상수
- [x] 유틸리티 함수 (`lib/utils/camping.ts`)
  - KATEC → WGS84 좌표 변환
  - 전화번호, 주소, 홈페이지 포맷팅
  - 필터링 및 검색 유틸리티
- [x] Supabase 마이그레이션 파일 생성
  - bookmarks 테이블 스키마 및 주석 업데이트 (캠핑장 기준)
- [x] 메타데이터 업데이트 (`app/layout.tsx`)
  - Pitch Camping 서비스명 및 Open Graph 메타데이터 추가
- [x] 홈페이지 업데이트 (`app/page.tsx`)
  - 캠핑장 서비스에 맞는 랜딩 페이지로 변경

---

## [Phase 2] 핵심 기능 MVP 개발

### 2.1 캠핑장 목록

- [x] 시/도·시군구·캠핑 타입·시설·정렬·페이지네이션 등 필터 기능 구현
- [x] 반응형 카드/그리드 UI: 모바일→데스크톱 최적화
- [x] API 데이터 캐싱 전략 수립 (성능·비용 고려) - [캐싱 전략 문서](./CACHING_STRATEGY.md) 참고
- [x] 오류·빈값 graceful UX 처리
- [x] 목록 썸네일·시설 아이콘·타입 뱃지 표시, SEO/마크업 접근성 보장

### 2.2 지도 연동

- [x] Naver Maps v3 지도 연동·최적화 (좌표계 변환 포함)
- [x] 지역·캠핑장 중심 좌표 설정, 타입별 마커 디자인
- [x] 리스트-지도 상호연동 및 반응형 UI 구성
- [ ] 지도 내 검색·필터·정렬 경험 개선
- [x] 마커 인포윈도우, 길찾기/현재위치 UX

### 2.3 키워드 검색

- [x] 검색창·자동완성 도입, 사용자 행동 데이터 로깅
- [x] 검색 API 연동, 성능 튜닝 (응답지연 대비 UX)
- [x] 결과 없음·에러 메시지/로딩 스피너
- [x] 필터+검색 복합 결과 UX
- [x] API 데이터 캐싱 전략 수립 완료 - [캐싱 전략 문서](./CACHING_STRATEGY.md) 참고

### 2.4 상세페이지

- [x] 기본 정보/운영/갤러리/지도/공유·북마크 섹션별 컨포넌트화
- [x] 주소 복사, 전화걸기, 홈페이지 링크 등 사용자 행동 흐름 설계
- [x] 이미지 목록·대표 썸네일·슬라이드 모달 UX
- [x] Open Graph 메타태그 동적 구성, SNS/카카오·네이버 공유 테스트
- [x] 북마크 기능: Supabase와 인증 폴백 구조(localStorage)
- [x] 즐겨찾기 테이블 설계, 로그인 UX 개선

### Phase 2 완료 상세

- [x] 필터 컴포넌트 (`components/camping-filters.tsx`)
  - 지역, 캠핑 타입, 시설 필터 및 정렬 옵션 구현
  - URL 쿼리 파라미터 연동
- [x] 캠핑장 카드 컴포넌트 (`components/camping-card.tsx`)
  - 썸네일 이미지, 캠핑장명, 주소, 타입 뱃지, 시설 아이콘 표시
  - 반응형 디자인, 클릭 시 상세페이지 이동
- [x] 캠핑장 목록 컴포넌트 (`components/camping-list.tsx`)
  - 그리드 레이아웃 (반응형), API 연동
  - 로딩 상태 (Skeleton UI), 에러 처리, 빈 결과 처리
  - 페이지네이션 구현
- [x] 홈페이지 통합 (`app/page.tsx`)
  - 필터와 목록 컴포넌트 통합
  - URL 쿼리 파라미터 기반 필터 상태 관리
- [x] 검색 컴포넌트 (`components/camping-search.tsx`)
  - 검색창, 엔터 키 또는 버튼으로 검색 실행
  - 검색어 초기화 기능
- [x] 검색 기능 통합
  - 홈페이지에 검색창 통합, 필터와 검색 조합
- [x] 상세페이지 기본 구조 (`app/campings/[contentId]/page.tsx`)
  - 동적 라우팅, 고캠핑 API 상세 정보 조회
  - 기본 정보 표시 (이름, 이미지, 주소, 전화번호, 홈페이지, 소개)
  - 동적 메타데이터 생성 (Open Graph 포함)
- [x] 네이버 지도 연동 (`components/naver-map.tsx`)
  - Naver Maps JavaScript API v3 (NCP) 연동
  - 좌표 변환 (KATEC → WGS84)
  - 캠핑장 마커 표시 및 인포윈도우
  - 리스트-지도 상호연동 (카드 클릭 시 지도 이동)
  - 반응형 레이아웃 (데스크톱: 분할, 모바일: 탭 전환)
- [x] 이미지 갤러리 (`components/camping-detail/detail-gallery.tsx`)
  - 대표 이미지 및 서브 이미지 썸네일 표시
  - 이미지 클릭 시 전체화면 모달
  - 이미지 슬라이드 기능 (이전/다음 버튼)
- [x] 공유 버튼 (`components/camping-detail/share-button.tsx`)
  - URL 클립보드 복사 기능
  - 복사 완료 상태 표시
- [x] 북마크 버튼 (`components/camping-detail/bookmark-button.tsx`)
  - 인증된 사용자: Supabase bookmarks 테이블에 저장
  - 비인증 사용자: localStorage에 임시 저장
  - 북마크 상태 표시 (별 아이콘)
- [x] 상세페이지 통합 (`app/campings/[contentId]/page.tsx`)
  - 이미지 갤러리, 공유 버튼, 북마크 버튼 통합

---

## [Phase 3] 사업화·운영 확장

- [x] Supabase DB 마이그레이션, RLS 보안정책 설정, 데이터 품질 점검
- [x] 통계/랭킹/인기도·사용자 기록 저장 구조 추가
- [x] 리뷰·평점 MVP 설계(공공 API+자체 DB)
- [x] 서비스 운영 KPI 대시보드 만들기
- [x] 클라우드 인프라/비용 모니터링·성능 최적화
- [x] API Rate Limit/품질 이슈 캐시·폴백 로직

### Phase 3 완료 상세

- [x] 통계 테이블 생성 (`supabase/migrations/20251106140000_create_statistics_tables.sql`)
  - camping_stats: 캠핑장별 통계 (조회수, 북마크 수, 공유 수)
  - user_activity: 사용자 활동 기록 (조회, 북마크, 공유)
  - 북마크 트리거로 bookmark_count 자동 업데이트
- [x] RLS 보안 정책 설계 (`supabase/migrations/20251106140001_design_rls_policies.sql`)
  - users, bookmarks, camping_stats, user_activity 테이블 RLS 정책 설계
  - 프로덕션 배포 전 적용 준비 완료
- [x] 조회수 추적 시스템 (`lib/api/analytics.ts`)
  - trackView(): 캠핑장 상세페이지 조회수 증가
  - trackActivity(): 사용자 활동 기록
  - getCampingStats(): 통계 데이터 조회
- [x] 인기도/랭킹 계산 시스템 (`lib/utils/ranking.ts`)
  - calculatePopularityScore(): 인기도 점수 계산
  - getPopularCampings(): 인기 캠핑장 목록 조회
  - 지역별/타입별 필터링 준비
- [x] 리뷰 테이블 생성 (`supabase/migrations/20251106140002_create_reviews_table.sql`)
  - reviews: 리뷰 및 평점 (1-5점)
  - review_helpful: 리뷰 도움됨 표시
  - 평균 평점/리뷰 개수 조회 함수
- [x] 리뷰 API 및 컴포넌트 (`lib/api/reviews.ts`, `components/camping-detail/review-section.tsx`)
  - 리뷰 작성, 수정, 삭제
  - 리뷰 목록 조회 (평점 분포 포함)
  - 리뷰 도움됨 기능
  - 상세페이지 리뷰 섹션 통합
- [x] API Rate Limit 핸들러 (`lib/api/rate-limit-handler.ts`)
  - Rate Limit 감지 (429 에러)
  - Exponential backoff 재시도
  - Rate Limit 정보 캐싱
- [x] 폴백 로직 (`lib/api/fallback-handler.ts`)
  - API 실패 시 캐시된 데이터 반환
  - 오프라인 상태 감지
  - 사용자 친화적 에러 메시지
- [x] 관리자 KPI 대시보드 (`app/admin/dashboard/page.tsx`)
  - 관리자 권한 확인 (환경변수 ADMIN_USER_IDS)
  - 주요 지표 표시 (사용자 수, 조회 수, 북마크 수, 리뷰 수)
  - 인기 캠핑장 TOP 10 테이블
  - 통계 카드 컴포넌트 (재사용 가능)
- [x] 로깅 시스템 (`lib/utils/logger.ts`)
  - 구조화된 로깅 (info, warn, error, debug)
  - 프로덕션 환경 JSON 포맷, 개발 환경 콘솔 출력
  - API 요청, 사용자 활동, 성능 메트릭, 비용 추적 로그
- [x] 성능 모니터링 (`lib/utils/performance.ts`)
  - API 응답 시간 측정
  - 페이지 로드 시간 추적
  - 메모리 사용량 측정
  - 성능 임계값 체크 및 경고
- [x] Next.js fetch 캐싱 적용
  - 캠핑장 상세: 6시간 캐시
  - 캠핑장 목록: 1시간 캐시
- [x] 비용 추적 문서 (`docs/COST_TRACKING.md`)
  - 서비스별 비용 구조 및 예상 비용
  - 비용 모니터링 방법
  - 비용 절감 전략 체크리스트

---

## [Phase 4] UI/UX·접근성·최적화

- [x] 시각적 브랜딩·컬러스킴 다크/라이트 모드 완벽 지원
- [x] 이미지·지도·목록·에러·로딩 상태별 세밀한 Skeleton/스피너
- [x] ARIA, 키보드/스크린리더 지원 등 접근성 전수 검사
- [x] 페이지 404/오프라인 안내·재시도 UX
- [x] SEO: sitemap, robots.txt, 동적 메타태그 구성
- [x] Lighthouse 점수 80+ 달성 준비 완료 (코드 레벨 최적화 완료, 실제 측정 필요)

### Phase 4 완료 상세

- [x] 테마 전환 UI 컴포넌트 (`components/theme-toggle.tsx`)
  - 라이트/다크/시스템 모드 전환 지원
  - DropdownMenu를 통한 테마 선택 UI
  - 접근성: ARIA 속성, 키보드 네비게이션 지원
- [x] ThemeProvider 통합 (`app/layout.tsx`)
  - next-themes ThemeProvider 추가
  - suppressHydrationWarning으로 하이드레이션 경고 방지
  - Skip to content 링크 추가 (접근성)
- [x] 스켈레톤 컴포넌트 생성 (`components/loading/`)
  - CardSkeleton: 캠핑 카드 로딩 UI
  - MapSkeleton: 지도 로딩 UI
  - ImageSkeleton: 이미지 로딩 UI (aspect-ratio 지원)
  - DetailSkeleton: 상세페이지 로딩 UI
  - 모든 스켈레톤에 접근성 속성 추가 (role="status", aria-label)
- [x] 로딩 상태 적용
  - CampingList: CardSkeleton 적용
  - NaverMap: MapSkeleton 적용
  - 로딩 상태에 스크린 리더 지원 (sr-only 텍스트)
- [x] 접근성 개선 (WCAG 2.1 AA 준수 목표)
  - CampingCard: aria-label, 포커스 스타일, 이미지 alt 텍스트 개선, 시설 목록 role 추가
  - CampingSearch: 라벨 연결, ARIA 속성 (aria-busy, aria-describedby), 로딩 상태 안내
  - CampingFilters: 필터 섹션 role="region", 체크박스 aria-label 추가
  - CampingList: 결과 개수 aria-live, 목록 role="list", 페이지네이션 nav 태그 및 aria-current
  - NaverMap: role="application", aria-hidden 속성 관리
  - 모든 버튼/링크에 포커스 링 스타일 적용
- [x] 키보드 네비게이션 지원
  - 전역 CSS에 :focus-visible 스타일 추가
  - 모든 인터랙티브 요소에 일관된 포커스 링 (ring-2 ring-primary)
  - Tab 순서 논리적 구성
- [x] 스크린 리더 지원
  - Skip to content 링크 추가 (app/layout.tsx)
  - 모든 아이콘에 aria-hidden="true" 추가
  - 숨김 텍스트 .sr-only 클래스 정의 및 적용
  - 로딩 상태, 에러 상태에 명확한 안내 메시지
- [x] 포커스 스타일 개선 (`app/globals.css`)
  - :focus-visible 전역 스타일 추가
  - .sr-only 유틸리티 클래스 정의
  - focus:not-sr-only 스타일 지원
- [x] 404 페이지 (`app/not-found.tsx`)
  - 캠핑 테마 디자인 (Tent 아이콘)
  - 명확한 에러 메시지 및 안내
  - 홈으로 가기, 캠핑장 검색 링크 제공
  - 접근성: 포커스 스타일, aria-label 적용
- [x] 동적 Sitemap 생성 (`app/sitemap.ts`)
  - Next.js 15 MetadataRoute.Sitemap 활용
  - 고캠핑 API를 통한 캠핑장 목록 조회
  - 각 캠핑장 상세페이지 URL 자동 생성
  - changeFrequency 및 priority 설정
- [x] Robots.txt 생성 (`app/robots.ts`)
  - 모든 검색 엔진 허용 (User-agent: \*)
  - /api/, /admin/ 경로 차단
  - Sitemap URL 지정
- [x] 성능 최적화 (`next.config.ts`, `app/layout.tsx`, `app/page.tsx`)
  - 이미지 최적화: WebP/AVIF 포맷 지원, 캐싱 설정, 고캠핑 API 도메인 추가
  - 폰트 최적화: display: swap 적용, 주요 폰트만 preload
  - 번들 최적화: NaverMap 동적 import, 코드 스플리팅 설정
  - 압축 및 보안 헤더 최적화 (compress: true, poweredByHeader: false)
- [x] Web Vitals 모니터링 (`components/web-vitals.tsx`)
  - LCP, CLS 측정 및 로깅
  - 성능 임계값 경고
  - 페이지 로드 시간 추적
- [x] Lighthouse 측정 가이드 작성 (`docs/LIGHTHOUSE_CHECKLIST.md`)
  - 측정 방법 안내
  - 최적화 체크리스트
  - 추가 최적화 권장사항

---

## [Phase 5] 배포·운영·사업성 검증

- [x] Vercel/클라우드 배포·CD, 실 운영 환경 점검
- [x] 핵심 기능 검증 체크리스트 작성(MVP 4개)
- [x] 즐겨찾기·URL복사·API 응답 성공률·데이터 정확도 측정
- [x] CS/고객 피드백 수집, 반영 플랜 수립
- [ ] 투자/사업자 대상 서비스 데모·랜딩페이지 공유
- [ ] 국내 캠핑 진흥/파트너십/마케팅 협력 구조 논의

### Phase 5 완료 상세

- [x] Vercel 배포 설정 (`vercel.json`)
  - 빌드/설치 명령어 설정
  - 리전 설정 (icn1)
  - 프로덕션 환경 변수 설정 가이드
- [x] CI/CD 파이프라인 구성 (`.github/workflows/deploy.yml`)
  - GitHub Actions 워크플로우 설정
  - 빌드 전 체크: lint, type-check, build
  - 자동 배포 준비 완료
- [x] 배포 체크리스트 문서 (`docs/DEPLOYMENT_CHECKLIST.md`)
  - 환경 변수 체크리스트
  - 빌드 및 코드 품질 확인
  - 데이터베이스 및 외부 서비스 연동 확인
  - 기능 동작 확인 체크리스트
  - 성능 및 보안 확인
  - 롤백 절차 문서화
- [x] MVP 기능 검증 체크리스트 (`docs/MVP_FEATURE_CHECKLIST.md`)
  - 캠핑장 목록 + 필터 검증 항목
  - 네이버 지도 연동 검증 항목
  - 키워드 검색 검증 항목
  - 상세페이지 검증 항목
  - 반응형 및 브라우저 호환성 테스트 항목
  - 성능 및 접근성 테스트 항목
- [x] 메트릭 측정 시스템 (`lib/utils/metrics.ts`)
  - 북마크 성공률 추적 함수
  - URL 복사 성공률 추적 함수
  - API 응답 성공률 및 응답 시간 추적 함수
  - 데이터 정확도 검증 함수
  - 전체 메트릭 계산 함수
- [x] 메트릭 추적 통합
  - `components/camping-detail/share-button.tsx`: URL 복사 성공/실패 추적 추가
  - `components/camping-detail/bookmark-button.tsx`: 북마크 성공/실패 추적 추가
  - `lib/api/camping-api.ts`: API 요청 성공/실패 및 응답 시간 추적 추가
- [x] 관리자 분석 페이지 (`app/admin/analytics/page.tsx`)
  - 기능별 성공률 표시 (북마크, URL 복사, API 응답)
  - 평균 API 응답 시간 표시
  - 데이터 정확도 및 에러 발생률 표시
  - 관리자 권한 확인 통합
- [x] 분석 데이터 조회 (`actions/get-analytics.ts`)
  - 서비스 메트릭 조회 Server Action
  - 관리자 권한 확인
  - 기본 통계 데이터 반환 (향후 확장 가능)
- [x] 피드백 저장 테이블 (`supabase/migrations/20251106150000_create_feedback_table.sql`)
  - 피드백 유형 (bug, feature, improvement, other)
  - 우선순위 및 상태 관리
  - 연락처 이메일 및 페이지 URL 저장
  - 인덱스 및 트리거 설정
- [x] 피드백 제출 기능 (`actions/submit-feedback.ts`)
  - 피드백 저장 Server Action
  - 인증/비인증 사용자 모두 지원
  - 현재 페이지 URL 및 브라우저 정보 자동 포함
- [x] 피드백 폼 컴포넌트 (`components/feedback-form.tsx`)
  - 피드백 유형 선택 (Select)
  - 제목 및 상세 설명 입력 (Textarea)
  - 연락처 이메일 입력 (선택 사항)
  - React Hook Form + Zod 유효성 검사
  - 접근성 속성 적용 (ARIA, 포커스 스타일)
- [x] 피드백 페이지 (`app/feedback/page.tsx`)
  - 피드백 폼 표시
  - 피드백 유형 안내
  - 처리 시간 안내
  - 연락처 정보 안내

---

## [Phase 6] 추가 확장 및 사업화 전략

- [x] 외부 API 조사 및 연동 계획 수립 (예약, 날씨, 교통, 광고)
- [x] 예약 시스템 연동 프로토타입 개발 (외부 링크/전화 방식)
- [ ] 광고·예약·날씨·교통 등 외부 인프라/데이터 연동계획 완료
- [x] 캠핑 안전 수칙 정보 제공 기능 추가
- [ ] 포인트·혜택·커뮤니티·마케팅 연동 확장 프로토타입
- [ ] D2C 상품/캠핑 연계 이커머스 테스트
- [x] 사업화·BM 피드백 반영, 조직 운영 구조 점검
- [x] 운영 체크리스트 작성
- [x] 비즈니스 모델 문서 업데이트 (`docs/BUSINESS_MODEL.md`)
- [x] 투자 자료 준비 (`docs/PITCH_DECK.md`, `docs/FINANCIAL_MODEL.md`)
- [ ] 투자유치/정부지원/파트너협업 준비

### Phase 6 진행 중 상세

- [x] Phase 6 계획서 작성 (`docs/PHASE6_PLAN.md`)
  - 외부 인프라 연동 계획
  - 포인트/커뮤니티 프로토타입 계획
  - 이커머스 및 결제 시스템 계획
  - 사업화 문서화 계획
  - 투자/파트너십 준비 계획
- [x] 외부 API 연동 계획 문서 작성 (`docs/EXTERNAL_API_INTEGRATION_PLAN.md`)
  - 예약, 날씨, 교통, 광고 시스템 연동 전략 문서화
  - API 조사 및 선택 기준 명시
  - 구현 우선순위 정리
- [x] 예약 시스템 연동 프로토타입 (`components/camping-detail/reservation-button.tsx`)
  - 홈페이지 링크를 통한 예약 기능
  - 전화번호를 통한 예약 기능
  - 예약 가능 여부 표시
  - 상세페이지에 예약 버튼 통합

### 캠핑 안전 수칙 정보 제공 기능

**참고**: [고캠핑 안전한캠핑즐기기](https://www.gocamping.or.kr/zboard/list.do?lmCode=campSafe)

**목표**: 사용자에게 캠핑 안전 수칙 정보를 제공하여 안전한 캠핑 문화 확산

**작업 내용**:

- [x] 안전 수칙 테이블 생성 (`supabase/migrations/20251106160000_create_safety_guidelines_table.sql`)
  - 계절별 안전 수칙 카테고리 (봄, 여름, 가을, 겨울)
  - 주제별 안전 수칙 분류 (식중독, 물놀이, 벌레, 야생동물, 이상기후, 난로, 가스 등)
  - 안전 수칙 제목, 내용, 이미지, 동영상 링크 저장
  - 조회수 추적 및 우선순위 관리
- [x] 안전 수칙 API 함수 생성 (`lib/api/safety-guidelines.ts`)
  - 계절별 안전 수칙 조회
  - 주제별 안전 수칙 조회
  - 안전 수칙 검색 기능
  - 현재 계절 기반 추천 기능
  - 조회수 증가 함수
- [x] 안전 수칙 API 라우트 생성 (`app/api/safety-guidelines/route.ts`)
  - 클라이언트 사이드에서 안전 수칙 조회 API
- [x] 안전 수칙 컴포넌트 생성 (`components/safety/`)
  - `safety-card.tsx`: 안전 수칙 카드 컴포넌트
  - `safety-guidelines.tsx`: 안전 수칙 목록 및 필터링 컴포넌트
  - `safety-video.tsx`: 안전 수칙 동영상 컴포넌트
  - `safety-recommendations.tsx`: 안전 수칙 추천 컴포넌트
- [x] 안전 수칙 페이지 생성 (`app/safety/page.tsx`, `app/safety/[id]/page.tsx`)
  - 안전 수칙 메인 페이지 (목록, 검색, 필터링)
  - 안전 수칙 상세 페이지
  - 계절별/주제별 탭 분류
  - 동영상 링크 통합
- [x] 상세페이지에 안전 수칙 통합 (`app/campings/[contentId]/page.tsx`)
  - 캠핑장 상세페이지에 관련 안전 수칙 추천 추가
  - 현재 계절 기반 안전 수칙 추천
- [x] 안전 수칙 문서 작성 (`docs/SAFETY_GUIDELINES_PLAN.md`)

  - 안전 수칙 수집 계획
  - 데이터 구조 설계
  - UI/UX 설계

- [x] 운영 체크리스트 작성 (`docs/OPERATIONS_CHECKLIST.md`)

  - 일일/주간/월간/분기별 체크리스트 작성
  - 비상 대응 체크리스트 작성
  - 모니터링 도구 및 알림 설정 가이드
  - 정기 점검 미팅 프로세스 문서화

- [x] 비즈니스 모델 문서 업데이트 (`docs/BUSINESS_MODEL.md`)

  - 서비스 가치 제안
  - 타겟 시장 분석
  - 수익 모델 (5가지 수익원)
  - 경쟁 분석 및 경쟁 우위
  - 성장 전략
  - 주요 지표 (KPIs)
  - 리스크 및 대응 전략
  - 피드백 반영 계획

- [x] 투자 자료 준비
  - 피칭 덱 작성 (`docs/PITCH_DECK.md`)
    - 문제 정의, 솔루션, 시장 기회
    - 제품 데모, 비즈니스 모델
    - 경쟁 분석, 수익 전망
    - 팀 소개, 로드맵, 투자 요청
  - 재무 모델 작성 (`docs/FINANCIAL_MODEL.md`)
    - 초기 투자 비용
    - 운영 비용 (인프라, 마케팅, 인건비)
    - 수익 추정 (5가지 수익원)
    - 손익 분기점 분석
    - 현금 흐름 프로젝션
    - 주요 가정 및 리스크

**우선순위**: Medium (사용자 안전 및 서비스 가치 제고)

**참고 데이터**:

- 고캠핑 안전 수칙 카테고리:
  - 계절별: 봄, 여름, 가을, 겨울
  - 주제별: 식중독, 물놀이, 벌레, 야생동물, 이상기후/자연재해, 폭염, 난로, 가스 사고, 일산화탄소 중독 등
  - 안전 교육: 안전 수칙 동영상, 세이프 캠프 툰

---

## 참고 체크리스트

- [ ] API 품질·속도, DB, 보안, 클라우드 비용 등 관리
- [ ] 사업화 및 BM 구조팀(오너, CTO, PO, 마케터, 디자이너) 역할 분담
- [ ] 매주/매월 점검 미팅 및 버전관리
- [ ] 서비스 성장, 확장, 업그레이드 로드맵 수립

---

> 진심을 담아 요구사항, 실전 운영, 사업화·확장까지 누락없이 기록.
> 사업 성공을 위한 MVP·팀워크·확장성 실질 행동계획.
