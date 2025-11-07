/**
 * @file update-folder.ts
 * @description 북마크 폴더 수정 Server Action
 *
 * 기존 북마크 폴더를 수정하는 Server Action
 *
 * 주요 기능:
 * 1. 인증된 사용자의 폴더 수정
 * 2. 폴더 소유권 확인
 * 3. 폴더명 중복 확인 (수정 시)
 *
 * @dependencies
 * - lib/supabase/server.ts: createClerkSupabaseClient
 * - @clerk/nextjs/server: auth
 */

"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { logError, logInfo } from "@/lib/utils/logger";

export interface UpdateFolderInput {
  folderId: string;
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface UpdateFolderResult {
  success: boolean;
  error?: string;
}

/**
 * 북마크 폴더 수정
 * @param input 폴더 수정 정보
 * @returns 수정 결과
 */
export async function updateBookmarkFolder(
  input: UpdateFolderInput
): Promise<UpdateFolderResult> {
  console.group("[updateBookmarkFolder] 폴더 수정 시작");
  logInfo("[updateBookmarkFolder] 폴더 수정", { folderId: input.folderId });

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

    // 폴더 소유권 확인
    const { data: folder, error: folderError } = await supabase
      .from("bookmark_folders")
      .select("id, name")
      .eq("id", input.folderId)
      .eq("user_id", userData.id)
      .single();

    if (folderError || !folder) {
      console.error("[updateBookmarkFolder] 폴더 조회 실패:", folderError);
      logError("[updateBookmarkFolder] 폴더 조회 실패", folderError instanceof Error ? folderError : new Error(String(folderError)));
      return { success: false, error: "폴더를 찾을 수 없거나 권한이 없습니다." };
    }

    // 폴더명 변경 시 중복 확인
    if (input.name && input.name.trim() !== folder.name) {
      const { data: existingFolder, error: checkError } = await supabase
        .from("bookmark_folders")
        .select("id")
        .eq("user_id", userData.id)
        .eq("name", input.name.trim())
        .neq("id", input.folderId)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        console.error("[updateBookmarkFolder] 중복 확인 실패:", checkError);
        logError("[updateBookmarkFolder] 중복 확인 실패", checkError instanceof Error ? checkError : new Error(String(checkError)));
        return { success: false, error: "폴더명 중복 확인 중 오류가 발생했습니다." };
      }

      if (existingFolder) {
        const error = "이미 같은 이름의 폴더가 있습니다.";
        console.warn("[updateBookmarkFolder]", error);
        return { success: false, error };
      }
    }

    // 업데이트할 데이터 준비
    const updateData: Record<string, unknown> = {};
    if (input.name !== undefined) {
      updateData.name = input.name.trim();
    }
    if (input.description !== undefined) {
      updateData.description = input.description?.trim() || null;
    }
    if (input.color !== undefined) {
      updateData.color = input.color?.trim() || null;
    }
    if (input.icon !== undefined) {
      updateData.icon = input.icon?.trim() || null;
    }

    // 폴더 수정
    const { error: updateError } = await supabase
      .from("bookmark_folders")
      .update(updateData)
      .eq("id", input.folderId)
      .eq("user_id", userData.id);

    if (updateError) {
      console.error("[updateBookmarkFolder] 폴더 수정 실패:", updateError);
      logError("[updateBookmarkFolder] 폴더 수정 실패", updateError instanceof Error ? updateError : new Error(String(updateError)));
      return { success: false, error: "폴더 수정 중 오류가 발생했습니다." };
    }

    console.log("[updateBookmarkFolder] 폴더 수정 완료");
    logInfo("[updateBookmarkFolder] 폴더 수정 완료", { folderId: input.folderId });
    console.groupEnd();

    return { success: true };
  } catch (error) {
    console.error("[updateBookmarkFolder] 폴더 수정 오류:", error);
    logError("[updateBookmarkFolder] 폴더 수정 오류", error instanceof Error ? error : new Error(String(error)));
    console.groupEnd();
    return { success: false, error: "폴더 수정 중 예기치 않은 오류가 발생했습니다." };
  }
}

