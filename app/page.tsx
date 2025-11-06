/**
 * @file page.tsx
 * @description Pitch Camping 홈페이지
 *
 * 캠핑장 목록, 필터, 검색, 지도 기능을 통합한 메인 페이지
 *
 * 주요 기능:
 * 1. 필터 컴포넌트 (지역, 타입, 시설, 정렬)
 * 2. 캠핑장 목록 표시
 * 3. 네이버 지도 연동
 * 4. 리스트-지도 상호연동
 * 5. URL 쿼리 파라미터 기반 필터 상태 관리
 *
 * @dependencies
 * - components/camping-filters.tsx: CampingFilters 컴포넌트
 * - components/camping-list.tsx: CampingList 컴포넌트
 * - components/camping-search.tsx: CampingSearch 컴포넌트
 * - components/naver-map.tsx: NaverMap 컴포넌트
 * - types/camping.ts: CampingFilter, CampingSite 타입
 */

"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { CampingFilters } from "@/components/camping-filters";
import { CampingList } from "@/components/camping-list";
import { CampingSearch } from "@/components/camping-search";
import { NaverMap } from "@/components/naver-map";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Map, List } from "lucide-react";
import type { CampingFilter, CampingSite } from "@/types/camping";
import {
  REGIONS,
  CAMPING_TYPES,
  SORT_OPTIONS,
} from "@/constants/camping";

export default function Home() {
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState<CampingFilter>({});
  const [campings, setCampings] = useState<CampingSite[]>([]);
  const [selectedCampingId, setSelectedCampingId] = useState<string | undefined>();
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  // URL 쿼리 파라미터로부터 필터 초기화
  useEffect(() => {
    console.group("[Home] 필터 초기화");
    const region = searchParams.get("region");
    const type = searchParams.get("type");
    const facilities = searchParams.get("facilities");
    const keyword = searchParams.get("keyword");
    const sort = searchParams.get("sort");
    const view = searchParams.get("view") as "list" | "map" | null;

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

    if (view === "map") {
      setViewMode("map");
    }

    console.log("초기 필터:", initialFilter);
    setFilter(initialFilter);
    console.groupEnd();
  }, [searchParams]);

  const handleFilterChange = (newFilter: CampingFilter) => {
    console.log("[Home] 필터 변경 콜백:", newFilter);
    setFilter(newFilter);
    setSelectedCampingId(undefined); // 필터 변경 시 선택 해제
  };

  const handleCampingClick = (camping: CampingSite) => {
    console.log("[Home] 캠핑장 클릭:", camping.facltNm);
    setSelectedCampingId(camping.contentId);
  };

  const handleCampingListUpdate = (campings: CampingSite[]) => {
    console.log("[Home] 캠핑장 목록 업데이트:", campings.length);
    setCampings(campings);
  };

  return (
    <main className="min-h-[calc(100vh-80px)] py-8 px-4">
      <div className="max-w-[1920px] mx-auto">
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

        {/* 모바일: 탭 전환 */}
        <div className="lg:hidden mb-6">
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "list" | "map")}>
            <TabsList className="w-full">
              <TabsTrigger value="list" className="flex-1">
                <List className="w-4 h-4 mr-2" />
                목록
              </TabsTrigger>
              <TabsTrigger value="map" className="flex-1">
                <Map className="w-4 h-4 mr-2" />
                지도
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* 필터 및 콘텐츠 레이아웃 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 필터 사이드바 */}
          <aside className="lg:col-span-3">
            <CampingFilters onFilterChange={handleFilterChange} />
          </aside>

          {/* 목록 및 지도 영역 */}
          <div className="lg:col-span-9">
            {/* 데스크톱: 리스트와 지도 분할 */}
            <div className="hidden lg:grid lg:grid-cols-2 gap-6">
              {/* 리스트 영역 */}
              <div className="space-y-4">
                <CampingList 
                  filter={filter}
                  onCampingClick={handleCampingClick}
                  selectedCampingId={selectedCampingId}
                  onCampingsChange={handleCampingListUpdate}
                />
              </div>

              {/* 지도 영역 */}
              <div className="sticky top-4 h-[calc(100vh-120px)]">
                <NaverMap
                  campings={campings}
                  onMarkerClick={handleCampingClick}
                  selectedCampingId={selectedCampingId}
                  className="h-full"
                />
              </div>
            </div>

            {/* 모바일: 탭 콘텐츠 */}
            <div className="lg:hidden">
            {viewMode === "list" ? (
              <CampingList 
                filter={filter}
                onCampingClick={handleCampingClick}
                selectedCampingId={selectedCampingId}
                onCampingsChange={handleCampingListUpdate}
              />
            ) : (
                <div className="h-[600px]">
                  <NaverMap
                    campings={campings}
                    onMarkerClick={handleCampingClick}
                    selectedCampingId={selectedCampingId}
                    className="h-full"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
