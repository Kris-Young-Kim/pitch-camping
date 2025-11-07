/**
 * @file create-pet-travel-post.ts
 * @description 반려동물 동반 여행 커뮤니티 게시글 작성 Server Action
 */

"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { logError, logInfo } from "@/lib/utils/logger";
import type { PetTravelPostType } from "./get-pet-travel-posts";

export interface CreatePetTravelPostInput {
  postType: PetTravelPostType;
  title: string;
  content: string;
  travelContentId?: string;
  images?: string[];
  tags?: string[];
  isPublished?: boolean;
}

export interface CreatePetTravelPostResult {
  success: boolean;
  postId?: string;
  error?: string;
}

export async function createPetTravelPost(
  input: CreatePetTravelPostInput
): Promise<CreatePetTravelPostResult> {
  console.group("[createPetTravelPost] 게시글 작성 시작");
  logInfo("[createPetTravelPost] 작성 요청", { postType: input.postType, title: input.title });

  try {
    const { userId } = await auth();
    if (!userId) {
      console.warn("[createPetTravelPost] 인증되지 않은 사용자");
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
      console.error("[createPetTravelPost] 사용자 조회 실패:", userError);
      logError(
        "[createPetTravelPost] 사용자 조회 실패",
        userError instanceof Error ? userError : new Error(String(userError))
      );
      console.groupEnd();
      return { success: false, error: "사용자 정보를 찾을 수 없습니다." };
    }

    if (!input.title || !input.content) {
      console.warn("[createPetTravelPost] 제목 또는 내용이 없음");
      console.groupEnd();
      return { success: false, error: "제목과 내용을 입력해주세요." };
    }

    const { data: newPost, error: insertError } = await supabase
      .from("pet_travel_posts")
      .insert({
        user_id: userData.id,
        post_type: input.postType,
        title: input.title.trim(),
        content: input.content.trim(),
        travel_contentid: input.travelContentId || null,
        images: input.images || [],
        tags: input.tags || [],
        is_published: input.isPublished !== false, // 기본값 true
      })
      .select("id")
      .single();

    if (insertError || !newPost) {
      console.error("[createPetTravelPost] 게시글 작성 실패:", insertError);
      logError(
        "[createPetTravelPost] 게시글 작성 실패",
        insertError instanceof Error ? insertError : new Error(String(insertError))
      );
      console.groupEnd();
      return { success: false, error: "게시글 작성에 실패했습니다." };
    }

    logInfo("[createPetTravelPost] 게시글 작성 완료", { postId: newPost.id });
    console.groupEnd();

    return {
      success: true,
      postId: newPost.id,
    };
  } catch (error) {
    console.error("[createPetTravelPost] 게시글 작성 오류:", error);
    logError(
      "[createPetTravelPost] 게시글 작성 오류",
      error instanceof Error ? error : new Error(String(error))
    );
    console.groupEnd();
    return { success: false, error: "게시글 작성 중 오류가 발생했습니다." };
  }
}

