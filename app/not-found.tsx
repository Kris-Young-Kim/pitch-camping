/**
 * @file not-found.tsx
 * @description 404 페이지 컴포넌트
 *
 * 존재하지 않는 페이지를 요청했을 때 표시되는 페이지
 * 접근성을 고려하여 명확한 안내 메시지와 네비게이션 제공
 *
 * @dependencies
 * - components/ui/button.tsx: Button 컴포넌트
 * - lucide-react: MapPin, Home, Search 아이콘
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MapPin, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4" id="main-content">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <MapPin className="w-24 h-24 mx-auto text-gray-400 dark:text-gray-600 mb-4" aria-hidden="true" />
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
            페이지를 찾을 수 없습니다
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
            <br />
            URL을 확인하시거나 홈으로 돌아가시기 바랍니다.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
            <Link href="/" aria-label="홈으로 이동">
              <Home className="w-4 h-4 mr-2" aria-hidden="true" />
              홈으로 가기
            </Link>
          </Button>
          <Button asChild variant="outline" className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
            <Link href="/" aria-label="여행지 검색 페이지로 이동">
              <Search className="w-4 h-4 mr-2" aria-hidden="true" />
              여행지 검색
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

