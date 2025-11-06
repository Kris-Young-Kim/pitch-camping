# Phase 1 개발 계획: 프로젝트 셋업 및 공통 인프라

## 개요

Phase 1은 Pitch Camping 서비스의 기반 인프라와 공통 모듈을 구축하는 단계입니다. MVP 개발에 필요한 타입 정의, API 클라이언트, 유틸리티 함수, 데이터베이스 스키마를 준비합니다.

## 목표

- Next.js 15 프로젝트 환경 구축
- 고캠핑 API 통합 준비
- Supabase 데이터베이스 스키마 설계
- Clerk 인증 시스템 연동
- 공통 타입 및 유틸리티 함수 구축

## 작업 항목

### 1. 프로젝트 초기 설정

**파일**: `package.json`, `tsconfig.json`, `next.config.js`

- Next.js 15.x 프로젝트 확인
- TypeScript 설정 확인
- Tailwind CSS v4 설정 확인
- 필수 패키지 확인 및 설치

### 2. 환경변수 설정

**파일**: `.env` (참고용, 실제 파일은 .gitignore)

- 고캠핑 API 키 설정
- 네이버 지도 Client ID 설정
- Clerk 인증 키 설정
- Supabase 연결 정보 설정

**확인 사항**:
- NEXT_PUBLIC_GOCAMPING_API_KEY
- GOCAMPING_API_KEY
- NEXT_PUBLIC_NAVER_MAP_CLIENT_ID
- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- CLERK_SECRET_KEY
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY

### 3. TypeScript 타입 정의

**파일**: `types/camping.ts`

필수 타입:
- `CampingSite`: 캠핑장 목록 항목
- `CampingSiteDetail`: 캠핑장 상세 정보
- `CampingFilter`: 필터 옵션
- `GoCampingApiResponse`: API 응답 구조

고캠핑 API 응답 구조를 기반으로 정확한 타입 정의 필요.

### 4. API 클라이언트 구현

**파일**: `lib/api/camping-api.ts`

**CampingApiClient 클래스**:
- `constructor()`: API 키 및 Base URL 초기화
- `getCampingList(filter)`: 캠핑장 목록 조회
- `getCampingDetail(contentId)`: 캠핑장 상세 정보 조회
- `searchCamping(keyword, filter)`: 키워드 검색
- `request<T>(endpoint, params)`: 공통 API 요청 메서드
- `normalizeItems<T>(items)`: 응답 데이터 정규화 (단일/배열 처리)

**에러 처리**:
- API 응답 코드 검증
- 타임아웃 처리 (10초)
- 네트워크 오류 처리

### 5. 상수 정의

**파일**: `constants/camping.ts`

정의 항목:
- `CAMPING_TYPES`: 캠핑 타입 (일반야영장, 자동차야영장, 글램핑, 카라반)
- `REGIONS`: 지역 (시/도)
- `FACILITIES`: 시설 코드
- `SORT_OPTIONS`: 정렬 옵션
- `PAGINATION_DEFAULTS`: 페이지네이션 기본값

### 6. 유틸리티 함수

**파일**: `lib/utils/camping.ts`

함수 목록:
- `convertKATECToWGS84(mapX, mapY)`: 좌표계 변환
- `formatPhoneNumber(tel)`: 전화번호 포맷팅
- `formatAddress(addr1, addr2)`: 주소 결합
- `getValidHomepageUrl(url)`: 홈페이지 URL 유효성 검사
- `parseFacilities(facilitiesCl)`: 시설 문자열 파싱
- `formatCampingType(induty)`: 캠핑 타입 포맷팅
- `getValidImageUrl(imageUrl, defaultImageUrl)`: 이미지 URL 검증
- `sortCampings(campings, sortBy)`: 캠핑장 정렬

### 7. Supabase 데이터베이스 스키마

**파일**: `supabase/migrations/tourapi_schema.sql`

**users 테이블**:
- id (UUID, PK)
- clerk_id (TEXT, UNIQUE)
- name (TEXT)
- created_at (TIMESTAMPTZ)
- RLS 비활성화 (개발 환경)

**bookmarks 테이블**:
- id (UUID, PK)
- user_id (UUID, FK → users.id)
- content_id (TEXT)
- created_at (TIMESTAMPTZ)
- UNIQUE(user_id, content_id)
- 인덱스: user_id, content_id, created_at
- RLS 비활성화 (개발 환경)

### 8. 메타데이터 설정

**파일**: `app/layout.tsx`

설정 항목:
- 기본 메타데이터 (title, description, keywords)
- Open Graph 메타데이터
- Twitter 카드 메타데이터
- ClerkProvider 설정 (한국어)

### 9. 홈페이지 기본 구조

**파일**: `app/page.tsx`

- 기본 레이아웃 구조
- 서비스 소개 섹션
- 개발 진행 상황 안내 (임시)

## 완료 기준

- [x] 모든 타입 정의 완료
- [x] API 클라이언트가 정상 동작
- [x] 데이터베이스 마이그레이션 완료
- [x] 환경변수 설정 확인
- [x] 기본 메타데이터 설정 완료

## 참고 문서

- 고캠핑 API 문서
- Supabase 문서
- Clerk 문서

## 다음 단계

Phase 2로 진행하여 실제 기능 구현 시작.

