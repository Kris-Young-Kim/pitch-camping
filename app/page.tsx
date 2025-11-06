/**
 * @file page.tsx
 * @description Pitch Camping 홈페이지
 *
 * 캠핑장 목록, 필터, 검색 기능을 통합한 메인 페이지
 *
 * 주요 기능:
 * 1. 필터 컴포넌트 (지역, 타입, 시설, 정렬)
 * 2. 캠핑장 목록 표시
 * 3. URL 쿼리 파라미터 기반 필터 상태 관리
 *
 * @dependencies
 * - components/camping-filters.tsx: CampingFilters 컴포넌트
 * - components/camping-list.tsx: CampingList 컴포넌트
 * - types/camping.ts: CampingFilter 타입
 */

"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { CampingFilters } from "@/components/camping-filters";
import { CampingList } from "@/components/camping-list";
import { CampingSearch } from "@/components/camping-search";
import type { CampingFilter } from "@/types/camping";
import {
  REGIONS,
  CAMPING_TYPES,
  SORT_OPTIONS,
} from "@/constants/camping";

export default function Home() {
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState<CampingFilter>({});

  // URL 쿼리 파라미터로부터 필터 초기화
  useEffect(() => {
    console.group("[Home] 필터 초기화");
    const region = searchParams.get("region");
    const type = searchParams.get("type");
    const facilities = searchParams.get("facilities");
    const keyword = searchParams.get("keyword");
    const sort = searchParams.get("sort");

    const initialFilter: CampingFilter = {};

    if (region && region !== REGIONS.ALL) {
      initialFilter.doNm = region;
    }

    if (type && type !== CAMPING_TYPES.ALL) {
      initialFilter.induty = type;
    }

    if (facilities) {
      initialFilter.sbrsCl = facilities;
    }

    if (keyword) {
      initialFilter.keyword = keyword;
    }

    if (sort) {
      initialFilter.sortOrder = sort as CampingFilter["sortOrder"];
    }

    console.log("초기 필터:", initialFilter);
    setFilter(initialFilter);
    console.groupEnd();
  }, [searchParams]);

  const handleFilterChange = (newFilter: CampingFilter) => {
    console.log("[Home] 필터 변경 콜백:", newFilter);
    setFilter(newFilter);
  };

  return (
    <main className="min-h-[calc(100vh-80px)] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Pitch Camping
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            전국의 캠핑장을 검색하고 확인하세요
          </p>
          
          {/* 검색창 */}
          <div className="max-w-2xl">
            <CampingSearch
              onSearch={(keyword) => {
                console.log("[Home] 검색 실행:", keyword);
                setFilter((prev) => ({
                  ...prev,
                  keyword: keyword || undefined,
                  pageNo: 1,
                }));
              }}
            />
          </div>
        </div>

        {/* 필터 및 목록 레이아웃 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 필터 사이드바 */}
          <aside className="lg:col-span-1">
            <CampingFilters onFilterChange={handleFilterChange} />
          </aside>

          {/* 목록 영역 */}
          <div className="lg:col-span-3">
            <CampingList filter={filter} />
          </div>
        </div>
      </div>
    </main>
  );
}
