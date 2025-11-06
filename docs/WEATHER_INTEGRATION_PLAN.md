# 날씨 정보 연동 계획

## 개요

Pitch Travel 서비스에 날씨 정보 기능을 추가하여 사용자가 여행지를 방문하기 전 날씨를 확인할 수 있도록 합니다.

## 1. API 선택

### 1.1 조사 대상

- **기상청 Open API** (공공데이터포털)
  - 한국 공식 기상 데이터
  - 무료 사용 가능
  - 정확도 높음
  - 단기/중기 예보 제공
  - 단점: 신청 절차 복잡, API 구조 복잡

- **OpenWeatherMap API**
  - 전 세계 날씨 데이터
  - 무료 티어 제공 (월 1,000회 호출)
  - 사용하기 쉬운 API
  - 일주일 예보 제공
  - 단점: 한국 지역 데이터 정확도가 기상청보다 낮을 수 있음

### 1.2 선택: OpenWeatherMap API

**선택 이유**:
- 프로토타입 단계에서 빠른 구현 가능
- 무료 티어로 충분한 테스트 가능
- 향후 기상청 API로 전환 가능하도록 구조 설계

**향후 전환 계획**:
- 사용자 피드백 수집 후 기상청 API 전환 검토
- 두 API를 모두 지원하는 구조로 설계

## 2. 구현 내용

### 2.1 날씨 API 클라이언트

**파일**: `lib/api/weather-api.ts`

**주요 기능**:
- 현재 날씨 조회 (위도/경도 기반)
- 일주일 예보 조회
- 날씨 데이터 정규화
- 에러 처리 및 로깅

**API 엔드포인트**:
- 현재 날씨: `GET /weather`
- 일주일 예보: `GET /forecast`

### 2.2 날씨 위젯 컴포넌트

**파일**: `components/travel-detail/weather-widget.tsx`

**주요 기능**:
- 현재 날씨 표시 (온도, 날씨 상태, 습도, 풍속)
- 일주일 예보 표시
- 날씨 아이콘 표시
- 로딩 및 에러 상태 처리

**UI 구성**:
- 현재 날씨 카드
  - 온도 (큰 글씨)
  - 체감 온도
  - 날씨 설명
  - 습도, 풍속 정보
- 일주일 예보 리스트
  - 요일별 최고/최저 온도
  - 날씨 아이콘
  - 강수 확률

### 2.3 상세페이지 통합

**파일**: `app/travels/[contentId]/page.tsx`

**통합 위치**:
- 우측 사이드바 상단
- 빠른 링크 메뉴 위에 배치

**조건부 렌더링**:
- 좌표 정보가 있는 경우에만 표시
- API 키가 없는 경우 에러 메시지 표시

## 3. 환경 변수 설정

### 3.1 필요한 환경 변수

```env
# OpenWeatherMap API 키
OPENWEATHER_API_KEY=your_api_key_here

# 또는 클라이언트 사이드에서 사용하는 경우
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_api_key_here
```

### 3.2 API 키 발급 방법

1. [OpenWeatherMap](https://openweathermap.org/) 회원가입
2. API Keys 메뉴에서 새 API 키 생성
3. Free 플랜 선택 (월 1,000회 호출 무료)
4. 생성된 API 키를 환경 변수에 추가

### 3.3 보안 고려사항

- **서버 사이드 사용 권장**: `OPENWEATHER_API_KEY` 사용 (클라이언트에 노출되지 않음)
- **클라이언트 사이드 사용 시**: `NEXT_PUBLIC_OPENWEATHER_API_KEY` 사용 (공개되어도 무료 티어이므로 문제 없음)
- **Rate Limit**: 무료 티어는 분당 60회 호출 제한

## 4. 데이터 구조

### 4.1 현재 날씨 데이터

```typescript
interface WeatherData {
  temperature: number; // 현재 온도 (섭씨)
  feelsLike: number; // 체감 온도
  humidity: number; // 습도 (%)
  description: string; // 날씨 설명
  icon: string; // 날씨 아이콘 코드
  windSpeed: number; // 풍속 (m/s)
  windDirection?: number; // 풍향 (도)
  pressure?: number; // 기압 (hPa)
  visibility?: number; // 가시거리 (km)
  location: {
    lat: number;
    lon: number;
    name?: string;
  };
}
```

### 4.2 일주일 예보 데이터

```typescript
interface ForecastItem {
  date: string; // 날짜 (ISO 8601)
  dateText: string; // 날짜 텍스트
  dayOfWeek: string; // 요일
  tempMin: number; // 최저 온도
  tempMax: number; // 최고 온도
  description: string; // 날씨 설명
  icon: string; // 날씨 아이콘 코드
  humidity: number; // 습도
  windSpeed: number; // 풍속
  precipitation?: number; // 강수 확률 (%)
}
```

## 5. 향후 개선 사항

### 5.1 기상청 API 전환

- 사용자 피드백 수집 후 정확도 개선 필요 시 전환
- 두 API를 모두 지원하는 구조로 설계되어 있어 전환 용이

### 5.2 추가 기능

- **날씨 기반 여행 추천**: 날씨가 좋은 여행지 추천
- **캠핑 날씨 지수**: 캠핑하기 좋은 날씨 지수 계산
- **실시간 알림**: 날씨가 좋은 날 알림 기능
- **날씨 히스토리**: 과거 날씨 데이터 표시

### 5.3 성능 최적화

- **캐싱**: Next.js `revalidate` 옵션으로 5분 캐시
- **병렬 요청**: 현재 날씨와 예보를 병렬로 조회
- **에러 처리**: API 실패 시 graceful degradation

## 6. 테스트 계획

### 6.1 기능 테스트

- [ ] 좌표가 있는 여행지에서 날씨 정보 표시 확인
- [ ] 좌표가 없는 여행지에서 위젯이 표시되지 않는지 확인
- [ ] API 키가 없을 때 에러 메시지 표시 확인
- [ ] 로딩 상태 표시 확인
- [ ] 일주일 예보 정확도 확인

### 6.2 성능 테스트

- [ ] API 응답 시간 측정
- [ ] 캐싱 동작 확인
- [ ] Rate Limit 확인

### 6.3 사용자 테스트

- [ ] 날씨 정보의 정확도 피드백 수집
- [ ] UI/UX 개선 사항 수집
- [ ] 추가 기능 요청 수집

## 7. 참고 자료

- [OpenWeatherMap API 문서](https://openweathermap.org/api)
- [기상청 Open API](https://www.data.go.kr/)
- [Next.js Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)

---

**최종 업데이트**: 2025년 11월
**다음 리뷰**: 사용자 피드백 수집 후

