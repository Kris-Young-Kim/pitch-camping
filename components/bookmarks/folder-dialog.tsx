/**
 * @file folder-dialog.tsx
 * @description 북마크 폴더 생성/수정 다이얼로그 컴포넌트
 *
 * 북마크 폴더를 생성하거나 수정하는 다이얼로그 컴포넌트
 *
 * 주요 기능:
 * 1. 폴더 생성
 * 2. 폴더 수정
 * 3. 폴더명, 설명, 색상, 아이콘 설정
 *
 * @dependencies
 * - actions/bookmarks/folders/create-folder.ts: createBookmarkFolder
 * - actions/bookmarks/folders/update-folder.ts: updateBookmarkFolder
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createBookmarkFolder, type CreateFolderInput } from "@/actions/bookmarks/folders/create-folder";
import { updateBookmarkFolder, type UpdateFolderInput } from "@/actions/bookmarks/folders/update-folder";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { BookmarkFolder } from "@/actions/bookmarks/folders/get-folders";

const folderSchema = z.object({
  name: z.string().min(1, "폴더명은 필수입니다.").max(50, "폴더명은 50자 이하여야 합니다."),
  description: z.string().max(200, "설명은 200자 이하여야 합니다.").optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "올바른 색상 코드를 입력하세요 (예: #3B82F6)").optional().or(z.literal("")),
  icon: z.string().max(50, "아이콘 이름은 50자 이하여야 합니다.").optional(),
});

type FolderFormValues = z.infer<typeof folderSchema>;

interface FolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folder?: BookmarkFolder | null;
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

export function FolderDialog({
  open,
  onOpenChange,
  folder,
  onSaved,
}: FolderDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FolderFormValues>({
    resolver: zodResolver(folderSchema),
    defaultValues: {
      name: "",
      description: "",
      color: "",
      icon: "",
    },
  });

  // 폴더 수정 모드일 때 폼 초기화
  useEffect(() => {
    if (folder) {
      form.reset({
        name: folder.name,
        description: folder.description || "",
        color: folder.color || "",
        icon: folder.icon || "",
      });
    } else {
      form.reset({
        name: "",
        description: "",
        color: "",
        icon: "",
      });
    }
  }, [folder, form, open]);

  const onSubmit = async (values: FolderFormValues) => {
    console.group(`[FolderDialog] 폴더 ${folder ? "수정" : "생성"} 시작`);
    setIsSubmitting(true);

    try {
      if (folder) {
        // 폴더 수정
        const input: UpdateFolderInput = {
          folderId: folder.id,
          name: values.name,
          description: values.description || undefined,
          color: values.color || undefined,
          icon: values.icon || undefined,
        };

        const result = await updateBookmarkFolder(input);
        if (result.success) {
          console.log("[FolderDialog] 폴더 수정 완료");
          toast.success("폴더가 수정되었습니다.");
          onSaved?.();
          onOpenChange(false);
        } else {
          console.error("[FolderDialog] 폴더 수정 실패:", result.error);
          toast.error(result.error || "폴더 수정에 실패했습니다.");
        }
      } else {
        // 폴더 생성
        const input: CreateFolderInput = {
          name: values.name,
          description: values.description || undefined,
          color: values.color || undefined,
          icon: values.icon || undefined,
        };

        const result = await createBookmarkFolder(input);
        if (result.success) {
          console.log("[FolderDialog] 폴더 생성 완료");
          toast.success("폴더가 생성되었습니다.");
          onSaved?.();
          onOpenChange(false);
          form.reset();
        } else {
          console.error("[FolderDialog] 폴더 생성 실패:", result.error);
          toast.error(result.error || "폴더 생성에 실패했습니다.");
        }
      }
    } catch (error) {
      console.error("[FolderDialog] 폴더 저장 오류:", error);
      toast.error("폴더 저장 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
      console.groupEnd();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{folder ? "폴더 수정" : "새 폴더 만들기"}</DialogTitle>
          <DialogDescription>
            북마크를 분류하기 위한 폴더를 {folder ? "수정" : "생성"}합니다.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* 폴더명 */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>폴더명 *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="예: 가을 여행, 부산 여행, 맛집"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 설명 */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>설명</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="폴더에 대한 설명을 입력하세요 (선택 사항)"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
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
                    폴더 아이콘의 색상을 선택하거나 직접 입력하세요.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 아이콘 */}
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>아이콘</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="예: folder, star, heart (선택 사항)"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    폴더 아이콘 이름을 입력하세요 (lucide-react 아이콘 이름).
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
                {isSubmitting ? "저장 중..." : folder ? "수정" : "생성"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

