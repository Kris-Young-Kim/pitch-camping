/**
 * @file get-predictions.ts
 * @description 예측 분석 Server Action
 */

"use server";

import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { auth } from "@clerk/nextjs/server";
import { getTimeSeriesStats } from "./get-time-series-stats";

export interface PredictionData {
  date: string;
  predicted: number;
  lowerBound?: number; // 신뢰 구간 하한
  upperBound?: number; // 신뢰 구간 상한
}

export interface UserGrowthPrediction {
  success: boolean;
  historicalData?: Array<{ date: string; users: number }>;
  predictions?: PredictionData[];
  growthRate?: number; // 일평균 증가율 (%)
  nextMonthPrediction?: number;
  error?: string;
}

export interface PopularTravelPrediction {
  success: boolean;
  predictions?: Array<{
    contentId: string;
    title: string;
    currentPopularity: number;
    predictedPopularity: number;
    growthRate: number;
    seasonalFactor: number; // 계절성 요소 (0-1)
  }>;
  error?: string;
}

export interface TrafficPrediction {
  success: boolean;
  hourlyPredictions?: Array<{
    hour: number;
    predictedViews: number;
    confidence: number;
  }>;
  seasonalPredictions?: Array<{
    month: number;
    predictedViews: number;
    seasonalFactor: number;
  }>;
  error?: string;
}

