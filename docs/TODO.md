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
- [ ] 서비스 운영 KPI 대시보드 만들기
- [ ] 클라우드 인프라/비용 모니터링·성능 최적화
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

---

## [Phase 4] UI/UX·접근성·최적화

- [ ] 시각적 브랜딩·컬러스킴 다크/라이트 모드 완벽 지원
- [ ] 이미지·지도·목록·에러·로딩 상태별 세밀한 Skeleton/스피너
- [ ] ARIA, 키보드/스크린리더 지원 등 접근성 전수 검사
- [ ] 페이지 404/오프라인 안내·재시도 UX
- [ ] SEO: sitemap, robots.txt, 동적 메타태그 구성
- [ ] Lighthouse 점수 80+ 달성, UX/성능 테스트

---

## [Phase 5] 배포·운영·사업성 검증

- [ ] Vercel/클라우드 배포·CD, 실 운영 환경 점검
- [ ] 핵심 기능 검증 체크리스트 작성(MVP 4개)
- [ ] 즐겨찾기·URL복사·API 응답 성공률·데이터 정확도 측정
- [ ] CS/고객 피드백 수집, 반영 플랜 수립
- [ ] 투자/사업자 대상 서비스 데모·랜딩페이지 공유
- [ ] 국내 캠핑 진흥/파트너십/마케팅 협력 구조 논의

---

## [Phase 6] 추가 확장 및 사업화 전략

- [ ] 광고·예약·날씨·교통 등 외부 인프라/데이터 연동계획
- [ ] 포인트·혜택·커뮤니티·마케팅 연동 확장 프로토타입
- [ ] D2C 상품/캠핑 연계 이커머스 테스트
- [ ] 사업화·BM 피드백 반영, 조직 운영 구조 점검
- [ ] 투자유치/정부지원/파트너협업 준비

---

## 참고 체크리스트

- [ ] API 품질·속도, DB, 보안, 클라우드 비용 등 관리
- [ ] 사업화 및 BM 구조팀(오너, CTO, PO, 마케터, 디자이너) 역할 분담
- [ ] 매주/매월 점검 미팅 및 버전관리
- [ ] 서비스 성장, 확장, 업그레이드 로드맵 수립

---

> 진심을 담아 요구사항, 실전 운영, 사업화·확장까지 누락없이 기록.
> 사업 성공을 위한 MVP·팀워크·확장성 실질 행동계획.
