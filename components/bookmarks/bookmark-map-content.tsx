/**
 * @file bookmark-map-content.tsx
 * @description 북마크 지도 컨텐츠 컴포넌트
 *
 * 북마크한 여행지를 지도에 표시하는 클라이언트 컴포넌트
 *
 * 주요 기능:
 * 1. 북마크 목록 조회
 * 2. 폴더/태그별 필터링
 * 3. 지도에 마커 표시 (폴더/태그별 색상 구분)
 * 4. 일정 경로 표시 (선택적)
 *
 * @dependencies
 * - components/naver-map.tsx: NaverMap
 * - actions/bookmarks/get-bookmarks.ts: getBookmarks
 * - actions/bookmarks/folders/get-folders.ts: getBookmarkFolders
 * - actions/bookmarks/tags/get-tags.ts: getBookmarkTags
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { NaverMap } from "@/components/naver-map";
import { getBookmarks, type BookmarkWithTravel } from "@/actions/bookmarks/get-bookmarks";
import { getBookmarkFolders } from "@/actions/bookmarks/folders/get-folders";
import { getBookmarkTags } from "@/actions/bookmarks/tags/get-tags";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FolderList } from "@/components/bookmarks/folder-list";
import { TagList } from "@/components/bookmarks/tag-list";
import { Filter, MapPin } from "lucide-react";
import { toast } from "sonner";
import type { TravelSite } from "@/types/travel";

export function BookmarkMapContent() {
  const searchParams = useSearchParams();
  const [bookmarks, setBookmarks] = useState<BookmarkWithTravel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(
    searchParams.get("folderId") || null
  );
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(() => {
    const tagIdsParam = searchParams.get("tagIds");
    return tagIdsParam ? tagIdsParam.split(",") : [];
  });
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(
    searchParams.get("planId") || null
  );

  // 북마크 목록 조회
  useEffect(() => {
    async function fetchBookmarks() {
      console.group("[BookmarkMapContent] 북마크 목록 조회 시작");
      setLoading(true);
      setError(null);

      try {
        const filter: {
          folderId?: string | null;
          tagIds?: string[];
        } = {};

        if (selectedFolderId) {
          filter.folderId = selectedFolderId;
        }

        if (selectedTagIds.length > 0) {
          filter.tagIds = selectedTagIds;
        }

        const data = await getBookmarks("created_at", filter);
        console.log("[BookmarkMapContent] 북마크 목록:", data);
        setBookmarks(data);
      } catch (err) {
        console.error("[BookmarkMapContent] 북마크 목록 조회 실패:", err);
        setError(err instanceof Error ? err.message : "북마크 목록을 불러오는데 실패했습니다.");
        toast.error("북마크 목록을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
        console.groupEnd();
      }
    }

    fetchBookmarks();
  }, [selectedFolderId, selectedTagIds]);

  // 북마크를 TravelSite 형식으로 변환
  const travels: TravelSite[] = bookmarks.map((bookmark) => ({
    contentid: bookmark.contentid,
    contenttypeid: bookmark.contenttypeid,
    title: bookmark.title,
    addr1: bookmark.addr1,
    addr2: bookmark.addr2,
    mapx: bookmark.mapx,
    mapy: bookmark.mapy,
    firstimage: bookmark.firstimage,
    firstimage2: bookmark.firstimage2,
    tel: bookmark.tel,
    homepage: bookmark.homepage,
    cat1: bookmark.cat1,
    cat2: bookmark.cat2,
    cat3: bookmark.cat3,
    areacode: bookmark.areacode,
    sigungucode: bookmark.sigungucode,
    zipcode: bookmark.zipcode,
    overview: bookmark.overview,
  }));

  // 마커 클릭 핸들러
  const handleMarkerClick = useCallback((travel: TravelSite) => {
    console.log("[BookmarkMapContent] 마커 클릭:", travel);
    window.location.href = `/travels/${travel.contentid}`;
  }, []);

  // 폴더 선택 핸들러
  const handleFolderSelect = (folderId: string | null) => {
    setSelectedFolderId(folderId);
    setSelectedTagIds([]); // 폴더 선택 시 태그 초기화
  };

  // 태그 토글 핸들러
  const handleTagToggle = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
    setSelectedFolderId(null); // 태그 선택 시 폴더 초기화
  };

  if (loading) {
    return (
      <div className="h-[600px] bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-red-600 dark:text-red-400" />
          <div>
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-300">
              오류 발생
            </h3>
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        </div>
        <Button
          onClick={() => window.location.reload()}
          className="mt-4"
          variant="outline"
        >
          다시 시도
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 필터 섹션 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Filter className="w-5 h-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">필터</h2>
          </div>
        </div>

        <div className="space-y-4 pt-4">
          {/* 폴더 필터 */}
          <div>
            <Label className="text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
              폴더
            </Label>
            <FolderList
              selectedFolderId={selectedFolderId}
              onFolderSelect={handleFolderSelect}
            />
          </div>

          {/* 태그 필터 */}
          <div>
            <Label className="text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
              태그
            </Label>
            <TagList
              selectedTagIds={selectedTagIds}
              onTagToggle={handleTagToggle}
            />
          </div>
        </div>
      </div>

      {/* 지도 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="h-[600px] w-full">
          <NaverMap
            travels={travels}
            onMarkerClick={handleMarkerClick}
            showPetFriendlyOnly={false}
            bookmarkMarkers={{
              bookmarks: bookmarks.map((b) => ({
                bookmarkId: b.bookmarkId,
                contentid: b.contentid,
                folderId: b.folderId || null,
                tags: b.tags || [],
              })),
              folderId: selectedFolderId,
              tagIds: selectedTagIds,
            }}
          />
        </div>
      </div>

      {/* 북마크 개수 표시 */}
      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
        지도에 {bookmarks.length}개의 북마크가 표시됩니다
      </div>
    </div>
  );
}

