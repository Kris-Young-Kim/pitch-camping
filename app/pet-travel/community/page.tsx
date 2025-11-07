/**
 * @file app/pet-travel/community/page.tsx
 * @description 반려동물 동반 여행 커뮤니티 페이지
 */

import { PetTravelCommunityContent } from "@/components/pet-friendly/pet-travel-community-content";

export const metadata = {
  title: "반려동물 동반 여행 커뮤니티",
  description: "반려동물과 함께한 여행 경험을 공유하고 정보를 나눠보세요.",
};

export default function PetTravelCommunityPage() {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <PetTravelCommunityContent />
    </div>
  );
}

