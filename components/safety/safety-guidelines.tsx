/**
 * @file safety-guidelines.tsx
 * @description 안전 수칙 목록 컴포넌트
 *
 * 안전 수칙 목록을 표시하고 필터링하는 컴포넌트
 *
 * 주요 기능:
 * 1. 안전 수칙 목록 표시
 * 2. 계절/주제별 필터링
 * 3. 검색 기능
 *
 * @dependencies
 * - components/safety/safety-card.tsx: SafetyCard 컴포넌트
 * - components/ui/tabs.tsx: Tabs 컴포넌트
 * - lib/api/safety-guidelines.ts: getSafetyGuidelines 함수
 */

"use client";

import { useState, useEffect } from "react";
import { SafetyCard } from "./safety-card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { SafetyGuideline } from "@/lib/api/safety-guidelines";

interface SafetyGuidelinesProps {
  initialGuidelines?: SafetyGuideline[];
  defaultSeason?: "spring" | "summer" | "autumn" | "winter" | "all";
  defaultTopic?: string;
}

/**
 * 클라이언트 사이드에서 안전 수칙 조회
 */
async function fetchSafetyGuidelines(filter: any): Promise<SafetyGuideline[]> {
  const params = new URLSearchParams();
  if (filter.season && filter.season !== "all") {
    params.append("season", filter.season);
  }
  if (filter.topic && filter.topic !== "all") {
    params.append("topic", filter.topic);
  }
  if (filter.search) {
    params.append("search", filter.search);
  }
  if (filter.limit) {
    params.append("limit", filter.limit.toString());
  }

  const response = await fetch(`/api/safety-guidelines?${params.toString()}`);
  if (!response.ok) {
    throw new Error("안전 수칙 조회 실패");
  }
  return response.json();
}

export function SafetyGuidelines({
  initialGuidelines = [],
  defaultSeason,
  defaultTopic,
}: SafetyGuidelinesProps) {
  const [guidelines, setGuidelines] = useState<SafetyGuideline[]>(initialGuidelines);
  const [selectedSeason, setSelectedSeason] = useState<
    "spring" | "summer" | "autumn" | "winter" | "all"
  >(defaultSeason || "all");
  const [selectedTopic] = useState<string>(defaultTopic || "all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchGuidelines = async () => {
      setIsLoading(true);
      try {
        const filter: any = {};
        if (selectedSeason !== "all") {
          filter.season = selectedSeason;
        }
        if (selectedTopic !== "all") {
          filter.topic = selectedTopic;
        }
        if (searchQuery.trim()) {
          filter.search = searchQuery.trim();
        }

        const data = await fetchSafetyGuidelines(filter);
        setGuidelines(data);
      } catch (error) {
        console.error("[SafetyGuidelines] 안전 수칙 조회 오류:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGuidelines();
  }, [selectedSeason, selectedTopic, searchQuery]);

  return (
    <div className="space-y-6">
      {/* 검색창 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
        <Input
          type="search"
          placeholder="안전 수칙 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="안전 수칙 검색"
        />
      </div>

      {/* 계절별 탭 */}
      <Tabs value={selectedSeason} onValueChange={(value) => setSelectedSeason(value as any)}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="all">전체</TabsTrigger>
          <TabsTrigger value="spring">봄</TabsTrigger>
          <TabsTrigger value="summer">여름</TabsTrigger>
          <TabsTrigger value="autumn">가을</TabsTrigger>
          <TabsTrigger value="winter">겨울</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* 안전 수칙 목록 */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : guidelines.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            {searchQuery ? "검색 결과가 없습니다." : "안전 수칙이 없습니다."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guidelines.map((guideline) => (
            <SafetyCard key={guideline.id} guideline={guideline} />
          ))}
        </div>
      )}
    </div>
  );
}

