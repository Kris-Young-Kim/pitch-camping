# Mermaid.md – Pitch Camping 프로젝트 시각화

---

## 1. 전체 프로젝트 라이프사이클 (Gantt Chart)

```mermaid
gantt
    title Pitch Camping 사업화 프로젝트 타임라인
    dateFormat YYYY-MM-DD

    section Phase 1
    프로젝트 셋업 :phase1_setup, 2025-11-06, 14d
    공통 인프라 :phase1_infra, after phase1_setup, 7d

    section Phase 2
    캠핑장 목록 기능 :phase2_list, after phase1_infra, 21d
    지도 연동 :phase2_map, after phase2_list, 14d
    키워드 검색 :phase2_search, after phase2_map, 14d
    상세페이지 :phase2_detail, after phase2_search, 21d

    section Phase 3
    DB 마이그레이션 :phase3_db, after phase2_detail, 10d
    통계·랭킹 기능 :phase3_stats, after phase3_db, 14d
    리뷰·평점 :phase3_review, after phase3_stats, 10d

    section Phase 4
    UI/UX 최적화 :phase4_ux, after phase3_review, 14d
    접근성·SEO :phase4_seo, after phase4_ux, 10d
    성능 최적화 :phase4_perf, after phase4_seo, 10d

    section Phase 5
    배포·운영 :phase5_deploy, after phase4_perf, 14d
    사업성 검증 :phase5_biz, after phase5_deploy, 7d
    피드백 반영 :phase5_feedback, after phase5_biz, 7d

    section Phase 6
    확장·사업화 :phase6_expand, after phase5_feedback, 30d
```

---

## 2. 시스템 아키텍처 (System Architecture)

```mermaid
graph TB
    subgraph Client["🖥️ Frontend (Next.js 15)"]
        UI["React UI Components"]
        State["상태 관리 / Context"]
        Auth["Clerk 인증"]
    end

    subgraph Map["🗺️ Map Services"]
        NaverMap["Naver Maps API v3"]
        Marker["마커 / 인포윈도우"]
        Cluster["클러스터링 로직"]
    end

    subgraph API["🔌 Backend API"]
        NextAPI["Next.js API Routes"]
        CampingAPI["고캠핑 API<br/>GoCamping API"]
        Cache["캐시 레이어"]
        ErrorHandle["에러 처리 및 폴백"]
    end

    subgraph DB["💾 Data Layer"]
        Supabase["Supabase PostgreSQL"]
        Bookmarks["📌 Bookmarks"]
        UserData["👤 User Records"]
        Reviews["⭐ Reviews & Ratings"]
        Stats["📊 Statistics"]
    end

    subgraph Storage["☁️ Cloud Services"]
        Vercel["Vercel (Hosting)"]
        CDN["Image CDN"]
        NCP["NCP (Naver Cloud)"]
    end

    Client --> Auth
    Client --> UI
    UI --> State
    State --> NextAPI

    NextAPI --> CampingAPI
    NextAPI --> Cache
    CampingAPI --> ErrorHandle
    ErrorHandle --> Supabase

    NextAPI --> DB
    DB --> Bookmarks
    DB --> UserData
    DB --> Reviews
    DB --> Stats

    UI --> NaverMap
    NaverMap --> Marker
    Marker --> Cluster

    NextAPI --> Vercel
    Vercel --> CDN
    NaverMap --> NCP
```

---

## 3. 페이지 플로우 (User Journey)

```mermaid
graph LR
    Start["🏠 홈페이지<br/>캠핑장 목록"] --> Filter["🎯 필터링<br/>지역/타입/검색"]
    Filter --> List["📋 목록 표시<br/>카드 그리드"]
    List --> Map["🗺️ 지도 확인<br/>마커 표시"]

    List --> Detail["📄 상세페이지<br/>클릭"]
    Map --> Detail

    Detail --> DetailInfo["📌 기본정보<br/>주소/전화/링크"]
    Detail --> DetailOp["⏰ 운영정보<br/>시간/휴무/요금"]
    Detail --> Gallery["🖼️ 이미지 갤러리<br/>슬라이드 모달"]
    Detail --> DetailMap["🗺️ 상세 위치<br/>길찾기"]

    DetailInfo --> Share["🔗 공유하기<br/>URL 복사"]
    DetailInfo --> Bookmark["⭐ 북마크<br/>Supabase 저장"]

    Bookmark --> BookmarkList["📖 북마크 목록<br/>내 즐겨찾기"]
    BookmarkList --> End["✅ 사용자 캠핑 계획<br/>완료"]

    style Start fill:#4A90E2
    style Detail fill:#F5A623
    style Bookmark fill:#7ED321
    style End fill:#50E3C2
```

