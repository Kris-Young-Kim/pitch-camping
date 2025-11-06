/**
 * @file bookmark-button.tsx
 * @description 북마크 버튼 컴포넌트
 *
 * 캠핑장을 북마크에 추가/제거하는 기능
 *
 * 주요 기능:
 * 1. 인증된 사용자: Supabase bookmarks 테이블에 저장
 * 2. 비인증 사용자: localStorage에 임시 저장
 * 3. 북마크 상태 표시 (별 아이콘)
 *
 * @dependencies
 * - components/ui/button.tsx: Button 컴포넌트
 * - lib/supabase/clerk-client.ts: useClerkSupabaseClient 훅
 * - @clerk/nextjs: useAuth, useUser 훅
 * - lucide-react: Star 아이콘
 */

"use client";

import { useState, useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";

interface BookmarkButtonProps {
  contentId: string;
  className?: string;
}

const BOOKMARK_STORAGE_KEY = "pitch_camping_bookmarks";

export function BookmarkButton({ contentId, className }: BookmarkButtonProps) {
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const supabase = useClerkSupabaseClient();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 북마크 상태 확인
  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (!authLoaded || !userLoaded) {
        return;
      }

      console.group(`[BookmarkButton] 북마크 상태 확인: ${contentId}`);

      try {
        if (isSignedIn && user) {
          // 인증된 사용자: Supabase에서 확인
          console.log("[BookmarkButton] Supabase에서 북마크 확인");

          // 먼저 Supabase users 테이블에서 현재 사용자 ID 조회
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("id")
            .eq("clerk_id", user.id)
            .single();

          if (userError || !userData) {
            console.error("[BookmarkButton] 사용자 조회 실패:", userError);
            // 폴백: localStorage 확인
            checkLocalStorage();
            return;
          }

          const { data: bookmarkData, error: bookmarkError } = await supabase
            .from("bookmarks")
            .select("id")
            .eq("user_id", userData.id)
            .eq("content_id", contentId)
            .single();

          if (bookmarkError && bookmarkError.code !== "PGRST116") {
            console.error("[BookmarkButton] 북마크 조회 실패:", bookmarkError);
            checkLocalStorage();
            return;
          }

          setIsBookmarked(!!bookmarkData);
          console.log("[BookmarkButton] Supabase 북마크 상태:", !!bookmarkData);
        } else {
          // 비인증 사용자: localStorage 확인
          checkLocalStorage();
        }
      } catch (err) {
        console.error("[BookmarkButton] 북마크 상태 확인 오류:", err);
        checkLocalStorage();
      } finally {
        setIsLoading(false);
        console.groupEnd();
      }
    };

    const checkLocalStorage = () => {
      try {
        const stored = localStorage.getItem(BOOKMARK_STORAGE_KEY);
        if (stored) {
          const bookmarks = JSON.parse(stored);
          setIsBookmarked(bookmarks.includes(contentId));
          console.log("[BookmarkButton] localStorage 북마크 상태:", bookmarks.includes(contentId));
        } else {
          setIsBookmarked(false);
        }
      } catch (err) {
        console.error("[BookmarkButton] localStorage 읽기 오류:", err);
        setIsBookmarked(false);
      }
    };

    checkBookmarkStatus();
  }, [contentId, isSignedIn, authLoaded, userLoaded, user, supabase]);

  // 북마크 토글
  const handleToggle = async () => {
    if (isSaving || isLoading) return;

    console.group(`[BookmarkButton] 북마크 토글: ${contentId}`);
    setIsSaving(true);

    try {
      if (isSignedIn && user) {
        // 인증된 사용자: Supabase에 저장
        console.log("[BookmarkButton] Supabase에 북마크 저장/삭제");

        // 사용자 ID 조회
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id")
          .eq("clerk_id", user.id)
          .single();

        if (userError || !userData) {
          throw new Error("사용자 정보를 찾을 수 없습니다");
        }

        if (isBookmarked) {
          // 북마크 제거
          const { error } = await supabase
            .from("bookmarks")
            .delete()
            .eq("user_id", userData.id)
            .eq("content_id", contentId);

          if (error) throw error;
          console.log("[BookmarkButton] 북마크 제거 완료");
        } else {
          // 북마크 추가
          const { error } = await supabase
            .from("bookmarks")
            .insert({
              user_id: userData.id,
              content_id: contentId,
            });

          if (error) throw error;
          console.log("[BookmarkButton] 북마크 추가 완료");
        }

        setIsBookmarked(!isBookmarked);
      } else {
        // 비인증 사용자: localStorage에 저장
        console.log("[BookmarkButton] localStorage에 북마크 저장/삭제");

        const stored = localStorage.getItem(BOOKMARK_STORAGE_KEY);
        let bookmarks: string[] = stored ? JSON.parse(stored) : [];

        if (isBookmarked) {
          bookmarks = bookmarks.filter((id) => id !== contentId);
        } else {
          bookmarks.push(contentId);
        }

        localStorage.setItem(BOOKMARK_STORAGE_KEY, JSON.stringify(bookmarks));
        setIsBookmarked(!isBookmarked);
        console.log("[BookmarkButton] localStorage 북마크 상태 업데이트 완료");
      }
    } catch (err) {
      console.error("[BookmarkButton] 북마크 토글 오류:", err);
      alert(
        err instanceof Error
          ? err.message
          : "북마크 처리 중 오류가 발생했습니다"
      );
    } finally {
      setIsSaving(false);
      console.groupEnd();
    }
  };

  if (!authLoaded || !userLoaded) {
    return (
      <Button variant="outline" size="sm" disabled className={className}>
        <Star className="w-4 h-4 mr-2" />
        로딩 중...
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggle}
      disabled={isSaving}
      className={className}
    >
      <Star
        className={`w-4 h-4 mr-2 ${isBookmarked ? "fill-yellow-400 text-yellow-400" : ""}`}
      />
      {isBookmarked ? "북마크됨" : "북마크"}
    </Button>
  );
}

