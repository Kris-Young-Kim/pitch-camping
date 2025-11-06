/**
 * @file page.tsx
 * @description 안전 수칙 메인 페이지
 *
 * 캠핑 안전 수칙을 조회하고 검색할 수 있는 페이지
 *
 * 주요 기능:
 * 1. 안전 수칙 목록 표시
 * 2. 계절별/주제별 필터링
 * 3. 검색 기능
 * 4. 동영상 섹션
 *
 * @dependencies
 * - components/safety/safety-guidelines.tsx: SafetyGuidelines 컴포넌트
 * - lib/api/safety-guidelines.ts: getSafetyGuidelines 함수
 */

import { Shield, AlertTriangle } from "lucide-react";
import { SafetyGuidelines } from "@/components/safety/safety-guidelines";
import { getSafetyGuidelines } from "@/lib/api/safety-guidelines";
import { Card, CardContent } from "@/components/ui/card";

export default async function SafetyPage() {
  // 초기 안전 수칙 목록 조회 (서버 사이드)
  const initialGuidelines = await getSafetyGuidelines({ limit: 20 });

  return (
    <main className="min-h-[calc(100vh-80px)] py-8 px-4" id="main-content">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-green-600 dark:text-green-400" aria-hidden="true" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              안전한 캠핑 즐기기
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            계절별, 주제별 안전 수칙을 확인하고 안전한 캠핑을 즐기세요
          </p>
        </div>

        {/* 안전 주의사항 */}
        <Card className="mb-8 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
              <div>
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-300 mb-1">
                  안전 수칙 참고사항
                </h3>
                <p className="text-sm text-yellow-800 dark:text-yellow-400">
                  실제 결과는 현장 상황 및 계절에 따라 달라질 수 있으니, 
                  캠핑장 사업주에 직접 확인 후 이용해주세요. 
                  안전 수칙은 참고용이며, 항상 안전을 최우선으로 생각하세요.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 안전 수칙 목록 */}
        <SafetyGuidelines initialGuidelines={initialGuidelines} />
      </div>
    </main>
  );
}

