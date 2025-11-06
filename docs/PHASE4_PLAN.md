# Phase 4 개발 계획: UI/UX·접근성·최적화

## 개요

Phase 4는 프로덕션 배포 준비를 위한 사용자 경험 개선, 접근성 강화, SEO 최적화를 완료하는 단계입니다. Lighthouse 점수 80+ 달성을 목표로 전반적인 품질 향상을 추구합니다.

## 목표

- 다크/라이트 모드 완벽 지원
- 모든 로딩 상태 개선 (Skeleton UI)
- WCAG 2.1 AA 준수 접근성
- SEO 기본 설정 완료 (sitemap, robots.txt)
- Lighthouse 점수 80+ 달성

## 작업 항목

### 1. 다크/라이트 모드 완벽 지원

#### 1.1 테마 전환 UI 구현

**파일**: `components/theme-toggle.tsx`

**구현 내용**:
- 테마 전환 버튼 컴포넌트 (Sun/Moon 아이콘)
- `next-themes`의 `useTheme` 훅 사용
- 시스템 설정, 라이트, 다크 모드 전환 지원
- 부드러운 트랜지션 애니메이션

**기술 사항**:
- lucide-react의 Sun, Moon 아이콘 사용
- Button 컴포넌트로 구현
- 접근성: aria-label 추가

#### 1.2 ThemeProvider 통합

**파일**: `app/layout.tsx`

**구현 내용**:
- `next-themes`의 `ThemeProvider` 추가
- `attribute="class"` 설정 (Tailwind CSS dark 모드)
- `enableSystem` 옵션 활성화
- `defaultTheme="system"` 설정

**헤더 통합**:
- 헤더에 테마 토글 버튼 추가
- 모바일/데스크톱 모두 지원

#### 1.3 다크 모드 스타일 검증

**검사 대상 컴포넌트**:
- `components/camping-card.tsx`
- `components/camping-list.tsx`
- `components/camping-filters.tsx`
- `components/camping-search.tsx`
- `components/naver-map.tsx`
- `components/camping-detail/review-section.tsx`
- 모든 페이지 컴포넌트

**작업 내용**:
- 모든 컴포넌트에서 `dark:` 클래스 확인
- 색상 대비 검증 (WCAG AA)
- 다크 모드에서 이미지 가시성 확인

#### 1.4 브랜딩 컬러 스킴 조정

**파일**: `app/globals.css`

**작업 내용**:
- 캠핑/자연 테마에 맞는 초록색, 갈색 계열 조정
- Primary 색상: 초록색 계열 (`#22c55e` 또는 유사)
- Secondary 색상: 갈색/베이지 계열

**다크 모드 색상**:
- 어두운 배경에 최적화된 색상 조정
- 가독성 확보

### 2. 로딩 상태 개선

#### 2.1 재사용 가능한 스켈레톤 컴포넌트 생성

**파일**: `components/loading/card-skeleton.tsx`

**구현 내용**:
- 캠핑 카드와 동일한 레이아웃의 스켈레톤
- 이미지 영역, 텍스트 라인, 뱃지 영역
- `animate-pulse` 애니메이션

**파일**: `components/loading/map-skeleton.tsx`

**구현 내용**:
- 지도 영역과 동일한 크기의 스켈레톤
- 중앙에 스피너 또는 로딩 텍스트
- 네이버 지도 스타일과 유사한 디자인

**파일**: `components/loading/image-skeleton.tsx`

**구현 내용**:
- 이미지 로딩 중 표시할 스켈레톤
- aspect-ratio 유지
- Blur placeholder 효과

**파일**: `components/loading/detail-skeleton.tsx`

**구현 내용**:
- 상세페이지 레이아웃과 동일한 스켈레톤
- 이미지, 텍스트, 정보 섹션별 스켈레톤

#### 2.2 각 컴포넌트에 로딩 상태 적용

**파일**: `components/naver-map.tsx`

**작업 내용**:
- 지도 로드 완료 전 `MapSkeleton` 표시
- 스크립트 로드 상태 관리 개선

**파일**: `components/camping-detail/detail-gallery.tsx`

