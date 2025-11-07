/**
 * @file export-statistics.ts
 * @description 통계 데이터 내보내기 Server Action
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
import { convertToCSV, convertToJSON, flattenArray } from "@/lib/utils/data-export";

export type ExportFormat = "json" | "csv";

export interface ExportStatisticsInput {
  dataType:
    | "time_series"
    | "region_type"
    | "performance"
    | "cost"
    | "user_behavior"
    | "predictions"
    | "all";
  format: ExportFormat;
  period?: "7days" | "30days" | "90days";
}

export interface ExportStatisticsResult {
  success: boolean;
  filename?: string;
  content?: string;
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

export async function exportStatistics(
  input: ExportStatisticsInput
): Promise<ExportStatisticsResult> {
  console.group("[exportStatistics] 통계 데이터 내보내기 시작");
  console.log("데이터 유형:", input.dataType);
  console.log("형식:", input.format);

  try {
    const isAdmin = await checkAdminPermission();
    if (!isAdmin) {
      console.warn("[exportStatistics] 관리자 권한 없음");
      console.groupEnd();
      return { success: false, error: "관리자 권한이 필요합니다." };
    }

    let exportData: any = {};
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    let filename = `statistics-${timestamp}`;

    // 데이터 수집
    if (input.dataType === "time_series" || input.dataType === "all") {
      const period = input.period || "30days";
      const result = await getTimeSeriesStats(period);
      if (result.success && result.data) {
        exportData.timeSeries = result.data;
      }
    }

    if (input.dataType === "region_type" || input.dataType === "all") {
      const result = await getRegionTypeStats();
      if (result.success) {
        exportData.regionType = {
          regionStats: result.regionStats,
          typeStats: result.typeStats,
        };
      }
    }

    if (input.dataType === "performance" || input.dataType === "all") {
      const result = await getPerformanceMetrics("24hours");
      if (result.success) {
        exportData.performance = {
          apiResponseStats: result.apiResponseStats,
          pageLoadStats: result.pageLoadStats,
          webVitals: result.webVitals,
          errorRates: result.errorRates,
        };
      }
    }

    if (input.dataType === "cost" || input.dataType === "all") {
      const result = await getCostAnalysis("1month");
      if (result.success) {
        exportData.cost = {
          totalCost: result.totalCost,
          serviceBreakdown: result.serviceBreakdown,
          monthlyTrends: result.monthlyTrends,
          costOptimization: result.costOptimization,
        };
      }
    }

    if (input.dataType === "user_behavior" || input.dataType === "all") {
      const result = await getUserBehaviorAnalytics();
      if (result.success) {
        exportData.userBehavior = {
          sessionAnalysis: result.sessionAnalysis,
          journeyAnalysis: result.journeyAnalysis,
          segmentAnalysis: result.segmentAnalysis,
          retentionAnalysis: result.retentionAnalysis,
          conversionAnalytics: result.conversionAnalytics,
        };
      }
    }

    if (input.dataType === "predictions" || input.dataType === "all") {
      const result = await getUserGrowthPrediction(30);
      if (result.success) {
        exportData.predictions = {
          historicalData: result.historicalData,
          predictions: result.predictions,
          growthRate: result.growthRate,
          nextMonthPrediction: result.nextMonthPrediction,
        };
      }
    }

    // 형식에 따라 변환
    let content = "";
    if (input.format === "json") {
      content = convertToJSON(exportData);
      filename += ".json";
    } else {
      // CSV의 경우 평탄화된 배열로 변환
      const flatData: any[] = [];
      
      if (exportData.timeSeries) {
        flatData.push(...flattenArray(exportData.timeSeries));
      }
      if (exportData.regionType?.regionStats) {
        flatData.push(...flattenArray(exportData.regionType.regionStats));
      }
      if (exportData.regionType?.typeStats) {
        flatData.push(...flattenArray(exportData.regionType.typeStats));
      }
      if (exportData.performance?.errorRates) {
        flatData.push(...flattenArray(exportData.performance.errorRates));
      }
      if (exportData.cost?.serviceBreakdown) {
        flatData.push(...flattenArray(exportData.cost.serviceBreakdown));
      }
      if (exportData.cost?.monthlyTrends) {
        flatData.push(...flattenArray(exportData.cost.monthlyTrends));
      }
      if (exportData.userBehavior?.sessionAnalysis) {
        flatData.push({ ...exportData.userBehavior.sessionAnalysis });
      }
      if (exportData.predictions?.historicalData) {
        flatData.push(...flattenArray(exportData.predictions.historicalData));
      }
      if (exportData.predictions?.predictions) {
        flatData.push(...flattenArray(exportData.predictions.predictions));
      }

      content = convertToCSV(flatData);
      filename += ".csv";
    }

    console.log("[exportStatistics] 내보내기 완료:", filename);
    console.groupEnd();

    return {
      success: true,
      filename,
      content,
    };
  } catch (error) {
    console.error("[exportStatistics] 내보내기 오류:", error);
    console.groupEnd();
    return {
      success: false,
      error: "데이터 내보내기 중 오류가 발생했습니다.",
    };
  }
}

