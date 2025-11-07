# TODO.md – 여행 정보 서비스(Pitch Travel)

---

## 목적과 비전

한국관광공사 TourAPI를 활용한 여행지 정보 서비스 사업화 준비를 위한 실전 TODO. 모든 단계는 품질, 사용자 경험, 확장성을 최우선으로 한다. 단순 MVP를 넘어 사업 성공 기반을 마련하는 개발·운영·사업화 실천 계획이다.

---

## [Phase 1] 프로젝트 셋업 및 공통 인프라

- [x] Next.js 기반 프로젝트 세팅 (버전: 15.x, App Router)
- [x] 필수 패키지 설치: React, TypeScript, TailwindCSS(v4), shadcn/ui, lucide-react, Supabase client
- [x] 환경변수 관리: .env, 보안 적합성 확인
- [x] 공공 API 인증키 적용, API 모듈 구조 설계 (lib/api/travel-api.ts) - 한국관광공사 TourAPI 연동 완료
- [x] Supabase DB 구조 설계 (bookmarks·user·review 등 확장성 반영)
- [x] Supabase 여행지 테이블 생성 (`supabase/migrations/20250107000000_create_travels_table.sql`)
  - TourAPI 데이터 구조 기반 테이블 설계
  - 인덱스 및 권한 설정
- [x] 샘플 여행지 데이터 추가 (`supabase/migrations/20250107000001_insert_sample_travels.sql`)
  - 한국 인기 여행지 15개 추가 (경복궁, 남산타워, 해운대, 감천문화마을 등)
- [x] Clerk 연동, 유저 인증 플로우 기본 구현
- [ ] UI디자인 초안: 직원 및 투자자 대상 피드백 회의
- [ ] 오너/팀원의 사업 아이디어 피칭 & 최종 비전 검토

### Phase 1 완료 상세

- [x] TypeScript 타입 정의 (`types/travel.ts`)
  - TravelSite, TravelSiteDetail, TravelFacility, TravelFilter 타입 정의
  - 한국관광공사 TourAPI 응답 구조에 맞게 재정의 완료
- [x] 한국관광공사 TourAPI 클라이언트 (`lib/api/travel-api.ts`)
  - TravelApiClient 클래스 구현
  - getTravelList(), getTravelDetail(), searchTravel() 메서드
  - 지역기반 조회, 키워드 검색, 상세정보 조회 API 연동 완료
- [x] 여행지 관련 상수 정의 (`constants/travel.ts`)
  - 여행지 타입 (관광지, 문화시설, 축제, 숙박 등), 지역, 카테고리, 정렬 옵션 상수
- [x] 유틸리티 함수 (`lib/utils/travel.ts`)
  - 좌표 변환 (필요 시)
  - 전화번호, 주소, 홈페이지 포맷팅
  - 필터링 및 검색 유틸리티
- [x] Supabase 마이그레이션 파일 생성
  - bookmarks 테이블 스키마 및 주석 업데이트 (여행지 기준으로 변경 완료)
- [x] 메타데이터 업데이트 (`app/layout.tsx`)
  - Pitch Travel 서비스명 및 Open Graph 메타데이터 추가 완료
- [x] 홈페이지 업데이트 (`app/page.tsx`)
  - 여행지 서비스에 맞는 랜딩 페이지로 변경 완료

---

## [Phase 2] 핵심 기능 MVP 개발

### 2.1 여행지 목록

- [x] 시/도·시군구·여행지 타입(관광지/문화시설/축제/숙박 등)·카테고리·정렬·페이지네이션 등 필터 기능 구현
- [x] 반응형 카드/그리드 UI: 모바일→데스크톱 최적화
- [x] 오류·빈값 graceful UX 처리
- [x] 목록 썸네일·카테고리 아이콘·타입 뱃지 표시, SEO/마크업 접근성 보장

### 2.2 지도 연동

- [x] Naver Maps v3 지도 연동·최적화 (좌표계 변환 포함)
- [x] 지역·여행지 중심 좌표 설정, 타입별 마커 디자인
- [x] 리스트-지도 상호연동 및 반응형 UI 구성
- [x] 지도 내 검색·필터·정렬 경험 개선
- [x] 마커 인포윈도우, 길찾기/현재위치 UX

### 2.3 키워드 검색

- [x] 검색창·자동완성 도입, 사용자 행동 데이터 로깅
- [x] 검색 API 연동, 성능 튜닝 (응답지연 대비 UX)
- [x] 결과 없음·에러 메시지/로딩 스피너
- [x] 필터+검색 복합 결과 UX

### 2.4 상세페이지

- [x] 기본 정보/운영/갤러리/지도/공유·북마크 섹션별 컨포넌트화
- [x] 주소 복사, 전화걸기, 홈페이지 링크 등 사용자 행동 흐름 설계
- [x] 이미지 목록·대표 썸네일·슬라이드 모달 UX
- [x] Open Graph 메타태그 동적 구성, SNS/카카오·네이버 공유 테스트
- [x] 북마크 기능: Supabase와 인증 폴백 구조(localStorage)
- [x] 즐겨찾기 테이블 설계, 로그인 UX 개선

### 2.5 반려동물 동반 여행 기능

- [x] 반려동물 동반 여행지 필터링
  - [x] 필터 옵션 추가: "반려동물 동반 가능" 체크박스
  - [x] 키워드 검색에 "반려동물", "펫", "애완동물" 등 자동 포함 옵션 (petFriendly 필터 활성화 시)
  - [x] 여행지 타입별 필터링 (숙박, 관광지, 음식점 등) - 기존 필터와 함께 작동
  - [x] URL 쿼리 파라미터 연동
- [x] 반려동물 동반 여행지 정보 표시
  - [x] PetFriendlyBadge 컴포넌트 생성
  - [x] 여행지 카드에 반려동물 동반 가능 뱃지 표시
  - [x] 상세페이지에 반려동물 동반 정보 섹션 추가
  - [x] PetFriendlyInfo 컴포넌트 생성
  - [x] 반려동물 시설 정보 표시 (펜션, 호텔, 카페 등)
  - [x] 반려동물 규정 및 주의사항 표시
  - [x] 반려동물 추가 요금 정보 표시
- [x] 반려동물 동반 여행지 데이터베이스 스키마
  - [x] travels 테이블에 pet_friendly, pet_friendly_updated_at 필드 추가
  - [x] pet_friendly_info 테이블 생성 (반려동물 동반 여행지 정보)
  - [x] 반려동물 시설 정보 저장 구조 설계 (펜션, 호텔, 카페 등)
  - [x] 반려동물 규정 및 주의사항 저장 구조 설계
  - [x] 인덱스 및 트리거 설정
- [x] 반려동물 동반 여행 가이드/정보
  - [x] 반려동물 동반 여행 가이드 페이지 (`app/pet-travel-guide/page.tsx`)
  - [x] 반려동물 동반 여행 시 주의사항 안내
  - [x] 지역별 반려동물 동반 가능 여행지 추천 링크
  - [x] 반려동물 동반 여행 팁 및 체크리스트
  - [x] 여행 전 체크리스트 (건강 확인, 필수 준비물, 숙박 예약)
  - [x] 여행 중 주의사항 (안전 수칙, 건강 관리, 매너)
