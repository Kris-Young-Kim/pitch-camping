/**
 * @file get-bookmarks.ts
 * @description 북마크 목록 조회 Server Action
 *
 * 사용자가 북마크한 여행지 목록을 조회하는 Server Action
 *
 * 주요 기능:
 * 1. 인증된 사용자의 북마크 목록 조회
 * 2. 북마크한 여행지 상세 정보 조회 (TourAPI 또는 Supabase)
 * 3. 정렬 및 필터링 지원
 *
 * @dependencies
 * - lib/supabase/server.ts: createClerkSupabaseClient
 * - @clerk/nextjs/server: auth
 * - types/travel.ts: TravelSite 타입
 */

"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import type { TravelSite } from "@/types/travel";
import { normalizeTravelItems } from "@/lib/utils/travel";
import { TravelApiClient } from "@/lib/api/travel-api";
import { logError, logInfo } from "@/lib/utils/logger";

export interface BookmarkWithTravel extends TravelSite {
  bookmarkId: string;
  bookmarkedAt: string;
  tags?: Array<{
    id: string;
    name: string;
    color: string | null;
  }>;
  note?: string | null;
  noteUpdatedAt?: string | null;
}

/**
 * 북마크 목록 조회
 * @param sortBy 정렬 기준 ('created_at' | 'title' | 'region' | 'type')
 * @param filter 필터 옵션 (지역, 타입 등)
 * @returns 북마크한 여행지 목록
 */
