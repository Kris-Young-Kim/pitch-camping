/**
 * @file safety-recommendations.tsx
 * @description 여행지 상세페이지에 표시할 여행 안전 정보 추천 컴포넌트
 *
 * 여행지 상세페이지에서 지역/국가별 여행 안전 정보를 추천하는 컴포넌트
 *
 * 주요 기능:
 * 1. 여행지 지역/국가 기반 안전 정보 추천
 * 2. 관련 주제별 안전 정보 표시
 * 3. 안전 정보 카드 클릭 시 상세 페이지로 이동
 *
 * @dependencies
 * - components/safety/safety-card.tsx: SafetyCard 컴포넌트
 * - lib/api/safety-guidelines.ts: getRecommendedTravelSafetyGuidelines 함수
 */

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertTriangle } from "lucide-react";
import { SafetyCard } from "@/components/safety/safety-card";
import { type TravelSafetyGuideline } from "@/lib/api/safety-guidelines";
import type { TravelSiteDetail } from "@/types/travel";

interface SafetyRecommendationsProps {
  travel: TravelSiteDetail;
}

/**
 * 클라이언트 사이드에서 여행 안전 정보 조회
 */
async function fetchRecommendedSafetyGuidelines(region?: string): Promise<TravelSafetyGuideline[]> {
  const params = new URLSearchParams();
  params.append("limit", "3");
  if (region) {
    params.append("region", region);
  }

  const response = await fetch(`/api/safety-guidelines?${params.toString()}`);
  if (!response.ok) {
    throw new Error("여행 안전 정보 조회 실패");
  }
  return response.json();
}

export function SafetyRecommendations({ travel }: SafetyRecommendationsProps) {
  const [guidelines, setGuidelines] = useState<TravelSafetyGuideline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGuidelines = async () => {
      setLoading(true);
      setError(null);
      try {
        // 여행지 지역 정보 기반으로 안전 정보 추천
        // addr1에서 지역 추출 (예: "서울특별시", "제주특별자치도" 등)
        const region = travel.addr1 ? extractRegion(travel.addr1) : null;
        const data = await fetchRecommendedSafetyGuidelines(region || undefined);
        setGuidelines(data);
      } catch (err) {
        console.error("Failed to fetch safety guidelines:", err);
        setError("여행 안전 정보를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchGuidelines();
  }, [travel.addr1]);

  if (loading) {
    return (
      <Card className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="w-5 h-5" /> 여행 안전 정보
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400 text-sm">로딩 중...</p>
        </CardContent>
      </Card>
    );
  }

  if (error || guidelines.length === 0) {
    return (
      <Card className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="w-5 h-5" /> 여행 안전 정보
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {error || "이 지역에 대한 여행 안전 정보가 아직 준비되지 않았습니다."}
              </p>
              <a
                href="/safety"
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm mt-2 inline-block"
              >
                전체 여행 안전 정보 보기 →
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Shield className="w-5 h-5" /> 여행 안전 정보
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          안전한 여행을 위한 안전 정보를 확인하세요.
        </p>
        <div className="grid grid-cols-1 gap-4">
          {guidelines.map((guideline) => (
            <SafetyCard key={guideline.id} guideline={guideline} />
          ))}
        </div>
        <a
          href="/safety"
          className="text-blue-600 dark:text-blue-400 hover:underline text-sm inline-block"
        >
          전체 여행 안전 정보 보기 →
        </a>
      </CardContent>
    </Card>
  );
}

/**
 * 주소에서 지역 추출 (예: "서울특별시 강남구" → "서울")
 */
function extractRegion(addr: string): string | null {
  // 시/도 단위 추출
  const match = addr.match(/^(서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주)/);
  if (match) {
    return match[1];
  }
  return null;
}

