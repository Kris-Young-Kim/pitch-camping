/**
 * @file get-detailed-region-type-stats.ts
 * @description 지역별/타입별 상세 통계 조회 Server Action (시군구별, 지역-타입 조합 포함)
 */

"use server";

import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { auth } from "@clerk/nextjs/server";

export interface SigunguStats {
  areacode: string;
  areaname: string;
  sigungucode: string;
  sigunguname: string;
  travelCount: number;
  viewCount: number;
  bookmarkCount: number;
  reviewCount: number;
}

export interface RegionTypeCombinationStats {
  areacode: string;
  areaname: string;
  contentTypeId: string;
  typeName: string;
  travelCount: number;
  viewCount: number;
  bookmarkCount: number;
  reviewCount: number;
}

export interface DetailedRegionTypeStatsResult {
  success: boolean;
  sigunguStats?: SigunguStats[];
  regionTypeCombinations?: RegionTypeCombinationStats[];
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

// 시군구 이름 매핑 (주요 시군구만, 필요시 확장 가능)
function formatSigunguName(areacode: string | null, sigungucode: string | null): string {
  if (!areacode || !sigungucode) return "기타";

  // 간단한 매핑 (실제로는 더 많은 시군구가 있지만, 주요 지역만)
  const sigunguMap: Record<string, Record<string, string>> = {
    "1": {
      // 서울
      "1": "종로구",
      "2": "중구",
      "3": "용산구",
      "4": "성동구",
      "5": "광진구",
      "6": "동대문구",
      "7": "중랑구",
      "8": "성북구",
      "9": "강북구",
      "10": "도봉구",
      "11": "노원구",
      "12": "은평구",
      "13": "서대문구",
      "14": "마포구",
      "15": "양천구",
      "16": "강서구",
      "17": "구로구",
      "18": "금천구",
      "19": "영등포구",
      "20": "동작구",
      "21": "관악구",
      "22": "서초구",
      "23": "강남구",
      "24": "송파구",
      "25": "강동구",
    },
    "31": {
      // 경기
      "1": "수원시",
      "2": "성남시",
      "3": "의정부시",
      "4": "안양시",
      "5": "부천시",
      "6": "광명시",
      "7": "평택시",
      "8": "동두천시",
      "9": "안산시",
      "10": "고양시",
      "11": "과천시",
      "12": "구리시",
      "13": "남양주시",
      "14": "오산시",
      "15": "시흥시",
      "16": "군포시",
      "17": "의왕시",
      "18": "하남시",
      "19": "용인시",
      "20": "파주시",
      "21": "이천시",
      "22": "안성시",
      "23": "김포시",
      "24": "화성시",
      "25": "광주시",
      "26": "양주시",
      "27": "포천시",
      "28": "여주시",
      "29": "연천군",
      "30": "가평군",
      "31": "양평군",
    },
  };

  return sigunguMap[areacode]?.[sigungucode] || `시군구 ${sigungucode}`;
}

export async function getDetailedRegionTypeStats(): Promise<DetailedRegionTypeStatsResult> {
  console.group("[getDetailedRegionTypeStats] 상세 지역별/타입별 통계 조회 시작");

  try {
    const isAdmin = await checkAdminPermission();
    if (!isAdmin) {
      console.warn("[getDetailedRegionTypeStats] 관리자 권한 없음");
      console.groupEnd();
      return { success: false, error: "관리자 권한이 필요합니다." };
    }

    const supabase = getServiceRoleClient();

    // travels 테이블에서 시군구 정보 포함 조회
    const { data: travelsData } = await supabase
      .from("travels")
      .select("contentid, areacode, sigungucode, contenttypeid, title");

    const { data: statsData } = await supabase
      .from("travel_stats")
      .select("content_id, view_count, bookmark_count");

    const { data: reviewsData } = await supabase
      .from("reviews")
      .select("content_id");

    // 1. 시군구별 통계
    const sigunguMap = new Map<
      string,
      {
        areacode: string;
        sigungucode: string;
        travelCount: number;
        viewCount: number;
        bookmarkCount: number;
        reviewCount: number;
      }
    >();

    (travelsData || []).forEach((travel) => {
      if (!travel.areacode || !travel.sigungucode) return;

      const key = `${travel.areacode}-${travel.sigungucode}`;
      if (!sigunguMap.has(key)) {
        sigunguMap.set(key, {
          areacode: travel.areacode,
          sigungucode: travel.sigungucode,
          travelCount: 0,
          viewCount: 0,
          bookmarkCount: 0,
          reviewCount: 0,
        });
      }

      const sigungu = sigunguMap.get(key)!;
      sigungu.travelCount++;

      const stat = statsData?.find((s) => s.content_id === travel.contentid);
      if (stat) {
        sigungu.viewCount += stat.view_count || 0;
        sigungu.bookmarkCount += stat.bookmark_count || 0;
      }

      const reviewCount =
        reviewsData?.filter((r) => r.content_id === travel.contentid).length || 0;
      sigungu.reviewCount += reviewCount;
    });

    const sigunguStats: SigunguStats[] = Array.from(sigunguMap.values())
      .map((sigungu) => ({
        areacode: sigungu.areacode,
        areaname: formatAreaName(sigungu.areacode),
        sigungucode: sigungu.sigungucode,
        sigunguname: formatSigunguName(sigungu.areacode, sigungu.sigungucode),
        travelCount: sigungu.travelCount,
        viewCount: sigungu.viewCount,
        bookmarkCount: sigungu.bookmarkCount,
        reviewCount: sigungu.reviewCount,
      }))
      .sort((a, b) => b.travelCount - a.travelCount);

    // 2. 지역-타입 조합 통계
    const combinationMap = new Map<
      string,
      {
        areacode: string;
        contentTypeId: string;
        travelCount: number;
        viewCount: number;
        bookmarkCount: number;
        reviewCount: number;
      }
    >();

    (travelsData || []).forEach((travel) => {
      if (!travel.areacode || !travel.contenttypeid) return;

      const key = `${travel.areacode}-${travel.contenttypeid}`;
      if (!combinationMap.has(key)) {
        combinationMap.set(key, {
          areacode: travel.areacode,
          contentTypeId: travel.contenttypeid,
          travelCount: 0,
          viewCount: 0,
          bookmarkCount: 0,
          reviewCount: 0,
        });
      }

      const combination = combinationMap.get(key)!;
      combination.travelCount++;

      const stat = statsData?.find((s) => s.content_id === travel.contentid);
      if (stat) {
        combination.viewCount += stat.view_count || 0;
        combination.bookmarkCount += stat.bookmark_count || 0;
      }

      const reviewCount =
        reviewsData?.filter((r) => r.content_id === travel.contentid).length || 0;
      combination.reviewCount += reviewCount;
    });

    const regionTypeCombinations: RegionTypeCombinationStats[] = Array.from(
      combinationMap.values()
    )
      .map((combination) => ({
        areacode: combination.areacode,
        areaname: formatAreaName(combination.areacode),
        contentTypeId: combination.contentTypeId,
        typeName: formatTypeName(combination.contentTypeId),
        travelCount: combination.travelCount,
        viewCount: combination.viewCount,
        bookmarkCount: combination.bookmarkCount,
        reviewCount: combination.reviewCount,
      }))
      .sort((a, b) => b.travelCount - a.travelCount);

    console.log("[getDetailedRegionTypeStats] 통계 조회 완료:", {
      sigunguCount: sigunguStats.length,
      combinationCount: regionTypeCombinations.length,
    });
    console.groupEnd();

    return {
      success: true,
      sigunguStats,
      regionTypeCombinations,
    };
  } catch (error) {
    console.error("[getDetailedRegionTypeStats] 통계 조회 오류:", error);
    console.groupEnd();
    return {
      success: false,
      error: "통계 데이터를 불러오는데 실패했습니다.",
    };
  }
}

