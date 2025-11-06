# PRD: 캠핑장 정보 서비스 (Pitch Camping)

---

## 1. 프로젝트 개요

### 1.1 프로젝트 목적

고캠핑 API를 활용하여 사용자가 전국의 캠핑장 정보를 쉽게 검색하고, 지도에서 확인하며, 상세 정보를 조회할 수 있는 웹 서비스 개발

### 1.2 타겟 유저

- 캠핑을 계획하는 사용자
- 주변 캠핑장을 찾는 사용자
- 특정 지역의 캠핑 정보가 필요한 사용자

### 1.3 핵심 가치

- **편리성**: 전국 캠핑장 정보를 한 곳에서 검색
- **시각화**: 네이버 지도 연동으로 위치 기반 정보 제공
- **상세성**: 운영시간, 요금, 시설 정보, 이미지 등 종합 정보 제공

---

## 2. MVP 핵심 기능

### 2.1 캠핑장 목록 + 지역/타입 필터

#### 기능 설명

사용자가 지역(시/도)과 캠핑 타입을 선택하여 해당하는 캠핑장 목록을 조회

#### 상세 요구사항

- **지역 필터**

  - 시/도 단위 선택 (서울, 부산, 경기 등)
  - 시/군/구 단위 선택 (선택 사항)
  - "전체" 옵션 제공

- **캠핑 타입 필터**

  - 일반야영장
  - 자동차야영장
  - 글램핑
  - 카라반
  - "전체" 옵션 제공

- **시설 필터**

  - 화장실, 샤워장, 전기, 와이파이, 반려동물 동반, 주차 등

- **목록 표시 정보**

  - 썸네일 이미지 (없으면 기본 이미지)
  - 캠핑장명
  - 주소
  - 캠핑 타입 뱃지
  - 시설 아이콘 (화장실, 샤워장, 전기, 와이파이 등)
  - 예약 가능 여부 (있는 경우)

- **페이지네이션**

  - 페이지당 10-20개 항목
  - 무한 스크롤 또는 페이지 번호 선택

- **정렬 옵션**
  - 이름순 (가나다순)
  - 지역순
  - 인기순 (있는 경우)

#### 사용 API

- 고캠핑 API: 캠핑장 목록 조회 엔드포인트
- 지역별 조회 API
- 키워드 검색 API

#### UI 요구사항

- 반응형 디자인 (모바일/태블릿/데스크톱)
- 카드 형태의 그리드 레이아웃
- 필터는 상단 또는 사이드바에 배치
- 로딩 상태 표시

---

### 2.2 네이버 지도 연동

#### 기능 설명

캠핑장 목록의 위치를 네이버 지도에 마커로 표시하고, 사용자 인터랙션 제공

#### 상세 요구사항

- **지도 표시**

  - 초기 중심: 선택된 지역의 중심 좌표
  - 줌 레벨: 지역 범위에 따라 자동 조정
  - 모든 캠핑장을 마커로 표시

- **마커 기능**

  - 각 캠핑장을 마커로 표시
  - 마커 클릭 시 인포윈도우 표시
    - 캠핑장명
    - 간단한 설명
    - 시설 정보 요약
    - "상세보기" 버튼
  - 마커 색상: 캠핑 타입별로 구분 (선택 사항)

- **지도-리스트 연동**

  - 리스트 항목 클릭 시 해당 마커로 지도 이동
  - 리스트 항목 호버 시 해당 마커 강조 (선택 사항)

- **지도 컨트롤**
  - 줌 인/아웃
  - 지도 유형 선택 (일반/스카이뷰)
  - 현재 위치로 이동 버튼 (선택 사항)

#### 기술 요구사항

- **Naver Maps JavaScript API v3 (NCP)** 사용
  - 네이버 클라우드 플랫폼(NCP) Maps API 사용
  - URL 파라미터: `ncpKeyId` (구 `ncpClientId` 아님)
  - 클러스터링 모듈은 현재 미지원 (일반 마커 사용)
- **좌표 데이터**: `mapx` (경도), `mapy` (위도)
  - KATEC 좌표계, 정수형으로 저장 → `10000000`으로 나누어 변환

