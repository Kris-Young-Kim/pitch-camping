/**
 * @file travel-filters.tsx
 * @description 여행지 필터 컴포넌트
 *
 * 지역, 여행지 타입, 카테고리 필터 및 정렬 옵션을 제공하는 컴포넌트
 *
 * 주요 기능:
 * 1. 지역 필터 (시/도 드롭다운)
 * 2. 여행지 타입 필터 (관광지, 문화시설, 축제, 숙박 등)
 * 3. 정렬 옵션 (제목순, 조회순, 수정일순, 생성일순)
 * 4. 필터 초기화
 *
 * @dependencies
 * - types/travel.ts: TravelFilter 타입
 * - constants/travel.ts: 상수 정의
 * - components/ui/select.tsx: Select 컴포넌트
 */

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { X, Filter, Search } from "lucide-react";
import type { TravelFilter } from "@/types/travel";
import {
  REGIONS,
  REGION_LIST,
  REGION_CODES,
  TRAVEL_TYPES,
  TRAVEL_TYPE_LIST,
  TRAVEL_TYPE_CODES,
  SORT_OPTIONS,
  SORT_OPTION_LABELS,
} from "@/constants/travel";

interface TravelFiltersProps {
  onFilterChange?: (filter: TravelFilter) => void;
}

