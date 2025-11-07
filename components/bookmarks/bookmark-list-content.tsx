/**
 * @file bookmark-list-content.tsx
 * @description 북마크 목록 컨텐츠 컴포넌트
 *
 * 북마크한 여행지 목록을 표시하고 정렬/필터링 기능을 제공하는 클라이언트 컴포넌트
 *
 * 주요 기능:
 * 1. 북마크 목록 조회 및 표시
 * 2. 정렬 옵션 (최신순, 이름순, 지역별, 타입별)
 * 3. 필터 옵션 (지역, 타입, 검색어)
 * 4. 빈 상태 처리
 * 5. 에러 처리
 *
 * @dependencies
 * - actions/bookmarks/get-bookmarks.ts: getBookmarks Server Action
 * - components/travel-card.tsx: TravelCard 컴포넌트
 */

"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { TravelCard } from "@/components/travel-card";
import { BookmarkCard } from "@/components/bookmarks/bookmark-card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Bookmark, Search, Filter } from "lucide-react";
import { getBookmarks, type BookmarkWithTravel } from "@/actions/bookmarks/get-bookmarks";
import { REGIONS, REGION_LIST, REGION_CODES, TRAVEL_TYPES, TRAVEL_TYPE_LIST, TRAVEL_TYPE_CODES } from "@/constants/travel";
import { FolderList } from "@/components/bookmarks/folder-list";
import { TagList } from "@/components/bookmarks/tag-list";
import { toast } from "sonner";

type SortOption = "created_at" | "title" | "region" | "type";