- [x] 반려동물 동반 여행지 리뷰/평점
  - [x] 리뷰에 반려동물 동반 경험 포함 (reviews 테이블에 pet_friendly_experience, pet_friendly_rating, pet_friendly_comment 필드 추가)
  - [x] 반려동물 동반 만족도 별도 평가 (1-5점)
  - [x] 반려동물 동반 리뷰 필터링 및 검색 (getReviews 함수에 petFriendlyOnly 파라미터 추가)
  - [x] 반려동물 동반 리뷰 통계 조회 (getPetFriendlyReviewStats 함수)
  - [x] 반려동물 동반 리뷰 섹션 컴포넌트 (PetFriendlyReviewSection)
- [x] 반려동물 동반 여행지 지도 표시
  - [x] 지도에서 반려동물 동반 가능 여행지 마커 구분 (초록색 하트 아이콘 마커)
  - [x] 반려동물 동반 여행지만 필터링하여 지도 표시 (showPetFriendlyOnly prop)
  - [x] 인포윈도우에 반려동물 동반 뱃지 표시
  - [ ] 반려동물 동반 여행 경로 계획 기능 (추후 구현)

### Phase 2 진행 예정

- [x] 필터 컴포넌트 (`components/travel-filters.tsx`)
  - 지역, 여행지 타입(관광지/문화시설/축제/숙박), 카테고리 필터 및 정렬 옵션 구현
  - URL 쿼리 파라미터 연동
  - 가로 배치 레이아웃 (데스크톱: 가로, 모바일: 세로)
  - 검색어 입력 기능 추가 (키워드 검색)
  - 필터 순서: 지역 → 여행지 타입 → 정렬 → 검색어
  - 필터 제목: "여행정보검색"으로 변경
- [x] 여행지 카드 컴포넌트 (`components/travel-card.tsx`)
  - 썸네일 이미지, 여행지명, 주소, 타입 뱃지, 카테고리 아이콘 표시
  - 반응형 디자인, 클릭 시 상세페이지 이동
- [x] 여행지 목록 컴포넌트 (`components/travel-list.tsx`)
  - 그리드 레이아웃 (반응형), TourAPI 우선 사용 (실패 시 Supabase fallback)
  - 로딩 상태 (Skeleton UI), 에러 처리, 빈 결과 처리
  - 페이지네이션 구현
  - 무한 루프 문제 해결 (useRef를 통한 onTravelsChange 안정화)
- [x] API 라우트 TourAPI 우선 사용 (`app/api/travels/route.ts`)
  - 한국관광공사 TourAPI를 우선 사용
  - TourAPI 실패 시 Supabase fallback으로 자동 전환
  - 키워드 검색: searchTravel() 메서드 사용
  - 지역/타입 필터: getTravelList() 메서드 사용
  - 필터링, 검색, 정렬, 페이지네이션 지원
  - TourAPI 응답 형식과 호환되도록 데이터 변환
- [x] 홈페이지 통합 (`app/page.tsx`)
  - 필터와 목록 컴포넌트 통합
  - URL 쿼리 파라미터 기반 필터 상태 관리
  - 레이아웃: 필터 상단, 목록과 지도 세로 배치 (목록 위, 지도 아래)
- [x] 검색 컴포넌트 (`components/travel-search.tsx`)
  - 검색창, 엔터 키 또는 버튼으로 검색 실행
  - 검색어 초기화 기능
- [x] 검색 기능 통합
  - 홈페이지에 검색창 통합, 필터와 검색 조합
- [x] 상세페이지 기본 구조 (`app/travels/[contentId]/page.tsx`)
  - 동적 라우팅, TourAPI 상세 정보 조회
  - 기본 정보 표시 (이름, 이미지, 주소, 전화번호, 홈페이지, 소개)
  - 동적 메타데이터 생성 (Open Graph 포함)
- [x] 네이버 지도 연동 (`components/naver-map.tsx`)
  - Naver Maps JavaScript API v3 (NCP) 연동
  - 좌표 변환 (필요 시)
  - 여행지 마커 표시 및 인포윈도우
  - 리스트-지도 상호연동 (카드 클릭 시 지도 이동)
  - 반응형 레이아웃 (세로 배치: 목록 위, 지도 아래)
  - 마커 깜빡임 문제 해결 (useRef를 통한 travels 안정화, 실제 변경 시에만 마커 업데이트)
- [x] 이미지 갤러리 (`components/travel-detail/detail-gallery.tsx`)
  - 대표 이미지 및 서브 이미지 썸네일 표시
  - 이미지 클릭 시 전체화면 모달
  - 이미지 슬라이드 기능 (이전/다음 버튼)
- [x] 공유 버튼 (`components/travel-detail/share-button.tsx`)
  - URL 클립보드 복사 기능
  - 복사 완료 상태 표시
- [x] 북마크 버튼 (`components/travel-detail/bookmark-button.tsx`)
  - 인증된 사용자: Supabase bookmarks 테이블에 저장
  - 비인증 사용자: localStorage에 임시 저장
  - 북마크 상태 표시 (별 아이콘)