#### UI 요구사항

- 데스크톱: 리스트(좌측) + 지도(우측) 분할 레이아웃
- 모바일: 탭 형태로 리스트/지도 전환
- 지도 최소 높이: 400px (모바일), 600px (데스크톱)

---

### 2.3 키워드 검색

#### 기능 설명

사용자가 입력한 키워드로 캠핑장을 검색하고 결과를 표시

#### 상세 요구사항

- **검색 기능**

  - 검색창에 키워드 입력
  - 엔터 또는 검색 버튼 클릭으로 검색 실행
  - 자동완성 기능 (선택 사항)

- **검색 범위**

  - 캠핑장명
  - 주소
  - 설명 내용

- **검색 결과**

  - 목록 형태로 표시 (2.1과 동일한 카드 레이아웃)
  - 지도에 마커로 표시
  - 검색 결과 개수 표시
  - 결과 없음 시 안내 메시지

- **검색 필터 조합**
  - 키워드 + 지역 필터
  - 키워드 + 캠핑 타입 필터
  - 키워드 + 시설 필터
  - 모든 필터 동시 적용 가능

#### 사용 API

- 고캠핑 API: 키워드 검색 엔드포인트

#### UI 요구사항

- 헤더에 검색창 고정
- 검색창 너비: 최소 300px (모바일), 500px (데스크톱)
- 검색 아이콘 표시
- 검색 중 로딩 스피너

---

### 2.4 상세페이지

#### 기능 설명

사용자가 캠핑장을 클릭하면 상세 정보를 보여주는 페이지로 이동

#### 상세 요구사항

##### 2.4.1 기본 정보 섹션

- **표시 항목** (고캠핑 API 상세 정보)
  - 캠핑장명 (대제목)
  - 대표 이미지 (크게 표시)
  - 주소 (복사 기능)
  - 전화번호 (클릭 시 전화 연결)
  - 홈페이지 (링크)
  - 개요 (긴 설명문)
  - 캠핑 타입 및 카테고리

##### 2.4.2 운영 정보 섹션

- **표시 항목** (고캠핑 API 운영 정보)
  - 운영시간 / 개장시간
  - 휴무일
  - 이용요금
  - 주차 가능 여부
  - 예약 정보 (예약 가능 여부, 예약 URL)
  - 수용인원
  - 시설 정보 (화장실, 샤워장, 전기, 와이파이 등)
  - 반려동물 동반 가능 여부

##### 2.4.3 이미지 갤러리

- **표시 항목** (고캠핑 API 이미지 목록)
  - 대표 이미지 + 서브 이미지들
  - 이미지 클릭 시 전체화면 모달
  - 이미지 슬라이드 기능
  - 이미지 없으면 기본 이미지

##### 2.4.4 지도 섹션

- **표시 항목**
  - 해당 캠핑장 위치를 네이버 지도에 표시
  - 마커 1개 (해당 캠핑장)
  - "길찾기" 버튼 → 네이버 지도 앱/웹 연동
  - 좌표 정보 표시 (선택 사항)

##### 2.4.5 추가 기능

###### 공유하기

- **URL 복사**
  - 클립보드 복사 기능
  - 복사 완료 토스트 메시지
  - 공유 아이콘 버튼 (Share/Link 아이콘)

###### 북마크 (Supabase 연동)

- **기능**

  - 즐겨찾기 추가/제거
  - 별 아이콘 (채워짐/비어있음)
  - 북마크 개수 표시 (선택 사항)

- **데이터 저장**

  - ~~localStorage~~ → Supabase `bookmarks` 테이블
  - 인증된 사용자만 사용 가능
  - 로그인하지 않은 경우: 로그인 유도 또는 localStorage 임시 저장

- **북마크 목록 페이지** (`/bookmarks`, 선택 사항)
  - 사용자가 북마크한 캠핑장 목록
  - 카드 레이아웃 (2.1과 동일)
  - 정렬: 최신순, 이름순, 지역별
  - 일괄 삭제 기능

###### 기술 요구사항

