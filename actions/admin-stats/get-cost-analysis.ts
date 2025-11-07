/**
 * @file get-cost-analysis.ts
 * @description 비용 분석 조회 Server Action
 */

"use server";

import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { auth } from "@clerk/nextjs/server";

export interface ServiceCost {
  serviceName: string;
  operationType: string;
  totalUnits: number;
  totalCost: number;
  averageCost: number;
  count: number;
}

export interface MonthlyCost {
  month: string; // YYYY-MM 형식
  totalCost: number;
  serviceCosts: ServiceCost[];
}

export interface CostAnalysisResult {
  success: boolean;
  currentMonth?: MonthlyCost;
  monthlyTrends?: MonthlyCost[];
  serviceBreakdown?: ServiceCost[];
  totalCost?: number;
  costOptimization?: {
    suggestions: string[];
    potentialSavings: number;
  };
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

export async function getCostAnalysis(
  period: "1month" | "3months" | "6months" | "12months" = "1month"
): Promise<CostAnalysisResult> {
  console.group("[getCostAnalysis] 비용 분석 조회 시작");
  console.log("기간:", period);

  try {
    const isAdmin = await checkAdminPermission();
    if (!isAdmin) {
      console.warn("[getCostAnalysis] 관리자 권한 없음");
      console.groupEnd();
      return { success: false, error: "관리자 권한이 필요합니다." };
    }

    const supabase = getServiceRoleClient();

    // 기간 계산
    const now = new Date();
    let startDate = new Date();
    switch (period) {
      case "1month":
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case "3months":
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case "6months":
        startDate.setMonth(startDate.getMonth() - 6);
        break;
      case "12months":
        startDate.setMonth(startDate.getMonth() - 12);
        break;
    }

    // API 사용량 로그 조회
    const { data: usageData } = await supabase
      .from("api_usage_logs")
      .select("*")
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: false });

    if (!usageData || usageData.length === 0) {
      console.log("[getCostAnalysis] 사용량 데이터 없음");
      console.groupEnd();
      return {
        success: true,
        currentMonth: {
          month: now.toISOString().slice(0, 7),
          totalCost: 0,
          serviceCosts: [],
        },
        monthlyTrends: [],
        serviceBreakdown: [],
        totalCost: 0,
        costOptimization: {
          suggestions: [],
          potentialSavings: 0,
        },
      };
    }

    // 서비스별/작업별 집계
    const serviceMap = new Map<string, Map<string, { units: number; cost: number; count: number }>>();

    usageData.forEach((log) => {
      const serviceName = log.service_name;
      const operationType = log.operation_type;
      const key = `${serviceName}:${operationType}`;

      if (!serviceMap.has(serviceName)) {
        serviceMap.set(serviceName, new Map());
      }

      const operationMap = serviceMap.get(serviceName)!;
      if (!operationMap.has(operationType)) {
        operationMap.set(operationType, { units: 0, cost: 0, count: 0 });
      }

      const stats = operationMap.get(operationType)!;
      stats.units += Number(log.units) || 0;
      stats.cost += Number(log.total_cost) || 0;
      stats.count += 1;
    });

    // ServiceCost 배열 생성
    const serviceBreakdown: ServiceCost[] = [];
    serviceMap.forEach((operationMap, serviceName) => {
      operationMap.forEach((stats, operationType) => {
        serviceBreakdown.push({
          serviceName,
          operationType,
          totalUnits: stats.units,
          totalCost: stats.cost,
          averageCost: stats.count > 0 ? stats.cost / stats.count : 0,
          count: stats.count,
        });
      });
    });

    // 월별 트렌드 계산
    const monthlyMap = new Map<string, MonthlyCost>();

    usageData.forEach((log) => {
      const month = new Date(log.created_at).toISOString().slice(0, 7);
      if (!monthlyMap.has(month)) {
        monthlyMap.set(month, {
          month,
          totalCost: 0,
          serviceCosts: [],
        });
      }

      const monthly = monthlyMap.get(month)!;
      monthly.totalCost += Number(log.total_cost) || 0;

      const serviceCost = monthly.serviceCosts.find(
        (sc) => sc.serviceName === log.service_name && sc.operationType === log.operation_type
      );

      if (serviceCost) {
        serviceCost.totalUnits += Number(log.units) || 0;
        serviceCost.totalCost += Number(log.total_cost) || 0;
        serviceCost.count += 1;
        serviceCost.averageCost = serviceCost.totalCost / serviceCost.count;
      } else {
        monthly.serviceCosts.push({
          serviceName: log.service_name,
          operationType: log.operation_type,
          totalUnits: Number(log.units) || 0,
          totalCost: Number(log.total_cost) || 0,
          averageCost: Number(log.total_cost) || 0,
          count: 1,
        });
      }
    });

    const monthlyTrends = Array.from(monthlyMap.values()).sort((a, b) =>
      a.month.localeCompare(b.month)
    );

    // 현재 월 데이터
    const currentMonthKey = now.toISOString().slice(0, 7);
    const currentMonth =
      monthlyTrends.find((m) => m.month === currentMonthKey) ||
      monthlyTrends[monthlyTrends.length - 1] ||
      {
        month: currentMonthKey,
        totalCost: 0,
        serviceCosts: [],
      };

    // 총 비용 계산
    const totalCost = serviceBreakdown.reduce((sum, sc) => sum + sc.totalCost, 0);

    // 비용 최적화 제안
    const suggestions: string[] = [];
    let potentialSavings = 0;

    // 네이버 지도 API 최적화
    const naverMapCost = serviceBreakdown
      .filter((sc) => sc.serviceName === "naver_map")
      .reduce((sum, sc) => sum + sc.totalCost, 0);
    if (naverMapCost > 10000) {
      suggestions.push(
        `네이버 지도 API 사용량이 높습니다 (${naverMapCost.toLocaleString()}원). 지도 캐싱을 강화하여 비용을 절감할 수 있습니다.`
      );
      potentialSavings += naverMapCost * 0.3; // 30% 절감 가능
    }

    // Supabase API 호출 최적화
    const supabaseApiCost = serviceBreakdown
      .filter((sc) => sc.serviceName === "supabase" && sc.operationType === "api_request")
      .reduce((sum, sc) => sum + sc.count, 0);
    if (supabaseApiCost > 1000000) {
      suggestions.push(
        `Supabase API 호출이 많습니다 (${supabaseApiCost.toLocaleString()}건). 쿼리 최적화 및 캐싱을 통해 비용을 절감할 수 있습니다.`
      );
    }

    // TourAPI는 무료이지만 사용량 모니터링 제안
    const tourApiCount = serviceBreakdown
      .filter((sc) => sc.serviceName === "tour_api")
      .reduce((sum, sc) => sum + sc.count, 0);
    if (tourApiCount > 10000) {
      suggestions.push(
        `TourAPI 호출이 많습니다 (${tourApiCount.toLocaleString()}건). 캐싱 전략을 강화하여 응답 속도를 개선할 수 있습니다.`
      );
    }

    console.log("[getCostAnalysis] 비용 분석 완료:", {
      totalCost,
      serviceCount: serviceBreakdown.length,
      monthlyCount: monthlyTrends.length,
    });
    console.groupEnd();

    return {
      success: true,
      currentMonth,
      monthlyTrends,
      serviceBreakdown,
      totalCost,
      costOptimization: {
        suggestions,
        potentialSavings,
      },
    };
  } catch (error) {
    console.error("[getCostAnalysis] 비용 분석 오류:", error);
    console.groupEnd();
    return {
      success: false,
      error: "비용 분석을 불러오는데 실패했습니다.",
    };
  }
}

