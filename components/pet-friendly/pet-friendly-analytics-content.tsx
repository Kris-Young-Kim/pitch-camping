/**
 * @file pet-friendly-analytics-content.tsx
 * @description 반려동물 동반 여행지 통계/분석 UI 컴포넌트
 */

"use client";

import { PetFriendlyStatisticsResult } from "@/actions/pet-friendly/get-pet-friendly-statistics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, TrendingUp, MapPin, Star } from "lucide-react";
import Link from "next/link";

interface PetFriendlyAnalyticsContentProps {
  data: PetFriendlyStatisticsResult;
}

export function PetFriendlyAnalyticsContent({ data }: PetFriendlyAnalyticsContentProps) {
  if (!data.success) {
    return (
      <div className="max-w-3xl mx-auto bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 text-center">
        <p className="text-red-600 dark:text-red-300 text-sm">{data.error ?? "통계를 불러오는데 실패했습니다."}</p>
      </div>
    );
  }

  const areaStats = data.areaStats ?? [];
  const typeStats = data.typeStats ?? [];
  const popularityStats = data.popularityStats ?? [];

  const maxAreaCount = Math.max(...areaStats.map((item) => item.count), 1);
  const maxTypeCount = Math.max(...typeStats.map((item) => item.count), 1);

  return (
    <div className="space-y-8">
      {/* 요약 카드 */}
      <section className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              총 반려동물 동반 여행지
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.totalPetFriendlyTravels ?? 0}개</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              등록된 반려동물 동반 가능 여행지 수
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              평균 만족도
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <p className="text-3xl font-bold">{data.averageSatisfaction ?? 0}</p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              반려동물 동반 만족도 평균
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              총 리뷰 수
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.totalPetReviews ?? 0}개</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              반려동물 동반 리뷰 총 개수
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              인기 여행지
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{popularityStats.length}개</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              TOP 10 인기 여행지
            </p>
          </CardContent>
        </Card>
      </section>

      {/* 지역별 통계 */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              지역별 반려동물 동반 여행지 분포
            </CardTitle>
          </CardHeader>
          <CardContent>
            {areaStats.length === 0 ? (
              <p className="text-sm text-gray-500">데이터가 없습니다.</p>
            ) : (
              <div className="space-y-4">
                {areaStats.map((item, index) => (
                  <div key={item.areaCode} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Badge variant={index === 0 ? "default" : "secondary"}>{index + 1}</Badge>
                        <span className="font-medium">{item.label}</span>
                        {item.averageRating > 0 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            ⭐ {item.averageRating} ({item.totalReviews}개 리뷰)
                          </span>
                        )}
                      </div>
                      <span className="font-semibold">{item.count}개</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500"
                        style={{ width: `${(item.count / maxAreaCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* 타입별 통계 */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-600" />
              여행 유형별 반려동물 동반 여행지 분포
            </CardTitle>
          </CardHeader>
          <CardContent>
            {typeStats.length === 0 ? (
              <p className="text-sm text-gray-500">데이터가 없습니다.</p>
            ) : (
              <div className="space-y-4">
                {typeStats.map((item, index) => (
                  <div key={item.contentTypeId} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Badge variant={index === 0 ? "default" : "secondary"}>{index + 1}</Badge>
                        <span className="font-medium">{item.label}</span>
                        {item.averageRating > 0 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            ⭐ {item.averageRating} ({item.totalReviews}개 리뷰)
                          </span>
                        )}
                      </div>
                      <span className="font-semibold">{item.count}개</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-pink-500"
                        style={{ width: `${(item.count / maxTypeCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* 인기 여행지 TOP 10 */}
      {popularityStats.length > 0 && (
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-600" />
                인기 반려동물 동반 여행지 TOP 10
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {popularityStats.map((item, index) => (
                  <Link
                    key={item.contentId}
                    href={`/travels/${item.contentId}`}
                    className="block rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={index < 3 ? "default" : "secondary"}>
                            {index + 1}
                          </Badge>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {item.title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                          <span>👁️ {item.viewCount.toLocaleString()}</span>
                          <span>🔖 {item.bookmarkCount.toLocaleString()}</span>
                          <span>💬 {item.reviewCount.toLocaleString()}</span>
                          {item.averageRating > 0 && (
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                              {item.averageRating}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">인기도</p>
                        <p className="text-lg font-bold text-orange-600">
                          {item.popularityScore.toFixed(1)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}

