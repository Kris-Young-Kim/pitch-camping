/**
 * @file safety-recommendations.tsx
 * @description 안전 수칙 추천 컴포넌트
 *
 * 캠핑장 상세페이지에서 현재 계절 기반 안전 수칙을 추천하는 컴포넌트
 *
 * 주요 기능:
 * 1. 현재 계절 기반 안전 수칙 추천
 * 2. 캠핑 타입 기반 추천 (향후)
 * 3. 안전 수칙 페이지로 이동 링크
 *
 * @dependencies
 * - lib/api/safety-guidelines.ts: getRecommendedSafetyGuidelines 함수
 * - components/safety/safety-card.tsx: SafetyCard 컴포넌트
 */

import Link from "next/link";
import { Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getRecommendedSafetyGuidelines } from "@/lib/api/safety-guidelines";
import { SafetyCard } from "./safety-card";

interface SafetyRecommendationsProps {
  campingType?: string; // 캠핑 타입 (향후 활용)
}

export async function SafetyRecommendations({ campingType }: SafetyRecommendationsProps) {
  // campingType은 향후 활용 예정이므로 현재는 사용하지 않음
  void campingType;
  // 현재 계절 기반 안전 수칙 추천
  const recommendedGuidelines = await getRecommendedSafetyGuidelines(3);

  if (recommendedGuidelines.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600 dark:text-green-400" aria-hidden="true" />
              <CardTitle>안전한 캠핑을 위한 안전 수칙</CardTitle>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/safety">
                전체 보기
                <ArrowRight className="w-4 h-4 ml-1" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendedGuidelines.map((guideline) => (
              <SafetyCard key={guideline.id} guideline={guideline} showSeason={false} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

