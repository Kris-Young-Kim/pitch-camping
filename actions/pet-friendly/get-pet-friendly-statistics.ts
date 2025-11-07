/**
 * @file get-pet-friendly-statistics.ts
 * @description 반려동물 동반 여행지 통계/분석 Server Action
 */

"use server";

import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { logError, logInfo } from "@/lib/utils/logger";
import { REGION_LIST, TRAVEL_TYPE_LIST } from "@/constants/travel";

interface AreaStat {
  areaCode: string;
  count: number;
  averageRating?: number;
  totalReviews?: number;
}

interface TypeStat {
  contentTypeId: string;
  count: number;
  averageRating?: number;
  totalReviews?: number;
}

interface PopularityStat {
  contentId: string;
  title: string;
  viewCount: number;
  bookmarkCount: number;
  reviewCount: number;
  averageRating: number;
  popularityScore: number;
}

export interface PetFriendlyStatisticsResult {
  success: boolean;
  totalPetFriendlyTravels?: number;
  areaStats?: Array<AreaStat & { label: string }>;
  typeStats?: Array<TypeStat & { label: string }>;
  popularityStats?: PopularityStat[];
  averageSatisfaction?: number;
  totalPetReviews?: number;
  error?: string;
}

function formatAreaCode(areaCode: string | null): string {
  if (!areaCode) return "기타";
  const match = REGION_LIST.find((region) => region.value === areaCode);
  return match?.label ?? "기타";
}

function formatType(contentTypeId: string | null): string {
  if (!contentTypeId) return "기타";
  const match = TRAVEL_TYPE_LIST.find((type) => type.value === contentTypeId);
  return match?.label ?? "기타";
}

