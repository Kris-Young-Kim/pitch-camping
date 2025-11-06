/**
 * @file card-skeleton.tsx
 * @description 캠핑 카드 스켈레톤 컴포넌트
 *
 * 캠핑 카드와 동일한 레이아웃의 로딩 스켈레톤 UI
 * 접근성을 고려하여 스크린 리더용 텍스트 포함
 *
 * @dependencies
 * - components/ui/skeleton.tsx: Skeleton 컴포넌트
 */

import { Skeleton } from "@/components/ui/skeleton";

export function CardSkeleton() {
  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
      role="status"
      aria-label="캠핑장 정보 로딩 중"
    >
      <Skeleton className="w-full h-48" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-2 mt-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
      <span className="sr-only">캠핑장 정보를 불러오는 중입니다...</span>
    </div>
  );
}