export function BookmarkListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [bookmarks, setBookmarks] = useState<BookmarkWithTravel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 필터 상태
  const [sortBy, setSortBy] = useState<SortOption>(
    (searchParams.get("sort") as SortOption) || "created_at"
  );
  const [areaCode, setAreaCode] = useState<string>(
    searchParams.get("areaCode") || ""
  );
  const [contentTypeId, setContentTypeId] = useState<string>(
    searchParams.get("contentTypeId") || ""
  );
  const [keyword, setKeyword] = useState<string>(
    searchParams.get("keyword") || ""
  );
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(
    searchParams.get("folderId") || null
  );
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(() => {
    const tagIdsParam = searchParams.get("tagIds");
    return tagIdsParam ? tagIdsParam.split(",") : [];
  });

  // 북마크 목록 조회
  useEffect(() => {
    const fetchBookmarks = async () => {
      console.group("[BookmarkListContent] 북마크 목록 조회 시작");
      console.log("정렬:", sortBy);
      console.log("필터:", { areaCode, contentTypeId, keyword });

      setLoading(true);
      setError(null);

      try {
        const filter = {
          ...(areaCode && { areaCode }),
          ...(contentTypeId && { contentTypeId }),
          ...(keyword && { keyword }),
          ...(selectedFolderId !== null && { folderId: selectedFolderId }),
          ...(selectedTagIds.length > 0 && { tagIds: selectedTagIds }),
        };

        const data = await getBookmarks(sortBy, filter);
        console.log("[BookmarkListContent] 조회된 북마크 개수:", data.length);
        setBookmarks(data);
      } catch (err) {
        console.error("[BookmarkListContent] 북마크 목록 조회 오류:", err);
        setError(
          err instanceof Error
            ? err.message
            : "북마크 목록을 불러오는데 실패했습니다."
        );
        toast.error("북마크 목록을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
        console.groupEnd();
      }
    };

    fetchBookmarks();
  }, [sortBy, areaCode, contentTypeId, keyword, selectedFolderId, selectedTagIds]);

  // URL 쿼리 파라미터 업데이트
  useEffect(() => {
    const params = new URLSearchParams();
    if (sortBy !== "created_at") params.set("sort", sortBy);
    if (areaCode) params.set("areaCode", areaCode);
    if (contentTypeId) params.set("contentTypeId", contentTypeId);
    if (keyword) params.set("keyword", keyword);
    if (selectedFolderId) params.set("folderId", selectedFolderId);
    if (selectedTagIds.length > 0) params.set("tagIds", selectedTagIds.join(","));

    router.replace(`/bookmarks?${params.toString()}`, { scroll: false });
  }, [sortBy, areaCode, contentTypeId, keyword, selectedFolderId, selectedTagIds, router]);

  // 필터 초기화
  const handleResetFilters = () => {
    setSortBy("created_at");
    setAreaCode("");
    setContentTypeId("");
    setKeyword("");
    setSelectedFolderId(null);
    setSelectedTagIds([]);
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const hasActiveFilters = areaCode || contentTypeId || keyword || selectedFolderId !== null || selectedTagIds.length > 0;

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
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
      {/* 폴더 목록 */}
      <FolderList
        selectedFolderId={selectedFolderId}
        onFolderSelect={setSelectedFolderId}
        onFoldersChange={() => {
          // 폴더 변경 시 북마크 목록 다시 조회
          const filter = {
            ...(areaCode && { areaCode }),
            ...(contentTypeId && { contentTypeId }),
            ...(keyword && { keyword }),
            ...(selectedFolderId !== null && { folderId: selectedFolderId }),
            ...(selectedTagIds.length > 0 && { tagIds: selectedTagIds }),
          };
          getBookmarks(sortBy, filter).then(setBookmarks).catch((err) => {
            console.error("[BookmarkListContent] 북마크 목록 조회 오류:", err);
            setError(err instanceof Error ? err.message : "북마크 목록을 불러오는데 실패했습니다.");
          });
        }}
      />

      {/* 태그 목록 */}
      <TagList
        selectedTagIds={selectedTagIds}
        onTagToggle={handleTagToggle}
        onTagsChange={() => {
          // 태그 변경 시 북마크 목록 다시 조회
          const filter = {
            ...(areaCode && { areaCode }),
            ...(contentTypeId && { contentTypeId }),
            ...(keyword && { keyword }),
            ...(selectedFolderId !== null && { folderId: selectedFolderId }),
            ...(selectedTagIds.length > 0 && { tagIds: selectedTagIds }),
          };
          getBookmarks(sortBy, filter).then(setBookmarks).catch((err) => {
            console.error("[BookmarkListContent] 북마크 목록 조회 오류:", err);
            setError(err instanceof Error ? err.message : "북마크 목록을 불러오는데 실패했습니다.");
          });
        }}
      />

      {/* 필터 섹션 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Filter className="w-5 h-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">필터</h2>
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
            >
              초기화
            </Button>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-4 pt-4">
          {/* 정렬 */}
          <div className="flex-1 min-w-0">
            <Label className="text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
              정렬
            </Label>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger className="h-11 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">최신순</SelectItem>
                <SelectItem value="title">이름순</SelectItem>
                <SelectItem value="region">지역별</SelectItem>
                <SelectItem value="type">타입별</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 지역 필터 */}
          <div className="flex-1 min-w-0">
            <Label className="text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
              지역
            </Label>
            <Select value={areaCode} onValueChange={setAreaCode}>
              <SelectTrigger className="h-11 w-full">
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">전체</SelectItem>
                {REGION_LIST.map((region) => (
                  <SelectItem key={region} value={REGION_CODES[region]}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 타입 필터 */}
          <div className="flex-1 min-w-0">
            <Label className="text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
              여행지 타입
            </Label>
            <Select value={contentTypeId} onValueChange={setContentTypeId}>
              <SelectTrigger className="h-11 w-full">
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">전체</SelectItem>
                {TRAVEL_TYPE_LIST.map((type) => (
                  <SelectItem
                    key={type}
                    value={TRAVEL_TYPE_CODES[type as keyof typeof TRAVEL_TYPE_CODES]}
                  >
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 검색어 */}
          <div className="flex-1 min-w-0">
            <Label className="text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
              검색어
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="여행지명, 주소, 메모 검색..."
                className="h-11 w-full pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 북마크 목록 */}
      {bookmarks.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full">
              <Bookmark className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                북마크한 여행지가 없습니다
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                여행지를 북마크하면 여기에서 확인할 수 있습니다
              </p>
              <Button
                onClick={() => router.push("/")}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                여행지 둘러보기
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                총 {bookmarks.length}개의 북마크
              </p>
              {bookmarks.some((b) => b.note) && (
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  메모가 있는 북마크: {bookmarks.filter((b) => b.note).length}개
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {bookmarks.map((bookmark) => (
              <BookmarkCard
                key={bookmark.bookmarkId}
                bookmark={bookmark}
                onUpdate={() => {
                  // 북마크 목록 새로고침
                  const params = new URLSearchParams(searchParams.toString());
                  router.push(`/bookmarks?${params.toString()}`);
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