- **클립보드 API**

  - `navigator.clipboard.writeText()`
  - HTTPS 환경 필수

- **Open Graph 메타태그** (SEO 최적화)
  - 동적 메타태그 생성 (Next.js Metadata API)
  - 필수 속성:
    - `og:title`: 캠핑장명
    - `og:description`: 캠핑장 설명 (100자 이내)
    - `og:image`: 대표 이미지 (1200x630 권장)
    - `og:url`: 상세페이지 URL
    - `og:type`: "website"

#### 사용 API

- 고캠핑 API: 캠핑장 상세 정보 조회 엔드포인트
- 고캠핑 API: 시설 정보 조회 (있는 경우)
- 고캠핑 API: 이미지 목록 조회

#### URL 구조

```
/campings/[contentId]
예: /campings/12345
```

#### UI 요구사항

- 단일 컬럼 레이아웃 (모바일 우선)
- 섹션별 구분선 또는 카드
- 뒤로가기 버튼 (헤더)
- 이미지 갤러리: swiper 또는 캐러셀
- 정보 없는 항목은 숨김 처리

---

## 3. 기술 스택

### 3.1 Frontend

- **Framework**: Next.js 15.5.6 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Icons**: lucide-react
- **Maps**: Naver Maps API v3

### 3.2 Authentication

- **Clerk**: 사용자 인증 (로그인 필요 시)

### 3.3 Database

- **Supabase**: PostgreSQL (북마크, 사용자 기록 저장 시)

### 3.4 API

- **고캠핑 API**: 고캠핑 공공 API

---

## 4. API 명세

### 4.1 사용 API 목록

고캠핑 API 명세서 확인 후 업데이트 필요

| API              | 엔드포인트  | 용도                | 필수 파라미터                 |
| ---------------- | ----------- | ------------------- | ----------------------------- |
| 캠핑장 목록 조회 | (확인 필요) | 캠핑장 목록         | (고캠핑 API 명세서 확인 필요) |
| 상세정보 조회    | (확인 필요) | 상세페이지 기본정보 | (고캠핑 API 명세서 확인 필요) |
| 키워드 검색      | (확인 필요) | 검색 기능           | (고캠핑 API 명세서 확인 필요) |

### 4.2 Base URL

고캠핑 API Base URL 확인 필요

### 4.3 공통 파라미터

고캠핑 API 명세서 확인 후 업데이트 필요

- `serviceKey`: 인증키 (환경변수)
- `MobileApp`: "PitchCamping"
- 기타 파라미터는 고캠핑 API 명세서 확인

---

## 5. 데이터 구조

### 5.1 캠핑장 목록 응답 예시

```typescript
interface CampingSite {
  contentId: string; // 콘텐츠ID
  facltNm: string; // 캠핑장명
  lineIntro?: string; // 한줄 소개
  intro?: string; // 상세 설명
  addr1: string; // 주소
  addr2?: string; // 상세주소
  mapX: number; // 경도
  mapY: number; // 위도
  firstImageUrl?: string; // 대표이미지
  tel?: string; // 전화번호
  homepage?: string; // 홈페이지
  induty?: string; // 업종 (일반야영장, 자동차야영장 등)
  facltDivNm?: string; // 시설 구분
  operPdCl?: string; // 운영기간
  operDeCl?: string; // 운영일
  posblFcltyCl?: string; // 주요시설
  eqpmnLendCl?: string; // 캠핑장비 대여
  animalCmgCl?: string; // 반려동물 동반
  // ... 기타 필드 (고캠핑 API 명세서 확인 필요)
}
```

### 5.2 상세정보 응답 예시

```typescript
interface CampingSiteDetail {
  contentId: string;
  facltNm: string; // 캠핑장명
  lineIntro?: string; // 한줄 소개
  intro?: string; // 상세 설명
  addr1: string;
  addr2?: string;
  zipcode?: string;
  tel?: string;
  homepage?: string;
  mapX: number; // 경도
  mapY: number; // 위도
  firstImageUrl?: string;
  // 시설 정보
  sbrsCl?: string; // 부대시설
  posblFcltyCl?: string; // 주요시설
  // 운영 정보
  operPdCl?: string; // 운영기간
  operDeCl?: string; // 운영일
  lctCl?: string; // 입지 구분
  // ... 기타 필드 (고캠핑 API 명세서 확인 필요)
}
```

