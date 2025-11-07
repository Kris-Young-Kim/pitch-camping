/**
 * @file update-bookmark-folder.ts
 * @description 북마크 폴더 변경 Server Action
 *
 * 북마크를 폴더로 이동하거나 폴더에서 제거하는 Server Action
 *
 * 주요 기능:
 * 1. 인증된 사용자의 북마크 폴더 변경
 * 2. 북마크 소유권 확인
 * 3. 폴더 소유권 확인 (폴더 ID가 제공된 경우)
 *
 * @dependencies
 * - lib/supabase/server.ts: createClerkSupabaseClient
 * - @clerk/nextjs/server: auth
 */

"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { logError, logInfo } from "@/lib/utils/logger";

export interface UpdateBookmarkFolderInput {
  bookmarkId: string;
  folderId: string | null; // null이면 폴더에서 제거
}

export interface UpdateBookmarkFolderResult {
  success: boolean;
  error?: string;
}

/**
 * 북마크 폴더 변경
 * @param input 북마크 및 폴더 정보
 * @returns 변경 결과
 */
export async function updateBookmarkFolder(
  input: UpdateBookmarkFolderInput
): Promise<UpdateBookmarkFolderResult> {
  console.group("[updateBookmarkFolder] 북마크 폴더 변경 시작");
  logInfo("[updateBookmarkFolder] 북마크 폴더 변경", {
    bookmarkId: input.bookmarkId,
    folderId: input.folderId,
  });

  try {
    // 인증 확인
    const { userId } = await auth();
    if (!userId) {
      const error = "인증되지 않은 사용자입니다.";
      console.warn("[updateBookmarkFolder]", error);
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
      console.error("[updateBookmarkFolder] 사용자 조회 실패:", userError);
      logError("[updateBookmarkFolder] 사용자 조회 실패", userError instanceof Error ? userError : new Error(String(userError)));
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
      console.error("[updateBookmarkFolder] 북마크 조회 실패:", bookmarkError);
      logError("[updateBookmarkFolder] 북마크 조회 실패", bookmarkError instanceof Error ? bookmarkError : new Error(String(bookmarkError)));
      return { success: false, error: "북마크를 찾을 수 없거나 권한이 없습니다." };
    }

    // 폴더 ID가 제공된 경우 폴더 소유권 확인
    if (input.folderId) {
      const { data: folder, error: folderError } = await supabase
        .from("bookmark_folders")
        .select("id")
        .eq("id", input.folderId)
        .eq("user_id", userData.id)
        .single();

      if (folderError || !folder) {
        console.error("[updateBookmarkFolder] 폴더 조회 실패:", folderError);
        logError("[updateBookmarkFolder] 폴더 조회 실패", folderError instanceof Error ? folderError : new Error(String(folderError)));
        return { success: false, error: "폴더를 찾을 수 없거나 권한이 없습니다." };
      }
    }

    // 북마크 폴더 업데이트
    const { error: updateError } = await supabase
      .from("bookmarks")
      .update({ folder_id: input.folderId })
      .eq("id", input.bookmarkId)
      .eq("user_id", userData.id);

    if (updateError) {
      console.error("[updateBookmarkFolder] 북마크 폴더 변경 실패:", updateError);
      logError("[updateBookmarkFolder] 북마크 폴더 변경 실패", updateError instanceof Error ? updateError : new Error(String(updateError)));
      return { success: false, error: "북마크 폴더 변경 중 오류가 발생했습니다." };
    }

    console.log("[updateBookmarkFolder] 북마크 폴더 변경 완료");
    logInfo("[updateBookmarkFolder] 북마크 폴더 변경 완료", {
      bookmarkId: input.bookmarkId,
      folderId: input.folderId,
    });
    console.groupEnd();

    return { success: true };
  } catch (error) {
    console.error("[updateBookmarkFolder] 북마크 폴더 변경 오류:", error);
    logError("[updateBookmarkFolder] 북마크 폴더 변경 오류", error instanceof Error ? error : new Error(String(error)));
    console.groupEnd();
    return { success: false, error: "북마크 폴더 변경 중 예기치 않은 오류가 발생했습니다." };
  }
}

