/**
 * @file get-folders.ts
 * @description 북마크 폴더 목록 조회 Server Action
 *
 * 사용자가 생성한 북마크 폴더 목록을 조회하는 Server Action
 *
 * 주요 기능:
 * 1. 인증된 사용자의 폴더 목록 조회
 * 2. 폴더별 북마크 개수 포함
 * 3. 정렬 지원 (생성일순, 이름순)
 *
 * @dependencies
 * - lib/supabase/server.ts: createClerkSupabaseClient
 * - @clerk/nextjs/server: auth
 */

"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { logError, logInfo } from "@/lib/utils/logger";

export interface BookmarkFolder {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  createdAt: string;
  updatedAt: string;
  bookmarkCount: number;
}

/**
 * 북마크 폴더 목록 조회
 * @param sortBy 정렬 기준 ('created_at' | 'name')
 * @returns 북마크 폴더 목록 (북마크 개수 포함)
 */
export async function getBookmarkFolders(
  sortBy: "created_at" | "name" = "created_at"
): Promise<BookmarkFolder[]> {
  console.group("[getBookmarkFolders] 폴더 목록 조회 시작");
  logInfo("[getBookmarkFolders] 폴더 목록 조회", { sortBy });

  try {
    // 인증 확인
    const { userId } = await auth();
    if (!userId) {
      console.warn("[getBookmarkFolders] 인증되지 않은 사용자");
      logInfo("[getBookmarkFolders] 인증되지 않은 사용자");
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
      console.error("[getBookmarkFolders] 사용자 조회 실패:", userError);
      logError("[getBookmarkFolders] 사용자 조회 실패", userError instanceof Error ? userError : new Error(String(userError)));
      return [];
    }

    console.log("[getBookmarkFolders] 사용자 ID:", userData.id);

    // 폴더 목록 조회
    let foldersQuery = supabase
      .from("bookmark_folders")
      .select("id, name, description, color, icon, created_at, updated_at")
      .eq("user_id", userData.id);

    // 정렬
    if (sortBy === "name") {
      foldersQuery = foldersQuery.order("name", { ascending: true });
    } else {
      foldersQuery = foldersQuery.order("created_at", { ascending: false });
    }

    const { data: folders, error: foldersError } = await foldersQuery;

    if (foldersError) {
      console.error("[getBookmarkFolders] 폴더 조회 실패:", foldersError);
      logError("[getBookmarkFolders] 폴더 조회 실패", foldersError instanceof Error ? foldersError : new Error(String(foldersError)));
      return [];
    }

    if (!folders || folders.length === 0) {
      console.log("[getBookmarkFolders] 폴더 없음");
      logInfo("[getBookmarkFolders] 폴더 없음");
      return [];
    }

    console.log("[getBookmarkFolders] 폴더 개수:", folders.length);

    // 각 폴더별 북마크 개수 조회
    const foldersWithCount: BookmarkFolder[] = await Promise.all(
      folders.map(async (folder) => {
        const { count, error: countError } = await supabase
          .from("bookmarks")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userData.id)
          .eq("folder_id", folder.id);

        if (countError) {
          console.warn(`[getBookmarkFolders] 폴더 ${folder.id} 북마크 개수 조회 실패:`, countError);
          return {
            id: folder.id,
            name: folder.name,
            description: folder.description,
            color: folder.color,
            icon: folder.icon,
            createdAt: folder.created_at,
            updatedAt: folder.updated_at,
            bookmarkCount: 0,
          };
        }

        return {
          id: folder.id,
          name: folder.name,
          description: folder.description,
          color: folder.color,
          icon: folder.icon,
          createdAt: folder.created_at,
          updatedAt: folder.updated_at,
          bookmarkCount: count || 0,
        };
      })
    );

    console.log("[getBookmarkFolders] 최종 폴더 개수:", foldersWithCount.length);
    logInfo("[getBookmarkFolders] 폴더 목록 조회 완료", {
      totalCount: foldersWithCount.length,
    });
    console.groupEnd();

    return foldersWithCount;
  } catch (error) {
    console.error("[getBookmarkFolders] 폴더 목록 조회 오류:", error);
    logError("[getBookmarkFolders] 폴더 목록 조회 오류", error instanceof Error ? error : new Error(String(error)));
    console.groupEnd();
    return [];
  }
}

