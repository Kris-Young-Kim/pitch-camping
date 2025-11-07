/**
 * @file cost-tracker-server.ts
 * @description 서버 사이드 비용 추적 유틸리티
 */

import { getServiceRoleClient } from "@/lib/supabase/service-role";

/**
 * API 사용량 및 비용 기록 (서버 사이드)
 */
export async function trackApiUsageServer(
  serviceName: "vercel" | "supabase" | "naver_map" | "tour_api" | "clerk",
  operationType: string,
  costPerUnit: number = 0,
  units: number = 1,
  endpoint?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    const totalCost = costPerUnit * units;

    const supabase = getServiceRoleClient();

    const { error } = await supabase.from("api_usage_logs").insert({
      service_name: serviceName,
      operation_type: operationType,
      endpoint: endpoint || null,
      cost_per_unit: costPerUnit,
      units,
      total_cost: totalCost,
      metadata: metadata || {},
    });

    if (error) {
      console.warn("[CostTrackerServer] 사용량 기록 실패:", error);
    }
  } catch (error) {
    console.warn("[CostTrackerServer] 사용량 기록 오류:", error);
  }
}

/**
 * TourAPI 호출 추적 (서버 사이드)
 */
export async function trackTourApiUsageServer(
  operationType: "search_travel" | "detail_travel" | "image_travel" | "list_travel",
  endpoint?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  // TourAPI는 무료이지만 사용량 추적은 필요
  await trackApiUsageServer("tour_api", operationType, 0, 1, endpoint, metadata);
}