### 5.3 시설 정보 응답 예시

```typescript
interface CampingFacility {
  contentId: string;
  // 시설 정보
  sbrsCl?: string; // 부대시설 (화장실, 샤워장 등)
  posblFcltyCl?: string; // 주요시설
  glampInnerFclty?: string; // 글램핑 내부시설
  caravInnerFclty?: string; // 카라반 내부시설
  // 운영 정보
  operPdCl?: string; // 운영기간
  operDeCl?: string; // 운영일
  // ... 기타 필드 (고캠핑 API 명세서 확인 필요)
}
```

---

## 6. 페이지 구조

### 6.1 페이지 목록

```
/                          # 홈페이지 (캠핑장 목록 + 필터 + 지도)
/campings/[contentId]      # 상세페이지
/search?keyword=xxx        # 검색 결과 (홈에서 처리)
/bookmarks                 # 내 북마크 목록 (선택 사항, 미구현)
/admin/dashboard           # 관리자 KPI 대시보드
/admin/analytics           # 관리자 서비스 분석 대시보드
/feedback                  # 피드백 제출 페이지
/safety                    # 안전 수칙 목록 페이지
/safety/[id]               # 안전 수칙 상세 페이지
```

### 6.2 컴포넌트 구조

```
app/
├── page.tsx                    # 홈 (목록 + 필터 + 지도)
├── campings/
│   └── [contentId]/
│       └── page.tsx            # 상세페이지
├── admin/
│   ├── dashboard/
│   │   └── page.tsx            # 관리자 KPI 대시보드
│   └── analytics/
│       └── page.tsx            # 관리자 서비스 분석 대시보드
├── feedback/
│   └── page.tsx                # 피드백 제출 페이지
├── safety/
│   ├── page.tsx                # 안전 수칙 목록 페이지
│   └── [id]/
│       └── page.tsx            # 안전 수칙 상세 페이지
├── api/
│   ├── sync-user/
│   │   └── route.ts            # 사용자 동기화 API
│   └── safety-guidelines/
│       └── route.ts            # 안전 수칙 조회 API
├── not-found.tsx               # 404 페이지
├── sitemap.ts                  # 동적 sitemap 생성
└── robots.ts                   # robots.txt 생성

components/
├── camping-list.tsx            # 캠핑장 목록
├── camping-card.tsx           # 캠핑장 카드
├── camping-filters.tsx        # 필터 (지역/타입/시설)
├── camping-search.tsx         # 검색창
├── naver-map.tsx               # 네이버 지도
├── camping-detail/
│   ├── detail-gallery.tsx     # 이미지 갤러리
│   ├── share-button.tsx       # URL 복사 공유 버튼
│   ├── bookmark-button.tsx   # 북마크 버튼 (별 아이콘)
│   ├── review-section.tsx     # 리뷰 및 평점 섹션
│   └── reservation-button.tsx # 예약 버튼
├── admin/
│   ├── stats-card.tsx         # 통계 카드 컴포넌트
│   └── popular-campings.tsx   # 인기 캠핑장 테이블
├── safety/
│   ├── safety-card.tsx        # 안전 수칙 카드
│   ├── safety-guidelines.tsx  # 안전 수칙 목록 및 필터링
│   ├── safety-recommendations.tsx # 안전 수칙 추천
│   └── safety-video.tsx       # 안전 수칙 동영상
├── loading/
│   ├── card-skeleton.tsx      # 카드 로딩 스켈레톤
│   ├── map-skeleton.tsx       # 지도 로딩 스켈레톤
│   ├── image-skeleton.tsx     # 이미지 로딩 스켈레톤
│   └── detail-skeleton.tsx    # 상세페이지 로딩 스켈레톤
├── feedback-form.tsx          # 피드백 폼 컴포넌트
├── theme-toggle.tsx           # 테마 전환 버튼
├── web-vitals.tsx             # Web Vitals 모니터링
└── ui/                         # shadcn 컴포넌트

lib/
├── api/
│   ├── camping-api.ts          # 고캠핑 API 호출 함수들
│   ├── analytics.ts            # 조회수 추적 및 통계
│   ├── reviews.ts              # 리뷰 및 평점 API
│   ├── safety-guidelines.ts   # 안전 수칙 API
│   ├── rate-limit-handler.ts  # Rate Limit 핸들러
│   └── fallback-handler.ts    # 폴백 로직 핸들러
├── utils/
│   ├── camping.ts              # 캠핑 관련 유틸리티
│   ├── logger.ts               # 구조화된 로깅
│   ├── performance.ts          # 성능 모니터링
│   ├── metrics.ts              # 메트릭 추적
│   └── ranking.ts             # 인기도/랭킹 계산
└── supabase/
    ├── clerk-client.ts         # Client Component용 Supabase
    ├── server.ts               # Server Component용 Supabase
    ├── service-role.ts         # 관리자용 Supabase
    └── client.ts               # 공개 데이터용 Supabase

actions/
├── admin-stats.ts              # 관리자 통계 Server Action
├── get-analytics.ts            # 분석 데이터 조회 Server Action
└── submit-feedback.ts          # 피드백 제출 Server Action

types/
└── camping.ts                  # 캠핑장 타입 정의

constants/
└── camping.ts                  # 캠핑 관련 상수 정의
```

