/**
 * @file delete-folder.ts
 * @description 북마크 폴더 삭제 Server Action
 *
 * 북마크 폴더를 삭제하는 Server Action
 *
 * 주요 기능:
 * 1. 인증된 사용자의 폴더 삭제
 * 2. 폴더 소유권 확인
 * 3. 폴더 삭제 시 북마크의 folder_id는 NULL로 설정 (ON DELETE SET NULL)
 *
 * @dependencies
 * - lib/supabase/server.ts: createClerkSupabaseClient
 * - @clerk/nextjs/server: auth
 */

"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { logError, logInfo } from "@/lib/utils/logger";

export interface DeleteFolderResult {
  success: boolean;
  error?: string;
}

/**
 * 북마크 폴더 삭제
 * @param folderId 폴더 ID
 * @returns 삭제 결과
 */
export async function deleteBookmarkFolder(
  folderId: string
): Promise<DeleteFolderResult> {
  console.group("[deleteBookmarkFolder] 폴더 삭제 시작");
  logInfo("[deleteBookmarkFolder] 폴더 삭제", { folderId });

  try {
    // 인증 확인
    const { userId } = await auth();
    if (!userId) {
      const error = "인증되지 않은 사용자입니다.";
      console.warn("[deleteBookmarkFolder]", error);
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
      console.error("[deleteBookmarkFolder] 사용자 조회 실패:", userError);
      logError("[deleteBookmarkFolder] 사용자 조회 실패", userError instanceof Error ? userError : new Error(String(userError)));
      return { success: false, error: "사용자 정보를 찾을 수 없습니다." };
    }

    // 폴더 소유권 확인
    const { data: folder, error: folderError } = await supabase
      .from("bookmark_folders")
      .select("id")
      .eq("id", folderId)
      .eq("user_id", userData.id)
      .single();

    if (folderError || !folder) {
      console.error("[deleteBookmarkFolder] 폴더 조회 실패:", folderError);
      logError("[deleteBookmarkFolder] 폴더 조회 실패", folderError instanceof Error ? folderError : new Error(String(folderError)));
      return { success: false, error: "폴더를 찾을 수 없거나 권한이 없습니다." };
    }

    // 폴더 삭제 (북마크의 folder_id는 자동으로 NULL로 설정됨 - ON DELETE SET NULL)
    const { error: deleteError } = await supabase
      .from("bookmark_folders")
      .delete()
      .eq("id", folderId)
      .eq("user_id", userData.id);

    if (deleteError) {
      console.error("[deleteBookmarkFolder] 폴더 삭제 실패:", deleteError);
      logError("[deleteBookmarkFolder] 폴더 삭제 실패", deleteError instanceof Error ? deleteError : new Error(String(deleteError)));
      return { success: false, error: "폴더 삭제 중 오류가 발생했습니다." };
    }

    console.log("[deleteBookmarkFolder] 폴더 삭제 완료");
    logInfo("[deleteBookmarkFolder] 폴더 삭제 완료", { folderId });
    console.groupEnd();

    return { success: true };
  } catch (error) {
    console.error("[deleteBookmarkFolder] 폴더 삭제 오류:", error);
    logError("[deleteBookmarkFolder] 폴더 삭제 오류", error instanceof Error ? error : new Error(String(error)));
    console.groupEnd();
    return { success: false, error: "폴더 삭제 중 예기치 않은 오류가 발생했습니다." };
  }
}

