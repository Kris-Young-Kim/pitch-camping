/**
 * @file tag-dialog.tsx
 * @description 북마크 태그 생성/수정 다이얼로그 컴포넌트
 *
 * 북마크 태그를 생성하거나 수정하는 다이얼로그 컴포넌트
 *
 * 주요 기능:
 * 1. 태그 생성
 * 2. 태그 수정
 * 3. 태그명, 색상 설정
 *
 * @dependencies
 * - actions/bookmarks/tags/create-tag.ts: createBookmarkTag
 * - components/ui/dialog.tsx: Dialog 컴포넌트
 * - react-hook-form: 폼 관리
 * - zod: 유효성 검사
 */

"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { createBookmarkTag, type CreateTagInput } from "@/actions/bookmarks/tags/create-tag";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { BookmarkTag } from "@/actions/bookmarks/tags/get-tags";
import { TagAutocomplete } from "@/components/bookmarks/tag-autocomplete";

const tagSchema = z.object({
  name: z.string().min(1, "태그명은 필수입니다.").max(30, "태그명은 30자 이하여야 합니다."),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "올바른 색상 코드를 입력하세요 (예: #3B82F6)").optional().or(z.literal("")),
});

type TagFormValues = z.infer<typeof tagSchema>;

interface TagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tag?: BookmarkTag | null;
  onSaved?: () => void;
}

const DEFAULT_COLORS = [
  "#3B82F6", // blue
  "#EF4444", // red
  "#10B981", // green
  "#F59E0B", // yellow
  "#8B5CF6", // purple
  "#EC4899", // pink
  "#06B6D4", // cyan
  "#F97316", // orange
];

export function TagDialog({
  open,
  onOpenChange,
  tag,
  onSaved,
}: TagDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TagFormValues>({
    resolver: zodResolver(tagSchema),
    defaultValues: {
      name: "",
      color: "",
    },
  });

  // 태그 수정 모드일 때 폼 초기화
  useEffect(() => {
    if (tag) {
      form.reset({
        name: tag.name,
        color: tag.color || "",
      });
    } else {
      form.reset({
        name: "",
        color: "",
      });
    }
  }, [tag, form, open]);

  const onSubmit = async (values: TagFormValues) => {
    console.group(`[TagDialog] 태그 ${tag ? "수정" : "생성"} 시작`);
    setIsSubmitting(true);

    try {
      // 태그 생성만 지원 (수정은 추후 구현 가능)
      const input: CreateTagInput = {
        name: values.name,
        color: values.color || undefined,
      };

      const result = await createBookmarkTag(input);
      if (result.success) {
        console.log("[TagDialog] 태그 생성 완료");
        toast.success("태그가 생성되었습니다.");
        onSaved?.();
        onOpenChange(false);
        form.reset();
      } else {
        console.error("[TagDialog] 태그 생성 실패:", result.error);
        toast.error(result.error || "태그 생성에 실패했습니다.");
      }
    } catch (error) {
      console.error("[TagDialog] 태그 저장 오류:", error);
      toast.error("태그 저장 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
      console.groupEnd();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{tag ? "태그 수정" : "새 태그 만들기"}</DialogTitle>
          <DialogDescription>
            북마크를 분류하기 위한 태그를 {tag ? "수정" : "생성"}합니다.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* 태그명 (자동완성) */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>태그명 *</FormLabel>
                  <FormControl>
                    <TagAutocomplete
                      value={field.value}
                      onChange={(value) => {
                        field.onChange(value);
                      }}
                      onSelect={(selectedTag) => {
                        // 기존 태그를 선택한 경우 색상도 자동으로 설정
                        if (selectedTag && selectedTag.color) {
                          form.setValue("color", selectedTag.color);
                        }
                      }}
                      placeholder="예: 가을여행, 맛집, 부산"
                      excludeTagIds={tag ? [tag.id] : []}
                    />
                  </FormControl>
                  <FormDescription>
                    태그명을 입력하면 기존 태그가 자동완성됩니다.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 색상 */}
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>색상</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <div className="flex gap-2 flex-wrap">
                        {DEFAULT_COLORS.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => field.onChange(color)}
                            className={cn(
                              "w-10 h-10 rounded-full border-2 transition-all",
                              field.value === color
                                ? "border-gray-900 dark:border-gray-100 scale-110"
                                : "border-gray-300 dark:border-gray-600 hover:scale-105"
                            )}
                            style={{ backgroundColor: color }}
                            aria-label={`색상 선택: ${color}`}
                          />
                        ))}
                      </div>
                      <Input
                        placeholder="#3B82F6"
                        {...field}
                        className="font-mono"
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    태그 아이콘의 색상을 선택하거나 직접 입력하세요.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                취소
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "저장 중..." : tag ? "수정" : "생성"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

