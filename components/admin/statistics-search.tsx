/**
 * @file statistics-search.tsx
 * @description 통계 데이터 검색 컴포넌트
 */

"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { getFilterPresets } from "@/actions/filters/get-filter-presets";
import { createFilterPreset } from "@/actions/filters/create-filter-preset";
import { deleteFilterPreset } from "@/actions/filters/delete-filter-preset";
import type { FilterPreset } from "@/actions/filters/get-filter-presets";

interface StatisticsSearchProps {
  onSearch: (query: {
    keyword?: string;
    dateRange?: { start?: string; end?: string };
    region?: string;
    type?: string;
  }) => void;
}

export function StatisticsSearch({ onSearch }: StatisticsSearchProps) {
  const [keyword, setKeyword] = useState("");
  const [dateRange, setDateRange] = useState<{ start?: string; end?: string }>({});
  const [region, setRegion] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const [isPending, startTransition] = useTransition();

  const handleSearch = () => {
    console.group("[StatisticsSearch] 통계 검색");
    onSearch({
      keyword: keyword.trim() || undefined,
      dateRange: dateRange.start || dateRange.end ? dateRange : undefined,
      region: region || undefined,
      type: type || undefined,
    });
    console.groupEnd();
  };

  const handleLoadPreset = (preset: FilterPreset) => {
    console.group("[StatisticsSearch] 필터 프리셋 로드");
    const config = preset.filterConfig;
    if (config.keyword) setKeyword(config.keyword);
    if (config.dateRange) setDateRange(config.dateRange);
    if (config.region) setRegion(config.region);
    if (config.type) setType(config.type);
    onSearch({
      keyword: config.keyword,
      dateRange: config.dateRange,
      region: config.region,
      type: config.type,
    });
    toast.success(`"${preset.name}" 필터 프리셋을 적용했습니다.`);
    console.groupEnd();
  };

  const handleSavePreset = () => {
    startTransition(async () => {
      console.group("[StatisticsSearch] 필터 프리셋 저장");
      const result = await createFilterPreset({
        name: `통계 검색 - ${new Date().toLocaleDateString()}`,
        filterType: "statistics",
        filterConfig: {
          keyword: keyword.trim() || undefined,
          dateRange: dateRange.start || dateRange.end ? dateRange : undefined,
          region: region || undefined,
          type: type || undefined,
        },
      });

      if (result.success) {
        toast.success("필터 프리셋이 저장되었습니다.");
        loadPresets();
      } else {
        toast.error(result.error || "필터 프리셋 저장에 실패했습니다.");
      }
      console.groupEnd();
    });
  };

  const loadPresets = async () => {
    const result = await getFilterPresets("statistics");
    if (result.success && result.presets) {
      setPresets(result.presets);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          통계 데이터 검색
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 검색어 */}
        <div className="space-y-2">
          <Label htmlFor="stat-keyword">검색어</Label>
          <Input
            id="stat-keyword"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="통계 데이터 검색..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />
        </div>

        {/* 기간 필터 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="stat-start-date">시작 날짜</Label>
            <Input
              id="stat-start-date"
              type="date"
              value={dateRange.start || ""}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stat-end-date">종료 날짜</Label>
            <Input
              id="stat-end-date"
              type="date"
              value={dateRange.end || ""}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            />
          </div>
        </div>

        {/* 지역 및 타입 필터 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="stat-region">지역</Label>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger id="stat-region">
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">전체</SelectItem>
                <SelectItem value="서울">서울</SelectItem>
                <SelectItem value="부산">부산</SelectItem>
                <SelectItem value="대구">대구</SelectItem>
                <SelectItem value="인천">인천</SelectItem>
                <SelectItem value="광주">광주</SelectItem>
                <SelectItem value="대전">대전</SelectItem>
                <SelectItem value="울산">울산</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="stat-type">타입</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="stat-type">
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">전체</SelectItem>
                <SelectItem value="관광지">관광지</SelectItem>
                <SelectItem value="문화시설">문화시설</SelectItem>
                <SelectItem value="축제">축제</SelectItem>
                <SelectItem value="숙박">숙박</SelectItem>
                <SelectItem value="쇼핑">쇼핑</SelectItem>
                <SelectItem value="음식점">음식점</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 검색 버튼 */}
        <div className="flex items-center gap-2">
          <Button onClick={handleSearch} className="flex-1">
            <Search className="w-4 h-4 mr-2" />
            검색
          </Button>
          <Button variant="outline" onClick={handleSavePreset} disabled={isPending}>
            <Filter className="w-4 h-4 mr-2" />
            저장
          </Button>
        </div>

        {/* 저장된 프리셋 목록 */}
        {presets.length > 0 && (
          <div className="space-y-2 pt-4 border-t">
            <Label className="text-sm font-medium">저장된 검색</Label>
            <div className="space-y-1">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleLoadPreset(preset)}
                  className="w-full text-left text-sm p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

