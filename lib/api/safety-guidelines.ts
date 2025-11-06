/**
 * @file safety-guidelines.ts
 * @description 여행 안전 정보 API 함수
 *
 * 여행 안전 정보 조회 및 관리를 위한 API 함수
 *
 * 주요 기능:
 * 1. 여행 유형별 안전 정보 조회
 * 2. 주제별 안전 정보 조회
 * 3. 안전 정보 검색
 * 4. 지역/국가별 안전 정보 조회
 * 5. 안전 정보 상세 조회
 * 6. 조회수 추적
 *
 * @dependencies
 * - lib/supabase/server.ts: createClerkSupabaseClient (서버 사이드)
 * - lib/supabase/clerk-client.ts: useClerkSupabaseClient (클라이언트 사이드)
 */

import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { logError, logInfo } from "@/lib/utils/logger";

export interface TravelSafetyGuideline {
  id: string;
  title: string;
  content: string;
  travel_type: "domestic" | "overseas" | "free" | "package" | "all" | null;
  topic: string;
  region: string | null;
  country_code: string | null;
  image_url: string | null;
  video_url: string | null;
  video_type: "youtube" | "external" | "internal" | null;
  source_url: string | null;
  source_name: string | null;
  view_count: number;
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TravelSafetyGuidelineFilter {
  travel_type?: "domestic" | "overseas" | "free" | "package" | "all";
  topic?: string;
  region?: string;
  country_code?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * 여행 안전 정보 목록 조회 (서버 사이드)
 * @param filter 필터 옵션
 * @returns 여행 안전 정보 목록
 */
export async function getTravelSafetyGuidelines(
  filter: TravelSafetyGuidelineFilter = {}
): Promise<TravelSafetyGuideline[]> {
  // 빌드 시점에는 조용히 빈 배열 반환 (Supabase 연결 불가)
  const isBuildTime = process.env.NEXT_PHASE === "phase-production-build";
  
  if (isBuildTime) {
    return [];
  }

  logInfo("[TravelSafetyGuidelines] 여행 안전 정보 목록 조회", { filter });

  try {
    const supabase = createClerkSupabaseClient();

    let query = supabase
      .from("travel_safety_guidelines")
      .select("*")
      .eq("is_active", true)
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false });

    // 여행 유형 필터
    if (filter.travel_type && filter.travel_type !== "all") {
      query = query.or(`travel_type.eq.${filter.travel_type},travel_type.eq.all`);
    }

    // 주제 필터
    if (filter.topic) {
      query = query.eq("topic", filter.topic);
    }

    // 지역 필터
    if (filter.region) {
      query = query.eq("region", filter.region);
    }

    // 국가 코드 필터
    if (filter.country_code) {
      query = query.eq("country_code", filter.country_code);
    }

    // 검색 필터
    if (filter.search) {
      query = query.or(`title.ilike.%${filter.search}%,content.ilike.%${filter.search}%`);
    }

    // 페이지네이션
    if (filter.limit) {
      query = query.limit(filter.limit);
    }
    if (filter.offset) {
      query = query.range(filter.offset, filter.offset + (filter.limit || 20) - 1);
    }

    const { data, error } = await query;

    if (error) {
      // 테이블이 없거나 연결 실패 시 조용히 빈 배열 반환
      if (error.code === "PGRST116" || error.code === "42P01") {
        // 테이블이 존재하지 않음
        return [];
      }
      logError("[TravelSafetyGuidelines] 여행 안전 정보 조회 실패", error, { filter });
      return [];
    }

    logInfo("[TravelSafetyGuidelines] 여행 안전 정보 조회 완료", { count: data?.length || 0 });
    return (data || []) as TravelSafetyGuideline[];
  } catch (error) {
    // 빌드 시점이 아닐 때만 로그 출력
    if (!isBuildTime) {
      logError("[TravelSafetyGuidelines] 여행 안전 정보 조회 오류", error, { filter });
    }
    return [];
  }
}

/**
 * 여행 안전 정보 상세 조회 (서버 사이드)
 * @param id 여행 안전 정보 ID
 * @returns 여행 안전 정보 상세 정보
 */