---

## 7. UI/UX 요구사항

### 7.1 디자인 원칙

- **모바일 우선**: 반응형 디자인
- **직관성**: 명확한 네비게이션과 정보 계층
- **성능**: 빠른 로딩 (이미지 최적화, 레이지 로딩)
- **접근성**: ARIA 라벨, 키보드 네비게이션

### 7.2 컬러 스킴

- 다크/라이트 모드 지원
- Primary 색상: 캠핑/자연 느낌 (초록색, 갈색 계열 추천)

### 7.3 로딩 상태

- 리스트 로딩: 스켈레톤 UI
- 지도 로딩: 스피너
- 이미지 로딩: Placeholder 이미지

### 7.4 에러 처리

- API 에러: 에러 메시지 표시 + 재시도 버튼
- 네트워크 에러: 오프라인 안내
- 404: 페이지를 찾을 수 없음

---

## 8. 제약사항 및 고려사항

### 8.1 API 제약사항

- **Rate Limit**: 고캠핑 API 호출 제한 (확인 필요)
- **데이터 품질**: 일부 캠핑장은 이미지/정보 누락 가능
- **응답 속도**: API 응답 시간 고려 (캐싱 전략 필요)

### 8.2 네이버 지도 제약사항

- 월 10,000,000건 무료 (네이버 클라우드 플랫폼)
- Client ID 필요 (신용카드 등록 필수)
- Web Dynamic Map 서비스 활성화 필요

### 8.3 DB 고려사항

- 공공 API는 읽기 전용 → 리뷰/평점 등은 supabase DB 필요
- Supabase 활용하여 북마크, 조회수, 랭킹 등 구현 가능

### 8.4 보안 및 환경변수

- API 키는 환경변수로 관리 (`.env`)
- `NEXT_PUBLIC_` 접두사로 클라이언트 노출 허용

**필수 환경변수**:

```bash
# 고캠핑 API
NEXT_PUBLIC_GOCAMPING_API_KEY=your_gocamping_api_key
GOCAMPING_API_KEY=your_gocamping_api_key

# 네이버 지도
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=your_naver_map_client_id

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_STORAGE_BUCKET=uploads
```

---

## 9. 성공 지표 (KPI)

### 9.1 기능적 지표

- ✅ MVP 4가지 핵심 기능 모두 정상 작동 (목록/지도/검색/상세)
- ✅ API 응답 성공률 > 95%
- ✅ 페이지 로딩 시간 < 3초
- 북마크 데이터 정확도 > 99% (선택 사항)
- URL 복사 성공률 > 95%

---

## 10. 개발 일정 (페이지 중심)

### Phase 1: 기본 구조 & 공통 설정 ✅ 완료

