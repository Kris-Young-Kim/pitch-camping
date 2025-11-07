/**
 * @file tag-list.tsx
 * @description 북마크 태그 목록 컴포넌트
 *
 * 사용자가 생성한 북마크 태그 목록을 표시하고 관리하는 컴포넌트
 *
 * 주요 기능:
 * 1. 태그 목록 표시
 * 2. 태그별 북마크 개수 표시
 * 3. 태그 클릭 시 해당 태그의 북마크만 필터링
 * 4. 태그 생성/삭제
 * 5. 인기 태그 표시 (사용 빈도순)
 *
 * @dependencies
 * - actions/bookmarks/tags/get-tags.ts: getBookmarkTags
 * - actions/bookmarks/tags/delete-tag.ts: deleteBookmarkTag
 * - components/bookmarks/tag-dialog.tsx: TagDialog
 */

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { TagDialog } from "@/components/bookmarks/tag-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tag, Plus, MoreVertical, Edit, Trash2, X } from "lucide-react";
import { getBookmarkTags, type BookmarkTag } from "@/actions/bookmarks/tags/get-tags";
import { deleteBookmarkTag } from "@/actions/bookmarks/tags/delete-tag";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface TagListProps {
  selectedTagIds: string[];
  onTagToggle: (tagId: string) => void;
  onTagsChange?: () => void;
}

export function TagList({
  selectedTagIds,
  onTagToggle,
  onTagsChange,
}: TagListProps) {
  const [tags, setTags] = useState<BookmarkTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<BookmarkTag | null>(null);
  const [sortBy, setSortBy] = useState<"created_at" | "name" | "usage">("usage");

  // 태그 목록 조회
  const fetchTags = async () => {
    console.group("[TagList] 태그 목록 조회 시작");
    setLoading(true);

    try {
      const data = await getBookmarkTags(sortBy);
      console.log("[TagList] 조회된 태그 개수:", data.length);
      setTags(data);
    } catch (error) {
      console.error("[TagList] 태그 목록 조회 오류:", error);
      toast.error("태그 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
      console.groupEnd();
    }
  };

  useEffect(() => {
    fetchTags();
  }, [sortBy]);

  // 태그 삭제
  const handleDeleteTag = async (tagId: string, tagName: string) => {
    console.group(`[TagList] 태그 삭제: ${tagName}`);
    
    if (!confirm(`"${tagName}" 태그를 삭제하시겠습니까? 북마크에서도 태그가 제거됩니다.`)) {
      console.log("[TagList] 태그 삭제 취소");
      console.groupEnd();
      return;
    }

    try {
      const result = await deleteBookmarkTag(tagId);
      if (result.success) {
        console.log("[TagList] 태그 삭제 완료");
        toast.success("태그가 삭제되었습니다.");
        await fetchTags();
        onTagsChange?.();
        
        // 삭제된 태그가 선택되어 있으면 선택 해제
        if (selectedTagIds.includes(tagId)) {
          onTagToggle(tagId);
        }
      } else {
        console.error("[TagList] 태그 삭제 실패:", result.error);
        toast.error(result.error || "태그 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("[TagList] 태그 삭제 오류:", error);
      toast.error("태그 삭제 중 오류가 발생했습니다.");
    } finally {
      console.groupEnd();
    }
  };

  // 태그 수정 다이얼로그 열기
  const handleEditTag = (tag: BookmarkTag) => {
    setEditingTag(tag);
  };

  // 태그 생성/수정 완료 후 콜백
  const handleTagSaved = () => {
    fetchTags();
    onTagsChange?.();
    setIsCreateDialogOpen(false);
    setEditingTag(null);
  };

  // 선택된 태그 제거
  const handleClearSelection = () => {
    selectedTagIds.forEach((tagId) => {
      onTagToggle(tagId);
    });
  };

  if (loading) {
    return (
      <div className="flex gap-2 flex-wrap">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* 태그 목록 */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* 정렬 옵션 (모바일에서는 숨김) */}
        <div className="hidden md:flex items-center gap-2 mr-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "created_at" | "name" | "usage")}
            className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
          >
            <option value="usage">인기순</option>
            <option value="name">이름순</option>
            <option value="created_at">최신순</option>
          </select>
        </div>

        {/* 선택된 태그 표시 */}
        {selectedTagIds.length > 0 && (
          <button
            onClick={handleClearSelection}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
            aria-label="태그 필터 초기화"
          >
            <X className="w-4 h-4" aria-hidden="true" />
            필터 초기화 ({selectedTagIds.length})
          </button>
        )}

        {/* 태그 목록 */}
        {tags.map((tag) => {
          const isSelected = selectedTagIds.includes(tag.id);
          return (
            <div
              key={tag.id}
              className={cn(
                "relative group flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 transition-all cursor-pointer",
                isSelected
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
              )}
            >
              <button
                onClick={() => onTagToggle(tag.id)}
                className="flex items-center gap-1.5"
                aria-label={`${tag.name} 태그 ${isSelected ? "선택 해제" : "선택"}`}
              >
                <Tag
                  className="w-4 h-4"
                  style={tag.color ? { color: tag.color } : undefined}
                  aria-hidden="true"
                />
                <span className="text-sm font-medium">{tag.name}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ({tag.bookmarkCount})
                </span>
              </button>

              {/* 태그 메뉴 */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`${tag.name} 태그 메뉴`}
                  >
                    <MoreVertical className="w-3 h-3" aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEditTag(tag)}>
                    <Edit className="w-4 h-4 mr-2" aria-hidden="true" />
                    수정
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDeleteTag(tag.id, tag.name)}
                    className="text-red-600 dark:text-red-400"
                  >
                    <Trash2 className="w-4 h-4 mr-2" aria-hidden="true" />
                    삭제
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        })}

        {/* 태그 생성 버튼 */}
        <button
          onClick={() => setIsCreateDialogOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
          aria-label="새 태그 만들기"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span className="text-sm font-medium">태그 추가</span>
        </button>
      </div>

      {/* 태그 생성/수정 다이얼로그 */}
      <TagDialog
        open={isCreateDialogOpen || editingTag !== null}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setEditingTag(null);
          }
        }}
        tag={editingTag}
        onSaved={handleTagSaved}
      />
    </div>
  );
}

