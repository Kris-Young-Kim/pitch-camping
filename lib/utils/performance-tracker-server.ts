/**
 * @file performance-tracker-server.ts
 * @description 서버 사이드 성능 메트릭 수집 및 저장 유틸리티
 */

import { getServiceRoleClient } from "@/lib/supabase/service-role";

/**
 * 성능 메트릭 기록 (서버 사이드)
 */
export async function trackPerformanceMetricServer(
  metricType: "api_response" | "page_load" | "web_vital" | "db_query",
  metricName: string,
  value: number,
  endpoint?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    const supabase = getServiceRoleClient();

    const { error } = await supabase.from("performance_metrics").insert({
      metric_type: metricType,
      metric_name: metricName,
      endpoint: endpoint || null,
      value: Number(value),
      unit: "ms",
      metadata: metadata || {},
    });

    if (error) {
      console.warn("[PerformanceTrackerServer] 메트릭 기록 실패:", error);
    }
  } catch (error) {
    console.warn("[PerformanceTrackerServer] 메트릭 기록 오류:", error);
  }
}

