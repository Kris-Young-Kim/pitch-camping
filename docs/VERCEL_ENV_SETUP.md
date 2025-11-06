# Vercel 환경 변수 설정 가이드

이 문서는 Vercel 배포 시 필요한 환경 변수를 설정하는 방법을 안내합니다.

## 🔒 보안 경고

**⚠️ 중요: 이 문서에는 예시 값만 포함되어 있습니다.**

- 실제 API 키나 Client ID는 절대 문서나 코드에 하드코딩하지 마세요
- 모든 민감한 정보는 환경 변수나 보안 저장소에만 저장하세요
- Git에 커밋되면 안 되는 파일: `.env`, `.env.local`, `.env.production.local` 등
- API 키가 노출되었다면 즉시 키를 재생성하고 모든 환경 변수를 업데이트하세요

## 🚨 현재 발생 중인 오류

### 1. GOCAMPING_API_KEY 500 오류

**오류 메시지:**

```
[CampingList] API 호출 오류: Error: 서버 환경 변수 GOCAMPING_API_KEY를 확인해주세요.
```

**원인:**

- Vercel 환경 변수에 `GOCAMPING_API_KEY`가 설정되지 않았거나 잘못 설정됨
- 서버 사이드 API Route (`/api/campings`)에서 `process.env.GOCAMPING_API_KEY`를 찾지 못함

**해결 방법:**

1. Vercel Dashboard 접속: https://vercel.com/dashboard
2. 프로젝트 선택 → **Settings** → **Environment Variables**
3. 다음 환경 변수 추가:
   - **Key**: `GOCAMPING_API_KEY`
   - **Value**: 실제 API 키 값 (고캠핑 API에서 발급받은 키)
   - **Environment**: Production, Preview, Development 모두 선택
4. **Save** 클릭
5. **Redeploy** 실행 (또는 새 커밋 푸시)

**🔒 보안 주의사항:**

- 실제 API 키는 절대 문서나 코드에 하드코딩하지 마세요
- API 키는 환경 변수나 보안 저장소에만 저장하세요
- Git에 커밋되지 않도록 `.env` 파일을 `.gitignore`에 추가하세요

**⚠️ 중요:**

- `NEXT_PUBLIC_` 접두사가 **없는** `GOCAMPING_API_KEY`를 사용해야 합니다 (서버 사이드 전용)
- 클라이언트 사이드에서는 `/api/campings` API Route를 통해 간접적으로 접근합니다

### 2. Naver Map API 401 오류

**오류 메시지:**

```
Failed to load resource: the server responded with a status of 401 (Unauthorized)
NAVER Maps JavaScript API v3 잠시 후에 다시 요청해 주세요.
Error Code: 500 / Internal Server Error
Client ID: [your-client-id]
URI: https://pitch-camping.vercel.app/
```

**원인:**

- Naver Map API에 배포된 URL이 등록되지 않음
- API 키가 잘못 설정되었거나 만료됨

**해결 방법:**

#### Step 1: Naver Cloud Platform 콘솔에서 URL 등록

