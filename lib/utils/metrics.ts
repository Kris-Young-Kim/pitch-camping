/**
 * @file metrics.ts
 * @description 서비스 메트릭 측정 유틸리티
 *
 * 핵심 기능의 성공률, API 응답 시간, 데이터 정확도 등을 측정하는 유틸리티
 *
 * 주요 기능:
 * 1. 북마크 성공률 측정
 * 2. URL 복사 성공률 측정
 * 3. API 응답 성공률 및 응답 시간 측정
 * 4. 데이터 정확도 검증
 *
 * @dependencies
 * - lib/utils/logger.ts: 로깅 시스템
 * - lib/utils/performance.ts: 성능 측정
 */

import { logInfo, logError } from "./logger";

export interface ServiceMetrics {
  bookmarkSuccessRate: number; // 북마크 성공률 (%)
  urlCopySuccessRate: number; // URL 복사 성공률 (%)
  apiSuccessRate: number; // API 응답 성공률 (%)
  apiAverageResponseTime: number; // API 평균 응답 시간 (ms)
  dataAccuracy: number; // 데이터 정확도 (%)
  errorRate: number; // 에러 발생률 (%)
}

interface MetricData {
  bookmarkAttempts: number;
  bookmarkSuccesses: number;
  urlCopyAttempts: number;
  urlCopySuccesses: number;
  apiRequests: number;
  apiSuccesses: number;
  apiTotalResponseTime: number;
  dataValidationErrors: number;
  totalErrors: number;
}

// 메모리 기반 메트릭 (실제로는 데이터베이스에 저장 필요)
let metricsData: MetricData = {
  bookmarkAttempts: 0,
  bookmarkSuccesses: 0,
  urlCopyAttempts: 0,
  urlCopySuccesses: 0,
  apiRequests: 0,
  apiSuccesses: 0,
  apiTotalResponseTime: 0,
  dataValidationErrors: 0,
  totalErrors: 0,
};

/**
 * 북마크 시도 기록
 * @param success 성공 여부
 */
export function trackBookmarkAttempt(success: boolean) {
  metricsData.bookmarkAttempts++;
  if (success) {
    metricsData.bookmarkSuccesses++;
    // 성공은 조용히 추적 (너무 많은 로그 방지)
    // logInfo("[Metrics] 북마크 성공", { attempts: metricsData.bookmarkAttempts });
  } else {
    metricsData.totalErrors++;
    // 실패는 경고 레벨로 로깅 (에러가 아닌 메트릭 추적이므로)
    // 실제 에러는 호출하는 쪽에서 이미 로깅하고 있음
    // logError("[Metrics] 북마크 실패", new Error("북마크 실패"), { attempts: metricsData.bookmarkAttempts });
  }
}

/**
 * URL 복사 시도 기록
 * @param success 성공 여부
 */
export function trackUrlCopyAttempt(success: boolean) {
  metricsData.urlCopyAttempts++;
  if (success) {
    metricsData.urlCopySuccesses++;
    // 성공은 조용히 추적 (너무 많은 로그 방지)
    // logInfo("[Metrics] URL 복사 성공", { attempts: metricsData.urlCopyAttempts });
  } else {
    metricsData.totalErrors++;
    // 실패는 경고 레벨로 로깅 (에러가 아닌 메트릭 추적이므로)
    // 실제 에러는 호출하는 쪽에서 이미 로깅하고 있음
    // logError("[Metrics] URL 복사 실패", new Error("URL 복사 실패"), { attempts: metricsData.urlCopyAttempts });
  }
}

/**
 * API 요청 기록
 * @param success 성공 여부
 * @param responseTime 응답 시간 (ms)
 */
export function trackApiRequest(success: boolean, responseTime: number) {
  metricsData.apiRequests++;
  metricsData.apiTotalResponseTime += responseTime;

  if (success) {
    metricsData.apiSuccesses++;
    // 성공은 조용히 추적 (너무 많은 로그 방지)
    // logInfo("[Metrics] API 요청 성공", { 
    //   requests: metricsData.apiRequests,
    //   responseTime: `${responseTime}ms`
    // });
  } else {
    metricsData.totalErrors++;
    // 실패는 경고 레벨로 로깅 (에러가 아닌 메트릭 추적이므로)
    // 실제 에러는 호출하는 쪽에서 이미 로깅하고 있음
    // logError("[Metrics] API 요청 실패", new Error("API 요청 실패"), { 
    //   requests: metricsData.apiRequests,
    //   responseTime: `${responseTime}ms`
    // });
  }
}

/**
 * 데이터 검증 오류 기록
 */
export function trackDataValidationError() {
  metricsData.dataValidationErrors++;
  metricsData.totalErrors++;
  logError("[Metrics] 데이터 검증 오류", new Error("데이터 검증 실패"));
}

/**
 * 전체 메트릭 계산
 * @returns ServiceMetrics 객체
 */
export function calculateMetrics(): ServiceMetrics {
  const totalRequests = metricsData.bookmarkAttempts + metricsData.urlCopyAttempts + metricsData.apiRequests;
  // const totalSuccesses = metricsData.bookmarkSuccesses + metricsData.urlCopySuccesses + metricsData.apiSuccesses; // 향후 사용 예정

  const bookmarkSuccessRate =
    metricsData.bookmarkAttempts > 0
      ? (metricsData.bookmarkSuccesses / metricsData.bookmarkAttempts) * 100
      : 0;

  const urlCopySuccessRate =
    metricsData.urlCopyAttempts > 0
      ? (metricsData.urlCopySuccesses / metricsData.urlCopyAttempts) * 100
      : 0;

  const apiSuccessRate =
    metricsData.apiRequests > 0
      ? (metricsData.apiSuccesses / metricsData.apiRequests) * 100
      : 0;

  const apiAverageResponseTime =
    metricsData.apiRequests > 0
      ? metricsData.apiTotalResponseTime / metricsData.apiRequests
      : 0;

  // 데이터 정확도 (검증 오류가 없는 경우 100%)
  const dataAccuracy =
    totalRequests > 0
      ? ((totalRequests - metricsData.dataValidationErrors) / totalRequests) * 100
      : 100;

  const errorRate =
    totalRequests > 0
      ? (metricsData.totalErrors / totalRequests) * 100
      : 0;

  return {
    bookmarkSuccessRate: Math.round(bookmarkSuccessRate * 100) / 100,
    urlCopySuccessRate: Math.round(urlCopySuccessRate * 100) / 100,
    apiSuccessRate: Math.round(apiSuccessRate * 100) / 100,
    apiAverageResponseTime: Math.round(apiAverageResponseTime * 100) / 100,
    dataAccuracy: Math.round(dataAccuracy * 100) / 100,
    errorRate: Math.round(errorRate * 100) / 100,
  };
}

/**
 * 메트릭 데이터 초기화 (테스트용)
 */
export function resetMetrics() {
  metricsData = {
    bookmarkAttempts: 0,
    bookmarkSuccesses: 0,
    urlCopyAttempts: 0,
    urlCopySuccesses: 0,
    apiRequests: 0,
    apiSuccesses: 0,
    apiTotalResponseTime: 0,
    dataValidationErrors: 0,
    totalErrors: 0,
  };
  logInfo("[Metrics] 메트릭 데이터 초기화");
}

/**
 * 현재 메트릭 데이터 조회 (디버깅용)
 */
export function getMetricsData(): MetricData {
  return { ...metricsData };
}