- [x] 프로젝트 셋업
- [x] API 클라이언트 구현 (`lib/api/camping-api.ts`)
- [x] 기본 타입 정의 (`types/camping.ts`)
- [x] 레이아웃 구조 업데이트 (`app/layout.tsx`)
- [x] 공통 컴포넌트 (로딩, 에러 처리)

### Phase 2: 홈페이지 (`/`) - 캠핑장 목록 ✅ 완료

#### 2.1 페이지 기본 구조 ✅ 완료

- [x] `app/page.tsx` 재작성 (필터 + 목록 + 지도 통합)
- [x] 기본 UI 구조 확인 (헤더, 메인 영역, 푸터)

#### 2.2 캠핑장 목록 기능 (MVP 2.1) ✅ 완료

- [x] `components/camping-card.tsx` (캠핑장 카드 - 기본 정보만)
- [x] `components/camping-list.tsx` (목록 표시 - API 연동)
- [x] API 연동하여 실제 데이터 표시
- [x] 페이지 확인 및 스타일링 조정

#### 2.3 필터 기능 추가 ✅ 완료

- [x] `components/camping-filters.tsx` (지역/타입/시설 필터 UI)
- [x] 필터 동작 연결 (상태 관리)
- [x] 필터링된 결과 표시
- [x] 페이지 확인 및 UX 개선

#### 2.4 검색 기능 추가 (MVP 2.3) ✅ 완료

- [x] `components/camping-search.tsx` (검색창 UI)
- [x] 검색 API 연동
- [x] 검색 결과 표시
- [x] 검색 + 필터 조합 동작
- [x] 페이지 확인 및 UX 개선

#### 2.5 지도 연동 (MVP 2.2) ✅ 완료

- [x] `components/naver-map.tsx` (기본 지도 표시)
- [x] 캠핑장 마커 표시
- [x] 마커 클릭 시 인포윈도우
- [x] 리스트-지도 연동 (클릭/호버)
- [x] 반응형 레이아웃 (데스크톱: 분할, 모바일: 탭)
- [x] 페이지 확인 및 인터랙션 테스트

#### 2.6 정렬 & 페이지네이션 ✅ 완료

- [x] 정렬 옵션 추가 (이름순, 지역순, 인기순)
- [x] 페이지네이션 구현
- [x] 로딩 상태 개선 (Skeleton UI)
- [x] 최종 페이지 확인

### Phase 3: 상세페이지 (`/campings/[contentId]`) ✅ 완료

#### 3.1 페이지 기본 구조 ✅ 완료

- [x] `app/campings/[contentId]/page.tsx` 생성
- [x] 기본 레이아웃 구조 (뒤로가기 버튼, 섹션 구분)
- [x] 라우팅 테스트 (홈에서 클릭 시 이동)

#### 3.2 기본 정보 섹션 (MVP 2.4.1) ✅ 완료

- [x] 기본 정보 섹션 구현 (상세페이지 내)
- [x] 고캠핑 API 상세 정보 연동
- [x] 캠핑장명, 이미지, 주소, 전화번호, 홈페이지, 개요 표시
- [x] 주소 복사 기능
- [x] 전화번호 클릭 시 전화 연결
- [x] 페이지 확인 및 스타일링

#### 3.3 시설 정보 섹션 ✅ 완료

- [x] 시설 정보 표시 (상세페이지 내)
- [x] 시설 정보 표시 (화장실, 샤워장, 전기, 와이파이 등)
- [x] 페이지 확인

#### 3.4 운영 정보 섹션 ✅ 완료

- [x] 운영 정보 표시 (상세페이지 내)
- [x] 운영시간, 휴무일, 이용요금, 예약 정보 표시
- [x] 페이지 확인

#### 3.5 지도 섹션 (MVP 2.4.4) ✅ 완료

- [x] 지도 기능 통합 (상세페이지 내)
- [x] 해당 캠핑장 위치 표시 (마커 1개)
- [x] "길찾기" 버튼 (네이버 지도 연동)
- [x] 페이지 확인

#### 3.6 공유 기능 (MVP 2.4.5) ✅ 완료

