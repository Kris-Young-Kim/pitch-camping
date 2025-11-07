/**
 * @file create-folder.ts
 * @description 북마크 폴더 생성 Server Action
 *
 * 새로운 북마크 폴더를 생성하는 Server Action
 *
 * 주요 기능:
 * 1. 인증된 사용자의 폴더 생성
 * 2. 폴더명 중복 확인 (사용자별)
 * 3. 폴더 정보 저장
 *
 * @dependencies
 * - lib/supabase/server.ts: createClerkSupabaseClient
 * - @clerk/nextjs/server: auth
 */

"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { logError, logInfo } from "@/lib/utils/logger";

export interface CreateFolderInput {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface CreateFolderResult {
  success: boolean;
  folderId?: string;
  error?: string;
}

/**
 * 북마크 폴더 생성
 * @param input 폴더 정보
 * @returns 생성 결과
 */
export async function createBookmarkFolder(
  input: CreateFolderInput
): Promise<CreateFolderResult> {
  console.group("[createBookmarkFolder] 폴더 생성 시작");
  logInfo("[createBookmarkFolder] 폴더 생성", { name: input.name });

  try {
    // 인증 확인
    const { userId } = await auth();
    if (!userId) {
      const error = "인증되지 않은 사용자입니다.";
      console.warn("[createBookmarkFolder]", error);
      return { success: false, error };
    }

    // 입력 검증
    if (!input.name || input.name.trim() === "") {
      const error = "폴더명은 필수입니다.";
      console.warn("[createBookmarkFolder]", error);
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
      console.error("[createBookmarkFolder] 사용자 조회 실패:", userError);
      logError("[createBookmarkFolder] 사용자 조회 실패", userError instanceof Error ? userError : new Error(String(userError)));
      return { success: false, error: "사용자 정보를 찾을 수 없습니다." };
    }

    // 폴더명 중복 확인
    const { data: existingFolder, error: checkError } = await supabase
      .from("bookmark_folders")
      .select("id")
      .eq("user_id", userData.id)
      .eq("name", input.name.trim())
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      console.error("[createBookmarkFolder] 중복 확인 실패:", checkError);
      logError("[createBookmarkFolder] 중복 확인 실패", checkError instanceof Error ? checkError : new Error(String(checkError)));
      return { success: false, error: "폴더명 중복 확인 중 오류가 발생했습니다." };
    }

    if (existingFolder) {
      const error = "이미 같은 이름의 폴더가 있습니다.";
      console.warn("[createBookmarkFolder]", error);
      return { success: false, error };
    }

    // 폴더 생성
    const { data: newFolder, error: createError } = await supabase
      .from("bookmark_folders")
      .insert({
        user_id: userData.id,
        name: input.name.trim(),
        description: input.description?.trim() || null,
        color: input.color?.trim() || null,
        icon: input.icon?.trim() || null,
      })
      .select("id")
      .single();

    if (createError || !newFolder) {
      console.error("[createBookmarkFolder] 폴더 생성 실패:", createError);
      logError("[createBookmarkFolder] 폴더 생성 실패", createError instanceof Error ? createError : new Error(String(createError)));
      return { success: false, error: "폴더 생성 중 오류가 발생했습니다." };
    }

    console.log("[createBookmarkFolder] 폴더 생성 완료:", newFolder.id);
    logInfo("[createBookmarkFolder] 폴더 생성 완료", { folderId: newFolder.id });
    console.groupEnd();

    return { success: true, folderId: newFolder.id };
  } catch (error) {
    console.error("[createBookmarkFolder] 폴더 생성 오류:", error);
    logError("[createBookmarkFolder] 폴더 생성 오류", error instanceof Error ? error : new Error(String(error)));
    console.groupEnd();
    return { success: false, error: "폴더 생성 중 예기치 않은 오류가 발생했습니다." };
  }
}

