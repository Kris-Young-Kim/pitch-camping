/**
 * @file pet-friendly-reviews.ts
 * @description 반려동물 동반 여행지 리뷰 통계 API 모듈
 *
 * 반려동물 동반 여행지 리뷰 통계 관련 API 함수들
 *
 * 주요 기능:
 * 1. 반려동물 동반 리뷰 통계 조회
 * 2. 반려동물 동반 만족도 평균 계산
 * 3. 반려동물 동반 리뷰 평점 분포 조회
 *
 * @dependencies
 * - lib/supabase/server.ts: createClerkSupabaseClient
 */

"use server";

import { createClerkSupabaseClient } from "@/lib/supabase/server";

export interface PetFriendlyReviewStats {
  averagePetRating: number;
  totalPetReviews: number;
  petRatingDistribution: {
    rating: number;
    count: number;
  }[];
}

/**
 * 반려동물 동반 리뷰 통계 조회
 * @param contentId 여행지 contentId
 * @returns 반려동물 동반 리뷰 통계
 */
export async function getPetFriendlyReviewStats(
  contentId: string
): Promise<PetFriendlyReviewStats> {
  console.log(`[PetFriendlyReviews] 통계 조회: ${contentId}`);

  try {
    const supabase = await createClerkSupabaseClient();

    // 반려동물 동반 리뷰만 조회
    const { data, error } = await supabase
      .from("reviews")
      .select("pet_friendly_rating")
      .eq("content_id", contentId)
      .eq("pet_friendly_experience", true)
      .not("pet_friendly_rating", "is", null);

    if (error) {
      console.error("[PetFriendlyReviews] 통계 조회 실패:", error);
      return {
        averagePetRating: 0,
        totalPetReviews: 0,
        petRatingDistribution: [],
      };
    }

    if (!data || data.length === 0) {
      return {
        averagePetRating: 0,
        totalPetReviews: 0,
        petRatingDistribution: [],
      };
    }

    // 평균 만족도 계산
    const totalRating = data.reduce(
      (sum, review) => sum + (review.pet_friendly_rating || 0),
      0
    );
    const averagePetRating = totalRating / data.length;

    // 평점 분포 계산
    const distribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    data.forEach((review) => {
      const rating = review.pet_friendly_rating;
      if (rating && rating >= 1 && rating <= 5) {
        distribution[rating] = (distribution[rating] || 0) + 1;
      }
    });

    const petRatingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
      rating,
      count: distribution[rating] || 0,
    }));

    return {
      averagePetRating: Math.round(averagePetRating * 10) / 10, // 소수점 첫째 자리까지
      totalPetReviews: data.length,
      petRatingDistribution,
    };
  } catch (error) {
    console.error("[PetFriendlyReviews] 통계 조회 오류:", error);
    return {
      averagePetRating: 0,
      totalPetReviews: 0,
      petRatingDistribution: [],
    };
  }
}