- [ ] 북마크 기능 고도화 (Phase 3)
  - [x] 북마크 목록 페이지 (`app/bookmarks/page.tsx`)
    - 사용자가 북마크한 여행지 목록 표시
    - 카드 레이아웃 (여행지 목록과 동일한 스타일)
    - 빈 상태 처리 (북마크가 없을 때 안내 메시지)
    - 로딩 상태 처리 (Suspense + Skeleton UI)
    - 에러 처리
    - 인증 확인 및 리다이렉트
  - [x] 북마크 정렬 및 필터링
    - 정렬 옵션: 최신순, 이름순, 지역별, 타입별
    - 필터: 지역, 여행지 타입
    - 검색 기능 (여행지명, 주소로 검색)
    - URL 쿼리 파라미터 연동
  - [x] 북마크 폴더/카테고리 기능
    - [x] 데이터베이스 스키마 생성 (bookmark_folders 테이블, bookmarks 테이블에 folder_id 추가)
    - [x] 폴더 CRUD Server Actions (생성, 조회, 수정, 삭제)
    - [x] 폴더 목록 컴포넌트 (FolderList)
    - [x] 폴더 생성/수정 다이얼로그 (FolderDialog)
    - [x] 북마크 목록 페이지에 폴더 기능 통합
    - [x] 폴더별 북마크 필터링
    - [x] 폴더별 북마크 개수 표시
    - [ ] 북마크 추가 시 폴더 선택 옵션 (북마크 버튼에 폴더 선택 기능 추가)
  - [x] 북마크 태그 기능
    - [x] 데이터베이스 스키마 생성 (bookmark_tags, bookmark_tag_relations 테이블)
    - [x] 태그 CRUD Server Actions (생성, 조회, 삭제)
    - [x] 북마크 태그 추가/제거 Server Action
    - [x] 태그 목록 컴포넌트 (TagList)
    - [x] 태그 생성 다이얼로그 (TagDialog)
    - [x] 북마크 목록 페이지에 태그 기능 통합
    - [x] 태그별 필터링
    - [x] 인기 태그 표시 (사용 빈도순 정렬)
    - [x] 태그 색상 커스터마이징
    - [x] 북마크 카드에 태그 표시
    - [x] 태그 자동완성 기능 (`components/bookmarks/tag-autocomplete.tsx`)
      - [x] 태그명 입력 시 기존 태그 자동완성 제안
      - [x] 키보드 네비게이션 지원 (Arrow Up/Down, Enter, Escape)
      - [x] 새 태그 생성 옵션 표시
      - [x] 태그 선택 시 색상 자동 설정
      - [x] TagDialog에 자동완성 기능 통합
  - [x] 북마크 노트/메모 기능
    - [x] 각 북마크에 개인 메모 추가/수정 (bookmarks 테이블에 note, note_updated_at 필드 추가)
    - [x] 메모 검색 기능 (키워드 검색에 메모 포함)
    - [x] 메모가 있는 북마크 표시 (BookmarkCard에 메모 아이콘 및 미리보기)
    - [x] 북마크 노트 다이얼로그 (BookmarkNoteDialog)
    - [x] 북마크 카드 컴포넌트 (BookmarkCard) - 메모 기능 통합
  - [x] 북마크 일정 계획 기능
    - [x] 북마크한 여행지를 일정에 추가 (travel_plans, travel_plan_items 테이블 생성)
    - [x] 여행 일정 목록 페이지 (`app/travel-plans/page.tsx`)
    - [x] 여행 일정 상세 페이지 (`app/travel-plans/[planId]/page.tsx`)
    - [x] 일정별 여행지 그룹화 (일차별 표시)
    - [x] 여행 일정 공유 기능 (공개 일정, 공유 토큰)
    - [x] 일정 생성/수정 Server Actions
    - [x] 일정에 여행지 추가 기능
    - [ ] 여행 일정 캘린더 뷰 (추후 구현)
  - [x] 북마크 지도 보기
    - [x] 북마크한 여행지를 지도에 표시 (`app/bookmarks/map/page.tsx`)
    - [x] 폴더/태그별로 마커 색상 구분 (폴더: 보라색, 태그: 태그 색상, 북마크만: 파란색)
    - [x] 북마크 지도 필터링 (폴더/태그별)
    - [x] 북마크 마커 인포윈도우에 폴더/태그 정보 표시
    - [ ] 북마크 지도에서 일정 경로 표시 (추후 구현)
  - [x] 북마크 일괄 관리 기능
    - [x] 다중 선택 (체크박스) (`BookmarkCard`에 체크박스 추가)
    - [x] 일괄 관리 모드 토글 (`BookmarkListContent`)
    - [x] 일괄 관리 툴바 (`BulkActionsToolbar`)
    - [x] 일괄 삭제 (`batchDeleteBookmarks` Server Action)
    - [x] 일괄 폴더 이동 (`batchUpdateBookmarkFolder` Server Action)
    - [x] 일괄 태그 추가/제거 (`batchUpdateBookmarkTags` Server Action)
      - [x] 태그 추가 모드 (기존 태그 유지)
      - [x] 태그 제거 모드
      - [x] 태그 교체 모드 (기존 태그 제거 후 새 태그 추가)
  - [x] 북마크 공유 기능
    - [x] 데이터베이스 스키마 (`bookmark_share_links` 테이블)
    - [x] 공유 링크 생성/업데이트 (`createOrUpdateShareLink` Server Action)
    - [x] 공유 링크 조회 (`getShareLink` Server Action)
    - [x] 공개/비공개 전환 (`toggleShareLinkVisibility` Server Action)
    - [x] 공유된 북마크 조회 (`getSharedBookmarks` Server Action)
    - [x] 북마크 목록 공유 다이얼로그 (`BookmarkShareDialog`)
    - [x] 북마크 목록 공유 버튼 (`BookmarkListContent`)
    - [x] 폴더별 공유 기능 (`FolderList`에 공유 메뉴 추가)
    - [x] 공유 페이지 (`app/bookmarks/share/[token]/page.tsx`)
    - [x] 공유 링크 복사 기능
    - [x] 공개/비공개 전환 기능
    - [x] 공유 링크 재생성 기능
  - [x] 북마크 내보내기/가져오기
    - [x] JSON 형식으로 북마크 내보내기 (`exportBookmarks` Server Action + `BookmarkExportDialog`)
    - [x] CSV 형식으로 내보내기 (엑셀 호환)
    - [x] 북마크 가져오기 기능 (`importBookmarks` Server Action + `BookmarkImportDialog`)
    - [x] 다른 서비스에서 북마크 마이그레이션 (폴더/태그 자동 생성, 중복 검사, 요약 결과 제공)
  - [x] 북마크 알림 기능
    - [x] 여행지 정보 업데이트 시 알림 데이터 구조 (bookmark_notifications.notification_type = 'travel_update')
    - [x] 여행지 이벤트/프로모션 알림 ('event')
    - [x] 북마크한 여행지 주변 날씨 알림 ('weather')
    - [x] 알림 센터 UI (`BookmarkNotificationPanel`) + 알림 설정 다이얼로그 (`BookmarkNotificationSettingsDialog`)
  - [x] 북마크 통계/분석 기능
    - [x] 북마크한 여행지 통계 (지역별, 타입별 집계)
    - [x] 가장 많이 북마크한 지역/타입 하이라이트
    - [x] 북마크 트렌드 분석 (월별 추이)
    - [x] 개인 여행 취향 분석 문구 생성 (`favoriteSummary`)
    - [x] 전용 페이지 `app/bookmarks/analytics/page.tsx` + `BookmarkAnalyticsContent`
  - [x] 북마크 데이터베이스 스키마 확장
    - [x] bookmarks 테이블에 폴더, 태그, 메모, 공유, 알림 관련 필드 반영 (기 구현 확인)
    - [x] bookmark_folders / bookmark_tags / bookmark_tag_relations 테이블 운영 중 (문서 최신화)
    - [x] bookmark_notifications / bookmark_notification_preferences 테이블 추가
    - [x] travel_plans / travel_plan_items 테이블 (일정 기능) 유지보수
    - [x] 공유 링크(bookmark_share_links) 및 기타 트리거/함수 문서화
- [x] 상세페이지 통합 (`app/travels/[contentId]/page.tsx`)
  - 이미지 갤러리, 공유 버튼, 북마크 버튼 통합
- [x] 반려동물 동반 여행 기능 구현 (Phase 2)
  - [x] 반려동물 동반 여행지 필터 컴포넌트 (`components/travel-filters.tsx`)
    - [x] "반려동물 동반 가능" 필터 옵션 추가 (체크박스)
    - [x] 필터 상태 URL 쿼리 파라미터 연동
    - [x] 활성 필터 표시에 반려동물 동반 필터 포함
  - [x] 반려동물 동반 여행지 뱃지 (`components/travel-card.tsx`, `components/travel-detail/pet-friendly-badge.tsx`)
    - [x] PetFriendlyBadge 컴포넌트 생성
    - [x] 여행지 카드에 반려동물 동반 가능 뱃지 표시
    - [x] 상세페이지에 반려동물 동반 정보 섹션 추가 (`app/travels/[contentId]/page.tsx`에 PetFriendlyInfo 통합)
  - [x] 반려동물 동반 여행지 정보 컴포넌트 (`components/travel-detail/pet-friendly-info.tsx`)
    - [x] 반려동물 시설 정보 표시 (펜션, 호텔, 카페 등)
    - [x] 반려동물 규정 및 주의사항 표시
    - [x] 반려동물 동반 만족도 표시 (PetFriendlyReviewSection 컴포넌트로 구현)
  - [x] 반려동물 동반 여행 가이드 페이지 (`app/pet-travel-guide/page.tsx`)
    - [x] 반려동물 동반 여행 가이드 콘텐츠
    - [x] 주의사항 및 체크리스트
    - [x] 지역별 반려동물 동반 가능 여행지 추천 링크
    - [x] 여행 전/중 팁 제공
  - [x] 반려동물 동반 여행지 데이터베이스 스키마 (`supabase/migrations/`)
    - [x] travels 테이블에 pet_friendly, pet_friendly_updated_at 필드 추가
    - [x] pet_friendly_info 테이블 생성 (상세 정보)
    - [x] 반려동물 시설 정보 저장 구조 설계
    - [x] 인덱스 및 트리거 설정
  - [x] 반려동물 동반 여행지 API 연동
    - [x] TourAPI 키워드 검색에 반려동물 관련 키워드 자동 포함 (petFriendly 필터 활성화 시)
    - [x] Supabase에서 반려동물 동반 여행지 필터링 (pet_friendly = true)
    - [x] 반려동물 동반 여행지 상세 정보 조회 (pet_friendly_info 테이블)
  - [x] 반려동물 동반 여행지 지도 연동 (`components/naver-map.tsx`)
    - [x] 반려동물 동반 가능 여행지 마커 색상 구분 (초록색 하트 아이콘)
    - [x] 반려동물 동반 여행지 필터링 옵션 (`showPetFriendlyOnly` prop)
    - [x] 반려동물 동반 여행지 인포윈도우 뱃지 표시
    - [x] 홈페이지에서 반려동물 동반 필터 상태와 지도 연동 (`app/page.tsx`)

