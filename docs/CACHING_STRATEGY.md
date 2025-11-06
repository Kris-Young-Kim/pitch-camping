# API 데이터 캐싱 전략

## 목적
- API 호출 비용 절감 (Rate Limit 고려)
- 사용자 경험 개선 (응답 속도 향상)
- 서버 부하 감소
- 데이터 일관성 유지

## 현재 상황 분석

### API 호출 현황
- **클라이언트 사이드 호출**: `components/camping-list.tsx`에서 직접 API 호출
- **캐싱 없음**: 매번 API 호출 발생
- **고캠핑 API 특성**: 공공데이터, Rate Limit 존재 가능성

### 주요 이슈
1. 동일한 필터 조건으로 반복 호출 시 불필요한 API 호출
2. 페이지네이션 이동 시 매번 API 호출
3. 상세페이지 조회 시마다 API 호출

## 캐싱 전략

### 1. 서버 사이드 캐싱 (우선 적용)

#### 1.1 Next.js 15 fetch 캐싱
- **적용 대상**: Server Components, Server Actions
- **방법**: `fetch` 옵션에 `next.revalidate` 사용
- **캐시 시간**: 1시간 (3600초)

```typescript
// lib/api/camping-api.ts에 추가
async getCampingListWithCache(filter: CampingFilter) {
  const url = this.buildUrl('/basedList', filter);
  
  const response = await fetch(url, {
    next: { 
      revalidate: 3600, // 1시간 캐시
      tags: ['camping-list'] // On-demand Revalidation용 태그
    }
  });
  
  return response.json();
}
```

#### 1.2 Server Actions 구현
- **목적**: API 호출을 서버 사이드로 이동
- **파일**: `app/api/campings/route.ts` 또는 Server Actions 사용
- **장점**: 
  - Next.js 자동 캐싱 활용
  - API 키 보안 강화
  - 로깅 및 모니터링 용이

### 2. 클라이언트 사이드 캐싱 (보조 전략)

#### 2.1 React Query (TanStack Query) 도입
- **목적**: 클라이언트 사이드 상태 관리 및 캐싱
- **캐시 시간**: 5분 (300초)
- **Stale Time**: 5분
- **Cache Time**: 10분

```typescript
// hooks/use-camping-list.ts
import { useQuery } from '@tanstack/react-query';

export function useCampingList(filter: CampingFilter) {
  return useQuery({
    queryKey: ['camping-list', filter],
    queryFn: () => campingApi.getCampingList(filter),
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });
}
```

#### 2.2 URL 기반 캐싱 키
- **방법**: 필터 조건을 URL 쿼리 파라미터로 관리
- **장점**: 브라우저 뒤로가기/앞으로가기 시 캐시 활용
- **구현**: 이미 URL 쿼리 파라미터 사용 중

### 3. 데이터별 캐싱 전략

#### 3.1 캠핑장 목록
- **캐시 시간**: 1시간 (공공데이터, 자주 변경되지 않음)
- **캐시 키**: 필터 조건 조합 (region, type, facilities, keyword, page)
- **Invalidation**: 
  - 수동 갱신 버튼 제공
  - 최대 24시간 후 자동 갱신

#### 3.2 캠핑장 상세 정보
- **캐시 시간**: 6시간 (상세 정보는 더욱 안정적)
- **캐시 키**: contentId
- **ISR 적용**: `generateStaticParams`로 인기 캠핑장 사전 생성

#### 3.3 검색 결과
- **캐시 시간**: 30분 (검색은 더 자주 변경될 수 있음)
- **캐시 키**: keyword + 필터 조건
- **Debounce**: 검색 입력 시 500ms 지연

### 4. 구현 단계

#### Phase 1: 서버 사이드 캐싱 추가 (즉시 적용 가능)
1. Server Actions 생성 (`actions/camping.ts`)
2. Next.js fetch 캐싱 옵션 추가
3. 클라이언트 컴포넌트를 Server Component로 전환 (가능한 경우)

#### Phase 2: React Query 도입 (선택적)
1. `@tanstack/react-query` 설치
2. QueryClient Provider 설정
3. 커스텀 훅 생성 (`use-camping-list.ts`, `use-camping-detail.ts`)

#### Phase 3: 고급 캐싱 전략
1. On-demand Revalidation (태그 기반)
2. ISR (Incremental Static Regeneration) 적용
3. Edge Caching (Vercel Edge Network 활용)

## 예상 효과

### 성능 개선
- **첫 로드**: 동일 (API 호출 필요)
- **재방문**: 50-90% 속도 개선 (캐시 히트)
- **페이지네이션**: 즉시 응답 (캐시된 데이터)

### 비용 절감
- **API 호출 수**: 50-80% 감소
- **Rate Limit 회피**: 캐시로 인한 호출 제한 완화

### 사용자 경험
- **로딩 시간**: 평균 70% 단축
- **오프라인 지원**: 캐시된 데이터로 부분 지원 가능

## 모니터링 및 최적화

### 추적 지표
- 캐시 히트율
- API 호출 수
- 평균 응답 시간
- 에러율

### 설정 조정
- 캐시 시간 조정 (분석 결과 기반)
- Stale Time 최적화
- 필요 시 캐시 무효화 전략 개선

## 주의사항

### 데이터 신선도
- 공공데이터는 신뢰도가 높지만, 최신 정보가 필요할 수 있음
- 사용자에게 "마지막 업데이트 시간" 표시 제공

### Rate Limit 대응
- 캐시가 없을 때 연속 호출 방지
- 에러 발생 시 재시도 로직 구현
- Fallback 데이터 제공

## 구현 우선순위

1. **높음**: 서버 사이드 캐싱 (Next.js fetch 옵션)
2. **중간**: React Query 도입
3. **낮음**: 고급 캐싱 전략 (ISR, Edge Caching)

