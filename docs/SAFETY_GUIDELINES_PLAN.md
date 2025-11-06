# 캠핑 안전 수칙 기능 구현 계획

## 개요

고캠핑 사이트의 안전 수칙 정보를 활용하여 사용자에게 안전한 캠핑 정보를 제공하는 기능입니다.

**참고 자료**: [고캠핑 안전한캠핑즐기기](https://www.gocamping.or.kr/zboard/list.do?lmCode=campSafe)

## 목표

- 사용자에게 안전한 캠핑 수칙 정보 제공
- 계절별/주제별 안전 수칙 분류 및 검색
- 캠핑장 상세페이지와 연동하여 관련 안전 수칙 추천
- 안전 교육 동영상 통합

## 데이터 구조 설계

### 안전 수칙 테이블 스키마

```sql
CREATE TABLE safety_guidelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL, -- 안전 수칙 제목
  content TEXT NOT NULL, -- 안전 수칙 내용
  season TEXT CHECK (season IN ('spring', 'summer', 'autumn', 'winter', 'all')), -- 계절
  topic TEXT NOT NULL, -- 주제 (food_poisoning, water_play, insects, wildlife, weather, heater, gas, co, etc.)
  image_url TEXT, -- 이미지 URL
  video_url TEXT, -- 동영상 URL
  video_type TEXT CHECK (video_type IN ('youtube', 'external', 'internal')), -- 동영상 타입
  source_url TEXT, -- 출처 URL (고캠핑 사이트)
  view_count INTEGER DEFAULT 0, -- 조회수
  priority INTEGER DEFAULT 0, -- 우선순위 (높을수록 먼저 표시)
  is_active BOOLEAN DEFAULT true, -- 활성화 여부
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 주제별 분류

- `food_poisoning`: 식중독
- `water_play`: 물놀이
- `insects`: 벌레
- `wildlife`: 야생동물
- `weather`: 이상기후/자연재해
- `heat`: 폭염
- `heater`: 난로
- `gas`: 가스 사고
- `co`: 일산화탄소 중독
- `preparation`: 캠핑 준비사항
- `general`: 일반 안전 수칙

## UI/UX 설계

### 1. 안전 수칙 메인 페이지 (`/safety`)

**레이아웃**:
- 헤더: "안전한 캠핑 즐기기" 제목
- 필터 탭:
  - 계절별 탭: 전체, 봄, 여름, 가을, 겨울
  - 주제별 탭: 전체, 식중독, 물놀이, 벌레, 야생동물, 이상기후, 난로, 가스 등
- 안전 수칙 카드 그리드:
  - 제목, 썸네일 이미지, 계절/주제 태그
  - 클릭 시 상세 모달 또는 상세 페이지로 이동
- 동영상 섹션:
  - 동영상 카드 표시
  - YouTube 임베드 또는 링크

### 2. 안전 수칙 상세 페이지/모달

**내용**:
- 제목
- 본문 내용 (마크다운 형식 지원)
- 이미지 갤러리
- 동영상 (있는 경우)
- 관련 안전 수칙 추천
- 출처 링크

### 3. 캠핑장 상세페이지 통합

**위치**: 상세페이지 하단 또는 사이드바

**기능**:
- 현재 계절 기반 안전 수칙 추천
- 캠핑 타입 기반 안전 수칙 추천 (글램핑, 카라반 등)
- "안전 수칙 보기" 버튼/링크

## 구현 단계

### 1단계: 데이터베이스 및 API 구축

1. 안전 수칙 테이블 마이그레이션 파일 생성
2. 안전 수칙 API 함수 생성 (`lib/api/safety-guidelines.ts`)
   - `getSafetyGuidelines()`: 전체 조회
   - `getSafetyGuidelinesBySeason()`: 계절별 조회
   - `getSafetyGuidelinesByTopic()`: 주제별 조회
   - `getSafetyGuidelineById()`: 상세 조회
   - `searchSafetyGuidelines()`: 검색
3. 초기 데이터 수집 스크립트 (선택 사항)

### 2단계: UI 컴포넌트 개발

1. 안전 수칙 카드 컴포넌트 (`components/safety/safety-card.tsx`)
2. 안전 수칙 목록 컴포넌트 (`components/safety/safety-guidelines.tsx`)
3. 안전 수칙 상세 모달/페이지 (`components/safety/safety-detail.tsx`)
4. 동영상 컴포넌트 (`components/safety/safety-video.tsx`)
5. 필터 컴포넌트 (`components/safety/safety-filters.tsx`)

### 3단계: 페이지 개발

1. 안전 수칙 메인 페이지 (`app/safety/page.tsx`)
2. 안전 수칙 상세 페이지 (`app/safety/[id]/page.tsx`) (선택 사항)

### 4단계: 통합

1. 캠핑장 상세페이지에 안전 수칙 링크 추가
2. 관련 안전 수칙 추천 로직 구현
3. 네비게이션 메뉴에 안전 수칙 링크 추가

## 데이터 수집 계획

**고캠핑 사이트에서 수집할 정보**:
- 제목
- 본문 내용
- 이미지 URL
- 동영상 URL (있는 경우)
- 계절 정보
- 주제 정보

**수집 방법**:
1. 수동 데이터 입력 (초기)
2. 크롤링 스크립트 (자동화, 선택 사항)
3. 관리자 대시보드에서 직접 입력 (향후)

## 우선순위

**High**: 
- 안전 수칙 테이블 및 API 구축
- 기본 안전 수칙 페이지 생성

**Medium**:
- 상세페이지 통합
- 동영상 통합
- 검색 기능

**Low**:
- 자동 데이터 수집 스크립트
- 관리자 대시보드

## 참고사항

- 고캠핑 사이트의 저작권 고려 (출처 명시)
- 사용자에게 실제 현장 상황과 다를 수 있음을 안내
- 정기적으로 정보 업데이트 필요

