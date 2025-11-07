/**
 * @file reviews.ts
 * @description 리뷰 API 모듈
 *
 * 캠핑장 리뷰 및 평점 관련 API 함수들
 *
 * 주요 기능:
 * 1. 리뷰 작성, 수정, 삭제
 * 2. 리뷰 목록 조회
 * 3. 평균 평점 계산
 * 4. 리뷰 도움됨 기능
 *
 * @dependencies
 * - lib/supabase/server.ts: createClerkSupabaseClient
 * - lib/supabase/clerk-client.ts: useClerkSupabaseClient (클라이언트용)
 */

"use server";

import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";

export interface Review {
  id: string;
  user_id: string;
  content_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  helpful_count?: number;
  user_name?: string;
  // 반려동물 동반 여행 관련 필드
  pet_friendly_experience?: boolean;
  pet_friendly_rating?: number | null;
  pet_friendly_comment?: string | null;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    rating: number;
    count: number;
  }[];
}

/**
 * 리뷰 작성
 * @param contentId 고캠핑 API contentId
 * @param rating 평점 (1-5)
 * @param comment 리뷰 내용 (선택적)
 * @param petFriendlyExperience 반려동물 동반 여행 경험 여부 (선택적)
 * @param petFriendlyRating 반려동물 동반 만족도 (1-5, petFriendlyExperience가 true일 때만 사용)
 * @param petFriendlyComment 반려동물 동반 경험 상세 설명 (선택적)
 */
export async function createReview(
  contentId: string,
  rating: number,
  comment?: string,
  petFriendlyExperience?: boolean,
  petFriendlyRating?: number,
  petFriendlyComment?: string
): Promise<{ success: boolean; error?: string }> {
  console.group(`[Reviews] 리뷰 작성: ${contentId}, rating=${rating}`);

  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "로그인이 필요합니다",
      };
    }

    if (rating < 1 || rating > 5) {
      return {
        success: false,
        error: "평점은 1-5 사이여야 합니다",
      };
    }

    const supabase = await createClerkSupabaseClient();

    // 사용자 ID 조회
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", userId)
      .single();

    if (userError || !userData) {
      console.error("[Reviews] 사용자 조회 실패:", userError);
      return {
        success: false,
        error: "사용자 정보를 찾을 수 없습니다",
      };
    }

    // 반려동물 동반 만족도 검증
    if (petFriendlyExperience && petFriendlyRating !== undefined) {
      if (petFriendlyRating < 1 || petFriendlyRating > 5) {
        return {
          success: false,
          error: "반려동물 동반 만족도는 1-5 사이여야 합니다",
        };
      }
    }

    // 리뷰 작성
    const { error: insertError } = await supabase.from("reviews").insert({
      user_id: userData.id,
      content_id: contentId,
      rating,
      comment: comment || null,
      pet_friendly_experience: petFriendlyExperience || false,
      pet_friendly_rating: petFriendlyExperience && petFriendlyRating ? petFriendlyRating : null,
      pet_friendly_comment: petFriendlyComment || null,
    });

    if (insertError) {
      console.error("[Reviews] 리뷰 작성 실패:", insertError);
      
      // 중복 리뷰 에러 처리
      if (insertError.code === "23505") {
        return {
          success: false,
          error: "이미 리뷰를 작성하셨습니다",
        };
      }

      return {
        success: false,
        error: "리뷰 작성에 실패했습니다",
      };
    }

    console.log("[Reviews] 리뷰 작성 완료");
    return { success: true };
  } catch (error) {
    console.error("[Reviews] 리뷰 작성 오류:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다",
    };
  } finally {
    console.groupEnd();
  }
}

/**
 * 리뷰 수정
 * @param reviewId 리뷰 ID
 * @param rating 평점 (1-5)
 * @param comment 리뷰 내용 (선택적)
 */
export async function updateReview(
  reviewId: string,
  rating: number,
  comment?: string
): Promise<{ success: boolean; error?: string }> {
  console.group(`[Reviews] 리뷰 수정: ${reviewId}`);

  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "로그인이 필요합니다",
      };
    }

    const supabase = await createClerkSupabaseClient();

    // 사용자 ID 조회
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", userId)
      .single();

    if (userError || !userData) {
      return {
        success: false,
        error: "사용자 정보를 찾을 수 없습니다",
      };
    }

    // 리뷰 소유권 확인 및 수정
    const { error: updateError } = await supabase
      .from("reviews")
      .update({
        rating,
        comment: comment || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", reviewId)
      .eq("user_id", userData.id);

    if (updateError) {
      console.error("[Reviews] 리뷰 수정 실패:", updateError);
      return {
        success: false,
        error: "리뷰 수정에 실패했습니다",
      };
    }

    console.log("[Reviews] 리뷰 수정 완료");
    return { success: true };
  } catch (error) {
    console.error("[Reviews] 리뷰 수정 오류:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다",
    };
  } finally {
    console.groupEnd();
  }
}

/**
 * 리뷰 삭제
 * @param reviewId 리뷰 ID
 */
export async function deleteReview(
  reviewId: string
): Promise<{ success: boolean; error?: string }> {
  console.group(`[Reviews] 리뷰 삭제: ${reviewId}`);

  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "로그인이 필요합니다",
      };
    }

    const supabase = await createClerkSupabaseClient();

    // 사용자 ID 조회
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", userId)
      .single();

    if (userError || !userData) {
      return {
        success: false,
        error: "사용자 정보를 찾을 수 없습니다",
      };
    }

    // 리뷰 소유권 확인 및 삭제
    const { error: deleteError } = await supabase
      .from("reviews")
      .delete()
      .eq("id", reviewId)
      .eq("user_id", userData.id);

    if (deleteError) {
      console.error("[Reviews] 리뷰 삭제 실패:", deleteError);
      return {
        success: false,
        error: "리뷰 삭제에 실패했습니다",
      };
    }

    console.log("[Reviews] 리뷰 삭제 완료");
    return { success: true };
  } catch (error) {
    console.error("[Reviews] 리뷰 삭제 오류:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다",
    };
  } finally {
    console.groupEnd();
  }
}

