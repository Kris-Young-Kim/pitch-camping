/**
 * @file pet-friendly-review-section.tsx
 * @description 반려동물 동반 여행지 리뷰 섹션 컴포넌트
 *
 * 반려동물 동반 여행지의 반려동물 동반 리뷰만 필터링하여 표시하는 컴포넌트
 *
 * 주요 기능:
 * 1. 반려동물 동반 리뷰만 필터링하여 표시
 * 2. 반려동물 동반 만족도 표시
 * 3. 반려동물 동반 리뷰 통계 표시
 *
 * @dependencies
 * - lib/api/reviews.ts: getReviews
 * - lib/api/pet-friendly-reviews.ts: getPetFriendlyReviewStats
 * - components/travel-detail/review-card.tsx: ReviewCard (기존 리뷰 카드 재사용)
 */

"use client";

import { useEffect, useState } from "react";
import { getReviews, type Review } from "@/lib/api/reviews";
import { getPetFriendlyReviewStats, type PetFriendlyReviewStats } from "@/lib/api/pet-friendly-reviews";
import { Heart, Star, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface PetFriendlyReviewSectionProps {
  contentId: string;
  className?: string;
}

export function PetFriendlyReviewSection({
  contentId,
  className,
}: PetFriendlyReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<PetFriendlyReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      console.group(`[PetFriendlyReviewSection] 데이터 조회: ${contentId}`);
      setLoading(true);
      setError(null);

      try {
        // 반려동물 동반 리뷰와 통계를 병렬로 조회
        const [reviewsData, statsData] = await Promise.all([
          getReviews(contentId, 10, 0, true), // petFriendlyOnly = true
          getPetFriendlyReviewStats(contentId),
        ]);

        console.log("[PetFriendlyReviewSection] 리뷰 데이터:", reviewsData);
        console.log("[PetFriendlyReviewSection] 통계 데이터:", statsData);

        setReviews(reviewsData);
        setStats(statsData);
      } catch (err) {
        console.error("[PetFriendlyReviewSection] 데이터 조회 실패:", err);
        setError("리뷰를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
        console.groupEnd();
      }
    }

    fetchData();
  }, [contentId]);

  if (loading) {
    return (
      <div className={cn("bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 md:p-8", className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="space-y-2">
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 md:p-8", className)}>
        <div className="text-center text-red-600 dark:text-red-400">{error}</div>
      </div>
    );
  }

  if (!stats || stats.totalPetReviews === 0) {
    return (
      <div className={cn("bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 md:p-8", className)}>
        <div className="flex items-center gap-3 mb-4">
          <Heart className="w-6 h-6 text-green-600 dark:text-green-400 fill-current" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            반려동물 동반 리뷰
          </h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          아직 반려동물 동반 리뷰가 없습니다. 첫 번째 리뷰를 작성해보세요!
        </p>
      </div>
    );
  }

  return (
    <div className={cn("bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 md:p-8", className)}>
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <Heart className="w-6 h-6 text-green-600 dark:text-green-400 fill-current" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          반려동물 동반 리뷰
        </h2>
        <span className="px-3 py-1 text-sm font-semibold bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 rounded-full">
          {stats.totalPetReviews}개
        </span>
      </div>

      {/* 통계 */}
      {stats && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {stats.averagePetRating.toFixed(1)}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">/ 5.0</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <TrendingUp className="w-4 h-4" />
              <span>반려동물 동반 만족도</span>
            </div>
          </div>

          {/* 평점 분포 */}
          {stats.petRatingDistribution.length > 0 && (
            <div className="mt-4 space-y-2">
              {stats.petRatingDistribution.map(({ rating, count }) => (
                <div key={rating} className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-8">
                    {rating}점
                  </span>
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 dark:bg-green-400 rounded-full transition-all"
                      style={{
                        width: `${stats.totalPetReviews > 0 ? (count / stats.totalPetReviews) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-8 text-right">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 리뷰 목록 */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {review.user_name || "익명"}
                </span>
                {review.pet_friendly_experience && (
                  <span className="px-2 py-0.5 text-xs font-semibold bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 rounded-full flex items-center gap-1">
                    <Heart className="w-3 h-3 fill-current" />
                    반려동물 동반
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {review.pet_friendly_rating && (
                  <>
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {review.pet_friendly_rating}
                    </span>
                  </>
                )}
              </div>
            </div>

            {review.comment && (
              <p className="text-gray-700 dark:text-gray-300 mb-2">{review.comment}</p>
            )}

            {review.pet_friendly_comment && (
              <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">
                  반려동물 동반 경험:
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {review.pet_friendly_comment}
                </p>
              </div>
            )}

            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {new Date(review.created_at).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
        ))}
      </div>

      {reviews.length === 0 && (
        <p className="text-center text-gray-600 dark:text-gray-400 py-4">
          반려동물 동반 리뷰가 없습니다.
        </p>
      )}
    </div>
  );
}