---

## [Phase 3] 사업화·운영 확장

- [x] Supabase DB 마이그레이션, RLS 보안정책 설정, 데이터 품질 점검
- [x] 통계/랭킹/인기도·사용자 기록 저장 구조 추가
- [x] 리뷰·평점 MVP 설계(공공 API+자체 DB)
- [x] 서비스 운영 KPI 대시보드 만들기
- [x] 클라우드 인프라/비용 모니터링·성능 최적화
- [x] API Rate Limit/품질 이슈 캐시·폴백 로직
- [ ] 반려동물 동반 여행 기능 확장 (Phase 3)
  - [x] 반려동물 동반 여행지 통계 및 분석
    - [x] 반려동물 동반 가능 여행지 통계 (지역별, 타입별) (`getPetFriendlyStatistics` Server Action)
    - [x] 반려동물 동반 여행지 인기도 분석 (조회수, 북마크 수, 리뷰 수 기반 인기도 점수 계산)
    - [x] 반려동물 동반 만족도 통계 (리뷰 평점 기반 평균 만족도)
    - [x] 통계 대시보드 페이지 (`app/pet-travel/analytics/page.tsx`)
    - [x] 통계 UI 컴포넌트 (`PetFriendlyAnalyticsContent`)
  - [x] 반려동물 동반 여행지 리뷰 시스템 확장
    - [x] 리뷰에 반려동물 동반 경험 필드 추가 (reviews 테이블에 pet_friendly_experience, pet_friendly_rating, pet_friendly_comment 필드)
    - [x] 반려동물 동반 만족도 별도 평가 항목 (1-5점 평점)
    - [x] 반려동물 동반 리뷰 필터링 및 검색 (getReviews 함수에 petFriendlyOnly 파라미터)
    - [x] 반려동물 동반 리뷰 통계 및 분석 (getPetFriendlyReviewStats 함수, PetFriendlyReviewSection 컴포넌트)
  - [x] 반려동물 동반 여행지 추천 시스템
    - [x] 사용자 기반 반려동물 동반 여행지 추천 (북마크한 여행지와 유사한 지역/타입 추천)
    - [x] 지역별 반려동물 동반 인기 여행지 추천 (인기도 점수 기반)
    - [x] 계절별 반려동물 동반 여행지 추천 (계절에 맞는 여행지 타입 우선)
    - [x] 추천 페이지 (`app/pet-travel/recommendations/page.tsx`)
    - [x] 추천 UI 컴포넌트 (`PetFriendlyRecommendationsContent`)
  - [x] 반려동물 동반 여행 커뮤니티 기능
    - [x] 반려동물 동반 여행 후기 공유 (pet_travel_posts 테이블, post_type='review')
    - [x] 반려동물 동반 여행지 정보 공유 (travel_contentid 필드로 여행지 연결)
    - [x] 반려동물 동반 여행 팁 및 체크리스트 공유 (post_type='tip', 'checklist')
    - [x] 커뮤니티 페이지 (`app/pet-travel/community/page.tsx`)
    - [x] 게시글 작성/조회/좋아요 기능 (createPetTravelPost, getPetTravelPosts, togglePetTravelPostLike)
    - [x] 게시글 카드 컴포넌트 (`PetTravelPostCard`)
    - [x] 게시글 작성 다이얼로그 (`PetTravelPostDialog`)

### Phase 3 완료 상세

- [x] 통계 테이블 생성 (`supabase/migrations/20251106210358_create_travel_stats_table.sql`)
  - travel_stats: 여행지별 통계 (조회수, 북마크 수, 공유 수)
  - user_activity: 사용자 활동 기록 (조회, 북마크, 공유) - 주석 업데이트 완료
  - 북마크 트리거로 bookmark_count 자동 업데이트
- [x] RLS 보안 정책 설계 (`supabase/migrations/20251106140001_design_rls_policies.sql`)
  - users, bookmarks, camping_stats, user_activity 테이블 RLS 정책 설계
  - 프로덕션 배포 전 적용 준비 완료
- [x] 조회수 추적 시스템 (`lib/api/analytics.ts`)
  - trackView(): 여행지 상세페이지 조회수 증가 (travel_stats 사용)
  - trackActivity(): 사용자 활동 기록
  - getTravelStats(): 통계 데이터 조회
  - getCampingStats(): 호환성을 위해 유지 (deprecated)
- [x] 인기도/랭킹 계산 시스템 (`lib/utils/ranking.ts`)
  - calculatePopularityScore(): 인기도 점수 계산 (popularity.ts)
  - getPopularTravels(): 인기 여행지 목록 조회
  - getPopularTravelsByRegion(): 지역별 인기 여행지 조회
  - getPopularTravelsByType(): 타입별 인기 여행지 조회
  - 호환성 함수 유지 (getPopularCampings 등)
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
  - 인기 여행지 TOP 10 테이블 (`components/admin/popular-travels.tsx`)
  - 통계 카드 컴포넌트 (재사용 가능, `components/admin/stats-card.tsx`)
