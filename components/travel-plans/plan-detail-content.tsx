/**
 * @file plan-detail-content.tsx
 * @description 여행 일정 상세 컨텐츠 컴포넌트
 *
 * 여행 일정의 상세 정보와 일차별 여행지를 표시하는 컴포넌트
 *
 * 주요 기능:
 * 1. 일정 기본 정보 표시
 * 2. 일차별 여행지 목록 표시
 * 3. 여행지 추가
 * 4. 일정 편집
 * 5. 일정 공유
 *
 * @dependencies
 * - actions/travel-plans/add-item.ts: addPlanItem
 * - components/travel-card.tsx: TravelCard
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TravelCard } from "@/components/travel-card";
import {
  Calendar,
  MapPin,
  Plus,
  Share2,
  Edit,
  ArrowLeft,
} from "lucide-react";
import type { TravelPlanDetail } from "@/actions/travel-plans/get-plan-detail";
import { AddPlanItemDialog } from "@/components/travel-plans/add-item-dialog";
import { toast } from "sonner";

interface PlanDetailContentProps {
  planDetail: TravelPlanDetail;
}

export function PlanDetailContent({ planDetail }: PlanDetailContentProps) {
  const router = useRouter();
  const [addItemDialogOpen, setAddItemDialogOpen] = useState(false);

  // 일차별로 여행지 그룹화
  const itemsByDay = planDetail.items.reduce(
    (acc, item) => {
      if (!acc[item.dayNumber]) {
        acc[item.dayNumber] = [];
      }
      acc[item.dayNumber].push(item);
      return acc;
    },
    {} as Record<number, typeof planDetail.items>
  );

  const handleShare = () => {
    if (planDetail.shareToken) {
      const shareUrl = `${window.location.origin}/travel-plans/${planDetail.id}?token=${planDetail.shareToken}`;
      navigator.clipboard.writeText(shareUrl);
      toast.success("공유 링크가 복사되었습니다");
    } else {
      toast.error("공개 일정이 아닙니다");
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Link
            href="/travel-plans"
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            일정 목록으로
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {planDetail.title}
          </h1>
          {planDetail.description && (
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {planDetail.description}
            </p>
          )}
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            {planDetail.startDate && planDetail.endDate && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(planDetail.startDate).toLocaleDateString("ko-KR")} -{" "}
                  {new Date(planDetail.endDate).toLocaleDateString("ko-KR")}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{planDetail.items.length}개 여행지</span>
            </div>
            <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full">
              {planDetail.status === "draft"
                ? "초안"
                : planDetail.status === "planned"
                ? "계획됨"
                : planDetail.status === "in_progress"
                ? "진행중"
                : planDetail.status === "completed"
                ? "완료"
                : "취소"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {planDetail.isPublic && (
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" />
              공유
            </Button>
          )}
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            편집
          </Button>
        </div>
      </div>

      {/* 일차별 여행지 목록 */}
      {Object.keys(itemsByDay).length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full">
              <MapPin className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                여행지가 없습니다
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                북마크한 여행지를 일정에 추가해보세요
              </p>
              <Button onClick={() => setAddItemDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                여행지 추가
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(itemsByDay)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([dayNumber, items]) => (
              <div key={dayNumber} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {dayNumber}일차
                  </h2>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setAddItemDialogOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    추가
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {items
                    .sort((a, b) => a.orderIndex - b.orderIndex)
                    .map((item) => (
                      <div key={item.id} className="relative">
                        {item.travel && (
                          <TravelCard travel={item.travel} />
                        )}
                        {item.notes && (
                          <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs text-gray-700 dark:text-gray-300">
                            {item.notes}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* 여행지 추가 다이얼로그 */}
      <AddPlanItemDialog
        open={addItemDialogOpen}
        onOpenChange={setAddItemDialogOpen}
        planId={planDetail.id}
        onSuccess={() => {
          router.refresh();
        }}
      />
    </div>
  );
}

