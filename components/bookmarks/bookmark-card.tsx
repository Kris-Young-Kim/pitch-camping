/**
 * @file bookmark-card.tsx
 * @description 북마크 카드 컴포넌트
 *
 * 북마크 목록에서 사용되는 카드 컴포넌트
 * TravelCard를 확장하여 북마크 전용 기능 추가 (노트, 메모 등)
 *
 * 주요 기능:
 * 1. 여행지 정보 표시 (TravelCard 재사용)
 * 2. 북마크 노트 표시 및 편집
 * 3. 북마크 태그 표시
 * 4. 북마크 메모 아이콘 표시
 *
 * @dependencies
 * - components/travel-card.tsx: TravelCard 컴포넌트
 * - components/bookmarks/bookmark-note-dialog.tsx: BookmarkNoteDialog
 * - types/travel.ts: TravelSite 타입
 */

"use client";

import { useState } from "react";
import { TravelCard } from "@/components/travel-card";
import { BookmarkNoteDialog } from "@/components/bookmarks/bookmark-note-dialog";
import { Button } from "@/components/ui/button";
import { FileText, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BookmarkWithTravel } from "@/actions/bookmarks/get-bookmarks";

interface BookmarkCardProps {
  bookmark: BookmarkWithTravel;
  onUpdate?: () => void;
}

export function BookmarkCard({ bookmark, onUpdate }: BookmarkCardProps) {
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);

  const hasNote = !!bookmark.note;

  return (
    <>
      <div className="relative group">
        {/* 여행지 카드 */}
        <TravelCard travel={bookmark} />

        {/* 북마크 전용 기능 오버레이 */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* 메모 버튼 */}
          <Button
            size="sm"
            variant="secondary"
            className={cn(
              "h-8 w-8 p-0 rounded-full shadow-lg",
              hasNote && "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
            )}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setNoteDialogOpen(true);
            }}
            aria-label={hasNote ? "메모 수정" : "메모 추가"}
            title={hasNote ? "메모 수정" : "메모 추가"}
          >
            {hasNote ? (
              <FileText className="h-4 w-4 fill-current" />
            ) : (
              <Pencil className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* 메모 미리보기 (메모가 있는 경우) */}
        {hasNote && (
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 via-black/60 to-transparent rounded-b-xl">
            <p className="text-xs text-white line-clamp-2">{bookmark.note}</p>
          </div>
        )}
      </div>

      {/* 메모 다이얼로그 */}
      <BookmarkNoteDialog
        open={noteDialogOpen}
        onOpenChange={setNoteDialogOpen}
        bookmarkId={bookmark.bookmarkId}
        initialNote={bookmark.note || null}
        onSuccess={onUpdate}
      />
    </>
  );
}

