/**
 * @file pet-friendly-recommendations-content.tsx
 * @description 반려동물 동반 여행지 추천 UI 컴포넌트
 */

"use client";

import { PetFriendlyRecommendationsResult } from "@/actions/pet-friendly/get-pet-friendly-recommendations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, Star, TrendingUp, User, Calendar } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getImageUrl } from "@/lib/utils/travel";

interface PetFriendlyRecommendationsContentProps {
  data: PetFriendlyRecommendationsResult;
}

function RecommendationCard({
  recommendation,
  index,
}: {
  recommendation: PetFriendlyRecommendationsResult["userBased"] extends Array<infer T> ? T : never;
  index: number;
}) {
  return (
    <Link
      href={`/travels/${recommendation.contentId}`}
      className="block rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
    >
      <div className="flex gap-4">
        <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
          {recommendation.firstimage ? (
            <Image
              src={getImageUrl(recommendation.firstimage)}
              alt={recommendation.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Heart className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant={index < 3 ? "default" : "secondary"}>{index + 1}</Badge>
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                  {recommendation.title}
                </h3>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                {recommendation.addr1} {recommendation.addr2}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 mb-2">
            {recommendation.averageRating > 0 && (
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                {recommendation.averageRating}
              </span>
            )}
            <span>💬 {recommendation.reviewCount}</span>
            <span>🔖 {recommendation.bookmarkCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <Badge className="bg-emerald-600 text-xs">{recommendation.reason}</Badge>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              인기도 {recommendation.popularityScore.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function PetFriendlyRecommendationsContent({
  data,
}: PetFriendlyRecommendationsContentProps) {
  if (!data.success) {
    return (
      <div className="max-w-3xl mx-auto bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 text-center">
        <p className="text-red-600 dark:text-red-300 text-sm">
          {data.error ?? "추천을 불러오는데 실패했습니다."}
        </p>
      </div>
    );
  }

  const userBased = data.userBased ?? [];
  const regionBased = data.regionBased ?? [];
  const seasonal = data.seasonal ?? [];

  const getSeasonName = () => {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return "봄";
    if (month >= 6 && month <= 8) return "여름";
    if (month >= 9 && month <= 11) return "가을";
    return "겨울";
  };

  return (
    <div className="space-y-8">
      {/* 사용자 기반 추천 */}
      {userBased.length > 0 && (
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                나를 위한 맞춤 추천
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                내가 북마크한 여행지와 유사한 반려동물 동반 여행지를 추천합니다.
              </p>
              <div className="space-y-3">
                {userBased.map((rec, index) => (
                  <RecommendationCard key={rec.contentId} recommendation={rec} index={index} />
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* 지역별 인기 추천 */}
      {regionBased.length > 0 && (
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-purple-600" />
                지역별 인기 반려동물 동반 여행지
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                많은 사용자들이 찾는 인기 반려동물 동반 여행지입니다.
              </p>
              <div className="space-y-3">
                {regionBased.map((rec, index) => (
                  <RecommendationCard key={rec.contentId} recommendation={rec} index={index} />
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* 계절별 추천 */}
      {seasonal.length > 0 && (
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-600" />
                {getSeasonName()}에 어울리는 반려동물 동반 여행지
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                이 계절에 특히 좋은 반려동물 동반 여행지를 추천합니다.
              </p>
              <div className="space-y-3">
                {seasonal.map((rec, index) => (
                  <RecommendationCard key={rec.contentId} recommendation={rec} index={index} />
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* 추천 없음 */}
      {userBased.length === 0 && regionBased.length === 0 && seasonal.length === 0 && (
        <div className="text-center py-12 text-gray-600 dark:text-gray-400">
          <Heart className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>아직 추천할 반려동물 동반 여행지가 없습니다.</p>
        </div>
      )}
    </div>
  );
}