export async function getTravelSafetyGuidelineById(id: string): Promise<TravelSafetyGuideline | null> {
  logInfo("[TravelSafetyGuidelines] 여행 안전 정보 상세 조회", { id });

  try {
    const supabase = createClerkSupabaseClient();

    const { data, error } = await supabase
      .from("travel_safety_guidelines")
      .select("*")
      .eq("id", id)
      .eq("is_active", true)
      .single();

    if (error) {
      logError("[TravelSafetyGuidelines] 여행 안전 정보 상세 조회 실패", error, { id });
      if (error.code === "PGRST116") {
        return null; // 데이터 없음
      }
      throw error;
    }

    logInfo("[TravelSafetyGuidelines] 여행 안전 정보 상세 조회 완료", { id, title: data?.title });
    return data as TravelSafetyGuideline;
  } catch (error) {
    logError("[TravelSafetyGuidelines] 여행 안전 정보 상세 조회 오류", error, { id });
    return null;
  }
}

/**
 * 여행 유형별 안전 정보 조회
 * @param travel_type 여행 유형 (domestic, overseas, free, package)
 * @returns 여행 안전 정보 목록
 */
export async function getTravelSafetyGuidelinesByType(
  travel_type: "domestic" | "overseas" | "free" | "package"
): Promise<TravelSafetyGuideline[]> {
  return getTravelSafetyGuidelines({ travel_type });
}

/**
 * 주제별 여행 안전 정보 조회
 * @param topic 주제
 * @returns 여행 안전 정보 목록
 */
export async function getTravelSafetyGuidelinesByTopic(topic: string): Promise<TravelSafetyGuideline[]> {
  return getTravelSafetyGuidelines({ topic });
}

/**
 * 지역/국가별 여행 안전 정보 조회
 * @param region 지역
 * @param country_code 국가 코드 (선택 사항)
 * @returns 여행 안전 정보 목록
 */
export async function getTravelSafetyGuidelinesByRegion(
  region: string,
  country_code?: string
): Promise<TravelSafetyGuideline[]> {
  return getTravelSafetyGuidelines({ region, country_code });
}

/**
 * 여행 안전 정보 검색
 * @param search 검색어
 * @param limit 결과 개수 제한
 * @returns 여행 안전 정보 목록
 */
export async function searchTravelSafetyGuidelines(
  search: string,
  limit: number = 20
): Promise<TravelSafetyGuideline[]> {
  return getTravelSafetyGuidelines({ search, limit });
}

/**
 * 여행 안전 정보 조회수 증가 (서버 사이드)
 * @param id 여행 안전 정보 ID
 */
export async function incrementTravelSafetyGuidelineView(id: string): Promise<void> {
  logInfo("[TravelSafetyGuidelines] 조회수 증가", { id });

  try {
    const supabase = createClerkSupabaseClient();

    const { error } = await supabase.rpc("increment_travel_safety_guideline_view_count", {
      guideline_id: id,
    });

    if (error) {
      logError("[TravelSafetyGuidelines] 조회수 증가 실패", error, { id });
      // 조회수 증가 실패는 치명적이지 않으므로 에러를 던지지 않음
    } else {
      logInfo("[TravelSafetyGuidelines] 조회수 증가 완료", { id });
    }
  } catch (error) {
    logError("[TravelSafetyGuidelines] 조회수 증가 오류", error, { id });
    // 조회수 증가 실패는 치명적이지 않으므로 에러를 던지지 않음
  }
}

/**
 * 추천 여행 안전 정보 조회
 * @param limit 결과 개수 제한
 * @param region 지역 (선택 사항)
 * @returns 여행 안전 정보 목록
 */
export async function getRecommendedTravelSafetyGuidelines(
  limit: number = 5,
  region?: string
): Promise<TravelSafetyGuideline[]> {
  logInfo("[TravelSafetyGuidelines] 추천 여행 안전 정보 조회", { limit, region });

  const filter: TravelSafetyGuidelineFilter = { limit };
  if (region) {
    filter.region = region;
  }

  return getTravelSafetyGuidelines(filter);
}

// 하위 호환성을 위한 별칭 (기존 코드와의 호환성)
export type SafetyGuideline = TravelSafetyGuideline;
export type SafetyGuidelineFilter = TravelSafetyGuidelineFilter;
export const getSafetyGuidelines = getTravelSafetyGuidelines;
export const getSafetyGuidelineById = getTravelSafetyGuidelineById;
export const incrementSafetyGuidelineView = incrementTravelSafetyGuidelineView;
export const getRecommendedSafetyGuidelines = getRecommendedTravelSafetyGuidelines;

