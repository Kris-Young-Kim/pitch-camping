/**
 * @file map-skeleton.tsx
 * @description 지도 스켈레톤 컴포넌트
 *
 * 네이버 지도 로딩 중 표시할 스켈레톤 UI
 * 접근성을 고려하여 스크린 리더용 텍스트 포함
 *
 * @dependencies
 * - components/ui/skeleton.tsx: Skeleton 컴포넌트
 * - lucide-react: MapPin 아이콘
 */

import { Skeleton } from "@/components/ui/skeleton";
import { MapPin } from "lucide-react";

export function MapSkeleton() {
  return (
    <div
      className="w-full h-full bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center relative overflow-hidden"
      role="status"
      aria-label="지도 로딩 중"
    >
      <Skeleton className="absolute inset-0" />
      <div className="relative z-10 flex flex-col items-center gap-2">
        <MapPin className="h-8 w-8 text-gray-400 dark:text-gray-600 animate-pulse" aria-hidden="true" />
        <p className="text-sm text-gray-500 dark:text-gray-400">지도를 불러오는 중...</p>
      </div>
      <span className="sr-only">지도를 불러오는 중입니다...</span>
    </div>
  );
}

