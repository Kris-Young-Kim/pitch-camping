/**
 * @file get-performance-metrics.ts
 * @description 성능 메트릭 조회 Server Action
 */

"use server";

import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { auth } from "@clerk/nextjs/server";

export interface PerformanceMetric {
  metricType: string;
  metricName: string;
  endpoint: string | null;
  value: number;
  unit: string;
  timestamp: string;
}

export interface PerformanceStatistics {
  average: number;
  median: number;
  p95: number;
  p99: number;
  min: number;
  max: number;
  count: number;
}

export interface ErrorRate {
  endpoint: string | null;
  errorCount: number;
  totalRequests: number;
  errorRate: number; // %
}

export interface PerformanceMetricsResult {
  success: boolean;
  apiResponseStats?: PerformanceStatistics;
  pageLoadStats?: PerformanceStatistics;
  webVitals?: {
    lcp?: PerformanceStatistics;
    fid?: PerformanceStatistics;
    cls?: PerformanceStatistics;
  };
  errorRates?: ErrorRate[];
  error?: string;
}

async function checkAdminPermission(): Promise<boolean> {
  try {
    const { userId } = await auth();
    if (!userId) return false;

    const adminUserIds = process.env.ADMIN_USER_IDS?.split(",") || [];
    if (adminUserIds.includes(userId)) return true;

    return false;
  } catch {
    return false;
  }
}

function calculateStatistics(values: number[]): PerformanceStatistics {
  if (values.length === 0) {
    return {
      average: 0,
      median: 0,
      p95: 0,
      p99: 0,
      min: 0,
      max: 0,
      count: 0,
    };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const count = sorted.length;
  const sum = sorted.reduce((acc, val) => acc + val, 0);

  return {
    average: sum / count,
    median: sorted[Math.floor(count / 2)],
    p95: sorted[Math.floor(count * 0.95)],
    p99: sorted[Math.floor(count * 0.99)],
    min: sorted[0],
    max: sorted[count - 1],
    count,
  };
}

export async function getPerformanceMetrics(
  period: "1hour" | "24hours" | "7days" | "30days" = "24hours"
): Promise<PerformanceMetricsResult> {
  console.group("[getPerformanceMetrics] 성능 메트릭 조회 시작");
  console.log("기간:", period);

  try {
    const isAdmin = await checkAdminPermission();
    if (!isAdmin) {
      console.warn("[getPerformanceMetrics] 관리자 권한 없음");
      console.groupEnd();
      return { success: false, error: "관리자 권한이 필요합니다." };
    }

    const supabase = getServiceRoleClient();

    // 기간 계산
    const now = new Date();
    let startDate = new Date();
    switch (period) {
      case "1hour":
        startDate.setHours(startDate.getHours() - 1);
        break;
      case "24hours":
        startDate.setHours(startDate.getHours() - 24);
        break;
      case "7days":
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "30days":
        startDate.setDate(startDate.getDate() - 30);
        break;
    }

    // 성능 메트릭 조회
    const { data: metricsData } = await supabase
      .from("performance_metrics")
      .select("*")
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: false });

    // API 응답 시간 통계
    const apiResponseValues = (metricsData || [])
      .filter((m) => m.metric_type === "api_response" && m.metric_name === "api_response_time")
      .map((m) => Number(m.value));

    const apiResponseStats = calculateStatistics(apiResponseValues);

    // 페이지 로드 시간 통계
    const pageLoadValues = (metricsData || [])
      .filter((m) => m.metric_type === "page_load" && m.metric_name === "page_load_time")
      .map((m) => Number(m.value));

    const pageLoadStats = calculateStatistics(pageLoadValues);

    // Web Vitals 통계
    const lcpValues = (metricsData || [])
      .filter((m) => m.metric_type === "web_vital" && m.metric_name === "lcp")
      .map((m) => Number(m.value));

    const fidValues = (metricsData || [])
      .filter((m) => m.metric_type === "web_vital" && m.metric_name === "fid")
      .map((m) => Number(m.value));

    const clsValues = (metricsData || [])
      .filter((m) => m.metric_type === "web_vital" && m.metric_name === "cls")
      .map((m) => Number(m.value));

    const webVitals = {
      lcp: calculateStatistics(lcpValues),
      fid: calculateStatistics(fidValues),
      cls: calculateStatistics(clsValues),
    };

    // 에러율 계산
    const { data: errorData } = await supabase
      .from("error_logs")
      .select("endpoint, error_type")
      .gte("created_at", startDate.toISOString());

    // 엔드포인트별 에러 수 집계
    const endpointErrorCounts = new Map<string, number>();
    (errorData || []).forEach((error) => {
      const endpoint = error.endpoint || "unknown";
      endpointErrorCounts.set(endpoint, (endpointErrorCounts.get(endpoint) || 0) + 1);
    });

    // 엔드포인트별 총 요청 수 집계 (성능 메트릭 기준)
    const endpointRequestCounts = new Map<string, number>();
    (metricsData || [])
      .filter((m) => m.metric_type === "api_response")
      .forEach((m) => {
        const endpoint = m.endpoint || "unknown";
        endpointRequestCounts.set(endpoint, (endpointRequestCounts.get(endpoint) || 0) + 1);
      });

    const errorRates: ErrorRate[] = Array.from(
      new Set([...endpointErrorCounts.keys(), ...endpointRequestCounts.keys()])
    ).map((endpoint) => {
      const errorCount = endpointErrorCounts.get(endpoint) || 0;
      const totalRequests = endpointRequestCounts.get(endpoint) || 0;
      return {
        endpoint: endpoint === "unknown" ? null : endpoint,
        errorCount,
        totalRequests,
        errorRate: totalRequests > 0 ? (errorCount / totalRequests) * 100 : 0,
      };
    });

    console.log("[getPerformanceMetrics] 통계 조회 완료:", {
      apiResponseCount: apiResponseStats.count,
      pageLoadCount: pageLoadStats.count,
      errorRatesCount: errorRates.length,
    });
    console.groupEnd();

    return {
      success: true,
      apiResponseStats,
      pageLoadStats,
      webVitals,
      errorRates,
    };
  } catch (error) {
    console.error("[getPerformanceMetrics] 통계 조회 오류:", error);
    console.groupEnd();
    return {
      success: false,
      error: "성능 메트릭을 불러오는데 실패했습니다.",
    };
  }
}

