/**
 * @file create-tag.ts
 * @description 북마크 태그 생성 Server Action
 *
 * 새로운 북마크 태그를 생성하는 Server Action
 *
 * 주요 기능:
 * 1. 인증된 사용자의 태그 생성
 * 2. 태그명 중복 확인 (사용자별)
 * 3. 태그 정보 저장
 *
 * @dependencies
 * - lib/supabase/server.ts: createClerkSupabaseClient
 * - @clerk/nextjs/server: auth
 */

"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { logError, logInfo } from "@/lib/utils/logger";

export interface CreateTagInput {
  name: string;
  color?: string;
}

export interface CreateTagResult {
  success: boolean;
  tagId?: string;
  error?: string;
}

/**
 * 북마크 태그 생성
 * @param input 태그 정보
 * @returns 생성 결과
 */
export async function createBookmarkTag(
  input: CreateTagInput
): Promise<CreateTagResult> {
  console.group("[createBookmarkTag] 태그 생성 시작");
  logInfo("[createBookmarkTag] 태그 생성", { name: input.name });

  try {
    // 인증 확인
    const { userId } = await auth();
    if (!userId) {
      const error = "인증되지 않은 사용자입니다.";
      console.warn("[createBookmarkTag]", error);
      return { success: false, error };
    }

    // 입력 검증
    if (!input.name || input.name.trim() === "") {
      const error = "태그명은 필수입니다.";
      console.warn("[createBookmarkTag]", error);
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
      console.error("[createBookmarkTag] 사용자 조회 실패:", userError);
      logError("[createBookmarkTag] 사용자 조회 실패", userError instanceof Error ? userError : new Error(String(userError)));
      return { success: false, error: "사용자 정보를 찾을 수 없습니다." };
    }

    // 태그명 중복 확인
    const { data: existingTag, error: checkError } = await supabase
      .from("bookmark_tags")
      .select("id")
      .eq("user_id", userData.id)
      .eq("name", input.name.trim())
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      console.error("[createBookmarkTag] 중복 확인 실패:", checkError);
      logError("[createBookmarkTag] 중복 확인 실패", checkError instanceof Error ? checkError : new Error(String(checkError)));
      return { success: false, error: "태그명 중복 확인 중 오류가 발생했습니다." };
    }

    if (existingTag) {
      const error = "이미 같은 이름의 태그가 있습니다.";
      console.warn("[createBookmarkTag]", error);
      return { success: false, error };
    }

    // 태그 생성
    const { data: newTag, error: createError } = await supabase
      .from("bookmark_tags")
      .insert({
        user_id: userData.id,
        name: input.name.trim(),
        color: input.color?.trim() || null,
      })
      .select("id")
      .single();

    if (createError || !newTag) {
      console.error("[createBookmarkTag] 태그 생성 실패:", createError);
      logError("[createBookmarkTag] 태그 생성 실패", createError instanceof Error ? createError : new Error(String(createError)));
      return { success: false, error: "태그 생성 중 오류가 발생했습니다." };
    }

    console.log("[createBookmarkTag] 태그 생성 완료:", newTag.id);
    logInfo("[createBookmarkTag] 태그 생성 완료", { tagId: newTag.id });
    console.groupEnd();

    return { success: true, tagId: newTag.id };
  } catch (error) {
    console.error("[createBookmarkTag] 태그 생성 오류:", error);
    logError("[createBookmarkTag] 태그 생성 오류", error instanceof Error ? error : new Error(String(error)));
    console.groupEnd();
    return { success: false, error: "태그 생성 중 예기치 않은 오류가 발생했습니다." };
  }
}

