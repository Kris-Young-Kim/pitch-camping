/**
 * @file performance-tracker.ts
 * @description 성능 메트릭 수집 및 저장 유틸리티
 */

"use client";

/**
 * 성능 메트릭 기록 (클라이언트 사이드)
 */
export async function trackPerformanceMetric(
  metricType: "api_response" | "page_load" | "web_vital" | "db_query",
  metricName: string,
  value: number,
  endpoint?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    const response = await fetch("/api/performance/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        metricType,
        metricName,
        value,
        endpoint: endpoint || null,
        metadata: metadata || {},
      }),
    });

    if (!response.ok) {
      console.warn("[PerformanceTracker] 메트릭 기록 실패:", response.statusText);
    }
  } catch (error) {
    console.warn("[PerformanceTracker] 메트릭 기록 오류:", error);
  }
}

/**
 * 에러 로그 기록 (클라이언트 사이드)
 */
export async function trackError(
  errorType: "api_error" | "page_error" | "db_error" | "other",
  errorMessage: string,
  errorStack?: string,
  endpoint?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    const response = await fetch("/api/performance/error", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        errorType,
        errorMessage,
        errorStack: errorStack || null,
        endpoint: endpoint || null,
        metadata: metadata || {},
      }),
    });

    if (!response.ok) {
      console.warn("[PerformanceTracker] 에러 로그 기록 실패:", response.statusText);
    }
  } catch (error) {
    console.warn("[PerformanceTracker] 에러 로그 기록 오류:", error);
  }
}

