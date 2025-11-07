/**
 * @file app/pet-travel/recommendations/page.tsx
 * @description 반려동물 동반 여행지 추천 페이지
 */

import { getPetFriendlyRecommendations } from "@/actions/pet-friendly/get-pet-friendly-recommendations";
import { PetFriendlyRecommendationsContent } from "@/components/pet-friendly/pet-friendly-recommendations-content";
import { Suspense } from "react";

export const metadata = {
  title: "반려동물 동반 여행지 추천",
  description: "나를 위한 맞춤형 반려동물 동반 여행지를 추천받아보세요.",
};

export default async function PetFriendlyRecommendationsPage() {
  const data = await getPetFriendlyRecommendations();

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          반려동물 동반 여행지 추천
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          나를 위한 맞춤형 반려동물 동반 여행지를 추천받아보세요.
        </p>
      </div>
      <Suspense fallback={<div className="text-center py-12">로딩 중...</div>}>
        <PetFriendlyRecommendationsContent data={data} />
      </Suspense>
    </div>
  );
}