---

## 4. 컴포넌트 계층 구조 (Component Tree)

```mermaid
graph TD
    App["App Layout<br/>app/layout.tsx"]

    App --> Header["Header Component"]
    App --> Main["Main Content"]
    App --> Footer["Footer Component"]

    Header --> Logo["Logo / Brand"]
    Header --> Search["Search Bar<br/>camping-search.tsx"]
    Header --> Nav["Navigation"]

    Main --> Home["Home Page<br/>app/page.tsx"]
    Main --> Detail["Detail Page<br/>app/campings/[contentId]/page.tsx"]
    Main --> Bookmarks["Bookmarks Page<br/>app/bookmarks/page.tsx"]

    Home --> Filters["Camping Filters<br/>camping-filters.tsx"]
    Home --> List["Camping List<br/>camping-list.tsx"]
    Home --> MapHome["Naver Map<br/>naver-map.tsx"]

    Filters --> RegionFilter["Region Filter"]
    Filters --> TypeFilter["Type Filter"]
    Filters --> SortFilter["Sort Options"]

    List --> Card["Camping Card<br/>camping-card.tsx"]
    Card --> Image["Thumbnail Image"]
    Card --> Title["Title & Address"]
    Card --> Badge["Type Badge"]
    Card --> Overview["Overview Text"]

    Detail --> DetailInfo["Detail Info<br/>detail-info.tsx"]
    Detail --> DetailIntro["Detail Intro<br/>detail-facilities.tsx"]
    Detail --> DetailGallery["Detail Gallery<br/>detail-gallery.tsx"]
    Detail --> DetailMap["Detail Map<br/>detail-map.tsx"]
    Detail --> ShareBtn["Share Button<br/>share-button.tsx"]
    Detail --> BookmarkBtn["Bookmark Button<br/>bookmark-button.tsx"]

    Bookmarks --> BookmarkList["Bookmark List<br/>bookmark-list.tsx"]
    BookmarkList --> BookmarkCard["Bookmark Card"]

    style App fill:#E8F4F8
    style Home fill:#B3E5FC
    style Detail fill:#FFE0B2
    style Bookmarks fill:#C8E6C9
```

---

## 5. 데이터 플로우 (Data Flow)

```mermaid
graph LR
    User["👤 사용자"]

    User -->|검색/필터| UI["UI 입력"]
    UI -->|쿼리 생성| NextAPI["Next.js API"]

    NextAPI -->|API 호출| PublicAPI["고캠핑 API<br/>GoCamping API"]
    PublicAPI -->|JSON 응답| Cache["캐시 레이어"]
    Cache -->|데이터 저장| Supabase["Supabase DB"]

    NextAPI -->|인증 확인| Clerk["Clerk Auth"]
    Clerk -->|토큰| NextAPI

    NextAPI -->|북마크 저장| BookmarkDB["Bookmarks 테이블"]
    NextAPI -->|사용자 기록| UserDB["User Records 테이블"]
    NextAPI -->|리뷰/평점| ReviewDB["Reviews 테이블"]

    NextAPI -->|응답 데이터| Frontend["React Frontend"]
    Frontend -->|UI 렌더링| Browser["Browser Display"]

    Browser -->|지도 데이터| NaverMap["Naver Maps"]
    NaverMap -->|마커 표시| Browser

    style User fill:#FFB3B3
    style PublicAPI fill:#B3D9FF
    style Supabase fill:#D1B3FF
    style Browser fill:#B3FFB3
```

---

## 6. 기능 우선순위 매트릭스 (Priority Matrix)

```mermaid
quadrantChart
    title 기능 개발 우선순위 분석
    x-axis Low Impact --> High Impact
    y-axis Low Effort --> High Effort

    캠핑장 목록: 0.8, 0.3
    지도 연동: 0.75, 0.5
    키워드 검색: 0.7, 0.3
    상세페이지: 0.85, 0.4
    북마크: 0.6, 0.35
    리뷰·평점: 0.5, 0.6
    통계·랭킹: 0.4, 0.65
    다크모드: 0.3, 0.4
    SEO최적화: 0.65, 0.5
    API캐싱: 0.7, 0.45
```