**작업 내용**:
- 이미지 로딩 중 `ImageSkeleton` 표시
- Lazy loading 적용

**파일**: `app/campings/[contentId]/page.tsx`

**작업 내용**:
- React Suspense로 `DetailSkeleton` 적용
- 데이터 로딩 중 스켈레톤 표시

**파일**: `components/camping-list.tsx`

**작업 내용**:
- 기존 Skeleton을 `CardSkeleton` 컴포넌트로 교체
- 일관된 로딩 UI

### 3. 접근성 전수 검사 및 개선

#### 3.1 ARIA 속성 추가

**작업 내용**:
- 모든 인터랙티브 요소에 `aria-label` 추가
- 폼 요소에 `aria-describedby` 추가 (에러 메시지)
- 드롭다운/모달에 `aria-expanded`, `aria-controls` 추가
- 네비게이션에 `aria-current="page"` 추가

**대상 컴포넌트**:
- `components/camping-filters.tsx`: Select, Checkbox
- `components/camping-search.tsx`: Input, Button
- `components/camping-card.tsx`: Link
- `components/naver-map.tsx`: 지도 컨테이너
- `components/camping-detail/review-section.tsx`: 폼, 버튼
- `components/camping-detail/share-button.tsx`: Button
- `components/camping-detail/bookmark-button.tsx`: Button

#### 3.2 키보드 네비게이션 지원

**작업 내용**:
- 모든 버튼, 링크가 키보드로 접근 가능
- Tab 순서 논리적 구성 (위→아래, 좌→우)
- Enter/Space로 버튼 활성화
- Escape로 모달/드롭다운 닫기
- 화살표 키로 목록 네비게이션 (선택적)

**포커스 스타일**:
- 모든 인터랙티브 요소에 명확한 포커스 링
- `focus:ring-2 focus:ring-green-500`
- `focus:outline-none` (커스텀 스타일로 대체)

#### 3.3 스크린 리더 지원

**작업 내용**:
- 의미 있는 alt 텍스트 (이미지)
- 숨김 텍스트 추가 (`sr-only` 클래스)
- Skip to content 링크 추가 (`app/layout.tsx`)

**파일**: `app/layout.tsx`

**Skip to content 링크**:
```tsx
<a href="#main-content" className="sr-only focus:not-sr-only">
  메인 콘텐츠로 건너뛰기
</a>
```

#### 3.4 색상 대비 검증

**작업 내용**:
- 모든 텍스트/배경 색상 조합의 대비율 확인
- WCAG AA 기준: 4.5:1 (일반 텍스트), 3:1 (큰 텍스트)
- 대비율이 부족한 경우 색상 조정

**검증 도구**:
- 브라우저 개발자 도구 (Accessibility 탭)
- 색상 대비 계산기 사용

### 4. 404/오프라인 페이지

#### 4.1 404 페이지

**파일**: `app/not-found.tsx`

**구현 내용**:
- 캠핑 테마에 맞는 디자인
- "페이지를 찾을 수 없습니다" 메시지
- 홈으로 돌아가기 버튼
- 검색 기능 링크 (선택적)

**디자인**:
- Tent 아이콘 또는 캠핑 이미지
- 친화적인 에러 메시지
- 다크 모드 지원

#### 4.2 오프라인 안내

**파일**: `app/offline/page.tsx` (선택적)

**구현 내용**:
- 오프라인 상태 안내 페이지
- 네트워크 연결 확인 안내
- 재시도 버튼

**파일**: `components/offline-indicator.tsx` (선택적)

**구현 내용**:
- 오프라인 감지 시 상단 배너 표시
- 네트워크 상태 모니터링
- 자동 재연결 시 배너 숨김

### 5. SEO 최적화

#### 5.1 동적 Sitemap 생성

**파일**: `app/sitemap.ts`

**구현 내용**:
- Next.js 15의 sitemap 기능 활용
- 고캠핑 API를 통한 캠핑장 목록 조회
- 각 캠핑장 상세페이지 URL 추가
- 변경 빈도(changeFrequency) 및 우선순위(priority) 설정

