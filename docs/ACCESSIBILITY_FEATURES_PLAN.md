# 접근성 기능 구현 계획서

## 개요

시각장애인을 위한 접근성 기능을 추가하여 WCAG 2.1 AAA 수준의 접근성을 달성합니다. 화면 확대/축소 및 음성 출력 기능을 포함한 접근성 도구 모음을 구현합니다.

## 목표

- 시각장애인을 포함한 모든 사용자가 웹사이트를 편리하게 이용할 수 있도록 지원
- WCAG 2.1 AAA 수준의 접근성 달성
- 화면 확대/축소 및 음성 출력 기능 제공
- 사용자 설정 저장 및 복원 기능

## 구현 항목

### 1. 접근성 도구 모음 컴포넌트

**파일**: `components/accessibility/accessibility-toolbar.tsx`

**주요 기능**:
- 화면 확대/축소 컨트롤 (100%, 125%, 150%, 200%)
- 음성 출력 컨트롤 (전체 페이지 읽기, 선택 영역 읽기)
- 고대비 모드 토글 (선택적)
- 폰트 크기 조절 (선택적)
- 설정 저장 (localStorage)

**기술 스택**:
- React hooks (useState, useEffect, useRef)
- Web Speech API (SpeechSynthesis)
- CSS 변수 또는 Tailwind 클래스를 통한 확대/축소
- localStorage를 통한 사용자 설정 저장

**접근성**:
- ARIA 라벨 및 역할 정의
- 키보드 단축키 지원
- 스크린 리더 지원

**UI 디자인**:
- 플로팅 버튼 (우측 하단 또는 상단)
- 클릭 시 도구 모음 패널 열기
- 접근성 아이콘 (Universal Access)
- 컴팩트한 디자인으로 콘텐츠 방해 최소화

### 2. 화면 확대/축소 기능

**파일**: `components/accessibility/zoom-control.tsx`

**구현 방식**:
- CSS `zoom` 속성 또는 `transform: scale()` 사용
- body 또는 main 요소에 적용
- 100%, 125%, 150%, 200% 단계별 조절
- 현재 확대율 표시
- 초기화 버튼 (100%로 복원)

**기능**:
- 확대 버튼 (+)
- 축소 버튼 (-)
- 현재 확대율 표시
- 드롭다운 메뉴로 직접 선택 가능
- 키보드 단축키 지원 (Ctrl + +, Ctrl + -)

**기술적 고려사항**:
- CSS `zoom` 속성 사용 (브라우저 호환성 확인)
- 또는 `transform: scale()` 사용 (더 넓은 호환성)
- 레이아웃 깨짐 방지 (overflow 처리)
- 확대 시 리플로우 최소화

### 3. 음성 출력 기능

**파일**: `components/accessibility/text-to-speech.tsx`

**구현 방식**:
- Web Speech API (SpeechSynthesis) 활용
- 한국어 음성 지원 확인
- 읽기 속도 조절 (0.5x ~ 2.0x)
- 일시정지/재개/중지 기능

**기능**:
- **전체 페이지 읽기**: 페이지의 모든 텍스트 콘텐츠 추출 후 읽기
- **선택 영역 읽기**: 사용자가 선택한 텍스트만 읽기
- 재생 컨트롤: 재생, 일시정지, 중지, 속도 조절
- 현재 읽는 부분 하이라이트 (선택적)

**텍스트 추출 로직**:
- `main` 요소 내의 모든 텍스트 노드 수집
- 스크립트, 스타일, 숨김 요소 제외
- 의미 있는 순서로 정렬 (heading → paragraph → list)
- ARIA 라벨 및 숨김 텍스트 포함

**기술적 고려사항**:
- Web Speech API 지원 여부 확인
- 한국어 음성 엔진 사용 가능 여부 확인
- 폴백: 지원하지 않는 경우 안내 메시지
- 읽기 중 스크롤 자동 추적
- 메모리 관리 (긴 텍스트 처리)

### 4. 접근성 도구 모음 UI

**파일**: `components/accessibility/accessibility-toolbar.tsx`

**컴포넌트 구조**:
```tsx
<AccessibilityToolbar>
  <ZoomControl />
  <TextToSpeech />
  <HighContrastToggle /> (선택적)
  <FontSizeControl /> (선택적)
</AccessibilityToolbar>
```

