# Phase 2 개발 계획: 핵심 기능 MVP 개발

## 개요

Phase 2는 Pitch Travel 서비스의 핵심 기능인 여행지 목록, 지도 연동, 검색, 상세페이지를 구현하는 단계입니다. 사용자가 실제로 사용할 수 있는 MVP 기능을 완성합니다.

## 목표

- 여행지 목록 및 필터링 기능
- 네이버 지도 연동 및 마커 표시
- 키워드 검색 기능
- 상세페이지 및 북마크 기능

## 현재 상태

### 이미 완료된 작업
- ✅ 여행지 목록 컴포넌트 (`components/travel-list.tsx`)
- ✅ 여행지 카드 컴포넌트 (`components/travel-card.tsx`)
- ✅ 여행지 필터 컴포넌트 (`components/travel-filters.tsx`)
- ✅ 여행지 검색 컴포넌트 (`components/travel-search.tsx`)
- ✅ 홈페이지 통합 (`app/page.tsx`)
- ✅ 네이버 지도 연동 (`components/naver-map.tsx`) - 여행지 기준으로 수정 완료

### 미완료 작업
- 없음 (모든 작업 완료)

## 작업 항목

### 2.1 여행지 목록 기능 ✅ 완료

#### 2.1.1 필터 컴포넌트 ✅

**파일**: `components/travel-filters.tsx`

**구현 내용**:
- 지역 필터 (시/도 선택)
- 여행지 타입 필터 (관광지, 문화시설, 축제, 숙박, 쇼핑, 음식점)
- 정렬 옵션 (제목순, 조회순, 수정일순, 생성일순)

**기술 사항**:
- shadcn/ui Select 컴포넌트 사용
- URL 쿼리 파라미터 연동
- 필터 변경 시 상위 컴포넌트에 콜백 전달

#### 2.1.2 여행지 카드 컴포넌트 ✅

**파일**: `components/travel-card.tsx`

**표시 항목**:
- 썸네일 이미지 (Next.js Image 컴포넌트)
- 여행지명 (title)
- 주소 (addr1, addr2)
- 여행지 타입 뱃지 (contenttypeid 기반)
- 카테고리 정보 (cat1, cat2)
- 전화번호 (있는 경우)
- 홈페이지 (있는 경우)

**인터랙션**:
- 클릭 시 상세페이지 이동 (`/travels/[contentid]`)
- 호버 효과
- 반응형 디자인 (모바일/태블릿/데스크톱)

#### 2.1.3 여행지 목록 컴포넌트 ✅

**파일**: `components/travel-list.tsx`

**기능**:
- 필터 기반 여행지 목록 조회
- 그리드 레이아웃 (반응형)
- 로딩 상태 (Skeleton UI)
- 에러 처리
- 빈 결과 처리
- 페이지네이션

**API 연동**:
- `/api/travels` API Route를 통한 TourAPI 호출
- `travelApi.getTravelList(filter)` 또는 `travelApi.searchTravel(keyword, filter)`
- 응답 데이터 정규화 (`normalizeTravelItems`)
- 총 개수 표시

#### 2.1.4 홈페이지 통합 ✅

**파일**: `app/page.tsx`

**레이아웃**:
- 필터 사이드바 (좌측)
- 여행지 목록 (중앙)
- 지도 (우측, 데스크톱)
- 모바일: 탭으로 전환

**상태 관리**:
- URL 쿼리 파라미터 기반 필터 상태
- 필터 변경 시 URL 업데이트

### 2.2 네이버 지도 연동 ✅ 완료

#### 2.2.1 네이버 지도 컴포넌트 ✅

**파일**: `components/naver-map.tsx`

**구현 내용**:
- Naver Maps JavaScript API v3 (NCP) 동적 로드
- 지도 초기화 및 표시
- 여행지 마커 표시
- 마커 클릭 시 인포윈도우 표시

**좌표 처리**:
- TourAPI는 WGS84 좌표계 사용 (변환 불필요)
- `parseCoordinates()` 함수로 문자열 좌표 파싱

**인포윈도우**:
- 여행지명 (title)
- 간단한 설명 (overview)
- 주소 (addr1)
- "상세보기" 버튼 (`/travels/[contentid]`)

#### 2.2.2 리스트-지도 연동 ✅

**파일**: `app/page.tsx`, `components/travel-card.tsx`

**기능**:
- 카드 클릭 시 해당 마커로 지도 이동
- 마커 클릭 시 인포윈도우 표시
- 선택된 여행지 강조

**반응형**:
- 데스크톱: 좌우 분할 레이아웃
- 모바일: 탭 전환 (목록/지도)

### 2.3 키워드 검색 기능 ✅ 완료

#### 2.3.1 검색 컴포넌트 ✅

**파일**: `components/travel-search.tsx`

**기능**:
- 검색창 입력
- 엔터 키 또는 검색 버튼으로 검색 실행
- 검색어 초기화 버튼

**UX**:
- 검색 아이콘 표시
- 로딩 상태 표시 (검색 중)
- 검색어 하이라이트 (선택적)

#### 2.3.2 검색 기능 통합 ✅

**파일**: `app/page.tsx`

