/**
 * @file get-region-type-stats.ts
 * @description 지역별/타입별 상세 통계 조회 Server Action
 */

"use server";

import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { auth } from "@clerk/nextjs/server";

export interface RegionStats {
  areacode: string;
  areaname: string;
  travelCount: number;
  viewCount: number;
  bookmarkCount: number;
  reviewCount: number;
  popularTravels: {
    contentId: string;
    title: string;
    viewCount: number;
    bookmarkCount: number;
  }[];
}

export interface TypeStats {
  contentTypeId: string;
  typeName: string;
  travelCount: number;
  viewCount: number;
  bookmarkCount: number;
  reviewCount: number;
  popularTravels: {
    contentId: string;
    title: string;
    viewCount: number;
    bookmarkCount: number;
  }[];
}

export interface RegionTypeStatsResult {
  success: boolean;
  regionStats?: RegionStats[];
  typeStats?: TypeStats[];
  error?: string;
}

async function checkAdminPermission(): Promise<boolean> {
  try {
    const { userId } = await auth();
    if (!userId) return false;

    const adminUserIds = process.env.ADMIN_USER_IDS?.split(",") || [];
    if (adminUserIds.includes(userId)) return true;

    return false;
  } catch {
    return false;
  }
}

function formatTypeName(contentTypeId: string | null): string {
  const typeMap: Record<string, string> = {
    "12": "관광지",
    "14": "문화시설",
    "15": "축제",
    "25": "여행코스",
    "28": "레포츠",
    "32": "숙박",
    "38": "쇼핑",
    "39": "음식점",
  };
  return typeMap[contentTypeId || ""] || "기타";
}

function formatAreaName(areacode: string | null): string {
  const areaMap: Record<string, string> = {
    "1": "서울",
    "2": "인천",
    "3": "대전",
    "4": "대구",
    "5": "광주",
    "6": "부산",
    "7": "울산",
    "8": "세종",
    "31": "경기",
    "32": "강원",
    "33": "충북",
    "34": "충남",
    "35": "경북",
    "36": "경남",
    "37": "전북",
    "38": "전남",
    "39": "제주",
  };
  return areaMap[areacode || ""] || "기타";
}

export async function getRegionTypeStats(): Promise<RegionTypeStatsResult> {
  console.group("[getRegionTypeStats] 지역별/타입별 통계 조회 시작");

  try {
    const isAdmin = await checkAdminPermission();
    if (!isAdmin) {
      console.warn("[getRegionTypeStats] 관리자 권한 없음");
      console.groupEnd();
      return { success: false, error: "관리자 권한이 필요합니다." };
    }

    const supabase = getServiceRoleClient();

    // 지역별 통계
    const { data: travelsData } = await supabase
      .from("travels")
      .select("contentid, areacode, title, contenttypeid");

    const { data: statsData } = await supabase
      .from("travel_stats")
      .select("content_id, view_count, bookmark_count");

    const { data: reviewsData } = await supabase
      .from("reviews")
      .select("content_id");

    // 지역별 집계
    const regionMap = new Map<string, {
      areacode: string;
      travelCount: number;
      viewCount: number;
      bookmarkCount: number;
      reviewCount: number;
      travels: Map<string, { title: string; viewCount: number; bookmarkCount: number }>;
    }>();

    (travelsData || []).forEach((travel) => {
      const areacode = travel.areacode || "unknown";
      if (!regionMap.has(areacode)) {
        regionMap.set(areacode, {
          areacode,
          travelCount: 0,
          viewCount: 0,
          bookmarkCount: 0,
          reviewCount: 0,
          travels: new Map(),
        });
      }

      const region = regionMap.get(areacode)!;
      region.travelCount++;

      const stat = statsData?.find((s) => s.content_id === travel.contentid);
      if (stat) {
        region.viewCount += stat.view_count || 0;
        region.bookmarkCount += stat.bookmark_count || 0;
        region.travels.set(travel.contentid, {
          title: travel.title || "제목 없음",
          viewCount: stat.view_count || 0,
          bookmarkCount: stat.bookmark_count || 0,
        });
      }

      const reviewCount = reviewsData?.filter((r) => r.content_id === travel.contentid).length || 0;
      region.reviewCount += reviewCount;
    });

    const regionStats: RegionStats[] = Array.from(regionMap.values())
      .map((region) => ({
        areacode: region.areacode,
        areaname: formatAreaName(region.areacode),
        travelCount: region.travelCount,
        viewCount: region.viewCount,
        bookmarkCount: region.bookmarkCount,
        reviewCount: region.reviewCount,
        popularTravels: Array.from(region.travels.values())
          .sort((a, b) => (b.viewCount + b.bookmarkCount) - (a.viewCount + a.bookmarkCount))
          .slice(0, 10)
          .map((travel, index) => ({
            contentId: Array.from(region.travels.keys())[index] || "",
            title: travel.title,
            viewCount: travel.viewCount,
            bookmarkCount: travel.bookmarkCount,
          })),
      }))
      .sort((a, b) => b.travelCount - a.travelCount);

    // 타입별 통계
    const typeMap = new Map<string, {
      contentTypeId: string;
      travelCount: number;
      viewCount: number;
      bookmarkCount: number;
      reviewCount: number;
      travels: Map<string, { title: string; viewCount: number; bookmarkCount: number }>;
    }>();

    (travelsData || []).forEach((travel) => {
      const contentTypeId = travel.contenttypeid || "unknown";
      if (!typeMap.has(contentTypeId)) {
        typeMap.set(contentTypeId, {
          contentTypeId,
          travelCount: 0,
          viewCount: 0,
          bookmarkCount: 0,
          reviewCount: 0,
          travels: new Map(),
        });
      }

      const type = typeMap.get(contentTypeId)!;
      type.travelCount++;

      const stat = statsData?.find((s) => s.content_id === travel.contentid);
      if (stat) {
        type.viewCount += stat.view_count || 0;
        type.bookmarkCount += stat.bookmark_count || 0;
        type.travels.set(travel.contentid, {
          title: travel.title || "제목 없음",
          viewCount: stat.view_count || 0,
          bookmarkCount: stat.bookmark_count || 0,
        });
      }

      const reviewCount = reviewsData?.filter((r) => r.content_id === travel.contentid).length || 0;
      type.reviewCount += reviewCount;
    });

    const typeStats: TypeStats[] = Array.from(typeMap.values())
      .map((type) => ({
        contentTypeId: type.contentTypeId,
        typeName: formatTypeName(type.contentTypeId),
        travelCount: type.travelCount,
        viewCount: type.viewCount,
        bookmarkCount: type.bookmarkCount,
        reviewCount: type.reviewCount,
        popularTravels: Array.from(type.travels.values())
          .sort((a, b) => (b.viewCount + b.bookmarkCount) - (a.viewCount + a.bookmarkCount))
          .slice(0, 10)
          .map((travel, index) => ({
            contentId: Array.from(type.travels.keys())[index] || "",
            title: travel.title,
            viewCount: travel.viewCount,
            bookmarkCount: travel.bookmarkCount,
          })),
      }))
      .sort((a, b) => b.travelCount - a.travelCount);

    console.log("[getRegionTypeStats] 통계 조회 완료:", {
      regionCount: regionStats.length,
      typeCount: typeStats.length,
    });
    console.groupEnd();

    return {
      success: true,
      regionStats,
      typeStats,
    };
  } catch (error) {
    console.error("[getRegionTypeStats] 통계 조회 오류:", error);
    console.groupEnd();
    return {
      success: false,
      error: "통계 데이터를 불러오는데 실패했습니다.",
    };
  }
}

