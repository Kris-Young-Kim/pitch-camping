/**
 * @file fallback-handler.ts
 * @description API 실패 시 폴백 로직
 *
 * API 호출 실패 시 캐시된 데이터를 반환하거나 오프라인 상태를 처리하는 유틸리티
 *
 * 주요 기능:
 * 1. API 호출 실패 시 캐시된 데이터 반환
 * 2. 오프라인 상태 감지
 * 3. 사용자 친화적 에러 메시지 제공
 *
 * @dependencies
 * - 없음 (순수 유틸리티)
 */

/**
 * 캐시된 데이터 인터페이스
 */
interface CachedData<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time To Live (밀리초)
}

/**
 * 메모리 캐시 저장소
 */
const memoryCache = new Map<string, CachedData<any>>();

/**
 * 로컬 스토리지 키 프리픽스
 */
const STORAGE_PREFIX = "pitch_camping_cache_";

/**
 * 오프라인 상태 감지
 * @returns 오프라인 여부
 */
export function isOffline(): boolean {
  if (typeof window === "undefined") {
    return false; // 서버 사이드에서는 항상 온라인으로 간주
  }

  return !navigator.onLine;
}

/**
 * 메모리 캐시에 데이터 저장
 * @param key 캐시 키
 * @param data 데이터
 * @param ttl TTL (밀리초, 기본값: 5분)
 */
export function setCache<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
  memoryCache.set(key, {
    data,
    timestamp: Date.now(),
    ttl,
  });
}

/**
 * 메모리 캐시에서 데이터 조회
 * @param key 캐시 키
 * @returns 데이터 또는 null (만료됨 또는 없음)
 */
export function getCache<T>(key: string): T | null {
  const cached = memoryCache.get(key);

  if (!cached) {
    return null;
  }

  // TTL 확인
  const age = Date.now() - cached.timestamp;
  if (age > cached.ttl) {
    memoryCache.delete(key);
    return null;
  }

  return cached.data as T;
}

/**
 * 로컬 스토리지에 데이터 저장
 * @param key 캐시 키
 * @param data 데이터
 * @param ttl TTL (밀리초, 기본값: 5분)
 */
export function setLocalStorageCache<T>(
  key: string,
  data: T,
  ttl: number = 5 * 60 * 1000
): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const cacheData: CachedData<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(cacheData));
  } catch (error) {
    console.error("[FallbackHandler] 로컬 스토리지 저장 실패:", error);
  }
}

/**
 * 로컬 스토리지에서 데이터 조회
 * @param key 캐시 키
 * @returns 데이터 또는 null (만료됨 또는 없음)
 */
export function getLocalStorageCache<T>(key: string): T | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (!stored) {
      return null;
    }

    const cached: CachedData<T> = JSON.parse(stored);

    // TTL 확인
    const age = Date.now() - cached.timestamp;
    if (age > cached.ttl) {
      localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
      return null;
    }

    return cached.data;
  } catch (error) {
    console.error("[FallbackHandler] 로컬 스토리지 조회 실패:", error);
    return null;
  }
}

/**
 * 캐시 제거 (메모리 및 로컬 스토리지)
 * @param key 캐시 키
 */
export function clearCache(key: string): void {
  memoryCache.delete(key);
  if (typeof window !== "undefined") {
    localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  }
}

/**
 * 모든 캐시 제거 (테스트용)
 */
export function clearAllCache(): void {
  memoryCache.clear();
  if (typeof window !== "undefined") {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  }
}

/**
 * API 호출 실패 시 폴백 데이터 반환
 * @param key 캐시 키
 * @param fetchFn API 호출 함수
 * @param useLocalStorage 로컬 스토리지 사용 여부 (기본값: true)
 * @returns 데이터 또는 null
 */
export async function fetchWithFallback<T>(
  key: string,
  fetchFn: () => Promise<T>,
  useLocalStorage: boolean = true
): Promise<T | null> {
  console.group(`[FallbackHandler] 폴백 요청: ${key}`);

  try {
    // 오프라인 상태 체크
    if (isOffline()) {
      console.warn("[FallbackHandler] 오프라인 상태 감지, 캐시 사용");
      return getCache<T>(key) || (useLocalStorage ? getLocalStorageCache<T>(key) : null);
    }

    // API 호출 시도
    const data = await fetchFn();

    // 성공 시 캐시 저장
    setCache(key, data);
    if (useLocalStorage) {
      setLocalStorageCache(key, data);
    }

    console.log("[FallbackHandler] API 호출 성공, 캐시 저장");
    return data;
  } catch (error) {
    console.error("[FallbackHandler] API 호출 실패:", error);

    // 폴백: 캐시된 데이터 반환
    const cached = getCache<T>(key) || (useLocalStorage ? getLocalStorageCache<T>(key) : null);

    if (cached) {
      console.log("[FallbackHandler] 캐시된 데이터 반환");
      return cached;
    }

    console.warn("[FallbackHandler] 사용 가능한 캐시 없음");
    return null;
  } finally {
    console.groupEnd();
  }
}

/**
 * 사용자 친화적 에러 메시지 생성
 * @param error 에러 객체
 * @returns 사용자 친화적 메시지
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // 네트워크 에러
    if (error.message.includes("fetch") || error.message.includes("network")) {
      return "네트워크 연결을 확인해주세요.";
    }

    // 타임아웃 에러
    if (error.message.includes("timeout") || error.message.includes("시간 초과")) {
      return "요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.";
    }

    // Rate Limit 에러
    if (error.message.includes("Rate Limit") || error.message.includes("429")) {
      return "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.";
    }

    // 일반 에러
    return error.message || "오류가 발생했습니다.";
  }

  return "알 수 없는 오류가 발생했습니다.";
}

