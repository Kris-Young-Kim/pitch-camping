/**
 * @file generate-report.ts
 * @description 리포트 생성 Server Action
 */

"use server";

import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { auth } from "@clerk/nextjs/server";
import { getTimeSeriesStats } from "./get-time-series-stats";
import { getRegionTypeStats } from "./get-region-type-stats";
import { getPerformanceMetrics } from "./get-performance-metrics";
import { getCostAnalysis } from "./get-cost-analysis";
import { getUserBehaviorAnalytics } from "./get-user-behavior-analytics";
import { getUserGrowthPrediction } from "./get-predictions";

export interface ReportMetrics {
  timeSeries?: boolean;
  regionType?: boolean;
  performance?: boolean;
  cost?: boolean;
  userBehavior?: boolean;
  predictions?: boolean;
}

export interface GenerateReportInput {
  reportType: "daily" | "weekly" | "monthly" | "custom";
  periodStart?: string; // YYYY-MM-DD
  periodEnd?: string; // YYYY-MM-DD
  metrics: ReportMetrics;
  format?: "pdf" | "html" | "json";
  templateId?: string;
}

export interface GenerateReportResult {
  success: boolean;
  reportId?: string;
  title?: string;
  data?: any;
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

function calculatePeriod(
  reportType: "daily" | "weekly" | "monthly" | "custom",
  periodStart?: string,
  periodEnd?: string
): { start: Date; end: Date } {
  const now = new Date();
  let start: Date;
  let end: Date = new Date(now);

  switch (reportType) {
    case "daily":
      start = new Date(now);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case "weekly":
      start = new Date(now);
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      break;
    case "monthly":
      start = new Date(now);
      start.setMonth(start.getMonth() - 1);
      start.setHours(0, 0, 0, 0);
      break;
    case "custom":
      if (periodStart && periodEnd) {
        start = new Date(periodStart);
        end = new Date(periodEnd);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
      } else {
        start = new Date(now);
        start.setDate(start.getDate() - 7);
        start.setHours(0, 0, 0, 0);
      }
      break;
    default:
      start = new Date(now);
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
  }

  return { start, end };
}

export async function generateReport(
  input: GenerateReportInput
): Promise<GenerateReportResult> {
  console.group("[generateReport] 리포트 생성 시작");
  console.log("리포트 유형:", input.reportType);
  console.log("포함 지표:", input.metrics);

  try {
    const isAdmin = await checkAdminPermission();
    if (!isAdmin) {
      console.warn("[generateReport] 관리자 권한 없음");
      console.groupEnd();
      return { success: false, error: "관리자 권한이 필요합니다." };
    }

    const { userId } = await auth();
    if (!userId) {
      console.warn("[generateReport] 인증되지 않은 사용자");
      console.groupEnd();
      return { success: false, error: "인증되지 않은 사용자입니다." };
    }

    const supabase = getServiceRoleClient();

    // 사용자 ID 조회
    const { data: userData } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", userId)
      .single();

    if (!userData) {
      console.warn("[generateReport] 사용자 정보 없음");
      console.groupEnd();
      return { success: false, error: "사용자 정보를 찾을 수 없습니다." };
    }

    // 기간 계산
    const { start, end } = calculatePeriod(
      input.reportType,
      input.periodStart,
      input.periodEnd
    );

    // 리포트 데이터 수집
    const reportData: any = {
      period: {
        start: start.toISOString().split("T")[0],
        end: end.toISOString().split("T")[0],
      },
      generatedAt: new Date().toISOString(),
      metrics: {},
    };

    // 시간대별 통계
    if (input.metrics.timeSeries) {
      const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      const period = daysDiff <= 7 ? "7days" : daysDiff <= 30 ? "30days" : "90days";
      const timeSeriesResult = await getTimeSeriesStats(period as any);
      if (timeSeriesResult.success) {
        reportData.metrics.timeSeries = timeSeriesResult.data;
      }
    }

    // 지역별/타입별 통계
    if (input.metrics.regionType) {
      const regionTypeResult = await getRegionTypeStats();
      if (regionTypeResult.success) {
        reportData.metrics.regionType = {
          regionStats: regionTypeResult.regionStats,
          typeStats: regionTypeResult.typeStats,
        };
      }
    }

    // 성능 메트릭
    if (input.metrics.performance) {
      const performanceResult = await getPerformanceMetrics("24hours");
      if (performanceResult.success) {
        reportData.metrics.performance = {
          apiResponseStats: performanceResult.apiResponseStats,
          pageLoadStats: performanceResult.pageLoadStats,
          webVitals: performanceResult.webVitals,
          errorRates: performanceResult.errorRates,
        };
      }
    }

    // 비용 분석
    if (input.metrics.cost) {
      const costResult = await getCostAnalysis("1month");
      if (costResult.success) {
        reportData.metrics.cost = {
          totalCost: costResult.totalCost,
          serviceBreakdown: costResult.serviceBreakdown,
          costOptimization: costResult.costOptimization,
        };
      }
    }

    // 사용자 행동 분석
    if (input.metrics.userBehavior) {
      const behaviorResult = await getUserBehaviorAnalytics();
      if (behaviorResult.success) {
        reportData.metrics.userBehavior = {
          sessionAnalysis: behaviorResult.sessionAnalysis,
          journeyAnalysis: behaviorResult.journeyAnalysis,
          segmentAnalysis: behaviorResult.segmentAnalysis,
        };
      }
    }

    // 예측 분석
    if (input.metrics.predictions) {
      const predictionResult = await getUserGrowthPrediction(30);
      if (predictionResult.success) {
        reportData.metrics.predictions = {
          growthRate: predictionResult.growthRate,
          nextMonthPrediction: predictionResult.nextMonthPrediction,
        };
      }
    }

    // 리포트 제목 생성
    const reportTypeNames: Record<string, string> = {
      daily: "일일",
      weekly: "주간",
      monthly: "월간",
      custom: "커스텀",
    };
    const title = `${reportTypeNames[input.reportType]} 리포트 - ${start.toISOString().split("T")[0]} ~ ${end.toISOString().split("T")[0]}`;

    // 리포트 저장
    const { data: reportRecord, error: insertError } = await supabase
      .from("reports")
      .insert({
        template_id: input.templateId || null,
        report_type: input.reportType,
        period_start: start.toISOString().split("T")[0],
        period_end: end.toISOString().split("T")[0],
        title,
        data: reportData,
        format: input.format || "pdf",
        created_by: userData.id,
      })
      .select()
      .single();

    if (insertError || !reportRecord) {
      console.error("[generateReport] 리포트 저장 실패:", insertError);
      console.groupEnd();
      return { success: false, error: "리포트 저장에 실패했습니다." };
    }

    console.log("[generateReport] 리포트 생성 완료:", reportRecord.id);
    console.groupEnd();

    return {
      success: true,
      reportId: reportRecord.id,
      title,
      data: reportData,
    };
  } catch (error) {
    console.error("[generateReport] 리포트 생성 오류:", error);
    console.groupEnd();
    return {
      success: false,
      error: "리포트 생성 중 오류가 발생했습니다.",
    };
  }
}