---

## 7. 배포 파이프라인 (CI/CD Pipeline)

```mermaid
graph LR
    Commit["💻 Git Commit<br/>코드 변경"]

    Commit --> Test["🧪 Automated Tests<br/>Unit / Integration"]
    Test -->|Pass| Build["🏗️ Build<br/>Next.js Compile"]
    Test -->|Fail| Notify1["❌ 알림"]

    Build --> Lint["✨ Linting & Type Check<br/>ESLint / TypeScript"]
    Lint -->|Pass| Deploy["🚀 Deploy to Vercel"]
    Lint -->|Fail| Notify2["⚠️ 코드 리뷰"]

    Deploy --> Staging["🌐 Staging Environment<br/>테스트 배포"]
    Staging -->|검증 완료| Prod["✅ Production<br/>실 서비스"]
    Staging -->|문제 발생| Rollback["⏮️ 롤백"]

    Prod --> Monitor["📊 모니터링<br/>성능/에러"]
    Monitor --> Alert["🔔 알림 시스템"]

    style Commit fill:#FFE0B2
    style Test fill:#FFCC80
    style Build fill:#FFB74D
    style Deploy fill:#FFA726
    style Prod fill:#66BB6A
    style Rollback fill:#EF5350
```

---

## 8. 마일스톤 및 KPI 추적 (Milestone Timeline)

```mermaid
timeline
    title Pitch Camping 사업화 마일스톤

    section 개발 기반 ✅
    M1_셋업 ✅ : 기본 구조 완성 ✅ : TypeScript 타입 정의 ✅ : API 연동 시작 ✅
    M2_MVP_기본 ✅ : 목록/필터/검색 ✅ : 지도 연동 ✅ : 상세페이지 기본 ✅

    section 운영 기반 ✅
    M3_DB_준비 ✅ : Supabase 마이그레이션 ✅ : RLS 정책 설정 ✅ : 북마크 기능 ✅
    M4_품질_개선 ✅ : UI/UX 최적화 ✅ : SEO 구성 ✅ : Lighthouse 80+ 준비 완료 ✅

    section 사업화 ✅
    M5_배포 ✅ : Vercel 라이브 ✅ : CI/CD 구성 ✅ : 모니터링 설정 ✅
    M6_검증 ✅ : 사용성 테스트 ✅ : KPI 달성 ✅ : 투자자 피칭 준비 ✅
    M7_확장 진행중 : 예약 연동 ✅ : 안전 수칙 ✅ : 운영 체크리스트 ✅ : 비즈니스 모델 ✅
```

---

## 9. 팀 역할 및 협업 구조 (Team Organization)

```mermaid
graph TB
    CEO["👨‍💼 CEO/오너<br/>비전 & 전략"]

    CEO --> CTO["🛠️ CTO/개발리드<br/>기술 아키텍처"]
    CEO --> PO["📊 PO/사업담당<br/>요구사항 & KPI"]
    CEO --> Design["🎨 디자이너<br/>UI/UX"]
    CEO --> Marketing["📢 마케터<br/>사용자 확보"]

    CTO --> FrontEnd["Frontend 개발자<br/>React/Next.js"]
    CTO --> Backend["Backend 개발자<br/>API/DB"]
    CTO --> DevOps["DevOps/인프라<br/>배포/모니터링"]

    PO --> ProductTesting["QA/테스트<br/>품질 검증"]
    PO --> Analytics["데이터분석<br/>KPI 측정"]

    Design --> FrontEnd
    FrontEnd --> ProductTesting
    Backend --> ProductTesting

    Marketing --> Analytics
    PO --> CTO
    PO --> Design

    style CEO fill:#FFCDD2
    style CTO fill:#BBDEFB
    style PO fill:#C8E6C9
    style Design fill:#FFF9C4
    style Marketing fill:#F0F4C3
```

---

## 10. 위험 및 대응 계획 (Risk Management)

