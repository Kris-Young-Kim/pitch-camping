/**
 * @file export-bookmarks.ts
 * @description 북마크 내보내기 Server Action
 */

"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { getBookmarks } from "@/actions/bookmarks/get-bookmarks";
import {
  buildExportPayload,
  convertBookmarksToCSV,
  convertBookmarksToJSON,
} from "@/lib/utils/bookmark-export";
import { logError, logInfo } from "@/lib/utils/logger";

export type BookmarkExportFormat = "json" | "csv";

export interface ExportBookmarksInput {
  format: BookmarkExportFormat;
  folderId?: string | null;
}

export interface ExportBookmarksResult {
  success: boolean;
  format?: BookmarkExportFormat;
  filename?: string;
  content?: string;
  error?: string;
}

export async function exportBookmarks(
  input: ExportBookmarksInput
): Promise<ExportBookmarksResult> {
  console.group("[exportBookmarks] 북마크 내보내기 시작");
  logInfo("[exportBookmarks] 내보내기 요청", { format: input.format });

  try {
    const { userId } = await auth();
    if (!userId) {
      console.warn("[exportBookmarks] 인증되지 않은 사용자");
      console.groupEnd();
      return { success: false, error: "인증되지 않은 사용자입니다." };
    }

    const supabase = createClerkSupabaseClient();

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", userId)
      .single();

    if (userError || !userData) {
      console.error("[exportBookmarks] 사용자 조회 실패:", userError);
      logError(
        "[exportBookmarks] 사용자 조회 실패",
        userError instanceof Error ? userError : new Error(String(userError))
      );
      console.groupEnd();
      return { success: false, error: "사용자 정보를 찾을 수 없습니다." };
    }

    const bookmarks = await getBookmarks("created_at", {
      folderId: input.folderId,
    });

    if (!bookmarks || bookmarks.length === 0) {
      console.log("[exportBookmarks] 내보낼 북마크 없음");
      console.groupEnd();
      return {
        success: true,
        format: input.format,
        filename: "bookmarks-empty",
        content: input.format === "json" ? "[]" : "",
      };
    }

    const { data: folders } = await supabase
      .from("bookmark_folders")
      .select("id, name")
      .eq("user_id", userData.id);

    const folderNameMap = new Map<string, string>();
    folders?.forEach((folder) => {
      folderNameMap.set(folder.id, folder.name);
    });

    const exportRecords = buildExportPayload(bookmarks, folderNameMap);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

    let content = "";
    let filename = `bookmarks-${timestamp}`;

    if (input.format === "json") {
      content = convertBookmarksToJSON(exportRecords);
      filename += ".json";
    } else {
      content = convertBookmarksToCSV(exportRecords);
      filename += ".csv";
    }

    logInfo("[exportBookmarks] 내보내기 완료", {
      format: input.format,
      count: exportRecords.length,
    });
    console.groupEnd();

    return {
      success: true,
      format: input.format,
      filename,
      content,
    };
  } catch (error) {
    console.error("[exportBookmarks] 내보내기 오류:", error);
    logError(
      "[exportBookmarks] 내보내기 오류",
      error instanceof Error ? error : new Error(String(error))
    );
    console.groupEnd();
    return {
      success: false,
      error: "북마크 내보내기 중 오류가 발생했습니다.",
    };
  }
}

