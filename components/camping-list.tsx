/**
 * @file camping-list.tsx
 * @description 캠핑장 목록 컴포넌트
 *
 * 고캠핑 API를 호출하여 캠핑장 목록을 표시하는 컴포넌트
 *
 * 주요 기능:
 * 1. 필터 기반 캠핑장 목록 조회
 * 2. 그리드 레이아웃 (반응형)
 * 3. 로딩 상태 표시 (Skeleton UI)
 * 4. 에러 처리
 * 5. 빈 결과 처리
 * 6. 페이지네이션
 *
 * @dependencies
 * - types/camping.ts: CampingSite, CampingFilter 타입
 * - lib/api/camping-api.ts: campingApi 클라이언트
 * - components/camping-card.tsx: CampingCard 컴포넌트
 */

"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { CampingCard } from "@/components/camping-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import type { CampingSite, CampingFilter } from "@/types/camping";
import { campingApi, CampingApiClient } from "@/lib/api/camping-api";
import { PAGINATION_DEFAULTS } from "@/constants/camping";

interface CampingListProps {
  filter?: CampingFilter;
  onCampingClick?: (camping: CampingSite) => void;
  selectedCampingId?: string;
  onCampingsChange?: (campings: CampingSite[]) => void;
}

export function CampingList({ filter, onCampingClick, selectedCampingId, onCampingsChange }: CampingListProps) {
  const searchParams = useSearchParams();
  const [campings, setCampings] = useState<CampingSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(
    parseInt(searchParams.get("page") || "1", 10)
  );
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchCampings = async () => {
      console.group("[CampingList] 캠핑장 목록 조회 시작");
      console.log("필터:", filter);
      console.log("페이지:", page);

      setLoading(true);
      setError(null);

      try {
        const filterWithPage: CampingFilter = {
          ...filter,
          pageNo: page,
          numOfRows: PAGINATION_DEFAULTS.PAGE_SIZE,
        };

        console.log("[CampingList] API 호출 시작");
        const response = await campingApi.getCampingList(filterWithPage);

        console.log("[CampingList] API 응답:", response);

        // 응답 데이터 정규화
        const items = CampingApiClient.normalizeItems(
          response.response?.body?.items?.item
        );

        console.log("[CampingList] 정규화된 데이터:", {
          count: items.length,
          totalCount: response.response?.body?.totalCount,
        });

        setCampings(items);
        setTotalCount(response.response?.body?.totalCount || 0);
        
        // 상위 컴포넌트로 캠핑장 목록 전달
        onCampingsChange?.(items);
      } catch (err) {
        console.error("[CampingList] API 호출 오류:", err);
        setError(
          err instanceof Error ? err.message : "캠핑장 목록을 불러오는데 실패했습니다."
        );
        setCampings([]);
      } finally {
        setLoading(false);
        console.groupEnd();
      }
    };

    fetchCampings();
  }, [filter, page]);

  // 페이지 변경 핸들러
  const handlePageChange = (newPage: number) => {
    console.log("[CampingList] 페이지 변경:", newPage);
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 재시도 핸들러
  const handleRetry = () => {
    console.log("[CampingList] 재시도");
    setError(null);
    setPage(1);
  };

  // 총 페이지 수 계산
  const totalPages = Math.ceil(totalCount / PAGINATION_DEFAULTS.PAGE_SIZE);

  // 로딩 상태
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          오류가 발생했습니다
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center">
          {error}
        </p>
        <Button onClick={handleRetry} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          다시 시도
        </Button>
      </div>
    );
  }

  // 빈 결과 상태
  if (campings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          캠핑장을 찾을 수 없습니다
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
          검색 조건을 변경해보세요.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 결과 개수 표시 */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        총 {totalCount.toLocaleString()}개의 캠핑장이 있습니다
      </div>

      {/* 캠핑장 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campings.map((camping) => (
          <CampingCard 
            key={camping.contentId} 
            camping={camping}
            onCardClick={onCampingClick}
          />
        ))}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
          >
            이전
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
          >
            다음
          </Button>
        </div>
      )}
    </div>
  );
}

