/**
 * @file camping-filters.tsx
 * @description 캠핑장 필터 컴포넌트
 *
 * 지역, 캠핑 타입, 시설 필터 및 정렬 옵션을 제공하는 컴포넌트
 *
 * 주요 기능:
 * 1. 지역 필터 (시/도 드롭다운)
 * 2. 캠핑 타입 필터 (일반야영장, 자동차야영장, 글램핑, 카라반)
 * 3. 시설 필터 (체크박스: 화장실, 샤워장, 전기, 와이파이 등)
 * 4. 정렬 옵션 (이름순, 지역순, 인기순)
 * 5. 필터 초기화
 *
 * @dependencies
 * - types/camping.ts: CampingFilter 타입
 * - constants/camping.ts: 상수 정의
 * - components/ui/select.tsx: Select 컴포넌트
 * - components/ui/checkbox.tsx: Checkbox 컴포넌트
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { X, Filter } from "lucide-react";
import type { CampingFilter } from "@/types/camping";
import {
  REGIONS,
  REGION_LIST,
  CAMPING_TYPES,
  CAMPING_TYPE_LIST,
  FACILITY_LIST,
  SORT_OPTIONS,
  SORT_OPTION_LABELS,
} from "@/constants/camping";

interface CampingFiltersProps {
  onFilterChange?: (filter: CampingFilter) => void;
}

export function CampingFilters({ onFilterChange }: CampingFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 필터 상태 관리
  const [region, setRegion] = useState<string>(
    searchParams.get("region") || REGIONS.ALL
  );
  const [campingType, setCampingType] = useState<string>(
    searchParams.get("type") || CAMPING_TYPES.ALL
  );
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>(() => {
    const facilitiesParam = searchParams.get("facilities");
    return facilitiesParam ? facilitiesParam.split(",") : [];
  });
  const [sortOrder, setSortOrder] = useState<string>(
    searchParams.get("sort") || SORT_OPTIONS.NAME
  );

  // 필터 변경 시 URL 및 콜백 업데이트
  useEffect(() => {
    console.group("[CampingFilters] 필터 상태 변경");
    console.log("지역:", region);
    console.log("캠핑 타입:", campingType);
    console.log("선택된 시설:", selectedFacilities);
    console.log("정렬:", sortOrder);

    const filter: CampingFilter = {
      doNm: region !== REGIONS.ALL ? region : undefined,
      induty: campingType !== CAMPING_TYPES.ALL ? campingType : undefined,
      sbrsCl:
        selectedFacilities.length > 0 ? selectedFacilities.join(",") : undefined,
      sortOrder: sortOrder as CampingFilter["sortOrder"],
      pageNo: 1, // 필터 변경 시 첫 페이지로 리셋
    };

    // URL 쿼리 파라미터 업데이트
    const params = new URLSearchParams();
    if (region !== REGIONS.ALL) params.set("region", region);
    if (campingType !== CAMPING_TYPES.ALL) params.set("type", campingType);
    if (selectedFacilities.length > 0)
      params.set("facilities", selectedFacilities.join(","));
    if (sortOrder !== SORT_OPTIONS.NAME) params.set("sort", sortOrder);

    const keyword = searchParams.get("keyword");
    if (keyword) params.set("keyword", keyword);

    router.replace(`/?${params.toString()}`, { scroll: false });

    // 콜백 호출
    onFilterChange?.(filter);

    console.groupEnd();
  }, [region, campingType, selectedFacilities, sortOrder, router, searchParams, onFilterChange]);

  // 시설 필터 토글
  const toggleFacility = (facility: string) => {
    console.log("[CampingFilters] 시설 필터 토글:", facility);
    setSelectedFacilities((prev) =>
      prev.includes(facility)
        ? prev.filter((f) => f !== facility)
        : [...prev, facility]
    );
  };

  // 필터 초기화
  const resetFilters = () => {
    console.log("[CampingFilters] 필터 초기화");
    setRegion(REGIONS.ALL);
    setCampingType(CAMPING_TYPES.ALL);
    setSelectedFacilities([]);
    setSortOrder(SORT_OPTIONS.NAME);

    // URL도 초기화 (키워드는 유지)
    const params = new URLSearchParams();
    const keyword = searchParams.get("keyword");
    if (keyword) params.set("keyword", keyword);

    router.replace(`/?${params.toString()}`, { scroll: false });
  };

  // 필터가 적용되어 있는지 확인
  const hasActiveFilters =
    region !== REGIONS.ALL ||
    campingType !== CAMPING_TYPES.ALL ||
    selectedFacilities.length > 0 ||
    sortOrder !== SORT_OPTIONS.NAME;

  return (
    <div className="space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md" role="region" aria-label="캠핑장 필터">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-green-600 dark:text-green-400" aria-hidden="true" />
          <h2 className="text-lg font-semibold">필터</h2>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label="필터 초기화"
          >
            <X className="w-4 h-4 mr-1" aria-hidden="true" />
            초기화
          </Button>
        )}
      </div>

      {/* 지역 필터 */}
      <div className="space-y-2">
        <Label htmlFor="region">지역</Label>
        <Select value={region} onValueChange={setRegion}>
          <SelectTrigger id="region">
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

      {/* 캠핑 타입 필터 */}
      <div className="space-y-2">
        <Label htmlFor="type">캠핑 타입</Label>
        <Select value={campingType} onValueChange={setCampingType}>
          <SelectTrigger id="type">
            <SelectValue placeholder="캠핑 타입 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={CAMPING_TYPES.ALL}>전체</SelectItem>
            {CAMPING_TYPE_LIST.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 시설 필터 */}
      <div className="space-y-2">
        <Label id="facilities-label">시설</Label>
        <div className="grid grid-cols-2 gap-2" role="group" aria-labelledby="facilities-label">
          {FACILITY_LIST.slice(0, 8).map((facility) => (
            <div key={facility} className="flex items-center space-x-2">
              <Checkbox
                id={`facility-${facility}`}
                checked={selectedFacilities.includes(facility)}
                onCheckedChange={() => toggleFacility(facility)}
                aria-label={`${facility} 시설 ${selectedFacilities.includes(facility) ? "선택됨" : "선택 안됨"}`}
              />
              <Label
                htmlFor={`facility-${facility}`}
                className="text-sm cursor-pointer"
              >
                {facility}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* 정렬 옵션 */}
      <div className="space-y-2">
        <Label htmlFor="sort">정렬</Label>
        <Select value={sortOrder} onValueChange={setSortOrder}>
          <SelectTrigger id="sort">
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

      {/* 활성 필터 표시 */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          {region !== REGIONS.ALL && (
            <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 rounded">
              지역: {region}
            </span>
          )}
          {campingType !== CAMPING_TYPES.ALL && (
            <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 rounded">
              타입: {campingType}
            </span>
          )}
          {selectedFacilities.length > 0 && (
            <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 rounded">
              시설: {selectedFacilities.length}개
            </span>
          )}
          {sortOrder !== SORT_OPTIONS.NAME && (
            <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 rounded">
              {SORT_OPTION_LABELS[sortOrder as keyof typeof SORT_OPTION_LABELS]}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