export interface RevenuePrediction {
  success: boolean;
  predictions?: Array<{
    month: string;
    predictedRevenue: number;
    adRevenue: number;
    bookingRevenue: number;
    subscriptionRevenue: number;
    partnershipRevenue: number;
  }>;
  totalPredictedRevenue?: number;
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

/**
 * 선형 회귀를 사용한 예측
 */
function linearRegression(
  data: Array<{ x: number; y: number }>
): { slope: number; intercept: number; r2: number } {
  const n = data.length;
  const sumX = data.reduce((sum, d) => sum + d.x, 0);
  const sumY = data.reduce((sum, d) => sum + d.y, 0);
  const sumXY = data.reduce((sum, d) => sum + d.x * d.y, 0);
  const sumXX = data.reduce((sum, d) => sum + d.x * d.x, 0);
  const sumYY = data.reduce((sum, d) => sum + d.y * d.y, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // R² 계산
  const yMean = sumY / n;
  const ssRes = data.reduce((sum, d) => {
    const predicted = slope * d.x + intercept;
    return sum + Math.pow(d.y - predicted, 2);
  }, 0);
  const ssTot = data.reduce((sum, d) => sum + Math.pow(d.y - yMean, 2), 0);
  const r2 = 1 - ssRes / ssTot;

  return { slope, intercept, r2 };
}

/**
 * 사용자 증가 예측
 */
export async function getUserGrowthPrediction(
  days: number = 30
): Promise<UserGrowthPrediction> {
  console.group("[getUserGrowthPrediction] 사용자 증가 예측 시작");
  console.log("예측 기간:", days, "일");

  try {
    const isAdmin = await checkAdminPermission();
    if (!isAdmin) {
      console.warn("[getUserGrowthPrediction] 관리자 권한 없음");
      console.groupEnd();
      return { success: false, error: "관리자 권한이 필요합니다." };
    }

    // 최근 90일 데이터 조회 (3개월)
    const statsResult = await getTimeSeriesStats("3months");
    if (!statsResult.success || !statsResult.data) {
      console.warn("[getUserGrowthPrediction] 통계 데이터 없음");
      console.groupEnd();
      return { success: false, error: "통계 데이터를 불러올 수 없습니다." };
    }

    const historicalData = statsResult.data.map((d) => ({
      date: d.date,
      users: d.users,
    }));

    if (historicalData.length < 7) {
      console.warn("[getUserGrowthPrediction] 데이터 부족 (최소 7일 필요)");
      console.groupEnd();
      return {
        success: false,
        error: "예측을 위해 최소 7일의 데이터가 필요합니다.",
      };
    }

    // 선형 회귀를 위한 데이터 준비
    const regressionData = historicalData.map((d, index) => ({
      x: index,
      y: d.users,
    }));

    const { slope, intercept, r2 } = linearRegression(regressionData);

    // 일평균 증가율 계산
    const avgUsers = historicalData.reduce((sum, d) => sum + d.users, 0) / historicalData.length;
    const growthRate = avgUsers > 0 ? (slope / avgUsers) * 100 : 0;

    // 예측 생성
    const predictions: PredictionData[] = [];
    const lastIndex = historicalData.length - 1;
    const lastDate = new Date(historicalData[lastIndex].date);

    for (let i = 1; i <= days; i++) {
      const futureDate = new Date(lastDate);
      futureDate.setDate(futureDate.getDate() + i);
      const futureIndex = lastIndex + i;

      const predicted = slope * futureIndex + intercept;
      const confidence = Math.min(1, Math.max(0, r2)); // R²를 신뢰도로 사용
      const margin = predicted * (1 - confidence) * 0.3; // 30% 마진

      predictions.push({
        date: futureDate.toISOString().split("T")[0],
        predicted: Math.max(0, Math.round(predicted)),
        lowerBound: Math.max(0, Math.round(predicted - margin)),
        upperBound: Math.round(predicted + margin),
      });
    }

    // 다음 달 예측 (30일 후)
    const nextMonthIndex = lastIndex + 30;
    const nextMonthPrediction = Math.max(0, Math.round(slope * nextMonthIndex + intercept));

    console.log("[getUserGrowthPrediction] 예측 완료:", {
      growthRate: growthRate.toFixed(2) + "%",
      nextMonthPrediction,
      r2: r2.toFixed(3),
    });
    console.groupEnd();

    return {
      success: true,
      historicalData,
      predictions,
      growthRate,
      nextMonthPrediction,
    };
  } catch (error) {
    console.error("[getUserGrowthPrediction] 예측 오류:", error);
    console.groupEnd();
    return {
      success: false,
      error: "사용자 증가 예측을 수행하는데 실패했습니다.",
    };
  }
}

/**
 * 인기 여행지 예측
 */
export async function getPopularTravelPrediction(): Promise<PopularTravelPrediction> {
  console.group("[getPopularTravelPrediction] 인기 여행지 예측 시작");

  try {
    const isAdmin = await checkAdminPermission();
    if (!isAdmin) {
      console.warn("[getPopularTravelPrediction] 관리자 권한 없음");
      console.groupEnd();
      return { success: false, error: "관리자 권한이 필요합니다." };
    }

    const supabase = getServiceRoleClient();

    // 최근 30일 인기 여행지 조회
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: popularTravels } = await supabase
      .from("travels")
      .select("contentid, title, view_count, bookmark_count")
      .order("view_count", { ascending: false })
      .limit(50);

    if (!popularTravels || popularTravels.length === 0) {
      console.warn("[getPopularTravelPrediction] 여행지 데이터 없음");
      console.groupEnd();
      return { success: false, error: "여행지 데이터를 불러올 수 없습니다." };
    }

    // 최근 7일과 그 이전 7일 비교하여 성장률 계산
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const predictions = await Promise.all(
      popularTravels.slice(0, 20).map(async (travel) => {
        // 최근 7일 조회수
        const { count: recentViews } = await supabase
          .from("user_activity")
          .select("*", { count: "exact", head: true })
          .eq("content_id", travel.contentid)
          .eq("activity_type", "view")
          .gte("created_at", sevenDaysAgo.toISOString());

        // 그 이전 7일 조회수
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
        const { count: previousViews } = await supabase
          .from("user_activity")
          .select("*", { count: "exact", head: true })
          .eq("content_id", travel.contentid)
          .eq("activity_type", "view")
          .gte("created_at", fourteenDaysAgo.toISOString())
          .lt("created_at", sevenDaysAgo.toISOString());

        const currentPopularity = (travel.view_count || 0) + (travel.bookmark_count || 0) * 2;
        const recentViewsCount = recentViews || 0;
        const previousViewsCount = previousViews || 0;

        // 성장률 계산
        const growthRate =
          previousViewsCount > 0
            ? ((recentViewsCount - previousViewsCount) / previousViewsCount) * 100
            : recentViewsCount > 0
            ? 100
            : 0;

        // 예측 인기도 (성장률 반영)
        const predictedPopularity = currentPopularity * (1 + growthRate / 100);

        // 계절성 요소 (현재는 간단히 월별 가중치 적용)
        const currentMonth = new Date().getMonth() + 1;
        const seasonalFactor =
          currentMonth >= 3 && currentMonth <= 5
            ? 1.2 // 봄
            : currentMonth >= 6 && currentMonth <= 8
            ? 1.5 // 여름
            : currentMonth >= 9 && currentMonth <= 11
            ? 1.3 // 가을
            : 0.8; // 겨울

        return {
          contentId: travel.contentid,
          title: travel.title || "제목 없음",
          currentPopularity,
          predictedPopularity: predictedPopularity * seasonalFactor,
          growthRate,
          seasonalFactor,
        };
      })
    );

    // 예측 인기도 순으로 정렬
    predictions.sort((a, b) => b.predictedPopularity - a.predictedPopularity);

    console.log("[getPopularTravelPrediction] 예측 완료:", predictions.length, "개");
    console.groupEnd();

    return {
      success: true,
      predictions,
    };
  } catch (error) {
    console.error("[getPopularTravelPrediction] 예측 오류:", error);
    console.groupEnd();
    return {
      success: false,
      error: "인기 여행지 예측을 수행하는데 실패했습니다.",
    };
  }
}

/**
 * 트래픽 예측
 */
export async function getTrafficPrediction(): Promise<TrafficPrediction> {
  console.group("[getTrafficPrediction] 트래픽 예측 시작");

  try {
    const isAdmin = await checkAdminPermission();
    if (!isAdmin) {
      console.warn("[getTrafficPrediction] 관리자 권한 없음");
      console.groupEnd();
      return { success: false, error: "관리자 권한이 필요합니다." };
    }

    const supabase = getServiceRoleClient();

    // 최근 30일 데이터 조회
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: activities } = await supabase
      .from("user_activity")
      .select("created_at")
      .eq("activity_type", "view")
      .gte("created_at", thirtyDaysAgo.toISOString());

    if (!activities || activities.length === 0) {
      console.warn("[getTrafficPrediction] 활동 데이터 없음");
      console.groupEnd();
      return { success: false, error: "활동 데이터를 불러올 수 없습니다." };
    }

    // 시간대별 집계
    const hourlyCounts = new Map<number, number>();
    activities.forEach((activity) => {
      const date = new Date(activity.created_at);
      const hour = date.getHours();
      hourlyCounts.set(hour, (hourlyCounts.get(hour) || 0) + 1);
    });

    // 시간대별 예측 (평균 사용)
    const hourlyPredictions = Array.from({ length: 24 }, (_, hour) => {
      const count = hourlyCounts.get(hour) || 0;
      const avgCount = Array.from(hourlyCounts.values()).reduce((sum, c) => sum + c, 0) / 24;
      const predicted = count > 0 ? count : avgCount;
      const confidence = count > 0 ? 0.8 : 0.5;

      return {
        hour,
        predictedViews: Math.round(predicted),
        confidence,
      };
    });

    // 월별 계절성 예측
    const monthlyCounts = new Map<number, number>();
    activities.forEach((activity) => {
      const date = new Date(activity.created_at);
      const month = date.getMonth() + 1;
      monthlyCounts.set(month, (monthlyCounts.get(month) || 0) + 1);
    });

    const avgMonthlyViews = Array.from(monthlyCounts.values()).reduce((sum, c) => sum + c, 0) / 12;
    const seasonalPredictions = Array.from({ length: 12 }, (_, month) => {
      const monthNum = month + 1;
      const count = monthlyCounts.get(monthNum) || 0;
      const baseViews = count > 0 ? count : avgMonthlyViews;

      // 계절성 요소
      const seasonalFactor =
        monthNum >= 3 && monthNum <= 5
          ? 1.2 // 봄
          : monthNum >= 6 && monthNum <= 8
          ? 1.5 // 여름
          : monthNum >= 9 && monthNum <= 11
          ? 1.3 // 가을
          : 0.8; // 겨울

      return {
        month: monthNum,
        predictedViews: Math.round(baseViews * seasonalFactor),
        seasonalFactor,
      };
    });

    console.log("[getTrafficPrediction] 예측 완료");
    console.groupEnd();

    return {
      success: true,
      hourlyPredictions,
      seasonalPredictions,
    };
  } catch (error) {
    console.error("[getTrafficPrediction] 예측 오류:", error);
    console.groupEnd();
    return {
      success: false,
      error: "트래픽 예측을 수행하는데 실패했습니다.",
    };
  }
}

