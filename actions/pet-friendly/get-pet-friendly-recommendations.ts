/**
 * @file get-pet-friendly-recommendations.ts
 * @description 반려동물 동반 여행지 추천 Server Action
 */

"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { logError, logInfo } from "@/lib/utils/logger";
import type { TravelSite } from "@/types/travel";

export interface PetFriendlyRecommendation {
  contentId: string;
  title: string;
  addr1: string;
  addr2: string;
  firstimage: string | null;
  areacode: string | null;
  contenttypeid: string | null;
  mapx: string | null;
  mapy: string | null;
  popularityScore: number;
  averageRating: number;
  reviewCount: number;
  bookmarkCount: number;
  reason: string; // 추천 이유
}

export interface PetFriendlyRecommendationsResult {
  success: boolean;
  userBased?: PetFriendlyRecommendation[];
  regionBased?: PetFriendlyRecommendation[];
  seasonal?: PetFriendlyRecommendation[];
  error?: string;
}

function getCurrentSeason(): "spring" | "summer" | "fall" | "winter" {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "fall";
  return "winter";
}

export async function getPetFriendlyRecommendations(
  regionCode?: string,
  limit: number = 10
): Promise<PetFriendlyRecommendationsResult> {
  console.group("[getPetFriendlyRecommendations] 반려동물 동반 여행지 추천 시작");
  logInfo("[getPetFriendlyRecommendations] 추천 요청", { regionCode, limit });

  try {
    const supabase = createClerkSupabaseClient();
    let userId: string | null = null;

    // 사용자 기반 추천을 위한 사용자 정보 조회
    try {
      const { userId: clerkUserId } = await auth();
      if (clerkUserId) {
        const { data: userData } = await supabase
          .from("users")
          .select("id")
          .eq("clerk_id", clerkUserId)
          .single();
        userId = userData?.id || null;
      }
    } catch (authError) {
      console.warn("[getPetFriendlyRecommendations] 인증 정보 조회 실패 (무시):", authError);
    }

    // 반려동물 동반 여행지 조회
    let petFriendlyQuery = supabase
      .from("travels")
      .select("contentid, areacode, contenttypeid, title")
      .eq("pet_friendly", true);

    if (regionCode) {
      petFriendlyQuery = petFriendlyQuery.eq("areacode", regionCode);
    }

    const { data: petFriendlyTravels, error: travelsError } = await petFriendlyQuery;

    if (travelsError) {
      console.error("[getPetFriendlyRecommendations] 여행지 조회 실패:", travelsError);
      logError(
        "[getPetFriendlyRecommendations] 여행지 조회 실패",
        travelsError instanceof Error ? travelsError : new Error(String(travelsError))
      );
      console.groupEnd();
      return { success: false, error: "여행지 데이터를 불러오는데 실패했습니다." };
    }

    if (!petFriendlyTravels || petFriendlyTravels.length === 0) {
      console.log("[getPetFriendlyRecommendations] 반려동물 동반 여행지 없음");
      console.groupEnd();
      return {
        success: true,
        userBased: [],
        regionBased: [],
        seasonal: [],
      };
    }

    const contentIds = petFriendlyTravels.map((travel) => travel.contentid);

    // 통계 및 리뷰 데이터 조회
    const [statsData, reviewsData, bookmarksData] = await Promise.all([
      supabase
        .from("travel_stats")
        .select("content_id, view_count, bookmark_count")
        .in("content_id", contentIds),
      supabase
        .from("reviews")
        .select("content_id, pet_friendly_rating")
        .in("content_id", contentIds)
        .eq("pet_friendly_experience", true)
        .not("pet_friendly_rating", "is", null),
      userId
        ? supabase
            .from("bookmarks")
            .select("content_id")
            .eq("user_id", userId)
            .in("content_id", contentIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    const statsMap = new Map(
      (statsData.data || []).map((stat) => [stat.content_id, stat])
    );

    const reviewsMap = new Map<string, number[]>();
    (reviewsData.data || []).forEach((review) => {
      if (review.pet_friendly_rating) {
        if (!reviewsMap.has(review.content_id)) {
          reviewsMap.set(review.content_id, []);
        }
        reviewsMap.get(review.content_id)!.push(review.pet_friendly_rating);
      }
    });

    const userBookmarkedIds = new Set(
      (bookmarksData.data || []).map((b) => b.content_id)
    );

    // 여행지 상세 정보 조회
    const { data: travelDetails } = await supabase
      .from("travels")
      .select("contentid, title, addr1, addr2, firstimage, areacode, contenttypeid, mapx, mapy")
      .in("contentid", contentIds);

    const travelDetailsMap = new Map(
      (travelDetails || []).map((travel) => [travel.contentid, travel])
    );

    // 추천 점수 계산 함수
    const calculateRecommendationScore = (
      contentId: string,
      isUserBookmarked: boolean
    ): { score: number; reason: string } => {
      const stat = statsMap.get(contentId);
      const ratings = reviewsMap.get(contentId) || [];
      const averageRating =
        ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
          : 0;

      const viewCount = stat?.view_count || 0;
      const bookmarkCount = stat?.bookmark_count || 0;
      const reviewCount = ratings.length;

      // 인기도 점수 (조회수 * 0.2 + 북마크수 * 0.3 + 리뷰수 * 0.3 + 평점 * 0.2)
      let score =
        viewCount * 0.2 + bookmarkCount * 0.3 + reviewCount * 0.3 + averageRating * 0.2;

      // 사용자가 북마크한 경우 가중치 추가
      if (isUserBookmarked) {
        score += 5;
      }

      // 평점이 높을수록 가중치 추가
      if (averageRating >= 4.5) {
        score += 3;
      } else if (averageRating >= 4.0) {
        score += 2;
      } else if (averageRating >= 3.5) {
        score += 1;
      }

      let reason = "";
      if (averageRating >= 4.5 && reviewCount >= 10) {
        reason = "높은 만족도와 많은 리뷰";
      } else if (bookmarkCount >= 50) {
        reason = "많은 사용자가 북마크한 인기 여행지";
      } else if (averageRating >= 4.0) {
        reason = "높은 만족도";
      } else if (reviewCount >= 5) {
        reason = "검증된 반려동물 동반 여행지";
      } else {
        reason = "반려동물 동반 가능 여행지";
      }

      return { score, reason };
    };

    // 추천 목록 생성
    const recommendations: PetFriendlyRecommendation[] = petFriendlyTravels
      .map((travel) => {
        const detail = travelDetailsMap.get(travel.contentid);
        if (!detail) return null;

        const isUserBookmarked = userBookmarkedIds.has(travel.contentid);
        const { score, reason } = calculateRecommendationScore(
          travel.contentid,
          isUserBookmarked
        );
        const ratings = reviewsMap.get(travel.contentid) || [];
        const averageRating =
          ratings.length > 0
            ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
            : 0;
        const stat = statsMap.get(travel.contentid);

        return {
          contentId: travel.contentid,
          title: detail.title || "제목 없음",
          addr1: detail.addr1 || "",
          addr2: detail.addr2 || "",
          firstimage: detail.firstimage,
          areacode: detail.areacode,
          contenttypeid: detail.contenttypeid,
          mapx: detail.mapx,
          mapy: detail.mapy,
          popularityScore: Math.round(score * 10) / 10,
          averageRating: Math.round(averageRating * 10) / 10,
          reviewCount: ratings.length,
          bookmarkCount: stat?.bookmark_count || 0,
          reason,
        };
      })
      .filter((item): item is PetFriendlyRecommendation => item !== null)
      .sort((a, b) => b.popularityScore - a.popularityScore);

    // 사용자 기반 추천 (사용자가 북마크한 여행지와 유사한 지역/타입)
    let userBased: PetFriendlyRecommendation[] = [];
    if (userId && userBookmarkedIds.size > 0) {
      const userBookmarkedTravels = petFriendlyTravels.filter((travel) =>
        userBookmarkedIds.has(travel.contentid)
      );

      if (userBookmarkedTravels.length > 0) {
        // 북마크한 여행지의 지역/타입 분석
        const preferredAreas = new Set(
          userBookmarkedTravels.map((t) => t.areacode).filter(Boolean)
        );
        const preferredTypes = new Set(
          userBookmarkedTravels.map((t) => t.contenttypeid).filter(Boolean)
        );

        userBased = recommendations
          .filter((rec) => {
            // 북마크하지 않은 여행지 중에서
            if (userBookmarkedIds.has(rec.contentId)) return false;
            // 선호 지역 또는 선호 타입과 일치하는 여행지
            return (
              (rec.areacode && preferredAreas.has(rec.areacode)) ||
              (rec.contenttypeid && preferredTypes.has(rec.contenttypeid))
            );
          })
          .slice(0, limit);
      }
    }

    // 지역별 인기 추천
    const regionBased = recommendations
      .filter((rec) => !regionCode || rec.areacode === regionCode)
      .slice(0, limit);

    // 계절별 추천 (계절에 맞는 여행지 타입 우선)
    const currentSeason = getCurrentSeason();
    const seasonalTypeMap: Record<string, string[]> = {
      spring: ["12", "14", "15"], // 관광지, 문화시설, 축제
      summer: ["12", "32"], // 관광지, 숙박
      fall: ["12", "14", "15"], // 관광지, 문화시설, 축제
      winter: ["12", "32", "39"], // 관광지, 숙박, 음식점
    };

    const seasonalTypes = seasonalTypeMap[currentSeason] || [];
    const seasonal = recommendations
      .filter((rec) =>
        rec.contenttypeid ? seasonalTypes.includes(rec.contenttypeid) : true
      )
      .slice(0, limit);

    logInfo("[getPetFriendlyRecommendations] 추천 완료", {
      userBasedCount: userBased.length,
      regionBasedCount: regionBased.length,
      seasonalCount: seasonal.length,
    });
    console.groupEnd();

    return {
      success: true,
      userBased,
      regionBased,
      seasonal,
    };
  } catch (error) {
    console.error("[getPetFriendlyRecommendations] 추천 오류:", error);
    logError(
      "[getPetFriendlyRecommendations] 추천 오류",
      error instanceof Error ? error : new Error(String(error))
    );
    console.groupEnd();
    return { success: false, error: "반려동물 동반 여행지 추천 중 오류가 발생했습니다." };
  }
}