- [x] 통계 대시보드 고도화 (Phase 3)
  - [x] 실시간 통계 업데이트
    - [x] 자동 새로고침 옵션 (5초, 10초, 30초, 1분 간격) (폴링 방식)
    - [ ] WebSocket 또는 Server-Sent Events (SSE)를 통한 실시간 업데이트 (추후 구현)
    - [ ] 실시간 알림 (중요 지표 임계값 초과 시) (추후 구현)
  - [x] 차트/그래프 시각화
    - [x] 라인 차트: 사용자 증가 추이, 조회수 추이, 북마크 증가 추이 (TimeSeriesChart)
    - [x] 바 차트: 지역별 통계, 타입별 통계 (RegionTypeBarChart)
    - [x] 파이 차트: 여행지 타입 분포, 지역 분포 (PieChartComponent)
    - [x] 차트 라이브러리 통합 (recharts)
    - [ ] 히트맵: 시간대별 사용자 활동, 지역별 인기도 (추후 구현)
  - [x] 시간대별/기간별 통계
    - [x] 기간 선택 (오늘, 어제, 최근 7일, 최근 30일, 최근 3개월, 최근 1년) (getTimeSeriesStats)
    - [x] 일별 통계 (사용자, 조회수, 북마크, 리뷰)
    - [ ] 시간대별 통계 (시간, 요일, 월별) (추후 구현)
    - [ ] 전년/전월 대비 비교 (증감률 표시) (추후 구현)
    - [ ] 트렌드 분석 (증가/감소 추세) (추후 구현)
  - [x] 사용자 행동 분석
    - [x] 사용자 세션 분석 (평균 세션 시간, 페이지 뷰, 이탈률) (getUserBehaviorAnalytics)
    - [x] 사용자 여정 분석 (페이지 이동 경로) (TOP 20 경로 표시)
    - [x] 사용자 세그먼트 분석 (신규/기존 사용자, 활성/비활성 사용자)
    - [x] 사용자 리텐션 분석 (재방문율, 일별 리텐션 - 최근 7일)
    - [x] 사용자 전환율 분석 (방문 → 북마크, 방문 → 리뷰)
    - [x] 사용자 행동 분석 UI 컴포넌트 (UserBehaviorAnalytics)
  - [x] 지역별/타입별 상세 통계
    - [x] 지역별 상세 통계 (시/도별) (getRegionTypeStats)
    - [x] 시군구별 상세 통계 (getDetailedRegionTypeStats)
    - [x] 여행지 타입별 상세 통계 (관광지, 문화시설, 축제, 숙박 등)
    - [x] 지역-타입 조합 통계 (getDetailedRegionTypeStats)
    - [x] 지역별 인기 여행지 TOP 10 (RegionStats.popularTravels)
    - [x] 타입별 인기 여행지 TOP 10 (TypeStats.popularTravels)
    - [x] 상세 통계 UI 컴포넌트 (DetailedRegionTypeStats)
  - [x] 성능 모니터링
    - [x] API 응답 시간 모니터링 (평균, 중앙값, P95, P99) (getPerformanceMetrics)
    - [x] 페이지 로드 시간 모니터링 (LCP, FID, CLS) (PerformanceMonitoring 컴포넌트)
    - [x] 에러율 모니터링 (API 에러, 페이지 에러) (error_logs 테이블)
    - [x] 성능 메트릭 데이터베이스 저장 (performance_metrics 테이블)
    - [x] 성능 모니터링 UI 컴포넌트 (PerformanceMonitoring)
    - [x] 성능 메트릭 수집 시스템 (performance-tracker.ts, API Routes)
    - [ ] 데이터베이스 쿼리 성능 모니터링 (추후 구현)
    - [ ] 성능 임계값 알림 (응답 시간 초과, 에러율 증가) (추후 구현)
  - [x] 비용 분석
    - [x] API 사용량 추적 시스템 (api_usage_logs 테이블)
    - [x] 서비스별 사용량 통계 (service_usage_stats 테이블)
    - [x] TourAPI 호출 수 추적 (trackTourApiUsageServer)
    - [x] 네이버 지도 API 호출 수 추적 (trackNaverMapUsage)
    - [x] 월별 비용 추정 및 예측 (getCostAnalysis)
    - [x] 비용 최적화 제안 (costOptimization)
    - [x] 비용 분석 UI 컴포넌트 (CostAnalysis)
    - [ ] Vercel 사용량 추적 (함수 호출 수, 대역폭, 빌드 시간) (Vercel API 통합 필요)
    - [ ] Supabase 사용량 추적 (데이터베이스 크기, API 호출 수, Storage 사용량) (Supabase API 통합 필요)
  - [x] 예측 분석
    - [x] 사용자 증가 예측 (선형 회귀, 시계열 분석) (getUserGrowthPrediction)
    - [x] 인기 여행지 예측 (계절성, 트렌드 분석) (getPopularTravelPrediction)
    - [x] 트래픽 예측 (피크 시간대, 계절별 트래픽) (getTrafficPrediction)
    - [x] 수익 예측 (광고 수익, 예약 수수료 등) (getRevenuePrediction)
    - [x] 예측 분석 UI 컴포넌트 (Predictions)
  - [x] 리포트 생성
    - [x] 일일/주간/월간 리포트 자동 생성 (generateReport)
    - [x] 커스텀 리포트 생성 (기간, 지표 선택) (ReportGenerator)
    - [x] 리포트 데이터베이스 저장 (reports 테이블)
    - [x] 리포트 템플릿 시스템 (report_templates 테이블)
    - [x] 리포트 다운로드 (JSON 형식) (API Route)
    - [x] 리포트 생성 UI 컴포넌트 (ReportGenerator)
    - [ ] 리포트 이메일 발송 (관리자에게) (추후 구현)
    - [ ] 리포트 PDF 다운로드 (추후 구현)
    - [ ] 리포트 템플릿 저장 및 재사용 (추후 구현)
  - [ ] 알림 시스템
    - 임계값 기반 알림 (사용자 수 급증, 에러율 증가, 비용 초과 등)
    - 이메일 알림
    - 슬랙/디스코드 웹훅 연동
    - 알림 규칙 설정 (조건, 채널, 빈도)
  - [ ] 데이터 내보내기
    - 통계 데이터 CSV/Excel 내보내기
    - 통계 데이터 JSON/API 형식으로 내보내기
    - 대량 데이터 다운로드 (백업용)
  - [ ] 대시보드 커스터마이징
    - 위젯 추가/제거/재배치
    - 대시보드 레이아웃 저장
    - 여러 대시보드 생성 (예: "일일 모니터링", "주간 리포트", "비용 분석")
    - 대시보드 공유 (팀원과 공유)
  - [ ] 고급 필터링 및 검색
    - 다중 필터 조합 (지역 + 타입 + 기간)
    - 통계 데이터 검색
    - 필터 프리셋 저장
  - [ ] 데이터베이스 스키마 확장
    - analytics_events 테이블 생성 (사용자 이벤트 추적)
    - analytics_sessions 테이블 생성 (세션 추적)
    - analytics_metrics 테이블 생성 (집계된 메트릭 저장)
    - analytics_reports 테이블 생성 (생성된 리포트 저장)
    - analytics_alerts 테이블 생성 (알림 설정 및 이력)
- [x] 로깅 시스템 (`lib/utils/logger.ts`)
  - 구조화된 로깅 (info, warn, error, debug)
  - 프로덕션 환경 JSON 포맷, 개발 환경 콘솔 출력
  - API 요청, 사용자 활동, 성능 메트릭, 비용 추적 로그
- [x] 성능 모니터링 (`lib/utils/performance.ts`)
  - API 응답 시간 측정
  - 페이지 로드 시간 추적
  - 메모리 사용량 측정
  - 성능 임계값 체크 및 경고