**디자인**:
- 플로팅 버튼 (우측 하단 또는 상단)
- 클릭 시 도구 모음 패널 열기
- 접근성 아이콘 (Universal Access)
- 컴팩트한 디자인으로 콘텐츠 방해 최소화
- 다크 모드 지원

### 5. GNB 통합

**파일**: `components/navigation/global-nav.tsx`

**변경 사항**:
- 접근성 도구 버튼 추가 (접근성 아이콘)
- 클릭 시 접근성 도구 모음 패널 열기
- 또는 플로팅 버튼으로 별도 배치

**위치 옵션**:
- GNB 우측에 아이콘 버튼 추가
- 또는 페이지 우측 하단에 플로팅 버튼

### 6. 설정 저장 및 복원

**파일**: 
- `hooks/use-accessibility-settings.ts`
- `components/providers/accessibility-provider.tsx`

**기능**:
- localStorage에 사용자 설정 저장
- 확대율, 음성 속도, 고대비 모드 등
- 페이지 로드 시 자동 복원
- React Context를 통한 전역 상태 관리

**저장 항목**:
- 화면 확대율 (zoomLevel)
- 음성 읽기 속도 (speechRate)
- 고대비 모드 활성화 여부 (highContrast)
- 폰트 크기 (fontSize)

### 7. 접근성 개선

**추가 작업**:
- 모든 접근성 기능에 ARIA 라벨 추가
- 키보드 단축키 지원 (예: Ctrl + +, Ctrl + -)
- 스크린 리더 안내 메시지
- 포커스 관리 (모달/패널 열릴 때)
- 고대비 모드에서도 가시성 확보
- 확대 시 레이아웃 깨짐 없음

## 파일 구조

```
components/
├── accessibility/
│   ├── accessibility-toolbar.tsx    # 메인 도구 모음 컴포넌트
│   ├── zoom-control.tsx             # 확대/축소 컨트롤
│   ├── text-to-speech.tsx           # 음성 출력 컨트롤
│   └── accessibility-button.tsx     # 접근성 버튼 (GNB용)
├── providers/
│   └── accessibility-provider.tsx  # 접근성 설정 Context
hooks/
└── use-accessibility-settings.ts    # 접근성 설정 훅
```

## 구현 단계

### Phase 1: 기본 구조 설정
1. 접근성 도구 모음 컴포넌트 생성
2. 접근성 설정 Context Provider 생성
3. 접근성 설정 관리 훅 생성

### Phase 2: 화면 확대/축소 기능
1. 확대/축소 컨트롤 컴포넌트 생성
2. CSS zoom 또는 transform scale 적용
3. 키보드 단축키 지원 추가
4. 설정 저장 및 복원

### Phase 3: 음성 출력 기능
1. 음성 출력 컨트롤 컴포넌트 생성
2. Web Speech API 통합
3. 전체 페이지 읽기 기능
4. 선택 영역 읽기 기능
5. 재생 컨트롤 (재생, 일시정지, 중지, 속도 조절)

### Phase 4: GNB 통합 및 UI 개선
1. GNB에 접근성 도구 버튼 통합
2. 플로팅 버튼 디자인 적용
3. 접근성 패널 UI 개선
4. 반응형 디자인 적용

### Phase 5: 테스트 및 최적화
1. 접근성 기능 테스트
2. WCAG 준수 확인
3. 성능 최적화
4. 브라우저 호환성 테스트

## 기술적 고려사항

### 화면 확대/축소
- **CSS `zoom` 속성**: 간단하지만 일부 브라우저에서 지원 제한
- **`transform: scale()`**: 더 넓은 호환성, 레이아웃 계산 필요
- **선택**: 브라우저 호환성을 고려하여 `transform: scale()` 사용 권장
- 레이아웃 깨짐 방지: `overflow: hidden` 또는 스크롤 처리
- 확대 시 리플로우 최소화: `will-change` 속성 활용

### 음성 출력
- **Web Speech API**: 
  - `speechSynthesis` 객체 사용
  - 한국어 음성 엔진 확인 필요
  - 브라우저별 지원 차이 존재
