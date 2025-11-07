/**
 * @file page.tsx
 * @description 여행 일정 상세 페이지
 *
 * 특정 여행 일정의 상세 정보와 포함된 여행지를 표시하는 페이지
 *
 * 주요 기능:
 * 1. 일정 기본 정보 표시
 * 2. 일차별 여행지 목록 표시
 * 3. 여행지 추가/삭제
 * 4. 일정 편집
 * 5. 일정 공유
 *
 * @dependencies
 * - actions/travel-plans/get-plan-detail.ts: getTravelPlanDetail
 * - components/travel-plans/plan-detail-content.tsx: PlanDetailContent
 */

import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getTravelPlanDetail } from "@/actions/travel-plans/get-plan-detail";
import { PlanDetailContent } from "@/components/travel-plans/plan-detail-content";
import { CardSkeleton } from "@/components/loading/card-skeleton";

interface TravelPlanDetailPageProps {
  params: Promise<{ planId: string }>;
  searchParams: Promise<{ token?: string }>;
}

export default async function TravelPlanDetailPage({
  params,
  searchParams,
}: TravelPlanDetailPageProps) {
  const { planId } = await params;
  const { token } = await searchParams;

  console.group("[TravelPlanDetailPage] 페이지 로드 시작");
  console.log("일정 ID:", planId);
  console.log("공유 토큰:", token);

  const planDetail = await getTravelPlanDetail(planId, token || undefined);

  if (!planDetail) {
    console.warn("[TravelPlanDetailPage] 일정을 찾을 수 없음");
    console.groupEnd();
    notFound();
  }

  console.log("[TravelPlanDetailPage] 일정 상세:", planDetail);
  console.groupEnd();

  return (
    <main className="min-h-[calc(100vh-80px)] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <Suspense
          fallback={
            <div className="space-y-6">
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            </div>
          }
        >
          <PlanDetailContent planDetail={planDetail} />
        </Suspense>
      </div>
    </main>
  );
}

