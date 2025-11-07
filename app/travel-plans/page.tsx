/**
 * @file page.tsx
 * @description 여행 일정 목록 페이지
 *
 * 사용자가 만든 여행 일정 목록을 표시하는 페이지
 *
 * 주요 기능:
 * 1. 여행 일정 목록 표시
 * 2. 일정 생성
 * 3. 일정 상세 보기
 * 4. 일정 상태별 필터링
 *
 * @dependencies
 * - actions/travel-plans/get-plans.ts: getTravelPlans
 * - actions/travel-plans/create-plan.ts: createTravelPlan
 * - components/travel-plans/plan-list.tsx: PlanList
 */

import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { PlanListContent } from "@/components/travel-plans/plan-list-content";
import { CardSkeleton } from "@/components/loading/card-skeleton";

export const metadata = {
  title: "여행 일정 | Pitch Travel",
  description: "여행 일정을 계획하고 관리하세요",
};

export default async function TravelPlansPage() {
  console.group("[TravelPlansPage] 페이지 로드 시작");

  // 인증 확인
  const { userId } = await auth();
  if (!userId) {
    console.warn("[TravelPlansPage] 인증되지 않은 사용자, 로그인 페이지로 리다이렉트");
    redirect("/sign-in");
  }

  console.log("[TravelPlansPage] 인증된 사용자:", userId);
  console.groupEnd();

  return (
    <main className="min-h-[calc(100vh-80px)] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            여행 일정
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            북마크한 여행지로 여행 일정을 계획하고 관리하세요
          </p>
        </div>

        {/* 일정 목록 */}
        <Suspense
          fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          }
        >
          <PlanListContent />
        </Suspense>
      </div>
    </main>
  );
}

