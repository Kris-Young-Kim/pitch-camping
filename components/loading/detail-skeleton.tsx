/**
 * @file detail-skeleton.tsx
 * @description 상세페이지 스켈레톤 컴포넌트
 *
 * 캠핑장 상세페이지 레이아웃과 동일한 스켈레톤 UI
 * 이미지, 텍스트, 정보 섹션별 스켈레톤 제공
 *
 * @dependencies
 * - components/ui/skeleton.tsx: Skeleton 컴포넌트
 * - components/loading/image-skeleton.tsx: ImageSkeleton 컴포넌트
 */

import { Skeleton } from "@/components/ui/skeleton";
import { ImageSkeleton } from "./image-skeleton";

export function DetailSkeleton() {
  return (
    <div className="min-h-[calc(100vh-80px)] py-8 px-4" role="status" aria-label="캠핑장 상세 정보 로딩 중">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* 헤더 영역 */}
        <div className="space-y-2">
          <Skeleton className="h-10 w-12" />
          <Skeleton className="h-8 w-64" />
        </div>

        {/* 이미지 갤러리 영역 */}
        <ImageSkeleton className="w-full h-96 rounded-lg" aspectRatio="auto" />

        {/* 기본 정보 영역 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="flex gap-2 mt-4">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>

        {/* 상세 정보 영역 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </div>

        {/* 리뷰 섹션 스켈레톤 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-20 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <span className="sr-only">캠핑장 상세 정보를 불러오는 중입니다...</span>
    </div>
  );
}

