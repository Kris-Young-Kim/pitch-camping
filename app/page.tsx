/**
 * @file page.tsx
 * @description Pitch Travel 홈페이지
 *
 * 여행지 목록, 필터, 검색, 지도 기능을 통합한 메인 페이지
 *
 * 주요 기능:
 * 1. 필터 컴포넌트 (지역, 타입, 정렬)
 * 2. 여행지 목록 표시
 * 3. 네이버 지도 연동
 * 4. 리스트-지도 상호연동
 * 5. URL 쿼리 파라미터 기반 필터 상태 관리
 *
 * @dependencies
 * - components/travel-filters.tsx: TravelFilters 컴포넌트
 * - components/travel-list.tsx: TravelList 컴포넌트
 * - components/travel-search.tsx: TravelSearch 컴포넌트
 * - components/naver-map.tsx: NaverMap 컴포넌트
 * - types/travel.ts: TravelFilter, TravelSite 타입
 */

"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { TravelFilters } from "@/components/travel-filters";
import { TravelList } from "@/components/travel-list";
import { TravelSearch } from "@/components/travel-search";
import { MapSkeleton } from "@/components/loading/map-skeleton";
import type { TravelFilter, TravelSite } from "@/types/travel";
import { REGIONS, TRAVEL_TYPES, REGION_CODES, TRAVEL_TYPE_CODES } from "@/constants/travel";

// NaverMap 동적 import (SSR 비활성화, 번들 분리)
const NaverMap = dynamic(
  () =>
    import("@/components/naver-map").then((mod) => ({ default: mod.NaverMap })),
  {
    ssr: false,
    loading: () => <MapSkeleton />,
  },
);

function HomeContent() {
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState<TravelFilter>({});
  const [travels, setTravels] = useState<TravelSite[]>([]);
  const [selectedTravelId, setSelectedTravelId] = useState<
    string | undefined
  >();
  const [showPetFriendlyOnly, setShowPetFriendlyOnly] = useState(false);

  // URL 쿼리 파라미터로부터 필터 초기화
  useEffect(() => {
    const region = searchParams.get("region");
    const type = searchParams.get("type");
    const keyword = searchParams.get("keyword");
    const sort = searchParams.get("sort");
    const petFriendly = searchParams.get("petFriendly") === "true";

    const initialFilter: TravelFilter = {};

    if (region && region !== REGIONS.ALL) {
      initialFilter.areaCode = REGION_CODES[region];
    }

    if (type && type !== TRAVEL_TYPES.ALL) {
      initialFilter.contentTypeId = TRAVEL_TYPE_CODES[type as keyof typeof TRAVEL_TYPE_CODES];
    }

    if (keyword) {
      initialFilter.keyword = keyword;
    }

    if (sort) {
      initialFilter.arrange = sort;
    }

    if (petFriendly) {
      initialFilter.petFriendly = true;
      setShowPetFriendlyOnly(true);
    }

    setFilter(initialFilter);
  }, [searchParams]);

  const handleFilterChange = useCallback((newFilter: TravelFilter) => {
    setFilter(newFilter);
    setSelectedTravelId(undefined);
    setShowPetFriendlyOnly(newFilter.petFriendly === true);
  }, []);

  const handleTravelClick = useCallback((travel: TravelSite) => {
    setSelectedTravelId(travel.contentid);
  }, []);

  const handleTravelListUpdate = useCallback((travels: TravelSite[]) => {
    setTravels(travels);
  }, []);

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-16 md:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 space-y-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white tracking-tight leading-relaxed">
              한국의 아름다운
              <br className="mb-2" />
              <span className="text-blue-600 dark:text-blue-400">
                여행지를 탐험하세요
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              전국 여행지 정보를 한눈에 확인하고, 나만의 여행을
              계획해보세요
            </p>

            {/* 검색창 - Hero 스타일 */}
            <div className="max-w-3xl mx-auto mt-8">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-2 border border-gray-200 dark:border-gray-700">
                <TravelSearch
                  onSearch={(keyword) => {
                    setFilter((prev) => ({
                      ...prev,
                      keyword: keyword || undefined,
                      pageNo: 1,
                    }));
                  }}
                  placeholder="지역, 여행지명으로 검색해보세요..."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        {/* 필터 - 상단 고정 */}
        <div className="mb-6">
          <TravelFilters onFilterChange={handleFilterChange} />
        </div>

        {/* 목록 및 지도 레이아웃 - 세로 배치 */}
        <div className="space-y-6">
          {/* 상단: 목록 영역 */}
          <div>
            <TravelList
              filter={filter}
              onTravelClick={handleTravelClick}
              onTravelsChange={handleTravelListUpdate}
            />
          </div>

          {/* 하단: 지도 영역 */}
          <div className="h-[600px] md:h-[800px] rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
            <NaverMap
              travels={travels}
              onMarkerClick={handleTravelClick}
              selectedTravelId={selectedTravelId}
              className="h-full"
              showFilterOverlay={true}
              onFilterChange={(newFilter) => {
                // 지도 내 필터 변경 시 URL 업데이트
                const params = new URLSearchParams(searchParams.toString());
                if (newFilter.keyword) {
                  params.set("keyword", newFilter.keyword);
                } else {
                  params.delete("keyword");
                }
                window.history.pushState({}, "", `?${params.toString()}`);
                handleFilterChange({ ...filter, keyword: newFilter.keyword });
              }}
              currentFilter={{ keyword: filter.keyword }}
              showPetFriendlyOnly={showPetFriendlyOnly}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto py-8 px-4">
          <div className="space-y-6">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
