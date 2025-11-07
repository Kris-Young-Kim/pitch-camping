/**
 * @file get-tags.ts
 * @description 북마크 태그 목록 조회 Server Action
 *
 * 사용자가 생성한 북마크 태그 목록을 조회하는 Server Action
 *
 * 주요 기능:
 * 1. 인증된 사용자의 태그 목록 조회
 * 2. 태그별 북마크 개수 포함
 * 3. 정렬 지원 (생성일순, 이름순, 사용 빈도순)
 *
 * @dependencies
 * - lib/supabase/server.ts: createClerkSupabaseClient
 * - @clerk/nextjs/server: auth
 */

"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { logError, logInfo } from "@/lib/utils/logger";

export interface BookmarkTag {
  id: string;
  name: string;
  color: string | null;
  createdAt: string;
  bookmarkCount: number;
}

/**
 * 북마크 태그 목록 조회
 * @param sortBy 정렬 기준 ('created_at' | 'name' | 'usage')
 * @returns 북마크 태그 목록 (북마크 개수 포함)
 */
export async function getBookmarkTags(
  sortBy: "created_at" | "name" | "usage" = "created_at"
): Promise<BookmarkTag[]> {
  console.group("[getBookmarkTags] 태그 목록 조회 시작");
  logInfo("[getBookmarkTags] 태그 목록 조회", { sortBy });

  try {
    // 인증 확인
    const { userId } = await auth();
    if (!userId) {
      console.warn("[getBookmarkTags] 인증되지 않은 사용자");
      logInfo("[getBookmarkTags] 인증되지 않은 사용자");
      return [];
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
      console.error("[getBookmarkTags] 사용자 조회 실패:", userError);
      logError("[getBookmarkTags] 사용자 조회 실패", userError instanceof Error ? userError : new Error(String(userError)));
      return [];
    }

    console.log("[getBookmarkTags] 사용자 ID:", userData.id);

    // 태그 목록 조회
    let tagsQuery = supabase
      .from("bookmark_tags")
      .select("id, name, color, created_at")
      .eq("user_id", userData.id);

    // 정렬
    if (sortBy === "name") {
      tagsQuery = tagsQuery.order("name", { ascending: true });
    } else {
      tagsQuery = tagsQuery.order("created_at", { ascending: false });
    }

    const { data: tags, error: tagsError } = await tagsQuery;

    if (tagsError) {
      console.error("[getBookmarkTags] 태그 조회 실패:", tagsError);
      logError("[getBookmarkTags] 태그 조회 실패", tagsError instanceof Error ? tagsError : new Error(String(tagsError)));
      return [];
    }

    if (!tags || tags.length === 0) {
      console.log("[getBookmarkTags] 태그 없음");
      logInfo("[getBookmarkTags] 태그 없음");
      return [];
    }

    console.log("[getBookmarkTags] 태그 개수:", tags.length);

    // 각 태그별 북마크 개수 조회
    const tagsWithCount: BookmarkTag[] = await Promise.all(
      tags.map(async (tag) => {
        const { count, error: countError } = await supabase
          .from("bookmark_tag_relations")
          .select("*", { count: "exact", head: true })
          .eq("tag_id", tag.id);

        if (countError) {
          console.warn(`[getBookmarkTags] 태그 ${tag.id} 북마크 개수 조회 실패:`, countError);
          return {
            id: tag.id,
            name: tag.name,
            color: tag.color,
            createdAt: tag.created_at,
            bookmarkCount: 0,
          };
        }

        return {
          id: tag.id,
          name: tag.name,
          color: tag.color,
          createdAt: tag.created_at,
          bookmarkCount: count || 0,
        };
      })
    );

    // 사용 빈도순 정렬
    if (sortBy === "usage") {
      tagsWithCount.sort((a, b) => b.bookmarkCount - a.bookmarkCount);
    }

    console.log("[getBookmarkTags] 최종 태그 개수:", tagsWithCount.length);
    logInfo("[getBookmarkTags] 태그 목록 조회 완료", {
      totalCount: tagsWithCount.length,
    });
    console.groupEnd();

    return tagsWithCount;
  } catch (error) {
    console.error("[getBookmarkTags] 태그 목록 조회 오류:", error);
    logError("[getBookmarkTags] 태그 목록 조회 오류", error instanceof Error ? error : new Error(String(error)));
    console.groupEnd();
    return [];
  }
}

