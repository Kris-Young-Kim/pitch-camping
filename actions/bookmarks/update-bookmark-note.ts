/**
 * @file update-bookmark-note.ts
 * @description 북마크 노트/메모 업데이트 Server Action
 *
 * 북마크에 개인 메모를 추가하거나 수정하는 기능
 *
 * 주요 기능:
 * 1. 북마크 노트 추가/수정
 * 2. 북마크 노트 삭제 (null로 설정)
 * 3. 노트 업데이트 날짜 자동 갱신
 *
 * @dependencies
 * - lib/supabase/server.ts: createClerkSupabaseClient
 * - @clerk/nextjs/server: auth
 */

"use server";

import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";
import { logInfo, logError } from "@/lib/utils/logger";

export interface UpdateBookmarkNoteInput {
  bookmarkId: string;
  note: string | null;
}

export interface UpdateBookmarkNoteResult {
  success: boolean;
  error?: string;
}

/**
 * 북마크 노트 업데이트
 * @param input 북마크 ID와 노트 내용
 * @returns 업데이트 결과
 */
export async function updateBookmarkNote(
  input: UpdateBookmarkNoteInput
): Promise<UpdateBookmarkNoteResult> {
  console.group("[updateBookmarkNote] 북마크 노트 업데이트 시작");
  logInfo("[updateBookmarkNote] 북마크 노트 업데이트", {
    bookmarkId: input.bookmarkId,
    hasNote: !!input.note,
  });

  try {
    const { userId } = await auth();

    if (!userId) {
      console.warn("[updateBookmarkNote] 인증되지 않은 사용자");
      logInfo("[updateBookmarkNote] 인증되지 않은 사용자");
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
      console.error("[updateBookmarkNote] 사용자 조회 실패:", userError);
      logError(
        "[updateBookmarkNote] 사용자 조회 실패",
        userError instanceof Error ? userError : new Error(String(userError))
      );
      return {
        success: false,
        error: "사용자 정보를 찾을 수 없습니다",
      };
    }

    // 북마크 소유권 확인
    const { data: bookmark, error: bookmarkError } = await supabase
      .from("bookmarks")
      .select("id, user_id")
      .eq("id", input.bookmarkId)
      .single();

    if (bookmarkError || !bookmark) {
      console.error("[updateBookmarkNote] 북마크 조회 실패:", bookmarkError);
      logError(
        "[updateBookmarkNote] 북마크 조회 실패",
        bookmarkError instanceof Error
          ? bookmarkError
          : new Error(String(bookmarkError))
      );
      return {
        success: false,
        error: "북마크를 찾을 수 없습니다",
      };
    }

    if (bookmark.user_id !== userData.id) {
      console.warn("[updateBookmarkNote] 권한 없음");
      logInfo("[updateBookmarkNote] 권한 없음");
      return {
        success: false,
        error: "이 북마크를 수정할 권한이 없습니다",
      };
    }

    // 노트 업데이트 (null이면 삭제)
    const { error: updateError } = await supabase
      .from("bookmarks")
      .update({
        note: input.note || null,
        note_updated_at: input.note ? new Date().toISOString() : null,
      })
      .eq("id", input.bookmarkId);

    if (updateError) {
      console.error("[updateBookmarkNote] 노트 업데이트 실패:", updateError);
      logError(
        "[updateBookmarkNote] 노트 업데이트 실패",
        updateError instanceof Error
          ? updateError
          : new Error(String(updateError))
      );
      return {
        success: false,
        error: "노트 업데이트에 실패했습니다",
      };
    }

    console.log("[updateBookmarkNote] 북마크 노트 업데이트 완료");
    logInfo("[updateBookmarkNote] 북마크 노트 업데이트 완료", {
      bookmarkId: input.bookmarkId,
    });
    return { success: true };
  } catch (error) {
    console.error("[updateBookmarkNote] 북마크 노트 업데이트 오류:", error);
    logError(
      "[updateBookmarkNote] 북마크 노트 업데이트 오류",
      error instanceof Error ? error : new Error(String(error))
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다",
    };
  } finally {
    console.groupEnd();
  }
}