export async function getPetFriendlyStatistics(): Promise<PetFriendlyStatisticsResult> {
  console.group("[getPetFriendlyStatistics] 반려동물 동반 여행지 통계 조회 시작");

  try {
    const supabase = createClerkSupabaseClient();

    // 반려동물 동반 여행지 조회
    const { data: petFriendlyTravels, error: travelsError } = await supabase
      .from("travels")
      .select("contentid, areacode, contenttypeid, title")
      .eq("pet_friendly", true);

    if (travelsError) {
      console.error("[getPetFriendlyStatistics] 여행지 조회 실패:", travelsError);
      logError(
        "[getPetFriendlyStatistics] 여행지 조회 실패",
        travelsError instanceof Error ? travelsError : new Error(String(travelsError))
      );
      console.groupEnd();
      return { success: false, error: "여행지 데이터를 불러오는데 실패했습니다." };
    }

    if (!petFriendlyTravels || petFriendlyTravels.length === 0) {
      console.log("[getPetFriendlyStatistics] 반려동물 동반 여행지 없음");
      console.groupEnd();
      return {
        success: true,
        totalPetFriendlyTravels: 0,
        areaStats: [],
        typeStats: [],
        popularityStats: [],
        averageSatisfaction: 0,
        totalPetReviews: 0,
      };
    }

    const contentIds = petFriendlyTravels.map((travel) => travel.contentid);

    // 통계 데이터 조회
    const [statsData, reviewsData] = await Promise.all([
      supabase
        .from("travel_stats")
        .select("content_id, view_count, bookmark_count")
        .in("content_id", contentIds),
      supabase
        .from("reviews")
        .select("content_id, rating, pet_friendly_rating")
        .in("content_id", contentIds)
        .eq("pet_friendly_experience", true),
    ]);

    if (statsData.error) {
      console.warn("[getPetFriendlyStatistics] 통계 데이터 조회 실패 (무시):", statsData.error);
    }

    if (reviewsData.error) {
      console.warn("[getPetFriendlyStatistics] 리뷰 데이터 조회 실패 (무시):", reviewsData.error);
    }

    const statsMap = new Map(
      (statsData.data || []).map((stat) => [stat.content_id, stat])
    );

    const reviewsMap = new Map<string, Array<{ rating: number; petRating: number | null }>>();
    (reviewsData.data || []).forEach((review) => {
      if (!reviewsMap.has(review.content_id)) {
        reviewsMap.set(review.content_id, []);
      }
      reviewsMap.get(review.content_id)!.push({
        rating: review.rating,
        petRating: review.pet_friendly_rating,
      });
    });

    // 지역별 통계
    const areaMap = new Map<string, { count: number; ratings: number[]; reviewCount: number }>();
    petFriendlyTravels.forEach((travel) => {
      const areaCode = travel.areacode ?? "기타";
      if (!areaMap.has(areaCode)) {
        areaMap.set(areaCode, { count: 0, ratings: [], reviewCount: 0 });
      }
      const area = areaMap.get(areaCode)!;
      area.count += 1;

      const reviews = reviewsMap.get(travel.contentid) || [];
      reviews.forEach((review) => {
        if (review.petRating) {
          area.ratings.push(review.petRating);
          area.reviewCount += 1;
        }
      });
    });

    const areaStats = Array.from(areaMap.entries())
      .map(([areaCode, data]) => {
        const averageRating =
          data.ratings.length > 0
            ? data.ratings.reduce((sum, r) => sum + r, 0) / data.ratings.length
            : 0;
        return {
          areaCode,
          count: data.count,
          averageRating: Math.round(averageRating * 10) / 10,
          totalReviews: data.reviewCount,
          label: formatAreaCode(areaCode),
        };
      })
      .sort((a, b) => b.count - a.count);

    // 타입별 통계
    const typeMap = new Map<string, { count: number; ratings: number[]; reviewCount: number }>();
    petFriendlyTravels.forEach((travel) => {
      const typeId = travel.contenttypeid ?? "기타";
      if (!typeMap.has(typeId)) {
        typeMap.set(typeId, { count: 0, ratings: [], reviewCount: 0 });
      }
      const type = typeMap.get(typeId)!;
      type.count += 1;

      const reviews = reviewsMap.get(travel.contentid) || [];
      reviews.forEach((review) => {
        if (review.petRating) {
          type.ratings.push(review.petRating);
          type.reviewCount += 1;
        }
      });
    });

    const typeStats = Array.from(typeMap.entries())
      .map(([contentTypeId, data]) => {
        const averageRating =
          data.ratings.length > 0
            ? data.ratings.reduce((sum, r) => sum + r, 0) / data.ratings.length
            : 0;
        return {
          contentTypeId,
          count: data.count,
          averageRating: Math.round(averageRating * 10) / 10,
          totalReviews: data.reviewCount,
          label: formatType(contentTypeId),
        };
      })
      .sort((a, b) => b.count - a.count);

    // 인기도 통계 (TOP 10)
    const popularityStats: PopularityStat[] = petFriendlyTravels
      .map((travel) => {
        const stat = statsMap.get(travel.contentid);
        const reviews = reviewsMap.get(travel.contentid) || [];
        const petRatings = reviews
          .map((r) => r.petRating)
          .filter((r): r is number => r !== null);
        const averageRating =
          petRatings.length > 0
            ? petRatings.reduce((sum, r) => sum + r, 0) / petRatings.length
            : 0;

        const viewCount = stat?.view_count || 0;
        const bookmarkCount = stat?.bookmark_count || 0;
        const reviewCount = petRatings.length;

        // 인기도 점수 계산 (조회수 * 0.3 + 북마크수 * 0.4 + 리뷰수 * 0.2 + 평점 * 0.1)
        const popularityScore =
          viewCount * 0.3 + bookmarkCount * 0.4 + reviewCount * 0.2 + averageRating * 0.1;

        return {
          contentId: travel.contentid,
          title: travel.title || "제목 없음",
          viewCount,
          bookmarkCount,
          reviewCount,
          averageRating: Math.round(averageRating * 10) / 10,
          popularityScore: Math.round(popularityScore * 10) / 10,
        };
      })
      .sort((a, b) => b.popularityScore - a.popularityScore)
      .slice(0, 10);

    // 전체 만족도 평균
    const allPetRatings: number[] = [];
    (reviewsData.data || []).forEach((review) => {
      if (review.pet_friendly_rating) {
        allPetRatings.push(review.pet_friendly_rating);
      }
    });

    const averageSatisfaction =
      allPetRatings.length > 0
        ? allPetRatings.reduce((sum, r) => sum + r, 0) / allPetRatings.length
        : 0;

    logInfo("[getPetFriendlyStatistics] 통계 계산 완료", {
      totalPetFriendlyTravels: petFriendlyTravels.length,
      areaCount: areaStats.length,
      typeCount: typeStats.length,
      averageSatisfaction: Math.round(averageSatisfaction * 10) / 10,
    });
    console.groupEnd();

    return {
      success: true,
      totalPetFriendlyTravels: petFriendlyTravels.length,
      areaStats,
      typeStats,
      popularityStats,
      averageSatisfaction: Math.round(averageSatisfaction * 10) / 10,
      totalPetReviews: allPetRatings.length,
    };
  } catch (error) {
    console.error("[getPetFriendlyStatistics] 통계 계산 오류:", error);
    logError(
      "[getPetFriendlyStatistics] 통계 계산 오류",
      error instanceof Error ? error : new Error(String(error))
    );
    console.groupEnd();
    return { success: false, error: "반려동물 동반 여행지 통계를 계산하는 중 오류가 발생했습니다." };
  }
}