/**
 * 캠핑장 리뷰 목록 조회
 * @param contentId 고캠핑 API contentId
 * @param limit 조회할 개수 (기본값: 10)
 * @param offset 오프셋 (기본값: 0)
 * @returns 리뷰 목록
 */
export async function getReviews(
  contentId: string,
  limit: number = 10,
  offset: number = 0,
  petFriendlyOnly: boolean = false
): Promise<Review[]> {
  console.log(`[Reviews] 리뷰 목록 조회: ${contentId}, limit=${limit}, offset=${offset}, petFriendlyOnly=${petFriendlyOnly}`);

  try {
    const supabase = await createClerkSupabaseClient();

    let query = supabase
      .from("reviews")
      .select(
        `
        id,
        user_id,
        content_id,
        rating,
        comment,
        created_at,
        updated_at,
        pet_friendly_experience,
        pet_friendly_rating,
        pet_friendly_comment,
        users!inner(name)
      `
      )
      .eq("content_id", contentId);

    // 반려동물 동반 리뷰만 필터링
    if (petFriendlyOnly) {
      query = query.eq("pet_friendly_experience", true);
    }

    const { data, error } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("[Reviews] 리뷰 목록 조회 실패:", error);
      return [];
    }

    // 리뷰 도움됨 개수 조회 (선택적)
    const reviews: Review[] = await Promise.all(
      (data || []).map(async (review: any) => {
        const { count } = await supabase
          .from("review_helpful")
          .select("*", { count: "exact", head: true })
          .eq("review_id", review.id);

        return {
          id: review.id,
          user_id: review.user_id,
          content_id: review.content_id,
          rating: review.rating,
          comment: review.comment,
          created_at: review.created_at,
          updated_at: review.updated_at,
          helpful_count: count || 0,
          user_name: review.users?.name || "익명",
          pet_friendly_experience: review.pet_friendly_experience || false,
          pet_friendly_rating: review.pet_friendly_rating || null,
          pet_friendly_comment: review.pet_friendly_comment || null,
        };
      })
    );

    return reviews;
  } catch (error) {
    console.error("[Reviews] 리뷰 목록 조회 오류:", error);
    return [];
  }
}

/**
 * 캠핑장 평균 평점 및 통계 조회
 * @param contentId 고캠핑 API contentId
 * @returns 통계 데이터
 */
export async function getReviewStats(contentId: string): Promise<ReviewStats | null> {
  console.log(`[Reviews] 리뷰 통계 조회: ${contentId}`);

  try {
    const supabase = await createClerkSupabaseClient();

    // 평균 평점 조회
    const { data: avgData, error: avgError } = await supabase.rpc("get_average_rating", {
      p_content_id: contentId,
    });

    // 리뷰 개수 조회
    const { data: countData, error: countError } = await supabase.rpc("get_review_count", {
      p_content_id: contentId,
    });

    // 평점 분포 조회
    const { data: distributionData, error: distributionError } = await supabase
      .from("reviews")
      .select("rating")
      .eq("content_id", contentId);

    if (avgError || countError || distributionError) {
      console.error("[Reviews] 통계 조회 실패:", { avgError, countError, distributionError });
      return null;
    }

    // 평점 분포 계산
    const ratingDistribution = [1, 2, 3, 4, 5].map((rating) => {
      const count =
        distributionData?.filter((r: any) => r.rating === rating).length || 0;
      return { rating, count };
    });

    return {
      averageRating: Number(avgData) || 0,
      totalReviews: countData || 0,
      ratingDistribution,
    };
  } catch (error) {
    console.error("[Reviews] 통계 조회 오류:", error);
    return null;
  }
}

/**
 * 리뷰 도움됨 표시/해제
 * @param reviewId 리뷰 ID
 */
export async function toggleReviewHelpful(
  reviewId: string
): Promise<{ success: boolean; error?: string; helpful: boolean }> {
  console.group(`[Reviews] 리뷰 도움됨 토글: ${reviewId}`);

  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "로그인이 필요합니다",
        helpful: false,
      };
    }

    const supabase = await createClerkSupabaseClient();

    // 사용자 ID 조회
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", userId)
      .single();

    if (userError || !userData) {
      return {
        success: false,
        error: "사용자 정보를 찾을 수 없습니다",
        helpful: false,
      };
    }

    // 기존 도움됨 표시 확인
    const { data: existing } = await supabase
      .from("review_helpful")
      .select("id")
      .eq("review_id", reviewId)
      .eq("user_id", userData.id)
      .single();

    if (existing) {
      // 도움됨 해제
      const { error: deleteError } = await supabase
        .from("review_helpful")
        .delete()
        .eq("review_id", reviewId)
        .eq("user_id", userData.id);

      if (deleteError) {
        return {
          success: false,
          error: "도움됨 해제에 실패했습니다",
          helpful: true,
        };
      }

      return { success: true, helpful: false };
    } else {
      // 도움됨 표시
      const { error: insertError } = await supabase
        .from("review_helpful")
        .insert({
          review_id: reviewId,
          user_id: userData.id,
        });

      if (insertError) {
        return {
          success: false,
          error: "도움됨 표시에 실패했습니다",
          helpful: false,
        };
      }

      return { success: true, helpful: true };
    }
  } catch (error) {
    console.error("[Reviews] 도움됨 토글 오류:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다",
      helpful: false,
    };
  } finally {
    console.groupEnd();
  }
}

