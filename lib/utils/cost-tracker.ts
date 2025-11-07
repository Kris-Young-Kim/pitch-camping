/**
 * @file cost-tracker.ts
 * @description 비용 추적 유틸리티
 */

"use client";

/**
 * API 사용량 및 비용 기록 (클라이언트 사이드)
 */
export async function trackApiUsage(
  serviceName: "vercel" | "supabase" | "naver_map" | "tour_api" | "clerk",
  operationType: string,
  costPerUnit: number = 0,
  units: number = 1,
  endpoint?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    const totalCost = costPerUnit * units;

    const response = await fetch("/api/cost/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        serviceName,
        operationType,
        endpoint: endpoint || null,
        costPerUnit,
        units,
        totalCost,
        metadata: metadata || {},
      }),
    });

    if (!response.ok) {
      console.warn("[CostTracker] 사용량 기록 실패:", response.statusText);
    }
  } catch (error) {
    console.warn("[CostTracker] 사용량 기록 오류:", error);
  }
}

/**
 * 네이버 지도 API 호출 추적
 */
export async function trackNaverMapUsage(
  operationType: "geocoding" | "maps" | "static_map",
  endpoint?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  // 네이버 지도 API 가격 (건당)
  const costMap: Record<string, number> = {
    geocoding: 0.5, // 건당 0.5원
    maps: 0.5, // 건당 0.5원
    static_map: 0.1, // 건당 0.1원
  };

  const costPerUnit = costMap[operationType] || 0;

  await trackApiUsage("naver_map", operationType, costPerUnit, 1, endpoint, metadata);
}

/**
 * TourAPI 호출 추적 (무료이지만 추적은 필요)
 */
export async function trackTourApiUsage(
  operationType: "search_travel" | "detail_travel" | "image_travel",
  endpoint?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  // TourAPI는 무료이지만 사용량 추적은 필요
  await trackApiUsage("tour_api", operationType, 0, 1, endpoint, metadata);
}

