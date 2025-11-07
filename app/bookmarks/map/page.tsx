/**
 * @file page.tsx
 * @description 북마크 지도 보기 페이지
 *
 * 북마크한 여행지를 지도에 표시하는 페이지
 *
 * 주요 기능:
 * 1. 북마크한 여행지 지도 표시
 * 2. 폴더/태그별 필터링
 * 3. 마커 색상 구분
 * 4. 일정 경로 표시 (선택적)
 *
 * @dependencies
 * - components/bookmarks/bookmark-map.tsx: BookmarkMap
 * - actions/bookmarks/get-bookmarks.ts: getBookmarks
 */

import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { BookmarkMapContent } from "@/components/bookmarks/bookmark-map-content";
import { CardSkeleton } from "@/components/loading/card-skeleton";

export const metadata = {
  title: "북마크 지도 | Pitch Travel",
  description: "북마크한 여행지를 지도에서 확인하세요",
};

export default async function BookmarkMapPage() {
  console.group("[BookmarkMapPage] 페이지 로드 시작");

  // 인증 확인
  const { userId } = await auth();
  if (!userId) {
    console.warn("[BookmarkMapPage] 인증되지 않은 사용자, 로그인 페이지로 리다이렉트");
    redirect("/sign-in");
  }

  console.log("[BookmarkMapPage] 인증된 사용자:", userId);
  console.groupEnd();

  return (
    <main className="min-h-[calc(100vh-80px)] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            북마크 지도
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            북마크한 여행지를 지도에서 한눈에 확인하세요
          </p>
        </div>

        {/* 지도 컨텐츠 */}
        <Suspense
          fallback={
            <div className="h-[600px] bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          }
        >
          <BookmarkMapContent />
        </Suspense>
      </div>
    </main>
  );
}

