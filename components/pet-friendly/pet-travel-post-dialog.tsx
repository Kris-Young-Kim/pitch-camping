/**
 * @file pet-travel-post-dialog.tsx
 * @description 반려동물 동반 여행 커뮤니티 게시글 작성 다이얼로그
 */

"use client";

import { useState, useTransition } from "react";
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
import { createPetTravelPost } from "@/actions/pet-friendly/community/create-pet-travel-post";
import { toast } from "sonner";
import type { PetTravelPostType } from "@/actions/pet-friendly/community/get-pet-travel-posts";

interface PetTravelPostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postType: PetTravelPostType;
  travelContentId?: string;
  onSuccess?: () => void;
}

export function PetTravelPostDialog({
  open,
  onOpenChange,
  postType,
  travelContentId,
  onSuccess,
}: PetTravelPostDialogProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [isPending, startTransition] = useTransition();

  const getPostTypeLabel = () => {
    switch (postType) {
      case "review":
        return "후기";
      case "tip":
        return "팁";
      case "checklist":
        return "체크리스트";
    }
  };

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) {
      toast.error("제목과 내용을 입력해주세요.");
      return;
    }

    startTransition(async () => {
      console.group("[PetTravelPostDialog] 게시글 작성 요청");
      const tagArray = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      const result = await createPetTravelPost({
        postType,
        title: title.trim(),
        content: content.trim(),
        travelContentId,
        tags: tagArray,
        isPublished: true,
      });

      if (!result.success) {
        console.error("[PetTravelPostDialog] 게시글 작성 실패", result.error);
        toast.error(result.error || "게시글 작성에 실패했습니다.");
        console.groupEnd();
        return;
      }

      toast.success("게시글이 작성되었습니다.");
      setTitle("");
      setContent("");
      setTags("");
      console.groupEnd();
      onSuccess?.();
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{getPostTypeLabel()} 작성</DialogTitle>
          <DialogDescription>
            반려동물 동반 여행 경험을 공유해주세요.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="post-title">제목</Label>
            <Input
              id="post-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`${getPostTypeLabel()} 제목을 입력하세요`}
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="post-content">내용</Label>
            <Textarea
              id="post-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`${getPostTypeLabel()} 내용을 입력하세요`}
              rows={8}
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="post-tags">태그 (쉼표로 구분)</Label>
            <Input
              id="post-tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="예: 강아지, 펜션, 제주도"
              disabled={isPending}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              태그를 쉼표로 구분하여 입력하세요.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "작성 중..." : "작성하기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

