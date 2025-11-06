/**
 * @file feedback-form.tsx
 * @description 피드백 폼 컴포넌트
 *
 * 사용자 피드백을 제출하는 폼 컴포넌트
 *
 * 주요 기능:
 * 1. 피드백 유형 선택 (버그, 기능 제안, 개선사항, 기타)
 * 2. 제목 및 상세 설명 입력
 * 3. 연락처 이메일 입력 (선택 사항)
 * 4. 현재 페이지 URL 자동 포함
 *
 * @dependencies
 * - actions/submit-feedback.ts: submitFeedback Server Action
 * - components/ui/form.tsx: Form 컴포넌트
 * - components/ui/input.tsx: Input 컴포넌트
 * - components/ui/textarea.tsx: Textarea 컴포넌트
 * - components/ui/select.tsx: Select 컴포넌트
 * - react-hook-form: 폼 관리
 * - zod: 유효성 검사
 */

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import { submitFeedback } from "@/actions/submit-feedback";

const feedbackSchema = z.object({
  type: z.enum(["bug", "feature", "improvement", "other"]),
  title: z.string().min(1, "제목을 입력해주세요").max(200, "제목은 200자 이하여야 합니다"),
  description: z.string().min(10, "설명을 10자 이상 입력해주세요").max(2000, "설명은 2000자 이하여야 합니다"),
  contactEmail: z.string().email("올바른 이메일 주소를 입력해주세요").optional().or(z.literal("")),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

interface FeedbackFormProps {
  defaultType?: "bug" | "feature" | "improvement" | "other";
  defaultPageUrl?: string;
}

export function FeedbackForm({ defaultType, defaultPageUrl }: FeedbackFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      type: defaultType || "improvement",
      title: "",
      description: "",
      contactEmail: "",
    },
  });

  const selectedType = watch("type");

  const onSubmit = async (data: FeedbackFormData) => {
    console.group("[FeedbackForm] 피드백 제출");
    console.log("피드백 데이터:", data);

    setIsSubmitting(true);

    try {
      const pageUrl = defaultPageUrl || (typeof window !== "undefined" ? window.location.href : "");
      const userAgent = typeof window !== "undefined" ? window.navigator.userAgent : "";

      const result = await submitFeedback({
        type: data.type,
        title: data.title,
        description: data.description,
        contactEmail: data.contactEmail || undefined,
        pageUrl: pageUrl || undefined,
        userAgent: userAgent || undefined,
      });

      if (result.success) {
        console.log("[FeedbackForm] 피드백 제출 성공");
        toast.success("피드백이 제출되었습니다", {
          description: "소중한 의견 감사합니다. 검토 후 반영하겠습니다.",
        });
        reset(); // 폼 초기화
      } else {
        throw new Error(result.error || "피드백 제출에 실패했습니다");
      }
    } catch (error) {
      console.error("[FeedbackForm] 피드백 제출 오류:", error);
      toast.error("피드백 제출 실패", {
        description: error instanceof Error ? error.message : "다시 시도해주세요.",
      });
    } finally {
      setIsSubmitting(false);
      console.groupEnd();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          피드백 제출
        </CardTitle>
        <CardDescription>
          버그 리포트, 기능 제안, 개선사항 등을 알려주세요. 소중한 의견이 서비스 개선에 도움이 됩니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* 피드백 유형 */}
          <div className="space-y-2">
            <Label htmlFor="feedback-type">피드백 유형 *</Label>
            <Select
              value={selectedType}
              onValueChange={(value) => setValue("type", value as FeedbackFormData["type"])}
            >
              <SelectTrigger id="feedback-type" aria-label="피드백 유형 선택">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bug">버그 리포트</SelectItem>
                <SelectItem value="feature">기능 제안</SelectItem>
                <SelectItem value="improvement">개선사항</SelectItem>
                <SelectItem value="other">기타</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-red-500" role="alert">
                {errors.type.message}
              </p>
            )}
          </div>

          {/* 제목 */}
          <div className="space-y-2">
            <Label htmlFor="feedback-title">제목 *</Label>
            <Input
              id="feedback-title"
              {...register("title")}
              placeholder="피드백 제목을 입력하세요"
              aria-label="피드백 제목"
              aria-describedby={errors.title ? "title-error" : undefined}
              aria-invalid={!!errors.title}
              className="focus:ring-2 focus:ring-primary focus:ring-offset-2"
            />
            {errors.title && (
              <p id="title-error" className="text-sm text-red-500" role="alert">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* 상세 설명 */}
          <div className="space-y-2">
            <Label htmlFor="feedback-description">상세 설명 *</Label>
            <Textarea
              id="feedback-description"
              {...register("description")}
              placeholder="피드백 내용을 자세히 입력해주세요 (최소 10자)"
              rows={6}
              aria-label="피드백 상세 설명"
              aria-describedby={errors.description ? "description-error" : undefined}
              aria-invalid={!!errors.description}
              className="focus:ring-2 focus:ring-primary focus:ring-offset-2"
            />
            {errors.description && (
              <p id="description-error" className="text-sm text-red-500" role="alert">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* 연락처 이메일 (선택 사항) */}
          <div className="space-y-2">
            <Label htmlFor="feedback-email">연락처 이메일 (선택 사항)</Label>
            <Input
              id="feedback-email"
              type="email"
              {...register("contactEmail")}
              placeholder="답변을 받을 이메일 주소 (선택 사항)"
              aria-label="연락처 이메일"
              aria-describedby={errors.contactEmail ? "email-error" : undefined}
              aria-invalid={!!errors.contactEmail}
              className="focus:ring-2 focus:ring-primary focus:ring-offset-2"
            />
            {errors.contactEmail && (
              <p id="email-error" className="text-sm text-red-500" role="alert">
                {errors.contactEmail.message}
              </p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400">
              피드백 처리 상태를 이메일로 알려드립니다 (선택 사항)
            </p>
          </div>

          {/* 제출 버튼 */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label="피드백 제출"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                제출 중...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" aria-hidden="true" />
                피드백 제출
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