```mermaid
graph TD
    Risk1["⚠️ 공공 API 다운타임<br/>Rate Limit 초과"]
    Risk1 -->|대응| Mitigation1["✓ 캐싱 전략<br/>✓ 폴백 로직<br/>✓ 에러 핸들링"]

    Risk2["⚠️ 데이터 품질 저하<br/>이미지/정보 누락"]
    Risk2 -->|대응| Mitigation2["✓ 기본 이미지 설정<br/>✓ 유효성 검증<br/>✓ 사용자 제보 시스템"]

    Risk3["⚠️ 성능 저하<br/>응답 지연"]
    Risk3 -->|대응| Mitigation3["✓ 페이지 최적화<br/>✓ CDN 활용<br/>✓ 로드 분산"]

    Risk4["⚠️ 보안 이슈<br/>데이터 유출"]
    Risk4 -->|대응| Mitigation4["✓ 환경변수 관리<br/>✓ RLS 정책<br/>✓ HTTPS 강제"]

    Risk5["⚠️ 사용자 이탈<br/>만족도 저하"]
    Risk5 -->|대응| Mitigation5["✓ UX 개선<br/>✓ 피드백 수집<br/>✓ 기능 고도화"]

    Mitigation1 --> Success["✅ 안정적 서비스<br/>신뢰도 증대"]
    Mitigation2 --> Success
    Mitigation3 --> Success
    Mitigation4 --> Success
    Mitigation5 --> Success

    style Risk1 fill:#FFCDD2
    style Risk2 fill:#FFCDD2
    style Risk3 fill:#FFCDD2
    style Risk4 fill:#FFCDD2
    style Risk5 fill:#FFCDD2
    style Success fill:#C8E6C9
```

---

## 11. 사업화 전략 맵 (Business Model Canvas)

```mermaid
graph TB
    subgraph Partners["🤝 파트너십"]
        P1["고캠핑"]
        P2["네이버 클라우드"]
        P3["캠핑장/예약업소"]
    end

    subgraph Key["🔑 핵심 요소"]
        K1["캠핑장 정보 DB"]
        K2["지도 시각화"]
        K3["사용자 행동 데이터"]
    end

    subgraph Value["💎 가치 제안"]
        V1["한 곳에서 정보 검색"]
        V2["위치 기반 추천"]
        V3["신뢰할 수 있는 정보"]
    end

    subgraph Customer["👥 고객"]
        C1["국내 캠퍼"]
        C2["특정 지역 탐색자"]
        C3["캠핑 계획 수립자"]
    end

    subgraph Revenue["💰 수익"]
        R1["광고 (캠핑장/예약)"]
        R2["예약 수수료"]
        R3["프리미엄 서비스"]
        R4["B2B 정보 제공"]
    end

    Partners --> Key
    Key --> Value
    Value --> Customer
    Customer --> Revenue

    style Partners fill:#BBDEFB
    style Key fill:#FFF9C4
    style Value fill:#C8E6C9
    style Customer fill:#F0F4C3
    style Revenue fill:#FFCCBC
```

---

## 12. 성공 지표 대시보드 (KPI Dashboard)

```mermaid
quadrantChart
    title MVP 성공 지표 추적
    x-axis 개발 완료도 0 --> 100
    y-axis 사용자 만족도 0 --> 100

    캠핑장 목록: 95, 85
    지도 연동: 90, 85
    검색 기능: 90, 82
    상세 페이지: 95, 90
    북마크: 90, 85
    공유하기: 90, 85
    리뷰 시스템: 85, 80
    로딩 속도: 85, 85
    모바일 반응형: 90, 90
    SEO 최적화: 90, 85
    API 안정성: 90, 90
    접근성: 85, 85
    관리자 대시보드: 85, 80
    안전 수칙: 90, 80
```

---

## 용례 및 해석

- **Gantt Chart**: 각 Phase의 타임라인 및 의존성 추적
- **System Architecture**: 전체 시스템 구성 및 기술 스택
- **User Journey**: 사용자가 경험하는 전체 플로우
- **Component Tree**: React 컴포넌트 계층 구조
- **Data Flow**: API 호출부터 UI 렌더링까지의 데이터 흐름
- **Priority Matrix**: 개발 순서 결정 시 참고
- **CI/CD Pipeline**: 지속적 배포 전략
- **Milestone**: 주요 달성 목표 시점
- **Team Organization**: 팀 역할 분담 및 협업 구조
- **Risk Management**: 예상되는 위험과 대응책
- **Business Model**: 사업화 수익 구조 설계
- **KPI Dashboard**: 개발 완료도와 품질 지표 추적

---

> Mermaid 다이어그램으로 프로젝트의 모든 측면을 시각화.
> 팀과 투자자 커뮤니케이션 시 활용 권장.
