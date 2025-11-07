/**
 * @file update-bookmark-tags.ts
 * @description 북마크 태그 추가/제거 Server Action
 *
 * 북마크에 태그를 추가하거나 제거하는 Server Action
 *
 * 주요 기능:
 * 1. 인증된 사용자의 북마크 태그 관리
 * 2. 북마크 소유권 확인
 * 3. 태그 소유권 확인
 * 4. 태그 추가/제거
 *
 * @dependencies
 * - lib/supabase/server.ts: createClerkSupabaseClient
 * - @clerk/nextjs/server: auth
 */

"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { logError, logInfo } from "@/lib/utils/logger";

export interface UpdateBookmarkTagsInput {
  bookmarkId: string;
  tagIds: string[]; // 추가할 태그 ID 목록 (기존 태그는 제거됨)
}

export interface UpdateBookmarkTagsResult {
  success: boolean;
  error?: string;
}

/**
 * 북마크 태그 업데이트 (전체 교체)
 * @param input 북마크 및 태그 정보
 * @returns 업데이트 결과
 */
export async function updateBookmarkTags(
  input: UpdateBookmarkTagsInput
): Promise<UpdateBookmarkTagsResult> {
  console.group("[updateBookmarkTags] 북마크 태그 업데이트 시작");
  logInfo("[updateBookmarkTags] 북마크 태그 업데이트", {
    bookmarkId: input.bookmarkId,
    tagIds: input.tagIds,
  });

  try {
    // 인증 확인
    const { userId } = await auth();
    if (!userId) {
      const error = "인증되지 않은 사용자입니다.";
      console.warn("[updateBookmarkTags]", error);
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
      console.error("[updateBookmarkTags] 사용자 조회 실패:", userError);
      logError("[updateBookmarkTags] 사용자 조회 실패", userError instanceof Error ? userError : new Error(String(userError)));
      return { success: false, error: "사용자 정보를 찾을 수 없습니다." };
    }

    // 북마크 소유권 확인
    const { data: bookmark, error: bookmarkError } = await supabase
      .from("bookmarks")
      .select("id")
      .eq("id", input.bookmarkId)
      .eq("user_id", userData.id)
      .single();

    if (bookmarkError || !bookmark) {
      console.error("[updateBookmarkTags] 북마크 조회 실패:", bookmarkError);
      logError("[updateBookmarkTags] 북마크 조회 실패", bookmarkError instanceof Error ? bookmarkError : new Error(String(bookmarkError)));
      return { success: false, error: "북마크를 찾을 수 없거나 권한이 없습니다." };
    }

    // 태그 소유권 확인 (태그 ID가 제공된 경우)
    if (input.tagIds.length > 0) {
      const { data: tags, error: tagsError } = await supabase
        .from("bookmark_tags")
        .select("id")
        .eq("user_id", userData.id)
        .in("id", input.tagIds);

      if (tagsError) {
        console.error("[updateBookmarkTags] 태그 조회 실패:", tagsError);
        logError("[updateBookmarkTags] 태그 조회 실패", tagsError instanceof Error ? tagsError : new Error(String(tagsError)));
        return { success: false, error: "태그 조회 중 오류가 발생했습니다." };
      }

      if (tags.length !== input.tagIds.length) {
        const error = "일부 태그를 찾을 수 없거나 권한이 없습니다.";
        console.warn("[updateBookmarkTags]", error);
        return { success: false, error };
      }
    }

    // 기존 태그 관계 삭제
    const { error: deleteError } = await supabase
      .from("bookmark_tag_relations")
      .delete()
      .eq("bookmark_id", input.bookmarkId);

    if (deleteError) {
      console.error("[updateBookmarkTags] 기존 태그 관계 삭제 실패:", deleteError);
      logError("[updateBookmarkTags] 기존 태그 관계 삭제 실패", deleteError instanceof Error ? deleteError : new Error(String(deleteError)));
      return { success: false, error: "기존 태그 관계 삭제 중 오류가 발생했습니다." };
    }

    // 새 태그 관계 추가
    if (input.tagIds.length > 0) {
      const relations = input.tagIds.map((tagId) => ({
        bookmark_id: input.bookmarkId,
        tag_id: tagId,
      }));

      const { error: insertError } = await supabase
        .from("bookmark_tag_relations")
        .insert(relations);

      if (insertError) {
        console.error("[updateBookmarkTags] 새 태그 관계 추가 실패:", insertError);
        logError("[updateBookmarkTags] 새 태그 관계 추가 실패", insertError instanceof Error ? insertError : new Error(String(insertError)));
        return { success: false, error: "새 태그 관계 추가 중 오류가 발생했습니다." };
      }
    }

    console.log("[updateBookmarkTags] 북마크 태그 업데이트 완료");
    logInfo("[updateBookmarkTags] 북마크 태그 업데이트 완료", {
      bookmarkId: input.bookmarkId,
      tagIds: input.tagIds,
    });
    console.groupEnd();

    return { success: true };
  } catch (error) {
    console.error("[updateBookmarkTags] 북마크 태그 업데이트 오류:", error);
    logError("[updateBookmarkTags] 북마크 태그 업데이트 오류", error instanceof Error ? error : new Error(String(error)));
    console.groupEnd();
    return { success: false, error: "북마크 태그 업데이트 중 예기치 않은 오류가 발생했습니다." };
  }
}