- [x] Next.js fetch 캐싱 적용 (`lib/api/travel-api.ts`)
  - 여행지 상세: 6시간 캐시 (detailCommon)
  - 여행지 목록: 1시간 캐시 (areaBasedList, searchKeyword)
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
- [x] 전체 페이지 디자인 개선 (Design.md 원칙 반영)
- [x] 네비게이션 구조 개선 (GNB, LNB, SNB, FNB)
- [x] 접근성 기능 구현 (`components/accessibility/`)
  - 접근성 도구 모음 컴포넌트 (`accessibility-toolbar.tsx`) - 플로팅 버튼, Dialog 패널
  - 화면 확대/축소 기능 (`zoom-control.tsx`) - 100%, 125%, 150%, 200% 단계별 조절
  - 음성 출력 기능 (`text-to-speech.tsx`) - 전체 페이지/선택 영역 읽기, 속도 조절
  - RootLayout에 통합 완료
  - 키보드 단축키 지원 (Ctrl + +, Ctrl + -, Ctrl + 0)
  - localStorage를 통한 설정 저장
  - 계획서: [ACCESSIBILITY_FEATURES_PLAN.md](./ACCESSIBILITY_FEATURES_PLAN.md)

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
- [x] 404 페이지 업데이트 (`app/not-found.tsx`)
  - 여행 테마 디자인 (MapPin 아이콘)
  - "캠핑장 검색" → "여행지 검색" 텍스트 변경
  - 링크 URL 업데이트 완료
  - 접근성: 포커스 스타일, aria-label 적용 유지
- [x] 동적 Sitemap 업데이트 (`app/sitemap.ts`)
  - TourAPI로 변경 완료
  - `contentid` 필드 사용 (TourAPI)
  - URL 경로 변경: `/campings/` → `/travels/`
  - Sitemap URL 업데이트: `pitch-camping` → `pitch-travel`
- [x] Robots.txt 생성 (`app/robots.ts`)
  - 모든 검색 엔진 허용 (User-agent: \*)
  - /api/, /admin/ 경로 차단
  - Sitemap URL 지정
- [x] 성능 최적화 완료 (`next.config.ts`)
  - TourAPI 이미지 도메인 추가 (tong.visitkorea.or.kr, api.visitkorea.or.kr 등)
  - 이미지 최적화 확인: WebP/AVIF 포맷 지원, 캐싱 설정
  - 폰트 최적화 확인: display: swap 적용, 주요 폰트만 preload (이미 완료)
  - 번들 최적화 확인: NaverMap 동적 import, 코드 스플리팅 설정 (이미 완료)
  - 압축 및 보안 헤더 최적화 확인 (compress: true, poweredByHeader: false) (이미 완료)
- [x] Web Vitals 모니터링 (`components/web-vitals.tsx`)
  - LCP, CLS 측정 및 로깅
  - 성능 임계값 경고
  - 페이지 로드 시간 추적
- [x] Lighthouse 측정 가이드 작성 (`docs/LIGHTHOUSE_CHECKLIST.md`)
  - 측정 방법 안내
  - 최적화 체크리스트
  - 추가 최적화 권장사항
- [x] 네비게이션 구조 개선 (GNB, LNB, SNB, FNB)
  - GlobalNav 컴포넌트 생성 (`components/navigation/global-nav.tsx`)
    - 메인 메뉴 (홈, 안전 수칙, 피드백)
    - 모바일 햄버거 메뉴
    - 접근성 향상 (ARIA, 키보드 네비게이션)
  - LocalNav 컴포넌트 생성 (`components/navigation/local-nav.tsx`)
    - 페이지별 탭 네비게이션
    - 브레드크럼 네비게이션
    - 홈페이지: 모바일 뷰 모드 전환 탭
    - 상세페이지: 브레드크럼 네비게이션
  - SideNav 컴포넌트 생성 (`components/navigation/side-nav.tsx`)
    - 사이드바 형태의 네비게이션
    - 상세페이지: 빠른 링크 메뉴
  - FooterNav 컴포넌트 생성 (`components/navigation/footer-nav.tsx`)
    - 주요 링크, 서비스 정보, 지원 섹션
    - 소셜 미디어 링크
    - 저작권 및 API 제공자 정보
  - Layout에 FooterNav 통합 (`app/layout.tsx`)
- [x] 접근성 기능 계획서 작성 (`docs/ACCESSIBILITY_FEATURES_PLAN.md`)
  - 화면 확대/축소 기능 계획 (100%, 125%, 150%, 200%)
  - 음성 출력 기능 계획 (전체 페이지 + 선택 영역 읽기)
  - 접근성 도구 모음 계획
  - 구현 단계 및 테스트 계획

---

## [Phase 5] 배포·운영·사업성 검증

- [x] Vercel/클라우드 배포·CD, 실 운영 환경 점검
- [x] 핵심 기능 검증 체크리스트 작성(MVP 4개)
- [x] 즐겨찾기·URL복사·API 응답 성공률·데이터 정확도 측정
- [x] CS/고객 피드백 수집, 반영 플랜 수립
- [x] 투자/사업자 대상 서비스 데모·랜딩페이지 생성 (`app/demo/page.tsx`)
  - 서비스 소개 및 주요 기능 데모 (`components/demo/showcase.tsx`)
  - 통계 섹션 (실제 데이터 연동) (`components/demo/stats-section.tsx`)
  - CTA 버튼 및 연락처 정보
  - 히어로 섹션, 서비스 가치 제안, 연락처/문의 섹션 포함
- [x] 여행 관련 파트너십/마케팅 협력 구조 논의
  - 한국관광공사, 지역 관광청 등 파트너십 계획 수립 (`docs/PARTNERSHIP_PLAN.md`)
  - 파트너십 제안서 초안 작성 (`docs/PARTNERSHIP_PROPOSAL.md`)
  - 협력 구조 논의

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
  - `components/travel-detail/share-button.tsx`: URL 복사 성공/실패 추적 추가 완료
  - `components/travel-detail/bookmark-button.tsx`: 북마크 성공/실패 추적 추가 완료
  - `lib/api/travel-api.ts`: API 요청 성공/실패 및 응답 시간 추적 추가 완료
- [x] 관리자 분석 페이지 (`app/admin/analytics/page.tsx`)
  - 기능별 성공률 표시 (북마크, URL 복사, API 응답)
  - 평균 API 응답 시간 표시
  - 데이터 정확도 및 에러 발생률 표시
  - 관리자 권한 확인 통합
- [x] 분석 데이터 조회 (`actions/get-analytics.ts`)
  - 서비스 메트릭 조회 Server Action
  - 관리자 권한 확인
  - 기본 통계 데이터 반환 (향후 확장 가능)
