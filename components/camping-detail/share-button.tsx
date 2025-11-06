/**
 * @file share-button.tsx
 * @description URL 공유 버튼 컴포넌트
 *
 * 캠핑장 상세페이지 URL을 클립보드에 복사하는 기능
 *
 * 주요 기능:
 * 1. URL 복사 (클립보드 API)
 * 2. 복사 완료 알림 (Sonner Toast)
 *
 * @dependencies
 * - components/ui/button.tsx: Button 컴포넌트
 * - sonner: Toast 알림 라이브러리
 * - lucide-react: Share2, Check 아이콘
 */

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Share2, Check } from "lucide-react";

interface ShareButtonProps {
  contentId: string;
  className?: string;
}

export function ShareButton({ contentId, className }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    console.group("[ShareButton] URL 공유 시작");

    // 현재 페이지 URL 생성
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/campings/${contentId}`
        : `/campings/${contentId}`;

    console.log("URL:", url);

    try {
      // 클립보드에 복사
      await navigator.clipboard.writeText(url);

      console.log("[ShareButton] 클립보드 복사 성공");
      setCopied(true);

      // Toast 알림 표시
      toast.success("링크가 복사되었습니다", {
        description: "공유할 수 있습니다",
      });

      // 2초 후 복사 상태 해제
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error("[ShareButton] 클립보드 복사 실패:", err);

      // Toast 에러 알림 표시
      toast.error("복사 실패", {
        description: "링크를 수동으로 복사해주세요",
      });

      // 폴백: prompt 창으로 URL 표시
      prompt("링크를 복사하세요:", url);
    } finally {
      console.groupEnd();
    }
  };

  return (
    <Button
      onClick={handleShare}
      variant="outline"
      size="sm"
      className={className}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 mr-2" />
          복사됨
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4 mr-2" />
          공유하기
        </>
      )}
    </Button>
  );
}
