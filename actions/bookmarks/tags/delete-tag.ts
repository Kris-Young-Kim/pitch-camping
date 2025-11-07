/**
 * @file delete-tag.ts
 * @description 북마크 태그 삭제 Server Action
 *
 * 북마크 태그를 삭제하는 Server Action
 *
 * 주요 기능:
 * 1. 인증된 사용자의 태그 삭제
 * 2. 태그 소유권 확인
 * 3. 태그 삭제 시 북마크-태그 관계도 자동 삭제 (ON DELETE CASCADE)
 *
 * @dependencies
 * - lib/supabase/server.ts: createClerkSupabaseClient
 * - @clerk/nextjs/server: auth
 */

"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { logError, logInfo } from "@/lib/utils/logger";

export interface DeleteTagResult {
  success: boolean;
  error?: string;
}

/**
 * 북마크 태그 삭제
 * @param tagId 태그 ID
 * @returns 삭제 결과
 */
export async function deleteBookmarkTag(
  tagId: string
): Promise<DeleteTagResult> {
  console.group("[deleteBookmarkTag] 태그 삭제 시작");
  logInfo("[deleteBookmarkTag] 태그 삭제", { tagId });

  try {
    // 인증 확인
    const { userId } = await auth();
    if (!userId) {
      const error = "인증되지 않은 사용자입니다.";
      console.warn("[deleteBookmarkTag]", error);
      return { success: false, error };
    }

    // Supabase 클라이언트 생성
    const supabase = createClerkSupabaseClient();

    // 사용자 ID 조회
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", userId)
      .single();

    if (userError || !userData) {
      console.error("[deleteBookmarkTag] 사용자 조회 실패:", userError);
      logError("[deleteBookmarkTag] 사용자 조회 실패", userError instanceof Error ? userError : new Error(String(userError)));
      return { success: false, error: "사용자 정보를 찾을 수 없습니다." };
    }

    // 태그 소유권 확인
    const { data: tag, error: tagError } = await supabase
      .from("bookmark_tags")
      .select("id")
      .eq("id", tagId)
      .eq("user_id", userData.id)
      .single();

    if (tagError || !tag) {
      console.error("[deleteBookmarkTag] 태그 조회 실패:", tagError);
      logError("[deleteBookmarkTag] 태그 조회 실패", tagError instanceof Error ? tagError : new Error(String(tagError)));
      return { success: false, error: "태그를 찾을 수 없거나 권한이 없습니다." };
    }

    // 태그 삭제 (북마크-태그 관계는 자동 삭제됨 - ON DELETE CASCADE)
    const { error: deleteError } = await supabase
      .from("bookmark_tags")
      .delete()
      .eq("id", tagId)
      .eq("user_id", userData.id);

    if (deleteError) {
      console.error("[deleteBookmarkTag] 태그 삭제 실패:", deleteError);
      logError("[deleteBookmarkTag] 태그 삭제 실패", deleteError instanceof Error ? deleteError : new Error(String(deleteError)));
      return { success: false, error: "태그 삭제 중 오류가 발생했습니다." };
    }

    console.log("[deleteBookmarkTag] 태그 삭제 완료");
    logInfo("[deleteBookmarkTag] 태그 삭제 완료", { tagId });
    console.groupEnd();

    return { success: true };
  } catch (error) {
    console.error("[deleteBookmarkTag] 태그 삭제 오류:", error);
    logError("[deleteBookmarkTag] 태그 삭제 오류", error instanceof Error ? error : new Error(String(error)));
    console.groupEnd();
    return { success: false, error: "태그 삭제 중 예기치 않은 오류가 발생했습니다." };
  }
}

