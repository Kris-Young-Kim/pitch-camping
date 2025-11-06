/**
 * @file page.tsx
 * @description 관리자 분석 페이지
 *
 * 서비스 메트릭 (북마크 성공률, URL 복사 성공률, API 응답률 등)을 표시하는 관리자 페이지
 *
 * 주요 기능:
 * 1. 기능별 성공률 표시
 * 2. API 성능 지표 표시
 * 3. 데이터 정확도 표시
 * 4. 에러 발생률 표시
 *
 * @dependencies
 * - actions/get-analytics.ts: getAnalyticsMetrics Server Action
 * - components/admin/stats-card.tsx: StatsCard 컴포넌트
 */

import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getAnalyticsMetrics } from "@/actions/get-analytics";
import { StatsCard } from "@/components/admin/stats-card";
import { BarChart3, CheckCircle2, XCircle, Clock, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

async function checkAdminAccess(): Promise<boolean> {
  try {
    const { userId, orgRole } = await auth();
    if (!userId) return false;
    const adminUserIds = process.env.ADMIN_USER_IDS?.split(",") || [];
    if (adminUserIds.includes(userId)) return true;
    if (orgRole === "org:admin") return true;
    return false;
  } catch {
    return false;
  }
}

export default async function AdminAnalyticsPage() {
  const isAdmin = await checkAdminAccess();

  if (!isAdmin) {
    redirect("/");
  }

  const metrics = await getAnalyticsMetrics();

  if (!metrics) {
    return (
      <main className="min-h-[calc(100vh-80px)] py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-900 dark:text-red-300 mb-2">
              오류 발생
            </h2>
            <p className="text-red-700 dark:text-red-400">
              분석 데이터를 불러올 수 없습니다.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-80px)] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            서비스 분석
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            핵심 기능의 성공률 및 성능 지표를 확인하세요
          </p>
        </div>

        {/* 메트릭 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="북마크 성공률"
            value={`${metrics.bookmarkSuccessRate.toFixed(1)}%`}
            description={`시도: ${metrics.totalBookmarkAttempts.toLocaleString()}회`}
            icon={CheckCircle2}
            trend={metrics.bookmarkSuccessRate >= 95 ? { value: 0, isPositive: true } : { value: 0, isPositive: false }}
          />
          <StatsCard
            title="URL 복사 성공률"
            value={`${metrics.urlCopySuccessRate.toFixed(1)}%`}
            description={`시도: ${metrics.totalUrlCopyAttempts.toLocaleString()}회`}
            icon={CheckCircle2}
            trend={metrics.urlCopySuccessRate >= 95 ? { value: 0, isPositive: true } : { value: 0, isPositive: false }}
          />
          <StatsCard
            title="API 응답 성공률"
            value={`${metrics.apiSuccessRate.toFixed(1)}%`}
            description={`요청: ${metrics.totalApiRequests.toLocaleString()}회`}
            icon={Activity}
            trend={metrics.apiSuccessRate >= 95 ? { value: 0, isPositive: true } : { value: 0, isPositive: false }}
          />
          <StatsCard
            title="평균 API 응답 시간"
            value={`${metrics.apiAverageResponseTime.toFixed(0)}ms`}
            description="고캠핑 API 평균 응답 시간"
            icon={Clock}
            trend={metrics.apiAverageResponseTime < 1000 ? { value: 0, isPositive: true } : { value: 0, isPositive: false }}
          />
          <StatsCard
            title="데이터 정확도"
            value={`${metrics.dataAccuracy.toFixed(1)}%`}
            description="API 데이터와 표시 데이터 일치율"
            icon={BarChart3}
            trend={metrics.dataAccuracy >= 95 ? { value: 0, isPositive: true } : { value: 0, isPositive: false }}
          />
          <StatsCard
            title="에러 발생률"
            value={`${metrics.errorRate.toFixed(2)}%`}
            description="전체 요청 대비 에러 비율"
            icon={XCircle}
            trend={metrics.errorRate < 5 ? { value: 0, isPositive: true } : { value: 0, isPositive: false }}
          />
        </div>

        {/* 상세 정보 카드 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>성능 지표</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">API 평균 응답 시간</span>
                <span className="font-semibold">{metrics.apiAverageResponseTime.toFixed(0)}ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">API 성공률</span>
                <span className="font-semibold">{metrics.apiSuccessRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">에러 발생률</span>
                <span className="font-semibold">{metrics.errorRate.toFixed(2)}%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>기능별 성공률</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">북마크 성공률</span>
                <span className="font-semibold">{metrics.bookmarkSuccessRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">URL 복사 성공률</span>
                <span className="font-semibold">{metrics.urlCopySuccessRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">데이터 정확도</span>
                <span className="font-semibold">{metrics.dataAccuracy.toFixed(1)}%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 참고사항 */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>참고:</strong> 현재 메트릭은 추정값입니다. 정확한 측정을 위해서는 메트릭 추적 시스템을 구축해야 합니다.
          </p>
        </div>
      </div>
    </main>
  );
}

