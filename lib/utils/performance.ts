/**
 * @file performance.ts
 * @description 성능 모니터링 유틸리티
 *
 * API 응답 시간, 페이지 로드 시간 등을 측정하는 유틸리티
 *
 * 주요 기능:
 * 1. API 응답 시간 측정
 * 2. 페이지 로드 시간 추적
 * 3. Web Vitals 측정 (선택적)
 *
 * @dependencies
 * - lib/utils/logger.ts: logPerformance
 */

import { logPerformance } from "./logger";

/**
 * 성능 측정 추적기
 */
class PerformanceTracker {
  private markers: Map<string, number> = new Map();

  /**
   * 측정 시작
   */
  start(label: string): void {
    this.markers.set(label, performance.now());
  }

  /**
   * 측정 종료 및 결과 반환
   */
  end(label: string): number | null {
    const startTime = this.markers.get(label);
    if (!startTime) {
      console.warn(`[PerformanceTracker] 측정 시작되지 않은 레이블: ${label}`);
      return null;
    }

    const duration = performance.now() - startTime;
    this.markers.delete(label);

    // 성능 로그 기록
    logPerformance(label, duration, "ms");

    return duration;
  }

  /**
   * 측정 종료 및 로그 출력
   */
  endAndLog(label: string, context?: Record<string, unknown>): number | null {
    const duration = this.end(label);
    if (duration !== null && context) {
      logPerformance(label, duration, "ms", context);
    }
    return duration;
  }

  /**
   * 모든 측정 초기화
   */
  clear(): void {
    this.markers.clear();
  }
}

// 싱글톤 인스턴스
export const performanceTracker = new PerformanceTracker();

/**
 * API 응답 시간 측정 래퍼
 * @param fn API 호출 함수
 * @param endpoint API 엔드포인트 (로그용)
 * @returns 함수 실행 결과
 */
export async function measureApiResponse<T>(
  fn: () => Promise<T>,
  endpoint: string
): Promise<T> {
  const startTime = performance.now();

  try {
    const result = await fn();
    const duration = performance.now() - startTime;

    logPerformance(`API 응답 시간: ${endpoint}`, duration, "ms", {
      endpoint,
      success: true,
    });

    return result;
  } catch (error) {
    const duration = performance.now() - startTime;

    logPerformance(`API 응답 시간: ${endpoint}`, duration, "ms", {
      endpoint,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });

    throw error;
  }
}

/**
 * 페이지 로드 시간 측정
 * @param pageName 페이지 이름
 * @returns 측정 종료 함수
 */
export function measurePageLoad(pageName: string): () => void {
  const startTime = performance.now();

  return () => {
    const duration = performance.now() - startTime;
    logPerformance(`페이지 로드 시간: ${pageName}`, duration, "ms", {
      pageName,
    });
  };
}

/**
 * Web Vitals 측정 (클라이언트 사이드)
 * @param metricName 메트릭 이름 (CLS, FID, LCP 등)
 * @param value 값
 * @param id 측정 ID
 */
export function reportWebVital(
  metricName: string,
  value: number,
  id?: string
): void {
  logPerformance(`Web Vital: ${metricName}`, value, "ms", {
    metricName,
    id,
  });

  // 프로덕션 환경에서는 분석 서비스로 전송 가능
  if (process.env.NODE_ENV === "production") {
    // 예: Google Analytics, Vercel Analytics 등
    // gtag('event', metricName, { value, id });
  }
}

/**
 * 메모리 사용량 측정 (클라이언트 사이드)
 */
export function measureMemoryUsage(): void {
  if (typeof window === "undefined" || !(performance as any).memory) {
    return;
  }

  const memory = (performance as any).memory;
  const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
  const totalMB = Math.round(memory.totalJSHeapSize / 1048576);
  const limitMB = Math.round(memory.jsHeapSizeLimit / 1048576);

  logPerformance("메모리 사용량", usedMB, "MB", {
    used: usedMB,
    total: totalMB,
    limit: limitMB,
    percentage: Math.round((usedMB / limitMB) * 100),
  });
}

/**
 * 성능 경고 임계값 (ms)
 */
export const PERFORMANCE_THRESHOLDS = {
  API_RESPONSE_SLOW: 3000, // 3초 이상
  API_RESPONSE_VERY_SLOW: 5000, // 5초 이상
  PAGE_LOAD_SLOW: 3000, // 3초 이상
  PAGE_LOAD_VERY_SLOW: 5000, // 5초 이상
} as const;

/**
 * 성능 임계값 체크 및 경고
 */
export function checkPerformanceThreshold(
  metric: string,
  duration: number,
  threshold: number = PERFORMANCE_THRESHOLDS.API_RESPONSE_SLOW
): void {
  if (duration > threshold) {
    logPerformance(`${metric} (느림)`, duration, "ms", {
      threshold,
      exceeded: duration - threshold,
    });
  }
}