- **폴백 처리**: 
  - API 미지원 시 안내 메시지 표시
  - 대체 방법 제시
- **성능 최적화**:
  - 긴 텍스트는 청크 단위로 분할
  - 메모리 관리 (읽기 완료 후 정리)
- **읽기 중 스크롤**:
  - 현재 읽는 부분으로 자동 스크롤
  - 하이라이트 표시 (선택적)

### 설정 저장
- **localStorage 사용**:
  - 사용자 설정 영구 저장
  - 페이지 새로고침 후에도 유지
- **React Context**:
  - 전역 상태 관리
  - 모든 컴포넌트에서 접근 가능
- **초기화**:
  - 기본값 설정
  - 설정 초기화 버튼 제공

## 접근성 체크리스트

- [ ] 모든 컨트롤에 ARIA 라벨 추가
- [ ] 키보드 네비게이션 지원 (Tab, Enter, Space, Escape)
- [ ] 스크린 리더 테스트 (NVDA, JAWS)
- [ ] 포커스 관리 (모달/패널 열릴 때)
- [ ] 고대비 모드에서도 가시성 확보
- [ ] 확대 시 레이아웃 깨짐 없음
- [ ] 음성 출력 중 명확한 피드백 제공
- [ ] 설정 변경 시 즉시 반영
- [ ] 모바일 디바이스에서도 동작 확인

## 테스트 계획

### 1. 화면 확대/축소 테스트
- 각 확대율 (100%, 125%, 150%, 200%)에서 레이아웃 확인
- 모바일/데스크톱 반응형 확인
- 스크롤 동작 확인
- 키보드 단축키 동작 확인
- 설정 저장 및 복원 확인

### 2. 음성 출력 테스트
- 전체 페이지 읽기 정확도
- 선택 영역 읽기 정확도
- 재생 컨트롤 동작 (재생, 일시정지, 중지)
- 읽기 속도 조절 동작
- 한국어 발음 품질
- 긴 텍스트 처리 성능

### 3. 접근성 테스트
- 키보드만으로 모든 기능 사용 가능
- 스크린 리더 (NVDA, JAWS) 테스트
- WCAG 2.1 AAA 준수 확인
- 다양한 브라우저에서 테스트
- 다양한 디바이스에서 테스트

### 4. 성능 테스트
- 확대/축소 시 렌더링 성능
- 음성 출력 시 메모리 사용량
- 설정 저장/복원 속도
- 페이지 로드 시간 영향

## 브라우저 호환성

### Web Speech API 지원
- Chrome/Edge: 지원
- Firefox: 부분 지원
- Safari: 지원
- 모바일 브라우저: 제한적 지원

### CSS zoom/transform 지원
- 모든 모던 브라우저 지원
- IE11: transform만 지원

## 참고 자료

- [Web Speech API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Web Content Accessibility Guidelines (WCAG) 2.1](https://www.w3.org/TR/WCAG21/)
- [Accessibility for Teams](https://www.a11yproject.com/)

## 예상 작업 시간

- Phase 1: 기본 구조 설정 - 2시간
- Phase 2: 화면 확대/축소 기능 - 3시간
- Phase 3: 음성 출력 기능 - 4시간
- Phase 4: GNB 통합 및 UI 개선 - 2시간
- Phase 5: 테스트 및 최적화 - 3시간

**총 예상 시간**: 약 14시간

## 우선순위

1. **높음**: 화면 확대/축소 기능 (기본 접근성)
2. **높음**: 음성 출력 기능 (시각장애인 필수)
3. **중간**: GNB 통합 및 UI 개선
4. **중간**: 설정 저장 및 복원
5. **낮음**: 고대비 모드 (추가 기능)

## 주의사항

1. **Web Speech API 제한사항**:
   - 일부 브라우저에서 한국어 음성 품질이 낮을 수 있음
   - 모바일 브라우저에서 제한적 지원
   - 폴백 처리 필수

2. **성능 고려사항**:
   - 확대/축소 시 리플로우 발생 가능
   - 음성 출력 시 메모리 사용량 증가
   - 최적화 필요

3. **접근성**:
   - 모든 기능은 키보드로도 사용 가능해야 함
   - 스크린 리더로 모든 정보 전달 가능해야 함
   - 명확한 피드백 제공 필요

