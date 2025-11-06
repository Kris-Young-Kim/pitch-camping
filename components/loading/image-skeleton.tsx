/**
 * @file image-skeleton.tsx
 * @description 이미지 스켈레톤 컴포넌트
 *
 * 이미지 로딩 중 표시할 스켈레톤 UI
 * aspect-ratio를 유지하며 blur placeholder 효과 제공
 *
 * @dependencies
 * - components/ui/skeleton.tsx: Skeleton 컴포넌트
 */

import { Skeleton } from "@/components/ui/skeleton";

interface ImageSkeletonProps {
  className?: string;
  aspectRatio?: "square" | "video" | "auto";
}

export function ImageSkeleton({ className = "", aspectRatio = "auto" }: ImageSkeletonProps) {
  const aspectRatioClasses = {
    square: "aspect-square",
    video: "aspect-video",
    auto: "",
  };

  return (
    <div
      className={`relative overflow-hidden ${aspectRatioClasses[aspectRatio]} ${className}`}
      role="status"
      aria-label="이미지 로딩 중"
    >
      <Skeleton className="w-full h-full" />
      <span className="sr-only">이미지를 불러오는 중입니다...</span>
    </div>
  );
}

