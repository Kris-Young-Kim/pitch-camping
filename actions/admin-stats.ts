/**
 * @file admin-stats.ts
 * @description 관리자 통계 조회 Server Actions
 *
 * KPI 대시보드에서 사용할 통계 데이터를 조회하는 Server Actions
 *
 * 주요 기능:
 * 1. 총 사용자 수 조회
 * 2. 총 캠핑장 조회 수 조회
 * 3. 총 북마크 수 조회
 * 4. 총 리뷰 수 조회
 * 5. 인기 캠핑장 TOP 10 조회
 *
 * @dependencies
 * - lib/supabase/server.ts: createClerkSupabaseClient
 * - @clerk/nextjs/server: auth
 */

"use server";

import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { auth } from "@clerk/nextjs/server";

export interface AdminStats {
  totalUsers: number;
  totalViews: number;
  totalBookmarks: number;
  totalReviews: number;
  popularCampings: {
    contentId: string;
    viewCount: number;
    bookmarkCount: number;
    shareCount: number;
  }[];
}

/**
 * 관리자 권한 확인
 * @returns 관리자 여부
 */
async function checkAdminPermission(): Promise<boolean> {
  try {
    const { userId, orgRole } = await auth();

    if (!userId) {
      return false;
    }

    // Clerk Organization에서 관리자 역할 확인
    // 또는 환경변수로 관리자 ID 목록 관리
    const adminUserIds = process.env.ADMIN_USER_IDS?.split(",") || [];

    if (adminUserIds.includes(userId)) {
      return true;
    }

    // orgRole이 org:admin인 경우
    if (orgRole === "org:admin") {
      return true;
    }

    return false;
  } catch (error) {
    console.error("[AdminStats] 권한 확인 오류:", error);
    return false;
  }
}

/**
 * 관리자 통계 조회
 * @returns 통계 데이터 또는 null (권한 없음)
 */
export async function getAdminStats(): Promise<AdminStats | null> {
  console.group("[AdminStats] 통계 조회 시작");

  try {
    // 관리자 권한 확인
    const isAdmin = await checkAdminPermission();
    if (!isAdmin) {
      console.warn("[AdminStats] 관리자 권한 없음");
      return null;
    }

    const supabase = getServiceRoleClient(); // 관리자 통계는 RLS 우회 필요

    // 총 사용자 수 조회
    const { count: totalUsers, error: usersError } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });

    if (usersError) {
      console.error("[AdminStats] 사용자 수 조회 실패:", usersError);
    }

    // 총 조회 수 조회
    const { data: viewsData, error: viewsError } = await supabase
      .from("camping_stats")
      .select("view_count");

    const totalViews =
      viewsData?.reduce((sum, stat) => sum + (stat.view_count || 0), 0) || 0;

    if (viewsError) {
      console.error("[AdminStats] 조회 수 조회 실패:", viewsError);
    }

    // 총 북마크 수 조회
    const { count: totalBookmarks, error: bookmarksError } = await supabase
      .from("bookmarks")
      .select("*", { count: "exact", head: true });

    if (bookmarksError) {
      console.error("[AdminStats] 북마크 수 조회 실패:", bookmarksError);
    }

    // 총 리뷰 수 조회
    const { count: totalReviews, error: reviewsError } = await supabase
      .from("reviews")
      .select("*", { count: "exact", head: true });

    if (reviewsError) {
      console.error("[AdminStats] 리뷰 수 조회 실패:", reviewsError);
    }

    // 인기 캠핑장 TOP 10 조회
    const { data: popularData, error: popularError } = await supabase
      .from("camping_stats")
      .select("*")
      .order("bookmark_count", { ascending: false })
      .order("view_count", { ascending: false })
      .limit(10);

    if (popularError) {
      console.error("[AdminStats] 인기 캠핑장 조회 실패:", popularError);
    }

    const stats: AdminStats = {
      totalUsers: totalUsers || 0,
      totalViews: totalViews,
      totalBookmarks: totalBookmarks || 0,
      totalReviews: totalReviews || 0,
      popularCampings:
        popularData?.map((stat) => ({
          contentId: stat.content_id,
          viewCount: stat.view_count || 0,
          bookmarkCount: stat.bookmark_count || 0,
          shareCount: stat.share_count || 0,
        })) || [],
    };

    console.log("[AdminStats] 통계 조회 완료:", {
      totalUsers: stats.totalUsers,
      totalViews: stats.totalViews,
      totalBookmarks: stats.totalBookmarks,
      totalReviews: stats.totalReviews,
      popularCount: stats.popularCampings.length,
    });

    return stats;
  } catch (error) {
    console.error("[AdminStats] 통계 조회 오류:", error);
    return null;
  } finally {
    console.groupEnd();
  }
}

