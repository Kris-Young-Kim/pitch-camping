/**
 * @file get-time-series-stats.ts
 * @description 시간대별/기간별 통계 조회 Server Action
 */

"use server";

import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { auth } from "@clerk/nextjs/server";

export type TimePeriod = "today" | "yesterday" | "7days" | "30days" | "3months" | "1year" | "custom";

export interface TimeSeriesStats {
  date: string;
  users: number;
  views: number;
  bookmarks: number;
  reviews: number;
}

export interface TimeSeriesStatsResult {
  success: boolean;
  data?: TimeSeriesStats[];
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

function getDateRange(period: TimePeriod, customStart?: Date, customEnd?: Date): { start: Date; end: Date } {
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  let start = new Date();

  switch (period) {
    case "today":
      start.setHours(0, 0, 0, 0);
      break;
    case "yesterday":
      start = new Date(end);
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      end.setDate(end.getDate() - 1);
      end.setHours(23, 59, 59, 999);
      break;
    case "7days":
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      break;
    case "30days":
      start.setDate(start.getDate() - 30);
      start.setHours(0, 0, 0, 0);
      break;
    case "3months":
      start.setMonth(start.getMonth() - 3);
      start.setHours(0, 0, 0, 0);
      break;
    case "1year":
      start.setFullYear(start.getFullYear() - 1);
      start.setHours(0, 0, 0, 0);
      break;
    case "custom":
      if (customStart && customEnd) {
        start = new Date(customStart);
        start.setHours(0, 0, 0, 0);
        end.setTime(customEnd.getTime());
        end.setHours(23, 59, 59, 999);
      }
      break;
  }

  return { start, end };
}

export async function getTimeSeriesStats(
  period: TimePeriod = "30days",
  customStart?: Date,
  customEnd?: Date
): Promise<TimeSeriesStatsResult> {
  console.group("[getTimeSeriesStats] 시간대별 통계 조회 시작");
  console.log("기간:", period);

  try {
    const isAdmin = await checkAdminPermission();
    if (!isAdmin) {
      console.warn("[getTimeSeriesStats] 관리자 권한 없음");
      console.groupEnd();
      return { success: false, error: "관리자 권한이 필요합니다." };
    }

    const supabase = getServiceRoleClient();
    const { start, end } = getDateRange(period, customStart, customEnd);

    console.log("조회 기간:", { start, end });

    // 일별 통계 데이터 생성
    const data: TimeSeriesStats[] = [];
    const currentDate = new Date(start);

    while (currentDate <= end) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const dayStart = new Date(currentDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);

      // 해당 일의 사용자 수 (가입일 기준)
      const { count: users } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .gte("created_at", dayStart.toISOString())
        .lte("created_at", dayEnd.toISOString());

      // 해당 일의 북마크 수
      const { count: bookmarks } = await supabase
        .from("bookmarks")
        .select("*", { count: "exact", head: true })
        .gte("created_at", dayStart.toISOString())
        .lte("created_at", dayEnd.toISOString());

      // 해당 일의 리뷰 수
      const { count: reviews } = await supabase
        .from("reviews")
        .select("*", { count: "exact", head: true })
        .gte("created_at", dayStart.toISOString())
        .lte("created_at", dayEnd.toISOString());

      // 해당 일의 조회 수 (user_activity 테이블 사용, 없으면 0)
      let views = 0;
      try {
        const { count } = await supabase
          .from("user_activity")
          .select("*", { count: "exact", head: true })
          .eq("activity_type", "view")
          .gte("created_at", dayStart.toISOString())
          .lte("created_at", dayEnd.toISOString());
        views = count || 0;
      } catch {
        // user_activity 테이블이 없으면 0
        views = 0;
      }

      data.push({
        date: dateStr,
        users: users || 0,
        views,
        bookmarks: bookmarks || 0,
        reviews: reviews || 0,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log("[getTimeSeriesStats] 통계 조회 완료:", data.length, "일");
    console.groupEnd();

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("[getTimeSeriesStats] 통계 조회 오류:", error);
    console.groupEnd();
    return {
      success: false,
      error: "통계 데이터를 불러오는데 실패했습니다.",
    };
  }
}

