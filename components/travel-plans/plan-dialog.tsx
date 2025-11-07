/**
 * @file plan-dialog.tsx
 * @description 여행 일정 생성/수정 다이얼로그 컴포넌트
 *
 * 여행 일정을 생성하거나 수정하는 다이얼로그
 *
 * 주요 기능:
 * 1. 일정 제목, 설명 입력
 * 2. 여행 날짜 설정
 * 3. 공개 여부 설정
 *
 * @dependencies
 * - components/ui/dialog.tsx: Dialog 컴포넌트
 * - components/ui/button.tsx: Button 컴포넌트
 * - components/ui/input.tsx: Input 컴포넌트
 * - components/ui/textarea.tsx: Textarea 컴포넌트
 * - components/ui/label.tsx: Label 컴포넌트
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

interface PlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (input: {
    title: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    isPublic?: boolean;
  }) => Promise<void>;
  initialData?: {
    title?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    isPublic?: boolean;
  };
}

export function PlanDialog({
  open,
  onOpenChange,
  onSave,
  initialData,
}: PlanDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 다이얼로그가 열릴 때 초기 데이터 설정
  useEffect(() => {
    if (open) {
      setTitle(initialData?.title || "");
      setDescription(initialData?.description || "");
      setStartDate(initialData?.startDate || "");
      setEndDate(initialData?.endDate || "");
      setIsPublic(initialData?.isPublic || false);
    }
  }, [open, initialData]);

  const handleSave = async () => {
    if (!title.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim() || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        isPublic,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>여행 일정 만들기</DialogTitle>
          <DialogDescription>
            새로운 여행 일정을 만들어 북마크한 여행지를 추가하세요.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">제목 *</Label>
            <Input
              id="title"
              placeholder="예: 제주도 3박 4일 여행"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">설명</Label>
            <Textarea
              id="description"
              placeholder="여행 일정에 대한 설명을 입력하세요..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">시작일</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">종료일</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || undefined}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isPublic"
              checked={isPublic}
              onCheckedChange={(checked) => setIsPublic(checked === true)}
              disabled={isLoading}
            />
            <Label
              htmlFor="isPublic"
              className="text-sm font-normal cursor-pointer"
            >
              공개 일정으로 만들기
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            취소
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isLoading || !title.trim()}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            만들기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

