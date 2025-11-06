/**
 * @file lighthouse-checklist.md
 * @description Lighthouse 성능 측정 체크리스트
 *
 * Lighthouse 점수 80+ 달성을 위한 측정 가이드 및 최적화 체크리스트
 */

# Lighthouse 성능 측정 가이드

## 측정 방법

### 1. 개발 서버 실행
```bash
pnpm dev
```

### 2. Chrome DevTools에서 Lighthouse 실행
1. Chrome 브라우저에서 `http://localhost:3000` 열기
2. F12로 DevTools 열기
3. "Lighthouse" 탭 선택
4. 측정할 카테고리 선택:
   - Performance (성능)
   - Accessibility (접근성)
   - Best Practices (모범 사례)
   - SEO (검색 엔진 최적화)
5. "Generate report" 클릭

### 3. 목표 점수
- **Performance**: 80+
- **Accessibility**: 90+
- **Best Practices**: 90+
- **SEO**: 90+

## 구현된 최적화

### ✅ 이미지 최적화
- Next.js Image 컴포넌트 사용 (`components/camping-card.tsx`, `components/camping-detail/detail-gallery.tsx`)
- `priority` 속성: 상세페이지 첫 이미지에 적용
- `loading="lazy"`: 목록 카드 이미지에 적용
- `sizes` 속성: 반응형 이미지 크기 지정
- WebP/AVIF 포맷 지원 (`next.config.ts`)
- 이미지 캐싱: 24시간 TTL 설정

### ✅ 폰트 최적화
- `display: swap` 설정 (FOUT 방지)
- 주요 폰트만 preload (`app/layout.tsx`)
- 서브셋 폰트 사용 (latin만)

### ✅ 번들 크기 최적화
- NaverMap 동적 import (`app/page.tsx`)
  - SSR 비활성화
  - 번들 분리
  - 로딩 스켈레톤 표시
- 코드 스플리팅 설정 (`next.config.ts`)
  - Vendor chunk 분리
  - Common chunk 분리

### ✅ 성능 모니터링
- Web Vitals 측정 (`components/web-vitals.tsx`)
  - LCP (Largest Contentful Paint) 측정
  - CLS (Cumulative Layout Shift) 측정
  - 페이지 로드 시간 추적
- 성능 로깅 (`lib/utils/performance.ts`)

### ✅ 캐싱 전략
- API 응답 캐싱 (`lib/api/camping-api.ts`)
  - 목록: 1시간 캐시
  - 상세: 6시간 캐시
- Next.js fetch 캐싱 활용

### ✅ 접근성 개선
- ARIA 속성 추가
- 키보드 네비게이션 지원
- 스크린 리더 지원
- 포커스 스타일 개선

## 추가 최적화 권장사항

### 이미지 최적화
- [ ] 고캠핑 API 이미지 도메인 확인 및 `next.config.ts` 업데이트
- [ ] 이미지 압축 품질 조정 (필요시)
- [ ] Blur placeholder 적용 검토

### 코드 최적화
- [ ] 불필요한 dependencies 제거
- [ ] Tree shaking 확인
- [ ] 번들 분석 실행 (`ANALYZE=true pnpm build`)

### 성능 최적화
- [ ] React.memo 적용 (불필요한 리렌더링 방지)
- [ ] useMemo/useCallback 활용 (비용이 큰 계산 최적화)
- [ ] Virtual scrolling 적용 (긴 목록의 경우)

### 캐싱 최적화
- [ ] ISR (Incremental Static Regeneration) 적용 검토
- [ ] Edge caching 설정 (Vercel의 경우 자동)

## 측정 후 작업

1. **점수가 80 미만인 경우**:
   - Lighthouse 리포트의 "Opportunities" 섹션 확인
   - 각 항목별 최적화 적용
   - 재측정 후 점수 확인

2. **점수가 80 이상인 경우**:
   - TODO.md에 체크 표시
   - 최적화 내용 문서화
   - 프로덕션 배포 준비

## 참고 자료

- [Lighthouse Documentation](https://developer.chrome.com/docs/lighthouse/)
- [Web Vitals](https://web.dev/vitals/)
- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Next.js Font Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)

