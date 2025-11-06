/**
 * @file ranking.ts
 * @description 인기도 및 랭킹 계산 유틸리티
 *
 * 캠핑장의 인기도 점수를 계산하고 랭킹을 산출하는 함수들
 *
 * 주요 기능:
 * 1. 인기도 점수 계산 (조회수, 북마크 수 가중치)
 * 2. 랭킹 조회 (지역별, 타입별)
 * 3. 인기 캠핑장 목록 조회
 *
 * @dependencies
 * - lib/supabase/server.ts: createClerkSupabaseClient
 * - lib/utils/popularity.ts: calculatePopularityScore
 */

"use server";

import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { calculatePopularityScore } from "@/lib/utils/popularity";

export interface CampingRanking {
  contentId: string;
  facltNm: string;
  popularityScore: number;
  viewCount: number;
  bookmarkCount: number;
  shareCount: number;
}

/**
 * 인기 캠핑장 목록 조회
 * @param limit 조회할 개수 (기본값: 10)
 * @param region 지역 필터 (선택적)
 * @returns 인기 캠핑장 목록
 */
export async function getPopularCampings(
  limit: number = 10,
  region?: string,
): Promise<CampingRanking[]> {
  console.group(
    `[Ranking] 인기 캠핑장 조회: limit=${limit}, region=${region || "전체"}`,
  );

  try {
    const supabase = await createClerkSupabaseClient();

    // 통계 데이터 조회
    const query = supabase
      .from("camping_stats")
      .select("*")
      .order("bookmark_count", { ascending: false })
      .order("view_count", { ascending: false })
      .limit(limit);

    const { data: stats, error } = await query;

    if (error) {
      console.error("[Ranking] 통계 조회 실패:", error);
      return [];
    }

    if (!stats || stats.length === 0) {
      console.log("[Ranking] 통계 데이터 없음");
      return [];
    }

    // 인기도 점수 계산
    const rankings: CampingRanking[] = stats.map((stat) => ({
      contentId: stat.content_id,
      facltNm: "", // 나중에 고캠핑 API에서 조회 필요
      popularityScore: calculatePopularityScore(
        stat.view_count || 0,
        stat.bookmark_count || 0,
        stat.share_count || 0,
      ),
      viewCount: stat.view_count || 0,
      bookmarkCount: stat.bookmark_count || 0,
      shareCount: stat.share_count || 0,
    }));

    // 인기도 점수 순으로 정렬
    rankings.sort((a, b) => b.popularityScore - a.popularityScore);

    console.log(`[Ranking] 인기 캠핑장 ${rankings.length}개 조회 완료`);
    return rankings;
  } catch (error) {
    console.error("[Ranking] 인기 캠핑장 조회 오류:", error);
    return [];
  } finally {
    console.groupEnd();
  }
}

/**
 * 지역별 인기 캠핑장 조회
 * @param region 지역명 (예: "서울", "경기")
 * @param limit 조회할 개수 (기본값: 10)
 * @returns 인기 캠핑장 목록
 */
export async function getPopularCampingsByRegion(
  region: string,
  limit: number = 10,
): Promise<CampingRanking[]> {
  console.log(`[Ranking] 지역별 인기 캠핑장 조회: ${region}`);

  // TODO: 지역 필터링을 위해서는 고캠핑 API를 통해 해당 지역의 캠핑장 목록을 먼저 조회한 후
  // 통계 데이터와 조인해야 함
  // 현재는 전체 인기 캠핑장을 반환
  return getPopularCampings(limit);
}

/**
 * 캠핑 타입별 인기 캠핑장 조회
 * @param campingType 캠핑 타입 (예: "일반야영장", "글램핑")
 * @param limit 조회할 개수 (기본값: 10)
 * @returns 인기 캠핑장 목록
 */
export async function getPopularCampingsByType(
  campingType: string,
  limit: number = 10,
): Promise<CampingRanking[]> {
  console.log(`[Ranking] 타입별 인기 캠핑장 조회: ${campingType}`);

  // TODO: 타입 필터링을 위해서는 고캠핑 API를 통해 해당 타입의 캠핑장 목록을 먼저 조회한 후
  // 통계 데이터와 조인해야 함
  // 현재는 전체 인기 캠핑장을 반환
  return getPopularCampings(limit);
}
