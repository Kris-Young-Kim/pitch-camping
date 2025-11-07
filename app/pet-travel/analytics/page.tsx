/**
 * @file app/pet-travel/analytics/page.tsx
 * @description 반려동물 동반 여행지 통계/분석 페이지
 */

import { getPetFriendlyStatistics } from "@/actions/pet-friendly/get-pet-friendly-statistics";
import { PetFriendlyAnalyticsContent } from "@/components/pet-friendly/pet-friendly-analytics-content";

export const metadata = {
  title: "반려동물 동반 여행지 통계",
  description: "반려동물 동반 여행지 데이터를 분석합니다.",
};

export default async function PetFriendlyAnalyticsPage() {
  const data = await getPetFriendlyStatistics();

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          반려동물 동반 여행지 통계 대시보드
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          반려동물 동반 여행지의 지역별, 타입별 분포와 인기도를 분석해보세요.
        </p>
      </div>
      <PetFriendlyAnalyticsContent data={data} />
    </div>
  );
}