- [x] `components/camping-detail/share-button.tsx`
- [x] URL 복사 기능 (클립보드 API)
- [x] 복사 완료 토스트 메시지 (sonner 사용)
- [x] Open Graph 메타태그 동적 생성
- [x] 페이지 확인 및 공유 테스트

#### 3.7 추가 정보 섹션 ✅ 완료

- [x] `components/camping-detail/detail-gallery.tsx` (이미지 갤러리)
- [x] 고캠핑 API 이미지 목록 연동
- [x] 이미지 슬라이드 모달 기능
- [x] 페이지 확인

#### 3.8 추가 기능 ✅ 완료

- [x] `components/camping-detail/bookmark-button.tsx` (북마크 기능)
- [x] `components/camping-detail/review-section.tsx` (리뷰 및 평점)
- [x] `components/camping-detail/reservation-button.tsx` (예약 버튼)
- [x] `components/safety/safety-recommendations.tsx` (안전 수칙 추천)

### Phase 4: 북마크 기능 ✅ 완료

#### 4.1 Supabase 설정 ✅ 완료

- [x] `supabase/migrations/` 마이그레이션 파일
- [x] `bookmarks` 테이블 생성
- [x] RLS 정책 설계 (프로덕션 배포 전 적용 준비)

#### 4.2 북마크 기능 구현 ✅ 완료

- [x] `components/camping-detail/bookmark-button.tsx`
- [x] 상세페이지에 북마크 버튼 추가
- [x] Supabase DB 연동
- [x] 인증된 사용자 확인
- [x] 로그인하지 않은 경우 localStorage 임시 저장
- [x] 상세페이지에서 북마크 동작 확인

#### 4.3 북마크 목록 페이지

- [ ] `app/bookmarks/page.tsx` 생성 (선택 사항)
- [ ] `components/bookmarks/bookmark-list.tsx` (선택 사항)
- [ ] 북마크한 캠핑장 목록 표시 (선택 사항)

### Phase 5: 최적화 & 배포 ✅ 완료

- [x] 이미지 최적화 (`next.config.ts` 외부 도메인 설정)
- [x] 전역 에러 핸들링 개선
- [x] 404 페이지 (`app/not-found.tsx`)
- [x] SEO 최적화 (메타태그, sitemap.ts, robots.ts)
- [x] 성능 측정 (Lighthouse 점수 > 80 목표, 코드 레벨 최적화 완료)
- [x] 환경변수 보안 검증
- [x] Vercel 배포 설정 (`vercel.json`, CI/CD 파이프라인)

### Phase 6: 추가 기능 및 페이지 ✅ 일부 완료

#### 6.1 관리자 대시보드 ✅ 완료

- [x] `app/admin/dashboard/page.tsx` (KPI 대시보드)
- [x] `app/admin/analytics/page.tsx` (서비스 분석 대시보드)
- [x] `components/admin/stats-card.tsx`
- [x] `components/admin/popular-campings.tsx`

#### 6.2 피드백 시스템 ✅ 완료

- [x] `app/feedback/page.tsx`
- [x] `components/feedback-form.tsx`
- [x] 피드백 저장 테이블 (`supabase/migrations/20251106150000_create_feedback_table.sql`)

#### 6.3 안전 수칙 정보 제공 ✅ 완료

- [x] `app/safety/page.tsx` (안전 수칙 목록)
- [x] `app/safety/[id]/page.tsx` (안전 수칙 상세)
- [x] `components/safety/safety-card.tsx`
- [x] `components/safety/safety-guidelines.tsx`
- [x] `components/safety/safety-recommendations.tsx`
- [x] 안전 수칙 테이블 (`supabase/migrations/20251106160000_create_safety_guidelines_table.sql`)

---

## 12. 참고 자료

### API 문서

- 고캠핑 API: (고캠핑 API 문서 확인 필요)

### 기술 문서

- Next.js: https://nextjs.org/docs
- Naver Maps API v3: https://navermaps.github.io/maps.js.ncp/docs/
- Tailwind CSS: https://tailwindcss.com/docs
- shadcn/ui: https://ui.shadcn.com/

---