export async function getBookmarks(
  sortBy: "created_at" | "title" | "region" | "type" = "created_at",
  filter?: {
    areaCode?: string;
    contentTypeId?: string;
    keyword?: string;
    folderId?: string | null;
    tagIds?: string[];
  }
): Promise<BookmarkWithTravel[]> {
  console.group("[getBookmarks] 북마크 목록 조회 시작");
  logInfo("[getBookmarks] 북마크 목록 조회", { sortBy, filter });

  try {
    // 인증 확인
    const { userId } = await auth();
    if (!userId) {
      console.warn("[getBookmarks] 인증되지 않은 사용자");
      logInfo("[getBookmarks] 인증되지 않은 사용자");
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
      console.error("[getBookmarks] 사용자 조회 실패:", userError);
      logError("[getBookmarks] 사용자 조회 실패", userError instanceof Error ? userError : new Error(String(userError)));
      return [];
    }

    console.log("[getBookmarks] 사용자 ID:", userData.id);

    // 북마크 목록 조회
    let bookmarksQuery = supabase
      .from("bookmarks")
      .select("id, content_id, created_at, folder_id, note, note_updated_at")
      .eq("user_id", userData.id);

    // 폴더 필터 적용
    if (filter?.folderId !== undefined) {
      if (filter.folderId === null) {
        // 폴더 없는 북마크만 조회
        bookmarksQuery = bookmarksQuery.is("folder_id", null);
      } else {
        // 특정 폴더의 북마크만 조회
        bookmarksQuery = bookmarksQuery.eq("folder_id", filter.folderId);
      }
    }

    // 정렬 (북마크 생성일순으로 먼저 정렬, 이후 여행지 정보로 재정렬)
    bookmarksQuery = bookmarksQuery.order("created_at", { ascending: false });

    const { data: bookmarks, error: bookmarksError } = await bookmarksQuery;

    if (bookmarksError) {
      console.error("[getBookmarks] 북마크 조회 실패:", bookmarksError);
      logError("[getBookmarks] 북마크 조회 실패", bookmarksError instanceof Error ? bookmarksError : new Error(String(bookmarksError)));
      return [];
    }

    if (!bookmarks || bookmarks.length === 0) {
      console.log("[getBookmarks] 북마크 없음");
      logInfo("[getBookmarks] 북마크 없음");
      return [];
    }

    console.log("[getBookmarks] 북마크 개수:", bookmarks.length);

    // 북마크한 여행지 상세 정보 조회
    const contentIds = bookmarks.map((b) => b.content_id);
    console.log("[getBookmarks] 조회할 여행지 ID:", contentIds);

    // TourAPI를 통해 여행지 상세 정보 조회
    const travelApi = new TravelApiClient();
    const travelDetails: TravelSite[] = [];

    // 배치로 조회 (한 번에 여러 개 조회)
    for (const contentId of contentIds) {
      try {
        const detail = await travelApi.getTravelDetail(contentId);
        if (detail.response?.body?.items?.item) {
          const normalized = normalizeTravelItems(
            detail.response.body.items.item
          );
          if (normalized.length > 0) {
            travelDetails.push(normalized[0]);
          }
        }
      } catch (error) {
        console.warn(`[getBookmarks] 여행지 ${contentId} 조회 실패:`, error);
        // TourAPI 실패 시 Supabase에서 조회 시도
        try {
          const serviceClient = getServiceRoleClient();
          const { data: travelData } = await serviceClient
            .from("travels")
            .select("*")
            .eq("contentid", contentId)
            .single();

          if (travelData) {
            // Supabase 데이터를 TravelSite 형식으로 변환
            const travelSite: TravelSite = {
              contentid: travelData.contentid,
              contenttypeid: travelData.contenttypeid,
              title: travelData.title,
              addr1: travelData.addr1,
              addr2: travelData.addr2,
              mapx: travelData.mapx,
              mapy: travelData.mapy,
              firstimage: travelData.firstimage,
              firstimage2: travelData.firstimage2,
              tel: travelData.tel,
              homepage: travelData.homepage,
              cat1: travelData.cat1,
              cat2: travelData.cat2,
              cat3: travelData.cat3,
              areacode: travelData.areacode,
              sigungucode: travelData.sigungucode,
              zipcode: travelData.zipcode,
              overview: travelData.overview,
            };
            travelDetails.push(travelSite);
          }
        } catch (supabaseError) {
          console.error(`[getBookmarks] Supabase 조회 실패 (${contentId}):`, supabaseError);
        }
      }
    }

    console.log("[getBookmarks] 조회된 여행지 개수:", travelDetails.length);

    // 북마크별 태그 조회
    const bookmarkIds = bookmarks.map((b) => b.id);
    const { data: tagRelations, error: tagRelationsError } = await supabase
      .from("bookmark_tag_relations")
      .select("bookmark_id, tag_id, bookmark_tags(id, name, color)")
      .in("bookmark_id", bookmarkIds);

    if (tagRelationsError) {
      console.warn("[getBookmarks] 태그 관계 조회 실패:", tagRelationsError);
    }

    // 북마크별 태그 그룹화
    const tagsByBookmark = new Map<string, Array<{ id: string; name: string; color: string | null }>>();
    if (tagRelations) {
      tagRelations.forEach((relation) => {
        const bookmarkId = relation.bookmark_id;
        const tag = relation.bookmark_tags as { id: string; name: string; color: string | null } | null;
        if (tag) {
          if (!tagsByBookmark.has(bookmarkId)) {
            tagsByBookmark.set(bookmarkId, []);
          }
          tagsByBookmark.get(bookmarkId)!.push({
            id: tag.id,
            name: tag.name,
            color: tag.color,
          });
        }
      });
    }

    // 북마크 정보와 여행지 정보 결합
    const bookmarksWithTravel: BookmarkWithTravel[] = bookmarks
      .map((bookmark) => {
        const travel = travelDetails.find(
          (t) => t.contentid === bookmark.content_id
        );
        if (!travel) return null;

        return {
          ...travel,
          bookmarkId: bookmark.id,
          bookmarkedAt: bookmark.created_at,
          tags: tagsByBookmark.get(bookmark.id) || [],
          note: bookmark.note || null,
          noteUpdatedAt: bookmark.note_updated_at || null,
        };
      })
      .filter((item): item is BookmarkWithTravel => item !== null);

    // 필터 적용
    let filteredBookmarks = bookmarksWithTravel;
    if (filter) {
      if (filter.areaCode) {
        filteredBookmarks = filteredBookmarks.filter(
          (b) => b.areacode === filter.areaCode
        );
      }
      if (filter.contentTypeId) {
        filteredBookmarks = filteredBookmarks.filter(
          (b) => b.contenttypeid === filter.contentTypeId
        );
      }
      if (filter.keyword) {
        const keyword = filter.keyword.toLowerCase();
        filteredBookmarks = filteredBookmarks.filter(
          (b) =>
            b.title?.toLowerCase().includes(keyword) ||
            b.addr1?.toLowerCase().includes(keyword) ||
            b.addr2?.toLowerCase().includes(keyword) ||
            b.note?.toLowerCase().includes(keyword)
        );
      }
      if (filter.tagIds && filter.tagIds.length > 0) {
        // 선택된 태그 중 하나라도 포함된 북마크만 필터링
        filteredBookmarks = filteredBookmarks.filter((b) => {
          if (!b.tags || b.tags.length === 0) return false;
          return filter.tagIds!.some((tagId) =>
            b.tags!.some((tag) => tag.id === tagId)
          );
        });
      }
    }

    // 정렬 적용
    if (sortBy === "title") {
      filteredBookmarks.sort((a, b) =>
        (a.title || "").localeCompare(b.title || "")
      );
    } else if (sortBy === "region") {
      filteredBookmarks.sort((a, b) =>
        (a.areacode || "").localeCompare(b.areacode || "")
      );
    } else if (sortBy === "type") {
      filteredBookmarks.sort((a, b) =>
        (a.contenttypeid || "").localeCompare(b.contenttypeid || "")
      );
    }
    // created_at은 이미 정렬됨

    console.log("[getBookmarks] 최종 북마크 개수:", filteredBookmarks.length);
    logInfo("[getBookmarks] 북마크 목록 조회 완료", {
      totalCount: filteredBookmarks.length,
    });
    console.groupEnd();

    return filteredBookmarks;
  } catch (error) {
    console.error("[getBookmarks] 북마크 목록 조회 오류:", error);
    logError("[getBookmarks] 북마크 목록 조회 오류", error instanceof Error ? error : new Error(String(error)));
    console.groupEnd();
    return [];
  }
}

