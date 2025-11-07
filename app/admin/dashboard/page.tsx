/**
 * @file page.tsx
 * @description 관리자 KPI 대시보드 페이지
 *
 * 서비스 운영 지표를 한눈에 볼 수 있는 관리자 대시보드
 *
 * 주요 기능:
 * 1. 총 사용자 수, 조회 수, 북마크 수, 리뷰 수 표시
 * 2. 인기 여행지 TOP 10 표시
 * 3. 관리자 권한 확인
 *
 * @dependencies
 * - actions/admin-stats.ts: getAdminStats Server Action
 * - components/admin/stats-card.tsx: StatsCard 컴포넌트
 * - components/admin/popular-travels.tsx: PopularTravels 컴포넌트
 */

import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getAdminStats } from "@/actions/admin-stats";
import { StatsCard } from "@/components/admin/stats-card";
import { PopularTravels } from "@/components/admin/popular-travels";
import { EnhancedDashboard } from "@/components/admin/enhanced-dashboard";
import { Users, Eye, Bookmark, MessageSquare } from "lucide-react";

export default async function AdminDashboardPage() {
  console.group("[AdminDashboard] 페이지 로드 시작");

  // 인증 확인
  const { userId } = await auth();

  if (!userId) {
    console.warn("[AdminDashboard] 인증되지 않은 사용자");
    redirect("/sign-in");
  }

  // 관리자 권한 확인 (환경변수에서 관리자 ID 목록 확인)
  const adminUserIds = process.env.ADMIN_USER_IDS?.split(",") || [];

  if (!adminUserIds.includes(userId)) {
    console.warn("[AdminDashboard] 관리자 권한 없음:", userId);
    redirect("/");
  }

  // 통계 데이터 조회
  const stats = await getAdminStats();

  if (!stats) {
    console.error("[AdminDashboard] 통계 데이터 조회 실패");
    return (
      <main className="min-h-[calc(100vh-80px)] py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-900 dark:text-red-300 mb-2">
              오류 발생
            </h2>
            <p className="text-red-700 dark:text-red-400">
              통계 데이터를 불러올 수 없습니다.
            </p>
          </div>
        </div>
      </main>
    );
  }

  console.log("[AdminDashboard] 통계 데이터 조회 완료:", {
    totalUsers: stats.totalUsers,
    totalViews: stats.totalViews,
    totalBookmarks: stats.totalBookmarks,
    totalReviews: stats.totalReviews,
  });

  console.groupEnd();

  return (
    <main className="min-h-[calc(100vh-80px)] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            관리자 대시보드
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            서비스 운영 지표를 확인하세요
          </p>
        </div>

        {/* 통계 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="총 사용자 수"
            value={stats.totalUsers}
            description="가입한 사용자 수"
            icon={Users}
          />
          <StatsCard
            title="총 조회 수"
            value={stats.totalViews}
            description="여행지 조회 총합"
            icon={Eye}
          />
          <StatsCard
            title="총 북마크 수"
            value={stats.totalBookmarks}
            description="사용자 북마크 총합"
            icon={Bookmark}
          />
          <StatsCard
            title="총 리뷰 수"
            value={stats.totalReviews}
            description="작성된 리뷰 수"
            icon={MessageSquare}
          />
        </div>

        {/* 인기 여행지 목록 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <PopularTravels travels={stats.popularTravels} />
        </div>

        {/* 고도화된 대시보드 */}
        <EnhancedDashboard />
      </div>
    </main>
  );
}