- [ ] 통계 대시보드 고도화 (Phase 3) - 분석 페이지 확장
  - [ ] 실시간 통계 업데이트
    - WebSocket 또는 Server-Sent Events (SSE)를 통한 실시간 업데이트
    - 자동 새로고침 옵션 (5초, 10초, 30초, 1분 간격)
    - 실시간 알림 (중요 지표 임계값 초과 시)
  - [ ] 차트/그래프 시각화
    - 라인 차트: 사용자 증가 추이, 조회수 추이, 북마크 증가 추이
    - 바 차트: 지역별 통계, 타입별 통계, 일별/주별/월별 통계
    - 파이 차트: 여행지 타입 분포, 지역 분포
    - 히트맵: 시간대별 사용자 활동, 지역별 인기도
    - 차트 라이브러리 통합 (recharts, chart.js 등)
  - [ ] 시간대별/기간별 통계
    - 기간 선택 (오늘, 어제, 최근 7일, 최근 30일, 최근 3개월, 최근 1년, 커스텀)
    - 시간대별 통계 (시간, 요일, 월별)
    - 전년/전월 대비 비교 (증감률 표시)
    - 트렌드 분석 (증가/감소 추세)
  - [ ] 사용자 행동 분석
    - 사용자 세션 분석 (평균 세션 시간, 페이지 뷰, 이탈률)
    - 사용자 여정 분석 (페이지 이동 경로)
    - 사용자 세그먼트 분석 (신규/기존 사용자, 활성/비활성 사용자)
    - 사용자 리텐션 분석 (재방문율, 일별/주별/월별 리텐션)
    - 사용자 전환율 분석 (방문 → 북마크, 방문 → 리뷰)
  - [ ] 지역별/타입별 상세 통계
    - 지역별 상세 통계 (시/도별, 시군구별)
    - 여행지 타입별 상세 통계 (관광지, 문화시설, 축제, 숙박 등)
    - 지역-타입 조합 통계
    - 지역별 인기 여행지 TOP 10
    - 타입별 인기 여행지 TOP 10
  - [ ] 성능 모니터링
    - API 응답 시간 모니터링 (평균, 중앙값, P95, P99)
    - 페이지 로드 시간 모니터링 (LCP, FID, CLS)
    - 데이터베이스 쿼리 성능 모니터링
    - 에러율 모니터링 (API 에러, 페이지 에러)
    - 성능 임계값 알림 (응답 시간 초과, 에러율 증가)
  - [ ] 비용 분석
    - Vercel 사용량 추적 (함수 호출 수, 대역폭, 빌드 시간)
    - Supabase 사용량 추적 (데이터베이스 크기, API 호출 수, Storage 사용량)
    - 네이버 지도 API 호출 수 추적
    - TourAPI 호출 수 추적
    - 월별 비용 추정 및 예측
    - 비용 최적화 제안
  - [ ] 예측 분석
    - 사용자 증가 예측 (선형 회귀, 시계열 분석)
    - 인기 여행지 예측 (계절성, 트렌드 분석)
    - 트래픽 예측 (피크 시간대, 계절별 트래픽)
    - 수익 예측 (광고 수익, 예약 수수료 등)
  - [ ] 리포트 생성
    - 일일/주간/월간 리포트 자동 생성
    - 리포트 이메일 발송 (관리자에게)
    - 리포트 PDF 다운로드
    - 커스텀 리포트 생성 (기간, 지표 선택)
    - 리포트 템플릿 저장 및 재사용
  - [ ] 알림 시스템
    - 임계값 기반 알림 (사용자 수 급증, 에러율 증가, 비용 초과 등)
    - 이메일 알림
    - 슬랙/디스코드 웹훅 연동
    - 알림 규칙 설정 (조건, 채널, 빈도)
  - [ ] 데이터 내보내기
    - 통계 데이터 CSV/Excel 내보내기
    - 통계 데이터 JSON/API 형식으로 내보내기
    - 대량 데이터 다운로드 (백업용)
  - [ ] 대시보드 커스터마이징
    - 위젯 추가/제거/재배치
    - 대시보드 레이아웃 저장
    - 여러 대시보드 생성 (예: "일일 모니터링", "주간 리포트", "비용 분석")
    - 대시보드 공유 (팀원과 공유)
  - [ ] 고급 필터링 및 검색
    - 다중 필터 조합 (지역 + 타입 + 기간)
    - 통계 데이터 검색
    - 필터 프리셋 저장
  - [ ] 데이터베이스 스키마 확장
    - analytics_events 테이블 생성 (사용자 이벤트 추적)
    - analytics_sessions 테이블 생성 (세션 추적)
    - analytics_metrics 테이블 생성 (집계된 메트릭 저장)
    - analytics_reports 테이블 생성 (생성된 리포트 저장)
    - analytics_alerts 테이블 생성 (알림 설정 및 이력)
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
- [x] 광고·예약·날씨·교통 등 외부 인프라/데이터 연동계획 완료
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
- [x] 예약/문의 시스템 연동 프로토타입 (`components/travel-detail/contact-button.tsx`)
  - 홈페이지 링크를 통한 문의 기능
  - 전화번호를 통한 문의 기능
  - 예약 가능 여부 표시 (숙박 시설의 경우)
  - 상세페이지에 문의 버튼 통합
- [x] 날씨 정보 연동 프로토타입 (`components/travel-detail/weather-widget.tsx`, `lib/api/weather-api.ts`)
  - OpenWeatherMap API 연동
  - 현재 날씨 표시 (온도, 날씨 상태, 습도, 풍속)
  - 일주일 예보 표시
  - 상세페이지에 날씨 위젯 통합
  - 날씨 연동 계획 문서 작성 (`docs/WEATHER_INTEGRATION_PLAN.md`)
- [x] 광고 시스템 연동 프로토타입 (`components/ads/ad-banner.tsx`, `components/ads/ad-sidebar.tsx`)
  - Google AdSense 연동 준비
  - 광고 배너 컴포넌트 생성
  - 사이드바 광고 컴포넌트 생성
  - 목록 페이지 및 상세페이지에 광고 통합
  - 광고 연동 계획 문서 작성 (`docs/ADS_INTEGRATION_PLAN.md`)
- [x] 교통 정보 연동 프로토타입 (`components/travel-detail/transport-info.tsx`)
  - 네이버 지도 경로 안내 링크 제공 (자동차/대중교통)
  - 카카오맵 경로 안내 링크 제공 (자동차/대중교통)
  - 주소 복사 기능
  - 사용자 위치 기반 경로 안내 (선택 사항)
  - 상세페이지에 교통 정보 컴포넌트 통합
  - 교통 정보 연동 계획 문서 작성 (`docs/TRANSPORT_INTEGRATION_PLAN.md`)

### 여행 안전 정보 제공 기능

**참고**: 한국관광공사 여행 안전 정보, 외교부 해외여행 안전정보

**목표**: 사용자에게 여행 안전 정보를 제공하여 안전한 여행 문화 확산

**작업 내용**:

- [x] 여행 안전 정보 테이블 생성 (`supabase/migrations/20251106160000_create_travel_safety_guidelines_table.sql`)
  - 여행 유형별 안전 정보 카테고리 (국내여행, 해외여행, 자유여행, 패키지여행 등)
  - 주제별 안전 정보 분류 (교통안전, 건강, 자연재해, 범죄예방 등)
  - 안전 정보 제목, 내용, 이미지, 동영상 링크 저장
  - 조회수 추적 및 우선순위 관리
- [x] 여행 안전 정보 API 함수 생성 (`lib/api/safety-guidelines.ts`)
  - 여행 유형별 안전 정보 조회
  - 주제별 안전 정보 조회
  - 안전 정보 검색 기능
  - 지역/국가별 추천 기능
  - 조회수 증가 함수
- [x] 여행 안전 정보 API 라우트 생성 (`app/api/safety-guidelines/route.ts`)
  - 클라이언트 사이드에서 안전 정보 조회 API
- [x] 여행 안전 정보 컴포넌트 생성 (`components/safety/`)
  - `safety-card.tsx`: 안전 정보 카드 컴포넌트 (업데이트 완료)
  - `safety-guidelines.tsx`: 안전 정보 목록 및 필터링 컴포넌트 (업데이트 완료)
  - `safety-video.tsx`: 안전 정보 동영상 컴포넌트 (기존 유지)
  - `safety-recommendations.tsx`: 안전 정보 추천 컴포넌트 (생성 완료)
