/**
 * @file page.tsx
 * @description 북마크 목록 페이지
 *
 * 사용자가 북마크한 여행지 목록을 표시하는 페이지
 *
 * 주요 기능:
 * 1. 북마크한 여행지 목록 표시
 * 2. 정렬 및 필터링
 * 3. 빈 상태 처리
 * 4. 로딩 상태 처리
 * 5. 에러 처리
 *
 * @dependencies
 * - actions/bookmarks/get-bookmarks.ts: getBookmarks Server Action
 * - components/travel-card.tsx: TravelCard 컴포넌트
 * - components/loading/card-skeleton.tsx: CardSkeleton 컴포넌트
 */

import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { BookmarkListContent } from "@/components/bookmarks/bookmark-list-content";
import { CardSkeleton } from "@/components/loading/card-skeleton";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "북마크 | Pitch Travel",
  description: "북마크한 여행지 목록을 확인하세요",
};

export default async function BookmarksPage() {
  console.group("[BookmarksPage] 페이지 로드 시작");

  // 인증 확인
  const { userId } = await auth();
  if (!userId) {
    console.warn("[BookmarksPage] 인증되지 않은 사용자, 로그인 페이지로 리다이렉트");
    redirect("/sign-in");
  }

  console.log("[BookmarksPage] 인증된 사용자:", userId);
  console.groupEnd();

  return (
    <main className="min-h-[calc(100vh-80px)] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            북마크한 여행지
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            저장한 여행지를 한눈에 확인하고 관리하세요
          </p>
        </div>

        {/* 액션 버튼 */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              asChild
              variant="outline"
              className="flex items-center gap-2"
            >
              <a href="/bookmarks/map">
                <MapPin className="w-4 h-4" />
                지도 보기
              </a>
            </Button>
          </div>
        </div>

        {/* 북마크 목록 */}
        <Suspense
          fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          }
        >
          <BookmarkListContent />
        </Suspense>
      </div>
    </main>
  );
}

