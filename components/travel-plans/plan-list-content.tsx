/**
 * @file plan-list-content.tsx
 * @description 여행 일정 목록 컨텐츠 컴포넌트
 *
 * 여행 일정 목록을 표시하고 관리하는 클라이언트 컴포넌트
 *
 * 주요 기능:
 * 1. 일정 목록 조회 및 표시
 * 2. 일정 생성
 * 3. 일정 상태별 필터링
 * 4. 일정 삭제
 *
 * @dependencies
 * - actions/travel-plans/get-plans.ts: getTravelPlans
 * - actions/travel-plans/create-plan.ts: createTravelPlan
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, MapPin, AlertCircle } from "lucide-react";
import { getTravelPlans, type TravelPlan } from "@/actions/travel-plans/get-plans";
import { createTravelPlan } from "@/actions/travel-plans/create-plan";
import { PlanDialog } from "@/components/travel-plans/plan-dialog";
import { toast } from "sonner";

export function PlanListContent() {
  const router = useRouter();
  const [plans, setPlans] = useState<TravelPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<
    "draft" | "planned" | "in_progress" | "completed" | "cancelled" | undefined
  >(undefined);

  // 일정 목록 조회
  useEffect(() => {
    async function fetchPlans() {
      console.group("[PlanListContent] 일정 목록 조회 시작");
      setLoading(true);
      setError(null);

      try {
        const data = await getTravelPlans(statusFilter);
        console.log("[PlanListContent] 일정 목록:", data);
        setPlans(data);
      } catch (err) {
        console.error("[PlanListContent] 일정 목록 조회 실패:", err);
        setError(err instanceof Error ? err.message : "일정 목록을 불러오는데 실패했습니다.");
        toast.error("일정 목록을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
        console.groupEnd();
      }
    }

    fetchPlans();
  }, [statusFilter]);

  const handleCreatePlan = async (input: {
    title: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    isPublic?: boolean;
  }) => {
    console.group("[PlanListContent] 일정 생성 시작");
    const result = await createTravelPlan(input);

    if (result.success && result.planId) {
      console.log("[PlanListContent] 일정 생성 완료:", result.planId);
      toast.success("일정이 생성되었습니다");
      setPlanDialogOpen(false);
      // 일정 상세 페이지로 이동
      router.push(`/travel-plans/${result.planId}`);
    } else {
      console.error("[PlanListContent] 일정 생성 실패:", result.error);
      toast.error(result.error || "일정 생성에 실패했습니다");
    }
    console.groupEnd();
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          <div>
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-300">
              오류 발생
            </h3>
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        </div>
        <Button
          onClick={() => window.location.reload()}
          className="mt-4"
          variant="outline"
        >
          다시 시도
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 및 액션 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            내 일정 ({plans.length}개)
          </h2>
          {/* 상태 필터 */}
          <select
            value={statusFilter || ""}
            onChange={(e) =>
              setStatusFilter(
                e.target.value
                  ? (e.target.value as TravelPlan["status"])
                  : undefined
              )
            }
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">전체</option>
            <option value="draft">초안</option>
            <option value="planned">계획됨</option>
            <option value="in_progress">진행중</option>
            <option value="completed">완료</option>
            <option value="cancelled">취소</option>
          </select>
        </div>
        <Button onClick={() => setPlanDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          일정 만들기
        </Button>
      </div>

      {/* 일정 목록 */}
      {plans.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                여행 일정이 없습니다
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                새로운 여행 일정을 만들어보세요
              </p>
              <Button onClick={() => setPlanDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                일정 만들기
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => router.push(`/travel-plans/${plan.id}`)}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {plan.title}
                </h3>
                {plan.isPublic && (
                  <span className="px-2 py-1 text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full">
                    공개
                  </span>
                )}
              </div>

              {plan.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {plan.description}
                </p>
              )}

              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                {plan.startDate && plan.endDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(plan.startDate).toLocaleDateString("ko-KR")} -{" "}
                      {new Date(plan.endDate).toLocaleDateString("ko-KR")}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{plan.itemCount}개 여행지</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full">
                    {plan.status === "draft"
                      ? "초안"
                      : plan.status === "planned"
                      ? "계획됨"
                      : plan.status === "in_progress"
                      ? "진행중"
                      : plan.status === "completed"
                      ? "완료"
                      : "취소"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 일정 생성 다이얼로그 */}
      <PlanDialog
        open={planDialogOpen}
        onOpenChange={setPlanDialogOpen}
        onSave={handleCreatePlan}
      />
    </div>
  );
}