- [x] 여행 안전 정보 페이지 생성 (`app/safety/page.tsx`, `app/safety/[id]/page.tsx`)
  - 안전 정보 메인 페이지 (목록, 검색, 필터링) (업데이트 완료)
  - 안전 정보 상세 페이지 (업데이트 완료)
  - 여행 유형별/주제별 탭 분류
  - 동영상 링크 통합
- [x] 상세페이지에 안전 정보 통합 (`app/travels/[contentId]/page.tsx`)
  - 여행지 상세페이지에 관련 안전 정보 추천 추가
  - 지역/국가별 안전 정보 추천
- [x] 여행 안전 정보 문서 작성 (`docs/TRAVEL_SAFETY_GUIDELINES_PLAN.md`)

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

### UI/UX 및 네비게이션 개선 ✅ 완료

**목표**: Design.md 원칙을 반영한 현대적이고 직관적인 UI/UX 구현

**작업 내용**:

- [x] 전체 페이지 디자인 개선
  - 홈페이지 Hero 섹션 추가 (`app/page.tsx`)
    - 그라데이션 배경, 대형 제목, 현대적인 검색창
    - Design.md 원칙 반영 (모바일 퍼스트, 미니멀리즘, 비주얼 중심)
  - 레이아웃 개선 (2025-01-07)
    - 필터를 상단 가로 배치로 변경
    - 목록과 지도를 세로 배치로 변경 (목록 위, 지도 아래)
    - 모든 화면 크기에서 일관된 레이아웃 유지
  - 버그 수정 및 기능 개선 (2025-01-07)
    - TravelList 무한 루프 문제 해결 (useRef를 통한 onTravelsChange 안정화)
    - NaverMap 마커 깜빡임 문제 해결 (useRef를 통한 travels 안정화, 실제 변경 시에만 마커 업데이트)
    - 필터 컴포넌트 검색어 입력 기능 추가
    - 필터 순서 변경 (지역 → 여행지 타입 → 정렬 → 검색어)
    - 필터 제목 변경 ("필터" → "여행정보검색")
    - API Route TourAPI 우선 사용으로 변경 (실패 시 Supabase fallback)
  - 여행지 카드 디자인 개선 (`components/travel-card.tsx`)
    - 16:9 이미지 비율, 호버 시 줌 효과
    - 여행지 타입 뱃지 스타일 개선 (컬러 아이콘, rounded-full)
    - 그라데이션 오버레이 효과
  - 필터 컴포넌트 디자인 개선 (`components/travel-filters.tsx`)
    - 아이콘 배경, 더 큰 입력 필드 (h-11)
    - 활성 필터 뱃지 스타일 개선 (블루 테마)
    - 가로 배치 레이아웃 (데스크톱: 가로, 모바일: 세로)
  - 상세페이지 디자인 개선 (`app/travels/[contentId]/page.tsx`)
    - 2/3 + 1/3 그리드 레이아웃
    - 예약/문의 버튼 sticky 위치
    - 정보 구조 개선 (아이콘과 함께 표시)
  - Navbar 개선 (`components/navigation/global-nav.tsx`)
    - backdrop blur 효과
    - 테마 토글 추가
    - 반응형 개선
    - "Pitch Travel" 브랜드명 적용
  - 전역 스타일 개선 (`app/globals.css`)
    - 블루 테마 적용 (#3B82F6)
    - 포커스 스타일 개선
    - 타이포그래피 설정 (font-smoothing, line-height, heading 스타일)
- [x] 네비게이션 구조 개선 (GNB, LNB, SNB, FNB)
  - GlobalNav 컴포넌트 생성 (`components/navigation/global-nav.tsx`)
    - 메인 메뉴 (홈, 안전 수칙, 피드백)
    - 모바일 햄버거 메뉴
    - 접근성 향상 (ARIA, 키보드 네비게이션)
  - LocalNav 컴포넌트 생성 (`components/navigation/local-nav.tsx`)
    - 페이지별 탭 네비게이션
    - 브레드크럼 네비게이션
    - 홈페이지: 모바일 뷰 모드 전환 탭
    - 상세페이지: 브레드크럼 네비게이션
  - SideNav 컴포넌트 생성 (`components/navigation/side-nav.tsx`)
    - 사이드바 형태의 네비게이션
    - 상세페이지: 빠른 링크 메뉴
  - FooterNav 컴포넌트 생성 (`components/navigation/footer-nav.tsx`)
    - 주요 링크, 서비스 정보, 지원 섹션
    - 소셜 미디어 링크
    - 저작권 및 API 제공자 정보
  - Layout에 FooterNav 통합 (`app/layout.tsx`)
- [x] 접근성 기능 계획서 작성 (`docs/ACCESSIBILITY_FEATURES_PLAN.md`)
  - 화면 확대/축소 기능 계획 (100%, 125%, 150%, 200%)
  - 음성 출력 기능 계획 (전체 페이지 + 선택 영역 읽기)
  - 접근성 도구 모음 계획
  - 구현 단계 및 테스트 계획

**우선순위**: High (사용자 경험 및 접근성 향상)

### API 및 성능 개선 ✅ 완료

**작업 내용**:

- [x] API 라우트 TourAPI 우선 사용 (`app/api/travels/route.ts`)
  - 한국관광공사 TourAPI를 우선 사용
  - TourAPI 실패 시 Supabase fallback으로 자동 전환
  - 키워드 검색: searchTravel() 메서드 사용
  - 지역/타입 필터: getTravelList() 메서드 사용
  - 필터링, 검색, 정렬, 페이지네이션 지원
  - TourAPI 응답 형식과 호환되도록 데이터 변환
  - CORS 헤더 추가 (Access-Control-Allow-Origin, Access-Control-Allow-Methods)
  - OPTIONS 요청 처리 (preflight)
  - 캐싱 전략 적용 (5분 캐시, 10분 stale-while-revalidate)
- [x] 유틸리티 함수 리팩토링 (`lib/utils/travel.ts`)
  - `normalizeTravelItems` 함수를 TravelApiClient에서 분리 완료
  - 클라이언트/서버 양쪽에서 사용 가능한 순수 함수로 변경 완료
- [x] 이미지 최적화 (`next.config.ts`)
  - TourAPI 이미지 도메인 추가 (한국관광공사 이미지 서버)
  - `tong.visitkorea.or.kr`, `api.visitkorea.or.kr` 등 도메인 설정
  - HTTPS 프로토콜 및 pathname 패턴 지정
  - deviceSizes 및 imageSizes 최적화
  - AVIF, WebP 포맷 지원
  - 24시간 캐시 TTL 설정

**우선순위**: High (기능 안정성 및 성능 향상)

**참고 데이터**:

- 여행 안전 정보 카테고리:
  - 여행 유형별: 국내여행, 해외여행, 자유여행, 패키지여행
  - 주제별: 교통안전, 건강, 자연재해, 범죄예방, 여행보험, 비상연락처 등
  - 안전 교육: 여행 안전 동영상, 여행 가이드

---

## 참고 체크리스트

- [ ] API 품질·속도, DB, 보안, 클라우드 비용 등 관리
- [ ] 사업화 및 BM 구조팀(오너, CTO, PO, 마케터, 디자이너) 역할 분담
- [ ] 매주/매월 점검 미팅 및 버전관리
- [ ] 서비스 성장, 확장, 업그레이드 로드맵 수립

---

> 진심을 담아 요구사항, 실전 운영, 사업화·확장까지 누락없이 기록.
> 사업 성공을 위한 MVP·팀워크·확장성 실질 행동계획.