**구조**:
- 홈페이지 (`/`): priority 1.0
- 캠핑장 상세 (`/campings/[contentId]`): priority 0.8
- 정적 페이지들: priority 0.5

#### 5.2 Robots.txt 생성

**파일**: `app/robots.ts`

**구현 내용**:
- 모든 검색 엔진 허용 (User-agent: *)
- Sitemap URL 지정
- 불필요한 경로 차단 (선택적)

**예시**:
```
User-agent: *
Allow: /
Disallow: /api/
Sitemap: https://pitch-camping.vercel.app/sitemap.xml
```

#### 5.3 동적 메타데이터 개선

**파일**: `app/campings/[contentId]/page.tsx`

**작업 내용**:
- `generateMetadata` 함수 개선
- 더 상세한 Open Graph 메타데이터
- Twitter 카드 메타데이터 개선
- 구조화된 데이터 (JSON-LD) 추가 (선택적)

**구조화된 데이터**:
- LocalBusiness 스키마 (캠핑장 정보)
- BreadcrumbList 스키마 (선택적)

### 6. 성능 최적화 및 Lighthouse 점수 달성

#### 6.1 이미지 최적화

**작업 내용**:
- Next.js Image 컴포넌트 활용 확인
- `priority` 속성 사용 (above-the-fold 이미지)
- `loading="lazy"` 적용 (below-the-fold 이미지)
- 적절한 `sizes` 속성 설정

**파일**: `next.config.js` (필요 시)

**이미지 도메인 설정**:
- 고캠핑 API 이미지 도메인 추가
- 외부 이미지 최적화 설정

#### 6.2 폰트 최적화

**파일**: `app/layout.tsx`

**작업 내용**:
- 폰트 preload 추가
- `display: swap` 설정 (FOUT 방지)
- 폰트 파일 크기 최적화

#### 6.3 번들 크기 최적화

**작업 내용**:
- Dynamic import 확인 (지도 컴포넌트 등)
- 불필요한 의존성 제거
- Tree shaking 확인

**확인 대상**:
- `components/naver-map.tsx`: 동적 로드 확인
- 대용량 라이브러리: 필요한 부분만 import

#### 6.4 Web Vitals 모니터링

**파일**: `lib/utils/performance.ts`

**작업 내용**:
- Web Vitals 측정 함수 개선
- LCP, FID, CLS 측정
- 프로덕션 환경에서 분석 서비스 연동 (선택적)

#### 6.5 Lighthouse 성능 측정

**작업 내용**:
- 개발 서버에서 Lighthouse 실행
- 성능, 접근성, SEO, Best Practices 점수 확인
- 80점 미만 항목 개선
- 목표 점수 달성 확인

**측정 항목**:
- Performance: 80+
- Accessibility: 90+
- Best Practices: 90+
- SEO: 90+

## 구현 순서

1. **Week 1**: 다크/라이트 모드 (테마 전환 UI, 스타일 검증)
2. **Week 2**: 로딩 상태 개선 (스켈레톤 컴포넌트 생성 및 적용)
3. **Week 3**: 접근성 개선 (ARIA 속성, 키보드 네비게이션)
4. **Week 4**: 에러 페이지 및 SEO (404, sitemap, robots.txt)
5. **Week 5**: 성능 최적화 및 Lighthouse 측정

## 완료 기준

- [ ] 다크/라이트 모드 전환 정상 작동
- [ ] 모든 주요 컴포넌트에 로딩 상태 적용
- [ ] WCAG 2.1 AA 준수 (접근성 검사 통과)
- [ ] 404 페이지 정상 작동
- [ ] Sitemap 및 robots.txt 생성 완료
- [ ] Lighthouse 점수 80+ 달성 (Performance 포함)

## 참고 자료

- [Next.js SEO 가이드](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [WCAG 2.1 가이드](https://www.w3.org/WAI/WCAG21/quickref/)
- [next-themes 문서](https://github.com/pacocoursey/next-themes)
- [Lighthouse 성능 가이드](https://developer.chrome.com/docs/lighthouse/performance/)

## 다음 단계

Phase 5로 진행하여 배포 및 운영 환경 점검.

