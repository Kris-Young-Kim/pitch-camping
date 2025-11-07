/**
 * @file toggle-pet-travel-post-like.ts
 * @description 반려동물 동반 여행 커뮤니티 게시글 좋아요 토글 Server Action
 */

"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { logError, logInfo } from "@/lib/utils/logger";

export interface TogglePetTravelPostLikeResult {
  success: boolean;
  isLiked?: boolean;
  error?: string;
}

export async function togglePetTravelPostLike(
  postId: string
): Promise<TogglePetTravelPostLikeResult> {
  console.group("[togglePetTravelPostLike] 좋아요 토글 시작");
  console.log("게시글 ID:", postId);

  try {
    const { userId } = await auth();
    if (!userId) {
      console.warn("[togglePetTravelPostLike] 인증되지 않은 사용자");
      console.groupEnd();
      return { success: false, error: "로그인이 필요합니다." };
    }

    const supabase = createClerkSupabaseClient();

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", userId)
      .single();

    if (userError || !userData) {
      console.error("[togglePetTravelPostLike] 사용자 조회 실패:", userError);
      logError(
        "[togglePetTravelPostLike] 사용자 조회 실패",
        userError instanceof Error ? userError : new Error(String(userError))
      );
      console.groupEnd();
      return { success: false, error: "사용자 정보를 찾을 수 없습니다." };
    }

    // 기존 좋아요 확인
    const { data: existingLike } = await supabase
      .from("pet_travel_post_likes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", userData.id)
      .maybeSingle();

    if (existingLike) {
      // 좋아요 제거
      const { error: deleteError } = await supabase
        .from("pet_travel_post_likes")
        .delete()
        .eq("id", existingLike.id);

      if (deleteError) {
        console.error("[togglePetTravelPostLike] 좋아요 제거 실패:", deleteError);
        logError(
          "[togglePetTravelPostLike] 좋아요 제거 실패",
          deleteError instanceof Error ? deleteError : new Error(String(deleteError))
        );
        console.groupEnd();
        return { success: false, error: "좋아요 제거에 실패했습니다." };
      }

      logInfo("[togglePetTravelPostLike] 좋아요 제거 완료", { postId });
      console.groupEnd();
      return { success: true, isLiked: false };
    } else {
      // 좋아요 추가
      const { error: insertError } = await supabase
        .from("pet_travel_post_likes")
        .insert({
          post_id: postId,
          user_id: userData.id,
        });

      if (insertError) {
        console.error("[togglePetTravelPostLike] 좋아요 추가 실패:", insertError);
        logError(
          "[togglePetTravelPostLike] 좋아요 추가 실패",
          insertError instanceof Error ? insertError : new Error(String(insertError))
        );
        console.groupEnd();
        return { success: false, error: "좋아요 추가에 실패했습니다." };
      }

      logInfo("[togglePetTravelPostLike] 좋아요 추가 완료", { postId });
      console.groupEnd();
      return { success: true, isLiked: true };
    }
  } catch (error) {
    console.error("[togglePetTravelPostLike] 좋아요 토글 오류:", error);
    logError(
      "[togglePetTravelPostLike] 좋아요 토글 오류",
      error instanceof Error ? error : new Error(String(error))
    );
    console.groupEnd();
    return { success: false, error: "좋아요 처리 중 오류가 발생했습니다." };
  }
}

