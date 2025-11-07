/**
 * @file bookmark-note-dialog.tsx
 * @description 북마크 노트/메모 다이얼로그 컴포넌트
 *
 * 북마크에 개인 메모를 추가하거나 수정하는 다이얼로그
 *
 * 주요 기능:
 * 1. 북마크 노트 추가/수정
 * 2. 북마크 노트 삭제
 * 3. 노트 저장 및 취소
 *
 * @dependencies
 * - components/ui/dialog.tsx: Dialog 컴포넌트
 * - components/ui/button.tsx: Button 컴포넌트
 * - components/ui/textarea.tsx: Textarea 컴포넌트
 * - actions/bookmarks/update-bookmark-note.ts: updateBookmarkNote
 */

"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { updateBookmarkNote } from "@/actions/bookmarks/update-bookmark-note";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface BookmarkNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookmarkId: string;
  initialNote?: string | null;
  onSuccess?: () => void;
}

export function BookmarkNoteDialog({
  open,
  onOpenChange,
  bookmarkId,
  initialNote,
  onSuccess,
}: BookmarkNoteDialogProps) {
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 다이얼로그가 열릴 때 초기 노트 설정
  useEffect(() => {
    if (open) {
      setNote(initialNote || "");
    }
  }, [open, initialNote]);

  const handleSave = async () => {
    console.group("[BookmarkNoteDialog] 노트 저장 시작");
    setIsLoading(true);

    try {
      const result = await updateBookmarkNote({
        bookmarkId,
        note: note.trim() || null,
      });

      if (result.success) {
        console.log("[BookmarkNoteDialog] 노트 저장 완료");
        toast.success(note.trim() ? "메모가 저장되었습니다" : "메모가 삭제되었습니다");
        onOpenChange(false);
        onSuccess?.();
      } else {
        console.error("[BookmarkNoteDialog] 노트 저장 실패:", result.error);
        toast.error(result.error || "메모 저장에 실패했습니다");
      }
    } catch (error) {
      console.error("[BookmarkNoteDialog] 노트 저장 오류:", error);
      toast.error("메모 저장 중 오류가 발생했습니다");
    } finally {
      setIsLoading(false);
      console.groupEnd();
    }
  };

  const handleDelete = async () => {
    console.group("[BookmarkNoteDialog] 노트 삭제 시작");
    setIsLoading(true);

    try {
      const result = await updateBookmarkNote({
        bookmarkId,
        note: null,
      });

      if (result.success) {
        console.log("[BookmarkNoteDialog] 노트 삭제 완료");
        toast.success("메모가 삭제되었습니다");
        setNote("");
        onOpenChange(false);
        onSuccess?.();
      } else {
        console.error("[BookmarkNoteDialog] 노트 삭제 실패:", result.error);
        toast.error(result.error || "메모 삭제에 실패했습니다");
      }
    } catch (error) {
      console.error("[BookmarkNoteDialog] 노트 삭제 오류:", error);
      toast.error("메모 삭제 중 오류가 발생했습니다");
    } finally {
      setIsLoading(false);
      console.groupEnd();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>북마크 메모</DialogTitle>
          <DialogDescription>
            이 여행지에 대한 개인 메모를 추가하거나 수정할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="note">메모</Label>
            <Textarea
              id="note"
              placeholder="이 여행지에 대한 메모를 입력하세요..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={6}
              className="resize-none"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {note.length}자 / 1000자
            </p>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading || !initialNote}
            className="mr-auto"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            삭제
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              취소
            </Button>
            <Button type="button" onClick={handleSave} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              저장
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