**동작**:
- 검색어를 필터에 추가
- 필터와 검색 조합 가능
- URL 쿼리 파라미터에 검색어 포함

**API 연동**:
- `/api/travels?keyword=...` API Route를 통한 TourAPI 호출
- `travelApi.searchTravel(keyword, filter)` 메서드 사용

### 2.4 상세페이지 ✅ 완료

#### 2.4.1 기본 구조 ✅

**파일**: `app/travels/[contentId]/page.tsx`

**구현 내용**:
- 동적 라우팅 (`[contentId]` - TourAPI의 contentid 사용)
- TourAPI 상세 정보 조회
  - `travelApi.getTravelDetail(contentId)` - 공통정보
  - `travelApi.getTravelDetailIntro(contentId, contentTypeId)` - 소개정보
- 뒤로가기 버튼
- 섹션별 컴포넌트 구성

**동적 메타데이터**:
- `generateMetadata()` 함수 구현
- Open Graph 메타데이터 동적 생성
- Twitter 카드 메타데이터
- 여행지명, 설명, 이미지 포함

**표시 항목**:
- 여행지명 (title)
- 대표 이미지 (firstimage)
- 주소 (addr1, addr2)
- 전화번호 (tel, 클릭 시 전화 연결)
- 홈페이지 (homepage, 링크)
- 개요 (overview)
- 여행지 타입 및 카테고리
- 운영 정보 (이용시간, 휴무일 등)
- 시설 정보 (주차, 문의 등)

#### 2.4.2 이미지 갤러리 ✅

**파일**: `components/travel-detail/detail-gallery.tsx`

**기능**:
- TourAPI 이미지 목록 조회 (`travelApi.getTravelImages(contentId)`)
- 대표 이미지 표시 (firstimage)
- 서브 이미지 썸네일 (originimgurl, smallimageurl)
- 이미지 클릭 시 전체화면 모달
- 이미지 슬라이드 기능 (이전/다음 버튼)
- 이미지 인덱스 표시
- 키보드 네비게이션 (좌우 화살표)

**기술**:
- shadcn/ui Dialog 컴포넌트 사용
- 접근성 속성 추가 (ARIA, 키보드 지원)

#### 2.4.3 공유 버튼 ✅

**파일**: `components/travel-detail/share-button.tsx`

**기능**:
- URL 클립보드 복사 (`/travels/[contentid]`)
- 복사 완료 상태 표시 (체크 아이콘)
- Sonner Toast 알림
- URL 복사 성공/실패 추적 (metrics)

**폴백**:
- 클립보드 복사 실패 시 prompt 창 표시

#### 2.4.4 북마크 버튼 ✅

**파일**: `components/travel-detail/bookmark-button.tsx`

**기능**:
- 북마크 추가/제거 토글
- 인증된 사용자: Supabase `bookmarks` 테이블에 저장
  - `content_id`는 TourAPI의 `contentid` 사용
- 비인증 사용자: localStorage 저장
  - 키: `travel_bookmarks` 또는 유사한 형식
- 북마크 상태 표시 (별 아이콘, 채워진/빈 별)
- 북마크 성공/실패 추적 (metrics)

**인증 처리**:
- Clerk `useAuth()`, `useUser()` 훅 사용
- Supabase 사용자 ID 조회 (clerk_id → users.id)
- 에러 처리 및 폴백 (localStorage)

#### 2.4.5 상세페이지 통합 ✅

**파일**: `app/travels/[contentId]/page.tsx`

**레이아웃**:
- 2/3 + 1/3 그리드 레이아웃 (데스크톱)
- 모바일: 세로 스택 레이아웃
- 공유/북마크 버튼 sticky 위치

**통합 컴포넌트**:
- 이미지 갤러리
- 공유 버튼
- 북마크 버튼
- 네이버 지도 (해당 여행지 위치 표시)
- 네비게이션 (LocalNav, SideNav)

### 2.5 공통 개선 사항

#### 2.5.1 에러 처리

- API 호출 실패 시 재시도 버튼
- 네트워크 오류 시 안내 메시지
- 404 페이지 처리

#### 2.5.2 로딩 상태

- Skeleton UI (목록)
- 스피너 (지도)
- 로딩 메시지

#### 2.5.3 접근성

- ARIA 라벨 추가
- 키보드 네비게이션 지원
- 이미지 alt 텍스트

## 완료 기준

- [x] 여행지 목록 및 필터링 정상 동작 ✅
- [x] 네이버 지도 표시 및 마커 정상 동작 ✅
- [x] 검색 기능 정상 동작 ✅
- [x] 상세페이지 모든 섹션 표시 ✅
- [x] 북마크 기능 정상 동작 ✅
- [x] 반응형 디자인 적용 ✅
- [x] 에러 처리 완료 ✅

## 성능 요구사항

- 페이지 로드 시간 < 3초
- API 응답 성공률 > 95%
- 이미지 최적화 (Next.js Image 컴포넌트)

## 남은 작업

- 없음 (모든 작업 완료)

### 향후 개선 사항 (선택적)
- API 캐싱 전략 고도화
- 성능 최적화 추가
- 접근성 개선 지속

## 다음 단계

상세페이지 구현 완료 후 Phase 3로 진행하여 운영 및 확장 기능 구현.

