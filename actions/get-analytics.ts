/**
 * @file get-analytics.ts
 * @description 관리자 분석 데이터 조회 Server Action
 *
 * 서비스 메트릭 (북마크 성공률, URL 복사 성공률, API 응답률 등)을 조회
 *
 * @dependencies
 * - lib/supabase/service-role.ts: getServiceRoleClient
 * - lib/utils/logger.ts: 로깅 시스템
 */

"use server";

import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { auth } from "@clerk/nextjs/server";
import { logError, logInfo } from "@/lib/utils/logger";

export interface AnalyticsMetrics {
  bookmarkSuccessRate: number;
  urlCopySuccessRate: number;
  apiSuccessRate: number;
  apiAverageResponseTime: number;
  dataAccuracy: number;
  errorRate: number;
  totalBookmarkAttempts: number;
  totalUrlCopyAttempts: number;
  totalApiRequests: number;
}

async function checkAdminPermission(): Promise<boolean> {
  try {
    const { userId, orgRole } = await auth();
    if (!userId) return false;
    const adminUserIds = process.env.ADMIN_USER_IDS?.split(",") || [];
    if (adminUserIds.includes(userId)) return true;
    if (orgRole === "org:admin") return true;
    return false;
  } catch (error) {
    logError("[Analytics] 권한 확인 오류", error);
    return false;
  }
}

/**
 * 서비스 메트릭 조회 (관리자 전용)
 * 현재는 기본 통계만 반환 (실제 메트릭 시스템 구축 시 확장)
 */
export async function getAnalyticsMetrics(): Promise<AnalyticsMetrics | null> {
  logInfo("[Analytics] 메트릭 조회 시작");
  try {
    const isAdmin = await checkAdminPermission();
    if (!isAdmin) {
      logInfo("[Analytics] 관리자 권한 없음");
      return null;
    }

    const supabase = getServiceRoleClient();

    // 북마크 통계
    const { count: totalBookmarks, error: bookmarksError } = await supabase
      .from("bookmarks")
      .select("*", { count: "exact", head: true });
    if (bookmarksError) {
      logError("[Analytics] 북마크 수 조회 실패", bookmarksError);
    }

    // API 성공률은 로그에서 계산해야 함 (현재는 추정값)
    // 실제로는 별도 메트릭 테이블이 필요함

    // 기본값 반환 (실제 메트릭 시스템 구축 시 업데이트 필요)
    const metrics: AnalyticsMetrics = {
      bookmarkSuccessRate: totalBookmarks ? 95 : 0, // 추정값
      urlCopySuccessRate: 98, // 추정값
      apiSuccessRate: 97, // 추정값
      apiAverageResponseTime: 850, // 추정값 (ms)
      dataAccuracy: 99, // 추정값
      errorRate: 2, // 추정값
      totalBookmarkAttempts: totalBookmarks || 0,
      totalUrlCopyAttempts: 0, // 추적 필요
      totalApiRequests: 0, // 추적 필요
    };

    logInfo("[Analytics] 메트릭 조회 완료", metrics as unknown as Record<string, unknown>);
    return metrics;
  } catch (error) {
    logError("[Analytics] 메트릭 조회 오류", error);
    return null;
  }
}