export function TravelFilters({ onFilterChange }: TravelFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // onFilterChange를 ref로 저장하여 안정화
  const onFilterChangeRef = useRef(onFilterChange);
  useEffect(() => {
    onFilterChangeRef.current = onFilterChange;
  }, [onFilterChange]);

  // 필터 상태 관리
  const [region, setRegion] = useState<string>(
    searchParams.get("region") || REGIONS.ALL
  );
  const [travelType, setTravelType] = useState<string>(
    searchParams.get("type") || TRAVEL_TYPES.ALL
  );
  const [sortOrder, setSortOrder] = useState<string>(
    searchParams.get("sort") || SORT_OPTIONS.TITLE
  );

  // 필터 적용 함수 (검색 버튼 클릭 시 또는 자동 적용)
  const applyFilters = useCallback(() => {
    console.group("[TravelFilters] 필터 적용");
    console.log("지역:", region);
    console.log("여행지 타입:", travelType);
    console.log("정렬:", sortOrder);

    // 여행지 타입을 코드로 변환
    const getTravelTypeCode = (type: string): string | undefined => {
      const typeMap: Record<string, string> = {
        [TRAVEL_TYPES.TOURIST_SPOT]: TRAVEL_TYPE_CODES.TOURIST_SPOT,
        [TRAVEL_TYPES.CULTURAL_FACILITY]: TRAVEL_TYPE_CODES.CULTURAL_FACILITY,
        [TRAVEL_TYPES.FESTIVAL]: TRAVEL_TYPE_CODES.FESTIVAL,
        [TRAVEL_TYPES.ACCOMMODATION]: TRAVEL_TYPE_CODES.ACCOMMODATION,
        [TRAVEL_TYPES.SHOPPING]: TRAVEL_TYPE_CODES.SHOPPING,
        [TRAVEL_TYPES.RESTAURANT]: TRAVEL_TYPE_CODES.RESTAURANT,
      };
      return typeMap[type];
    };

    const filter: TravelFilter = {
      areaCode: region !== REGIONS.ALL ? REGION_CODES[region] : undefined,
      contentTypeId: travelType !== TRAVEL_TYPES.ALL ? getTravelTypeCode(travelType) : undefined,
      arrange: sortOrder as TravelFilter["arrange"],
      pageNo: 1, // 필터 변경 시 첫 페이지로 리셋
    };

    // URL 쿼리 파라미터 업데이트
    const params = new URLSearchParams();
    if (region !== REGIONS.ALL) params.set("region", region);
    if (travelType !== TRAVEL_TYPES.ALL) params.set("type", travelType);
    if (sortOrder !== SORT_OPTIONS.TITLE) params.set("sort", sortOrder);

    const keyword = searchParams.get("keyword");
    if (keyword) params.set("keyword", keyword);

    router.replace(`/?${params.toString()}`, { scroll: false });

    // 콜백 호출 (ref를 통해 안정적으로 호출)
    onFilterChangeRef.current?.(filter);

    console.groupEnd();
  }, [region, travelType, sortOrder, router, searchParams, onFilterChangeRef]);

  // 필터 변경 시 자동 적용 (정렬은 즉시 적용, 지역/타입은 검색 버튼 필요)
  useEffect(() => {
    // 정렬만 변경된 경우 즉시 적용
    if (sortOrder !== (searchParams.get("sort") || SORT_OPTIONS.TITLE)) {
      applyFilters();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortOrder]);

  // 필터 초기화
  const resetFilters = () => {
    console.log("[TravelFilters] 필터 초기화");
    setRegion(REGIONS.ALL);
    setTravelType(TRAVEL_TYPES.ALL);
    setSortOrder(SORT_OPTIONS.TITLE);

    // URL도 초기화 (키워드는 유지)
    const params = new URLSearchParams();
    const keyword = searchParams.get("keyword");
    if (keyword) params.set("keyword", keyword);

    router.replace(`/?${params.toString()}`, { scroll: false });
  };

  // 필터가 적용되어 있는지 확인
  const hasActiveFilters =
    region !== REGIONS.ALL ||
    travelType !== TRAVEL_TYPES.ALL ||
    sortOrder !== SORT_OPTIONS.TITLE;

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700" role="region" aria-label="여행지 필터">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Filter className="w-5 h-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">필터</h2>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 self-start md:self-auto"
            aria-label="필터 초기화"
          >
            <X className="w-4 h-4 mr-1" aria-hidden="true" />
            초기화
          </Button>
        )}
      </div>

      {/* 필터 옵션 - 가로 배치 */}
      <div className="flex flex-col md:flex-row gap-4 pt-4">
        {/* 지역 필터 */}
        <div className="flex-1 min-w-0">
          <Label htmlFor="region" className="text-sm font-semibold text-gray-900 dark:text-white mb-2 block">지역</Label>
          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger id="region" className="h-11 w-full">
              <SelectValue placeholder="지역 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={REGIONS.ALL}>전체</SelectItem>
              {REGION_LIST.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 여행지 타입 필터 */}
        <div className="flex-1 min-w-0">
          <Label htmlFor="type" className="text-sm font-semibold text-gray-900 dark:text-white mb-2 block">여행지 타입</Label>
          <Select value={travelType} onValueChange={setTravelType}>
            <SelectTrigger id="type" className="h-11 w-full">
              <SelectValue placeholder="여행지 타입 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TRAVEL_TYPES.ALL}>전체</SelectItem>
              {TRAVEL_TYPE_LIST.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 정렬 옵션 */}
        <div className="flex-1 min-w-0">
          <Label htmlFor="sort" className="text-sm font-semibold text-gray-900 dark:text-white mb-2 block">정렬</Label>
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger id="sort" className="h-11 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(SORT_OPTION_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 검색 버튼 */}
        <div className="flex items-end">
          <Button
            onClick={applyFilters}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold h-11 px-6"
            aria-label="필터 적용"
          >
            <Search className="w-4 h-4 mr-2" aria-hidden="true" />
            검색
          </Button>
        </div>
      </div>

      {/* 활성 필터 표시 */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
          {region !== REGIONS.ALL && (
            <span className="px-3 py-1.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-full border border-blue-200 dark:border-blue-800">
              지역: {region}
            </span>
          )}
          {travelType !== TRAVEL_TYPES.ALL && (
            <span className="px-3 py-1.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-full border border-blue-200 dark:border-blue-800">
              타입: {travelType}
            </span>
          )}
          {sortOrder !== SORT_OPTIONS.TITLE && (
            <span className="px-3 py-1.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-full border border-blue-200 dark:border-blue-800">
              {SORT_OPTION_LABELS[sortOrder as keyof typeof SORT_OPTION_LABELS]}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

