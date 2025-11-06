/**
 * @file rate-limit-handler.ts
 * @description API Rate Limit 감지 및 처리 핸들러
 *
 * 고캠핑 API 호출 시 Rate Limit을 감지하고 처리하는 유틸리티
 *
 * 주요 기능:
 * 1. Rate Limit 상태 코드(429) 감지
 * 2. Exponential backoff 재시도
 * 3. Rate Limit 정보 캐싱
 *
 * @dependencies
 * - 없음 (순수 유틸리티)
 */

/**
 * Rate Limit 오류 타입
 */
export class RateLimitError extends Error {
  constructor(
    message: string,
    public retryAfter?: number,
    public remainingRequests?: number
  ) {
    super(message);
    this.name = "RateLimitError";
  }
}

/**
 * Rate Limit 정보를 저장하는 인터페이스
 */
interface RateLimitInfo {
  retryAfter: number;
  remainingRequests: number;
  resetAt: number;
}

/**
 * Rate Limit 정보 캐시 (메모리)
 */
const rateLimitCache = new Map<string, RateLimitInfo>();

/**
 * Rate Limit 헤더에서 정보 추출
 * @param headers Response 헤더
 * @returns Rate Limit 정보 또는 null
 */
function extractRateLimitInfo(headers: Headers): RateLimitInfo | null {
  const retryAfter = headers.get("Retry-After");
  const remainingRequests = headers.get("X-RateLimit-Remaining");
  const resetAt = headers.get("X-RateLimit-Reset");

  if (!retryAfter) {
    return null;
  }

  return {
    retryAfter: parseInt(retryAfter, 10) || 60, // 기본값: 60초
    remainingRequests: remainingRequests ? parseInt(remainingRequests, 10) : 0,
    resetAt: resetAt ? parseInt(resetAt, 10) * 1000 : Date.now() + 60000,
  };
}

/**
 * Exponential backoff 대기 시간 계산
 * @param attempt 시도 횟수 (1부터 시작)
 * @param baseDelay 기본 대기 시간 (밀리초)
 * @param maxDelay 최대 대기 시간 (밀리초)
 * @returns 대기 시간 (밀리초)
 */
function calculateBackoffDelay(
  attempt: number,
  baseDelay: number = 1000,
  maxDelay: number = 60000
): number {
  const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
  // 짧은 랜덤 시간 추가 (jitter)
  const jitter = Math.random() * 0.1 * delay;
  return delay + jitter;
}

/**
 * 대기 시간만큼 대기
 * @param ms 대기 시간 (밀리초)
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Rate Limit이 있는지 확인
 * @param endpoint API 엔드포인트 (캐시 키로 사용)
 * @returns Rate Limit 정보 또는 null
 */
export function checkRateLimit(endpoint: string): RateLimitInfo | null {
  const cached = rateLimitCache.get(endpoint);

  if (!cached) {
    return null;
  }

  // Rate Limit이 아직 유효한지 확인
  if (Date.now() < cached.resetAt) {
    return cached;
  }

  // 만료된 정보 제거
  rateLimitCache.delete(endpoint);
  return null;
}

/**
 * Rate Limit 정보 업데이트
 * @param endpoint API 엔드포인트
 * @param info Rate Limit 정보
 */
export function updateRateLimitInfo(endpoint: string, info: RateLimitInfo): void {
  rateLimitCache.set(endpoint, info);
}

/**
 * Rate Limit이 있는 경우 대기 시간 반환
 * @param endpoint API 엔드포인트
 * @returns 대기 시간 (밀리초) 또는 0 (Rate Limit 없음)
 */
export function getWaitTime(endpoint: string): number {
  const info = checkRateLimit(endpoint);
  if (!info) {
    return 0;
  }

  const waitTime = info.resetAt - Date.now();
  return Math.max(0, waitTime);
}

/**
 * Rate Limit 에러 처리 및 재시도
 * @param endpoint API 엔드포인트
 * @param response Response 객체
 * @throws RateLimitError
 */
export function handleRateLimitError(
  endpoint: string,
  response: Response
): void {
  const info = extractRateLimitInfo(response.headers);

  if (info) {
    updateRateLimitInfo(endpoint, info);
    throw new RateLimitError(
      `Rate Limit 초과. ${info.retryAfter}초 후 재시도 가능합니다.`,
      info.retryAfter,
      info.remainingRequests
    );
  } else {
    // Rate Limit 정보가 없으면 기본값 사용
    const defaultInfo: RateLimitInfo = {
      retryAfter: 60,
      remainingRequests: 0,
      resetAt: Date.now() + 60000,
    };
    updateRateLimitInfo(endpoint, defaultInfo);
    throw new RateLimitError("Rate Limit 초과. 60초 후 재시도 가능합니다.", 60);
  }
}

/**
 * Rate Limit을 고려한 fetch 래퍼
 * @param endpoint API 엔드포인트
 * @param fetchFn fetch 함수
 * @param maxRetries 최대 재시도 횟수 (기본값: 3)
 * @returns Response 객체
 */
export async function fetchWithRateLimit(
  endpoint: string,
  fetchFn: () => Promise<Response>,
  maxRetries: number = 3
): Promise<Response> {
  console.group(`[RateLimitHandler] 요청 시작: ${endpoint}`);

  // Rate Limit 확인
  const waitTime = getWaitTime(endpoint);
  if (waitTime > 0) {
    console.log(`[RateLimitHandler] Rate Limit 대기: ${waitTime}ms`);
    await sleep(waitTime);
  }

  let attempt = 0;

  while (attempt < maxRetries) {
    attempt++;
    console.log(`[RateLimitHandler] 시도 ${attempt}/${maxRetries}`);

    try {
      const response = await fetchFn();

      // Rate Limit 에러 감지
      if (response.status === 429) {
        console.warn("[RateLimitHandler] Rate Limit 감지 (429)");
        handleRateLimitError(endpoint, response);

        // Exponential backoff 후 재시도
        if (attempt < maxRetries) {
          const backoffDelay = calculateBackoffDelay(attempt);
          console.log(`[RateLimitHandler] Backoff 대기: ${backoffDelay}ms`);
          await sleep(backoffDelay);
          continue;
        }
      }

      // 성공 응답
      console.log(`[RateLimitHandler] 요청 성공: ${response.status}`);
      
      // Rate Limit 헤더 업데이트 (있다면)
      const info = extractRateLimitInfo(response.headers);
      if (info) {
        updateRateLimitInfo(endpoint, info);
      }

      return response;
    } catch (error) {
      if (error instanceof RateLimitError) {
        // Rate Limit 에러는 재시도
        if (attempt < maxRetries) {
          const backoffDelay = calculateBackoffDelay(attempt);
          console.log(`[RateLimitHandler] Rate Limit 백오프: ${backoffDelay}ms`);
          await sleep(backoffDelay);
          continue;
        }

        // 최대 재시도 횟수 초과
        throw error;
      } else {
        // 다른 에러는 즉시 throw
        throw error;
      }
    }
  }

  throw new Error("최대 재시도 횟수를 초과했습니다");
}

/**
 * Rate Limit 캐시 초기화 (테스트용)
 */
export function clearRateLimitCache(): void {
  rateLimitCache.clear();
}