/**
 * 수익 예측
 */
export async function getRevenuePrediction(
  months: number = 6
): Promise<RevenuePrediction> {
  console.group("[getRevenuePrediction] 수익 예측 시작");
  console.log("예측 기간:", months, "개월");

  try {
    const isAdmin = await checkAdminPermission();
    if (!isAdmin) {
      console.warn("[getRevenuePrediction] 관리자 권한 없음");
      console.groupEnd();
      return { success: false, error: "관리자 권한이 필요합니다." };
    }

    // 최근 3개월 데이터 조회
    const statsResult = await getTimeSeriesStats("3months");
    if (!statsResult.success || !statsResult.data) {
      console.warn("[getRevenuePrediction] 통계 데이터 없음");
      console.groupEnd();
      return { success: false, error: "통계 데이터를 불러올 수 없습니다." };
    }

    const historicalData = statsResult.data;

    // 평균 일일 조회수 계산
    const avgDailyViews =
      historicalData.reduce((sum, d) => sum + d.views, 0) / historicalData.length;

    // 수익 모델 (간단한 추정)
    // 광고 수익: 페이지 뷰당 0.1원
    // 예약 수수료: 북마크당 100원 (전환율 5% 가정)
    // 구독 수익: 사용자당 월 1,000원 (전환율 2% 가정)
    // 제휴 수익: 고정 50만원/월

    const predictions: Array<{
      month: string;
      predictedRevenue: number;
      adRevenue: number;
      bookingRevenue: number;
      subscriptionRevenue: number;
      partnershipRevenue: number;
    }> = [];

    const now = new Date();
    let totalPredictedRevenue = 0;

    for (let i = 1; i <= months; i++) {
      const futureDate = new Date(now);
      futureDate.setMonth(futureDate.getMonth() + i);
      const monthStr = futureDate.toISOString().slice(0, 7);

      // 예상 일일 조회수 (성장률 5% 가정)
      const predictedDailyViews = avgDailyViews * Math.pow(1.05, i);
      const monthlyViews = predictedDailyViews * 30;

      // 광고 수익
      const adRevenue = monthlyViews * 0.1;

      // 예약 수수료 (북마크 전환율 5% 가정)
      const avgDailyBookmarks =
        historicalData.reduce((sum, d) => sum + d.bookmarks, 0) / historicalData.length;
      const predictedMonthlyBookmarks = avgDailyBookmarks * 30 * Math.pow(1.05, i);
      const bookingRevenue = predictedMonthlyBookmarks * 0.05 * 100;

      // 구독 수익 (사용자 전환율 2% 가정)
      const avgDailyUsers =
        historicalData.reduce((sum, d) => sum + d.users, 0) / historicalData.length;
      const predictedMonthlyUsers = avgDailyUsers * 30 * Math.pow(1.05, i);
      const subscriptionRevenue = predictedMonthlyUsers * 0.02 * 1000;

      // 제휴 수익 (고정)
      const partnershipRevenue = 500000;

      const predictedRevenue = adRevenue + bookingRevenue + subscriptionRevenue + partnershipRevenue;
      totalPredictedRevenue += predictedRevenue;

      predictions.push({
        month: monthStr,
        predictedRevenue,
        adRevenue,
        bookingRevenue,
        subscriptionRevenue,
        partnershipRevenue,
      });
    }

    console.log("[getRevenuePrediction] 예측 완료:", {
      months: predictions.length,
      totalRevenue: totalPredictedRevenue.toLocaleString(),
    });
    console.groupEnd();

    return {
      success: true,
      predictions,
      totalPredictedRevenue,
    };
  } catch (error) {
    console.error("[getRevenuePrediction] 예측 오류:", error);
    console.groupEnd();
    return {
      success: false,
      error: "수익 예측을 수행하는데 실패했습니다.",
    };
  }
}

