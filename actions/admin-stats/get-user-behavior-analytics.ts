/**
 * @file get-user-behavior-analytics.ts
 * @description 사용자 행동 분석 Server Action
 */

"use server";

import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { auth } from "@clerk/nextjs/server";

export interface SessionAnalytics {
  averageSessionDuration: number; // 평균 세션 시간 (초)
  averagePageViews: number; // 평균 페이지 뷰
  bounceRate: number; // 이탈률 (%)
  totalSessions: number; // 총 세션 수
}

export interface UserJourney {
  path: string; // 페이지 경로
  count: number; // 방문 횟수
  percentage: number; // 비율 (%)
}

export interface UserSegment {
  segment: string; // 세그먼트 이름
  count: number; // 사용자 수
  percentage: number; // 비율 (%)
}

export interface RetentionAnalytics {
  period: string; // 기간 (일별, 주별, 월별)
  retentionRate: number; // 리텐션율 (%)
  newUsers: number; // 신규 사용자 수
  returningUsers: number; // 재방문 사용자 수
}

export interface ConversionAnalytics {
  conversionType: string; // 전환 유형
  visitors: number; // 방문자 수
  conversions: number; // 전환 수
  conversionRate: number; // 전환율 (%)
}

export interface UserBehaviorAnalyticsResult {
  success: boolean;
  sessionAnalytics?: SessionAnalytics;
  userJourney?: UserJourney[];
  userSegments?: UserSegment[];
  retentionAnalytics?: RetentionAnalytics[];
  conversionAnalytics?: ConversionAnalytics[];
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

export async function getUserBehaviorAnalytics(): Promise<UserBehaviorAnalyticsResult> {
  console.group("[getUserBehaviorAnalytics] 사용자 행동 분석 시작");

  try {
    const isAdmin = await checkAdminPermission();
    if (!isAdmin) {
      console.warn("[getUserBehaviorAnalytics] 관리자 권한 없음");
      console.groupEnd();
      return { success: false, error: "관리자 권한이 필요합니다." };
    }

    const supabase = getServiceRoleClient();

    // 1. 사용자 세션 분석
    // user_activity 테이블에서 세션 정보 추출
    const { data: activities } = await supabase
      .from("user_activity")
      .select("user_id, created_at, activity_type")
      .order("created_at", { ascending: true });

    // 세션 그룹화 (30분 이내 활동을 같은 세션으로 간주)
    const sessions = new Map<string, { start: Date; end: Date; pageViews: number }>();
    const userSessions = new Map<string, { start: Date; end: Date; pageViews: number }[]>();

    (activities || []).forEach((activity) => {
      if (!activity.user_id) return; // 비인증 사용자 제외

      const activityTime = new Date(activity.created_at);
      const userId = activity.user_id;

      if (!userSessions.has(userId)) {
        userSessions.set(userId, []);
      }

      const userSessionList = userSessions.get(userId)!;
      const lastSession = userSessionList[userSessionList.length - 1];

      // 30분 이내 활동이면 같은 세션으로 간주
      if (
        lastSession &&
        activityTime.getTime() - lastSession.end.getTime() < 30 * 60 * 1000
      ) {
        lastSession.end = activityTime;
        lastSession.pageViews++;
      } else {
        userSessionList.push({
          start: activityTime,
          end: activityTime,
          pageViews: 1,
        });
      }
    });

    // 세션 통계 계산
    let totalDuration = 0;
    let totalPageViews = 0;
    let totalSessions = 0;
    let singlePageSessions = 0;

    userSessions.forEach((sessionList) => {
      sessionList.forEach((session) => {
        totalSessions++;
        const duration = (session.end.getTime() - session.start.getTime()) / 1000; // 초
        totalDuration += duration;
        totalPageViews += session.pageViews;
        if (session.pageViews === 1) {
          singlePageSessions++;
        }
      });
    });

    const sessionAnalytics: SessionAnalytics = {
      averageSessionDuration: totalSessions > 0 ? totalDuration / totalSessions : 0,
      averagePageViews: totalSessions > 0 ? totalPageViews / totalSessions : 0,
      bounceRate: totalSessions > 0 ? (singlePageSessions / totalSessions) * 100 : 0,
      totalSessions,
    };

    // 2. 사용자 여정 분석 (페이지 이동 경로)
    // user_activity에서 activity_type='view'인 것들을 경로로 간주
    const { data: viewActivities } = await supabase
      .from("user_activity")
      .select("content_id, activity_type, user_id")
      .eq("activity_type", "view");

    const pathCounts = new Map<string, number>();
    (viewActivities || []).forEach((activity) => {
      const path = activity.content_id ? `/travels/${activity.content_id}` : "/";
      pathCounts.set(path, (pathCounts.get(path) || 0) + 1);
    });

    const totalViews = Array.from(pathCounts.values()).reduce((sum, count) => sum + count, 0);
    const userJourney: UserJourney[] = Array.from(pathCounts.entries())
      .map(([path, count]) => ({
        path,
        count,
        percentage: totalViews > 0 ? (count / totalViews) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20); // TOP 20

    // 3. 사용자 세그먼트 분석
    const { data: users } = await supabase
      .from("users")
      .select("id, created_at");

    const { data: recentActivities } = await supabase
      .from("user_activity")
      .select("user_id, created_at")
      .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // 최근 30일

    const activeUserIds = new Set(
      (recentActivities || []).map((a) => a.user_id).filter(Boolean)
    );

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    let newUsers = 0;
    let existingUsers = 0;
    let activeUsers = 0;
    let inactiveUsers = 0;

    (users || []).forEach((user) => {
      const userCreatedAt = new Date(user.created_at);
      if (userCreatedAt >= thirtyDaysAgo) {
        newUsers++;
      } else {
        existingUsers++;
      }

      if (activeUserIds.has(user.id)) {
        activeUsers++;
      } else {
        inactiveUsers++;
      }
    });

    const totalUsers = users?.length || 0;
    const userSegments: UserSegment[] = [
      {
        segment: "신규 사용자 (최근 30일)",
        count: newUsers,
        percentage: totalUsers > 0 ? (newUsers / totalUsers) * 100 : 0,
      },
      {
        segment: "기존 사용자",
        count: existingUsers,
        percentage: totalUsers > 0 ? (existingUsers / totalUsers) * 100 : 0,
      },
      {
        segment: "활성 사용자 (최근 30일)",
        count: activeUsers,
        percentage: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0,
      },
      {
        segment: "비활성 사용자",
        count: inactiveUsers,
        percentage: totalUsers > 0 ? (inactiveUsers / totalUsers) * 100 : 0,
      },
    ];

    // 4. 사용자 리텐션 분석
    const { data: allActivities } = await supabase
      .from("user_activity")
      .select("user_id, created_at")
      .order("created_at", { ascending: true });

    // 사용자별 첫 방문일과 재방문일 추적
    const userFirstVisit = new Map<string, Date>();
    const userReturnVisits = new Map<string, Set<string>>(); // 날짜별 재방문 추적

    (allActivities || []).forEach((activity) => {
      if (!activity.user_id) return;

      const visitDate = new Date(activity.created_at);
      const dateStr = visitDate.toISOString().split("T")[0];

      if (!userFirstVisit.has(activity.user_id)) {
        userFirstVisit.set(activity.user_id, visitDate);
      } else {
        const firstVisit = userFirstVisit.get(activity.user_id)!;
        const firstVisitDateStr = firstVisit.toISOString().split("T")[0];

        if (dateStr !== firstVisitDateStr) {
          // 재방문
          if (!userReturnVisits.has(activity.user_id)) {
            userReturnVisits.set(activity.user_id, new Set());
          }
          userReturnVisits.get(activity.user_id)!.add(dateStr);
        }
      }
    });

    // 일별 리텐션 계산
    const dailyRetention: RetentionAnalytics[] = [];
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split("T")[0];
    }).reverse();

    last7Days.forEach((dateStr) => {
      const date = new Date(dateStr);
      const newUsersOnDate = Array.from(userFirstVisit.entries()).filter(
        ([_, firstVisit]) => firstVisit.toISOString().split("T")[0] === dateStr
      ).length;

      const returningUsersOnDate = Array.from(userReturnVisits.entries()).filter(
        ([_, returnDates]) => returnDates.has(dateStr)
      ).length;

      dailyRetention.push({
        period: dateStr,
        retentionRate:
          newUsersOnDate > 0 ? (returningUsersOnDate / newUsersOnDate) * 100 : 0,
        newUsers: newUsersOnDate,
        returningUsers: returningUsersOnDate,
      });
    });

    // 5. 사용자 전환율 분석
    const { data: bookmarkActivities } = await supabase
      .from("bookmarks")
      .select("user_id, created_at");

    const { data: reviewActivities } = await supabase
      .from("reviews")
      .select("user_id, created_at");

    const uniqueViewers = new Set(
      (viewActivities || []).map((a) => a.user_id).filter(Boolean)
    );
    const uniqueBookmarkers = new Set(
      (bookmarkActivities || []).map((b) => b.user_id).filter(Boolean)
    );
    const uniqueReviewers = new Set(
      (reviewActivities || []).map((r) => r.user_id).filter(Boolean)
    );

    const conversionAnalytics: ConversionAnalytics[] = [
      {
        conversionType: "방문 → 북마크",
        visitors: uniqueViewers.size,
        conversions: Array.from(uniqueBookmarkers).filter((id) =>
          uniqueViewers.has(id)
        ).length,
        conversionRate:
          uniqueViewers.size > 0
            ? (Array.from(uniqueBookmarkers).filter((id) => uniqueViewers.has(id)).length /
                uniqueViewers.size) *
              100
            : 0,
      },
      {
        conversionType: "방문 → 리뷰",
        visitors: uniqueViewers.size,
        conversions: Array.from(uniqueReviewers).filter((id) => uniqueViewers.has(id)).length,
        conversionRate:
          uniqueViewers.size > 0
            ? (Array.from(uniqueReviewers).filter((id) => uniqueViewers.has(id)).length /
                uniqueViewers.size) *
              100
            : 0,
      },
    ];

    console.log("[getUserBehaviorAnalytics] 분석 완료:", {
      sessions: sessionAnalytics.totalSessions,
      journeyPaths: userJourney.length,
      segments: userSegments.length,
      retentionDays: dailyRetention.length,
      conversions: conversionAnalytics.length,
    });
    console.groupEnd();

    return {
      success: true,
      sessionAnalytics,
      userJourney,
      userSegments,
      retentionAnalytics: dailyRetention,
      conversionAnalytics,
    };
  } catch (error) {
    console.error("[getUserBehaviorAnalytics] 분석 오류:", error);
    console.groupEnd();
    return {
      success: false,
      error: "사용자 행동 분석 중 오류가 발생했습니다.",
    };
  }
}