1. [Naver Cloud Platform 콘솔](https://console.ncloud.com/) 접속
2. **AI·NAVER API** → **Application** 선택
3. 해당 Application 클릭 (실제 Application 선택)
4. **서비스 환경** → **Web 서비스** 섹션 확인
5. **도메인 등록**에 다음 URL 추가:
   - `https://pitch-camping.vercel.app`
   - `https://*.vercel.app` (모든 Vercel 프리뷰 배포 포함, 선택 사항)
6. **저장** 클릭

#### Step 2: Vercel 환경 변수 확인

1. Vercel Dashboard → **Settings** → **Environment Variables**
2. 다음 환경 변수 확인:
   - **Key**: `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID`
   - **Value**: 실제 Naver Cloud Platform에서 발급받은 Client ID
   - **Environment**: Production, Preview, Development 모두 선택
3. 값이 올바른지 확인 후 **Save**

**🔒 보안 주의사항:**

- Client ID는 공개되어도 상대적으로 안전하지만, 민감한 정보이므로 문서에 직접 노출하지 마세요

#### Step 3: 재배포

- Vercel Dashboard에서 **Redeploy** 실행
- 또는 새 커밋 푸시

**⚠️ 참고:**

- Naver Map API는 등록된 도메인에서만 작동합니다
- 로컬 개발 환경(`localhost`)은 기본적으로 허용됩니다
- 프로덕션 도메인은 반드시 등록해야 합니다

## 📋 필수 환경 변수 목록

### Clerk 인증

| 변수명                                            | 설명                       | 예시          |
| ------------------------------------------------- | -------------------------- | ------------- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`               | Clerk 공개 키 (프로덕션)   | `pk_live_...` |
| `CLERK_SECRET_KEY`                                | Clerk 비밀 키 (프로덕션)   | `sk_live_...` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL`                   | 로그인 URL                 | `/sign-in`    |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | 로그인 후 리다이렉트 URL   | `/`           |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | 회원가입 후 리다이렉트 URL | `/`           |

**⚠️ 중요:** 프로덕션 배포 시에는 반드시 **Production 키**를 사용해야 합니다.

### Supabase

| 변수명                          | 설명                      | 예시                                      |
| ------------------------------- | ------------------------- | ----------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase 프로젝트 URL     | `https://xxx.supabase.co`                 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key         | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabase Service Role Key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `NEXT_PUBLIC_STORAGE_BUCKET`    | Storage 버킷 이름         | `uploads`                                 |

### 고캠핑 API

| 변수명              | 설명                             | 예시                                               |
| ------------------- | -------------------------------- | -------------------------------------------------- |
| `GOCAMPING_API_KEY` | 고캠핑 API 키 (서버 사이드 전용) | `your-api-key-here` (실제 키는 환경 변수에만 저장) |

**⚠️ 중요:**

- `NEXT_PUBLIC_` 접두사가 **없습니다** (서버 사이드 전용)
- 클라이언트는 `/api/campings` API Route를 통해 간접 접근

### 네이버 지도 API

| 변수명                            | 설명                    | 예시                                                 |
| --------------------------------- | ----------------------- | ---------------------------------------------------- |
| `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` | Naver Map API Client ID | `your-client-id-here` (실제 ID는 환경 변수에만 저장) |

**⚠️ 중요:**

- Naver Cloud Platform 콘솔에서 배포 URL 등록 필수

### 관리자 설정 (선택)

| 변수명           | 설명                             | 예시                |
| ---------------- | -------------------------------- | ------------------- |
| `ADMIN_USER_IDS` | 관리자 Clerk User ID (쉼표 구분) | `user_xxx,user_yyy` |

## 🔧 Vercel 환경 변수 설정 방법

### 방법 1: Vercel Dashboard (권장)

1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. 프로젝트 선택
3. **Settings** → **Environment Variables** 클릭
4. **Add New** 클릭
5. 다음 정보 입력:
   - **Key**: 환경 변수 이름
   - **Value**: 환경 변수 값
   - **Environment**:
     - Production (프로덕션 배포)
     - Preview (프리뷰 배포)
     - Development (로컬 개발, 선택 사항)
6. **Save** 클릭
7. **Redeploy** 실행 (또는 새 커밋 푸시)

### 방법 2: Vercel CLI

```bash
# 단일 환경 변수 추가
vercel env add GOCAMPING_API_KEY production

# 여러 환경 변수 한 번에 추가
vercel env add GOCAMPING_API_KEY production preview development
```

### 방법 3: `.env` 파일 (로컬 개발 전용)

로컬 개발 환경에서만 사용:

```bash
# .env.local
# ⚠️ 실제 API 키 값으로 교체하세요
GOCAMPING_API_KEY=your-actual-api-key-here
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=your-actual-client-id-here
```

**🔒 보안 주의사항:**

- `.env` 파일은 절대 Git에 커밋하지 마세요!
- `.env.local`, `.env.production.local` 등은 `.gitignore`에 포함되어 있어야 합니다
- 실제 API 키는 환경 변수나 보안 저장소에만 저장하세요
- 문서나 코드에 실제 키를 하드코딩하지 마세요

## ✅ 환경 변수 확인 방법

### Vercel Dashboard에서 확인

1. Vercel Dashboard → **Settings** → **Environment Variables**
2. 설정된 모든 환경 변수 목록 확인

### 배포 로그에서 확인

1. Vercel Dashboard → **Deployments** → 최신 배포 클릭
2. **Build Logs** 확인
3. 환경 변수 관련 오류 메시지 확인

### 런타임에서 확인 (개발 환경)

```typescript
// 서버 사이드 (API Route, Server Component)
console.log(process.env.GOCAMPING_API_KEY); // ✅ 작동
console.log(process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID); // ✅ 작동

// 클라이언트 사이드 (Client Component)
console.log(process.env.GOCAMPING_API_KEY); // ❌ undefined (NEXT_PUBLIC_ 없음)
console.log(process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID); // ✅ 작동
```

## 🐛 문제 해결

### 환경 변수가 적용되지 않을 때

1. **Redeploy 실행**

   - Vercel Dashboard → **Deployments** → 최신 배포 → **⋯** → **Redeploy**

2. **환경 변수 값 확인**

   - 공백이나 따옴표가 포함되지 않았는지 확인
   - 값 앞뒤에 공백이 없는지 확인

3. **환경 변수 이름 확인**

   - 대소문자 정확히 일치하는지 확인
   - `NEXT_PUBLIC_` 접두사 확인

4. **빌드 캐시 삭제**
   - Vercel Dashboard → **Settings** → **General** → **Clear Build Cache**

### API 키가 노출되었을 때

1. **즉시 키 교체**

   - 해당 서비스의 대시보드에서 키 재생성
   - Vercel 환경 변수 업데이트
   - 재배포

2. **Git 히스토리 확인**
   - `.env` 파일이 커밋되었는지 확인
   - 필요시 Git 히스토리에서 제거

## 📚 참고 자료

- [Vercel 환경 변수 문서](https://vercel.com/docs/concepts/projects/environment-variables)
- [Next.js 환경 변수 문서](https://nextjs.org/docs/basic-features/environment-variables)
- [Naver Cloud Platform 콘솔](https://console.ncloud.com/)
- [Clerk Dashboard](https://dashboard.clerk.com)
