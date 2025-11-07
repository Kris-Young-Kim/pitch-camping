/**
 * @file add-item-dialog.tsx
 * @description 여행 일정에 여행지 추가 다이얼로그 컴포넌트
 *
 * 북마크한 여행지를 일정에 추가하는 다이얼로그
 *
 * 주요 기능:
 * 1. 북마크한 여행지 목록 표시
 * 2. 일차 선택
 * 3. 방문 날짜/시간 설정
 * 4. 메모 추가
 *
 * @dependencies
 * - actions/bookmarks/get-bookmarks.ts: getBookmarks
 * - actions/travel-plans/add-item.ts: addPlanItem
 * - components/ui/dialog.tsx: Dialog 컴포넌트
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getBookmarks } from "@/actions/bookmarks/get-bookmarks";
import { addPlanItem } from "@/actions/travel-plans/add-item";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { BookmarkWithTravel } from "@/actions/bookmarks/get-bookmarks";

interface AddPlanItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId: string;
  onSuccess?: () => void;
}

export function AddPlanItemDialog({
  open,
  onOpenChange,
  planId,
  onSuccess,
}: AddPlanItemDialogProps) {
  const [bookmarks, setBookmarks] = useState<BookmarkWithTravel[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedContentId, setSelectedContentId] = useState("");
  const [dayNumber, setDayNumber] = useState(1);
  const [visitDate, setVisitDate] = useState("");
  const [visitTime, setVisitTime] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // 북마크 목록 조회
  useEffect(() => {
    if (open) {
      async function fetchBookmarks() {
        setLoading(true);
        try {
          const data = await getBookmarks();
          setBookmarks(data);
        } catch (error) {
          console.error("[AddPlanItemDialog] 북마크 목록 조회 실패:", error);
          toast.error("북마크 목록을 불러오는데 실패했습니다");
        } finally {
          setLoading(false);
        }
      }
      fetchBookmarks();
    }
  }, [open]);

  const handleAdd = async () => {
    if (!selectedContentId) {
      toast.error("여행지를 선택해주세요");
      return;
    }

    if (dayNumber < 1) {
      toast.error("일차는 1 이상이어야 합니다");
      return;
    }

    setIsSaving(true);
    try {
      const result = await addPlanItem({
        planId,
        contentId: selectedContentId,
        dayNumber,
        visitDate: visitDate || undefined,
        visitTime: visitTime || undefined,
        notes: notes.trim() || undefined,
      });

      if (result.success) {
        toast.success("여행지가 추가되었습니다");
        onOpenChange(false);
        // 폼 초기화
        setSelectedContentId("");
        setDayNumber(1);
        setVisitDate("");
        setVisitTime("");
        setNotes("");
        onSuccess?.();
      } else {
        toast.error(result.error || "여행지 추가에 실패했습니다");
      }
    } catch (error) {
      console.error("[AddPlanItemDialog] 여행지 추가 오류:", error);
      toast.error("여행지 추가 중 오류가 발생했습니다");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>여행지 추가</DialogTitle>
          <DialogDescription>
            북마크한 여행지를 일정에 추가하세요.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="bookmark">여행지 *</Label>
            {loading ? (
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            ) : (
              <Select
                value={selectedContentId}
                onValueChange={setSelectedContentId}
                disabled={isSaving}
              >
                <SelectTrigger id="bookmark">
                  <SelectValue placeholder="여행지를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {bookmarks.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      북마크한 여행지가 없습니다
                    </div>
                  ) : (
                    bookmarks.map((bookmark) => (
                      <SelectItem key={bookmark.bookmarkId} value={bookmark.contentid}>
                        {bookmark.title}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dayNumber">일차 *</Label>
              <Input
                id="dayNumber"
                type="number"
                min="1"
                value={dayNumber}
                onChange={(e) => setDayNumber(Number(e.target.value))}
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="visitDate">방문일</Label>
              <Input
                id="visitDate"
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                disabled={isSaving}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="visitTime">방문 시간</Label>
            <Input
              id="visitTime"
              type="time"
              value={visitTime}
              onChange={(e) => setVisitTime(e.target.value)}
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">메모</Label>
            <Textarea
              id="notes"
              placeholder="이 여행지에 대한 메모를 입력하세요..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              disabled={isSaving}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            취소
          </Button>
          <Button
            type="button"
            onClick={handleAdd}
            disabled={isSaving || !selectedContentId || dayNumber < 1}
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            추가
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

