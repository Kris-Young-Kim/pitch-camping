# 운영 점검/디버깅 리포트 (Pitch Camping)

## 개요
- 대상: Cursor 작업 흐름, Git/GitHub, Supabase, Clerk, Vercel 배포/운영
- 기준: 현재 레포 구조와 문서/코드 상태
- 목표: 출시/운영에 필요한 위험요인 사전 식별 및 즉시 실행 가능한 점검 항목 제공

---

## 1) Cursor (개발 흐름/작업 안전성)
- 체크
  - [x] 문서 일관성: `docs/TODO.md`, `PRD.md`, `Design.md`, `mermaid.md` 최신 반영 완료
  - [x] 디렉토리 일관성: `docs/DIR.md`는 현재 트리와 동기화됨
  - [x] 접근성/성능/로깅/메트릭 관련 구현 및 문서 존재
- 리스크/메모
  - 작업 자동화 전 실제 파일 트리 기준으로 문서 업데이트 주기적 필요
- 권장 액션
  - [ ] 문서 수정 시 `docs/DIR.md` 동기화 체계 유지 (PR 템플릿에 체크 항목 추가 권장)

---

## 2) Git/GitHub (버전관리/CI)
- 체크
  - [x] Git 사용 전제(레포 구성 정상)
  - [ ] GitHub Actions 워크플로우 파일 부재: `.github/workflows/*` 현재 레포에 없음
- 리스크/메모
  - 문서상 CI 파이프라인 구성 완료로 서술되었으나 실제 레포에 워크플로우 미존재 → 배포/검증 자동화 미작동 가능성
- 권장 액션
  - [ ] 최소 CI 파이프라인 추가 (lint/type-check/build)
    - 파일 경로: `.github/workflows/ci.yml`
    - 작업: `pnpm i`, `pnpm lint`, `pnpm -s tsc -v || true`(선택), `pnpm build`
  - [ ] PR 보호 규칙 설정(필수 체크 통과 후 머지)

---

## 3) Supabase (DB/마이그레이션/키)
- 체크
  - [x] 마이그레이션 존재: 통계/리뷰/피드백/안전수칙 등 (`supabase/migrations/*`)
  - [x] 서비스 롤 클라이언트 분리: `lib/supabase/service-role.ts`
  - [x] 개발 시 RLS 비활성 원칙 문서화 (AGENTS.md 규칙)
- 리스크/메모
  - 서비스 롤 키는 서버 전용 사용을 유지해야 함
  - 마이그레이션 간 의존 순서 점검 필요(로컬/프리뷰에서 전체 적용 테스트 권장)
- 권장 액션 (명령 가이드)
  - [ ] 로컬에서 마이그레이션 순차 적용 테스트
  - [ ] 통계/리뷰/피드백/안전수칙 CRUD 스모크 테스트

---

## 4) Clerk (인증)
- 체크
  - [x] `app/layout.tsx`에 `ClerkProvider` 적용
  - [x] 미들웨어: `middleware.ts` 존재 (보호 라우트 구성)
  - [x] 사용자 동기화: `components/providers/sync-user-provider.tsx`, `hooks/use-sync-user.ts`
- 리스크/메모
  - 관리자 페이지 접근 제어: `ADMIN_USER_IDS` 환경변수 의존 (배포 환경 변수 세팅 필요)
- 권장 액션
  - [ ] 프로덕션 환경에서 관리자 계정 리스트(`ADMIN_USER_IDS`) 설정 확인
  - [ ] 로그인/권한 라우팅 e2e 체크 (관리자/비로그인/일반계정 케이스)

---

## 5) Vercel (배포/런타임)
- 체크
  - [x] `vercel.json` 존재
  - [x] `next.config.ts` 이미지/압축/코드분할/캐시 설정 존재
  - [x] `app/sitemap.ts`, `app/robots.ts` 구현
- 리스크/메모
  - 환경변수 세팅 누락 시 런타임 실패 가능 (GoCamping, NCP, Clerk, Supabase)
- 권장 액션 (배포 전 검증 루틴)
  - [ ] Vercel Project 환경변수 일괄 점검
  - [ ] Preview 배포 → 주요 페이지 200 응답 및 크리티컬 경로 확인

---

## 6) Next.js 런타임/품질 체크 (로컬)
- 제안 커맨드 (실행 전 사용자 승인 필요)
  - 설치/빌드/린트
    - `pnpm install`
    - `pnpm lint`
    - `pnpm build`
  - 정적 점검
    - 이미지 도메인/캐시 정책: `next.config.ts`
    - 접근성/성능: Lighthouse(로컬 또는 Vercel Preview) 측정

---

## 7) 보안/비밀정보
- 체크
  - [x] 키는 `.env`에서 관리(사용자 확인 완료 전제)
  - [x] 서비스 롤 키 서버 전용 분리
- 권장 액션
  - [ ] 레포 공개 전 `.gitignore`에 `.env` 포함 유지
  - [ ] Vercel/Supabase/Clerk 콘솔에서 키 로테이션 주기 설정

---

## 8) 발견된 갭/리스크 요약 (Action Items)
- [!] GitHub Actions 워크플로우 미존재 → CI 자동 검증/배포 연계 불가
  - 조치: `.github/workflows/ci.yml` 추가 및 브랜치 보호 규칙 설정
- [ ] 관리자 페이지 접근 환경변수(`ADMIN_USER_IDS`) 배포환경 반영 확인
- [ ] Supabase 마이그레이션 순서/의존 테스트 (로컬/프리뷰)
- [ ] Preview에서 인증/지도/외부API 키 동작 스모크 테스트

## 9) 코드 품질 수정 완료 (2025-01-XX)
### 린트 오류 수정 완료
- ✅ **오류 2개 수정**:
  - `components/naver-map.tsx`: `MapPin` import 누락 → `lucide-react`에서 import 추가
  - `lib/utils/ranking.ts`: `let query` → `const query` 변경 (prefer-const)

- ✅ **경고 20개 이상 수정**:
  - 사용하지 않는 import 제거 (`Skeleton`, `TabsContent`, `SORT_OPTIONS`, `Link`, `SafetyGuideline` 등)
  - 사용하지 않는 변수 제거/주석 처리 (`error`, `pathname`, `getTypeLabel`, `campingType`, `XO`, `YO`, `ro`, `isProduction`, `totalSuccesses` 등)
  - React Hook 의존성 배열 수정 (`useCallback` 사용, 의존성 배열 완성)
  - `<img>` → `<Image>` (Next.js 권장)
  - 사용하지 않는 파라미터 제거 (`e` → 주석 처리)

### 주요 개선사항
- **React Hook 최적화**: `useCallback`으로 `addMarkers`, `initializeMap` 메모이제이션
- **의존성 배열 완성**: 모든 `useEffect` 의존성 배열에 필요한 의존성 포함
- **타입 안전성**: 사용하지 않는 타입 import 제거
- **성능**: Next.js `Image` 컴포넌트 사용으로 이미지 최적화

### 현재 상태
- ✅ **린트 오류 0개**
- ✅ **빌드 성공 가능성 높음** (타입 체크 및 린트 통과)

---

## 부록: 제안 CI 템플릿 (요약)
```yaml
name: CI
on:
  pull_request:
  push:
    branches: [ main ]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm build
```
