/**
 * @file folder-list.tsx
 * @description 북마크 폴더 목록 컴포넌트
 *
 * 사용자가 생성한 북마크 폴더 목록을 표시하고 관리하는 컴포넌트
 *
 * 주요 기능:
 * 1. 폴더 목록 표시
 * 2. 폴더별 북마크 개수 표시
 * 3. 폴더 클릭 시 해당 폴더의 북마크만 필터링
 * 4. 폴더 생성/수정/삭제
 *
 * @dependencies
 * - actions/bookmarks/folders/get-folders.ts: getBookmarkFolders
 * - actions/bookmarks/folders/delete-folder.ts: deleteBookmarkFolder
 * - components/bookmarks/folder-dialog.tsx: FolderDialog
 */

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FolderDialog } from "@/components/bookmarks/folder-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Folder, Plus, MoreVertical, Edit, Trash2, FolderOpen } from "lucide-react";
import { getBookmarkFolders, type BookmarkFolder } from "@/actions/bookmarks/folders/get-folders";
import { deleteBookmarkFolder } from "@/actions/bookmarks/folders/delete-folder";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FolderListProps {
  selectedFolderId: string | null;
  onFolderSelect: (folderId: string | null) => void;
  onFoldersChange?: () => void;
}

export function FolderList({
  selectedFolderId,
  onFolderSelect,
  onFoldersChange,
}: FolderListProps) {
  const [folders, setFolders] = useState<BookmarkFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<BookmarkFolder | null>(null);

  // 폴더 목록 조회
  const fetchFolders = async () => {
    console.group("[FolderList] 폴더 목록 조회 시작");
    setLoading(true);

    try {
      const data = await getBookmarkFolders("created_at");
      console.log("[FolderList] 조회된 폴더 개수:", data.length);
      setFolders(data);
    } catch (error) {
      console.error("[FolderList] 폴더 목록 조회 오류:", error);
      toast.error("폴더 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
      console.groupEnd();
    }
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  // 폴더 삭제
  const handleDeleteFolder = async (folderId: string, folderName: string) => {
    console.group(`[FolderList] 폴더 삭제: ${folderName}`);
    
    if (!confirm(`"${folderName}" 폴더를 삭제하시겠습니까? 폴더 안의 북마크는 폴더에서 제거됩니다.`)) {
      console.log("[FolderList] 폴더 삭제 취소");
      console.groupEnd();
      return;
    }

    try {
      const result = await deleteBookmarkFolder(folderId);
      if (result.success) {
        console.log("[FolderList] 폴더 삭제 완료");
        toast.success("폴더가 삭제되었습니다.");
        await fetchFolders();
        onFoldersChange?.();
        
        // 삭제된 폴더가 선택되어 있으면 "전체"로 변경
        if (selectedFolderId === folderId) {
          onFolderSelect(null);
        }
      } else {
        console.error("[FolderList] 폴더 삭제 실패:", result.error);
        toast.error(result.error || "폴더 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("[FolderList] 폴더 삭제 오류:", error);
      toast.error("폴더 삭제 중 오류가 발생했습니다.");
    } finally {
      console.groupEnd();
    }
  };

  // 폴더 수정 다이얼로그 열기
  const handleEditFolder = (folder: BookmarkFolder) => {
    setEditingFolder(folder);
  };

  // 폴더 생성/수정 완료 후 콜백
  const handleFolderSaved = () => {
    fetchFolders();
    onFoldersChange?.();
    setIsCreateDialogOpen(false);
    setEditingFolder(null);
  };

  if (loading) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-20 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse flex-shrink-0"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 폴더 목록 */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {/* 전체 북마크 버튼 */}
        <button
          onClick={() => onFolderSelect(null)}
          className={cn(
            "flex flex-col items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all flex-shrink-0 min-w-[120px]",
            selectedFolderId === null
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
              : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
          )}
          aria-label="전체 북마크 보기"
        >
          <FolderOpen className="w-5 h-5" aria-hidden="true" />
          <span className="text-sm font-medium">전체</span>
        </button>

        {/* 폴더 목록 */}
        {folders.map((folder) => (
          <div
            key={folder.id}
            className={cn(
              "flex flex-col items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all flex-shrink-0 min-w-[120px] relative group",
              selectedFolderId === folder.id
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
            )}
          >
            <button
              onClick={() => onFolderSelect(folder.id)}
              className="flex flex-col items-center gap-2 w-full"
              aria-label={`${folder.name} 폴더 보기`}
            >
              <Folder
                className="w-5 h-5"
                style={folder.color ? { color: folder.color } : undefined}
                aria-hidden="true"
              />
              <div className="text-center">
                <div className="text-sm font-medium truncate max-w-[100px]">
                  {folder.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {folder.bookmarkCount}개
                </div>
              </div>
            </button>

            {/* 폴더 메뉴 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`${folder.name} 폴더 메뉴`}
                >
                  <MoreVertical className="w-4 h-4" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEditFolder(folder)}>
                  <Edit className="w-4 h-4 mr-2" aria-hidden="true" />
                  수정
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDeleteFolder(folder.id, folder.name)}
                  className="text-red-600 dark:text-red-400"
                >
                  <Trash2 className="w-4 h-4 mr-2" aria-hidden="true" />
                  삭제
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}

        {/* 폴더 생성 버튼 */}
        <button
          onClick={() => setIsCreateDialogOpen(true)}
          className="flex flex-col items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all flex-shrink-0 min-w-[120px]"
          aria-label="새 폴더 만들기"
        >
          <Plus className="w-5 h-5" aria-hidden="true" />
          <span className="text-sm font-medium">새 폴더</span>
        </button>
      </div>

      {/* 폴더 생성/수정 다이얼로그 */}
      <FolderDialog
        open={isCreateDialogOpen || editingFolder !== null}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setEditingFolder(null);
          }
        }}
        folder={editingFolder}
        onSaved={handleFolderSaved}
      />
    </div>
  );
}

