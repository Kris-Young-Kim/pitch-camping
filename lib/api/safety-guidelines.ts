/**
 * @file safety-guidelines.ts
 * @description 안전 수칙 API 함수
 *
 * 캠핑 안전 수칙 조회 및 관리를 위한 API 함수
 *
 * 주요 기능:
 * 1. 계절별 안전 수칙 조회
 * 2. 주제별 안전 수칙 조회
 * 3. 안전 수칙 검색
 * 4. 안전 수칙 상세 조회
 * 5. 조회수 추적
 *
 * @dependencies
 * - lib/supabase/server.ts: createClerkSupabaseClient (서버 사이드)
 * - lib/supabase/clerk-client.ts: useClerkSupabaseClient (클라이언트 사이드)
 */

import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { logError, logInfo } from "@/lib/utils/logger";

export interface SafetyGuideline {
  id: string;
  title: string;
  content: string;
  season: "spring" | "summer" | "autumn" | "winter" | "all" | null;
  topic: string;
  image_url: string | null;
  video_url: string | null;
  video_type: "youtube" | "external" | "internal" | null;
  source_url: string | null;
  view_count: number;
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SafetyGuidelineFilter {
  season?: "spring" | "summer" | "autumn" | "winter" | "all";
  topic?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * 안전 수칙 목록 조회 (서버 사이드)
 * @param filter 필터 옵션
 * @returns 안전 수칙 목록
 */
export async function getSafetyGuidelines(
  filter: SafetyGuidelineFilter = {}
): Promise<SafetyGuideline[]> {
  logInfo("[SafetyGuidelines] 안전 수칙 목록 조회", { filter });

  try {
    const supabase = createClerkSupabaseClient();

    let query = supabase
      .from("safety_guidelines")
      .select("*")
      .eq("is_active", true)
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false });

    // 계절 필터
    if (filter.season && filter.season !== "all") {
      query = query.or(`season.eq.${filter.season},season.eq.all`);
    }

    // 주제 필터
    if (filter.topic) {
      query = query.eq("topic", filter.topic);
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
      logError("[SafetyGuidelines] 안전 수칙 조회 실패", error, { filter });
      throw error;
    }

    logInfo("[SafetyGuidelines] 안전 수칙 조회 완료", { count: data?.length || 0 });
    return (data || []) as SafetyGuideline[];
  } catch (error) {
    logError("[SafetyGuidelines] 안전 수칙 조회 오류", error, { filter });
    return [];
  }
}

/**
 * 안전 수칙 상세 조회 (서버 사이드)
 * @param id 안전 수칙 ID
 * @returns 안전 수칙 상세 정보
 */
export async function getSafetyGuidelineById(id: string): Promise<SafetyGuideline | null> {
  logInfo("[SafetyGuidelines] 안전 수칙 상세 조회", { id });

  try {
    const supabase = createClerkSupabaseClient();

    const { data, error } = await supabase
      .from("safety_guidelines")
      .select("*")
      .eq("id", id)
      .eq("is_active", true)
      .single();

    if (error) {
      logError("[SafetyGuidelines] 안전 수칙 상세 조회 실패", error, { id });
      if (error.code === "PGRST116") {
        return null; // 데이터 없음
      }
      throw error;
    }

    logInfo("[SafetyGuidelines] 안전 수칙 상세 조회 완료", { id, title: data?.title });
    return data as SafetyGuideline;
  } catch (error) {
    logError("[SafetyGuidelines] 안전 수칙 상세 조회 오류", error, { id });
    return null;
  }
}

/**
 * 계절별 안전 수칙 조회
 * @param season 계절 (spring, summer, autumn, winter)
 * @returns 안전 수칙 목록
 */
export async function getSafetyGuidelinesBySeason(
  season: "spring" | "summer" | "autumn" | "winter"
): Promise<SafetyGuideline[]> {
  return getSafetyGuidelines({ season });
}

/**
 * 주제별 안전 수칙 조회
 * @param topic 주제
 * @returns 안전 수칙 목록
 */
export async function getSafetyGuidelinesByTopic(topic: string): Promise<SafetyGuideline[]> {
  return getSafetyGuidelines({ topic });
}

/**
 * 안전 수칙 검색
 * @param search 검색어
 * @param limit 결과 개수 제한
 * @returns 안전 수칙 목록
 */
export async function searchSafetyGuidelines(
  search: string,
  limit: number = 20
): Promise<SafetyGuideline[]> {
  return getSafetyGuidelines({ search, limit });
}

/**
 * 안전 수칙 조회수 증가 (서버 사이드)
 * @param id 안전 수칙 ID
 */
export async function incrementSafetyGuidelineView(id: string): Promise<void> {
  logInfo("[SafetyGuidelines] 조회수 증가", { id });

  try {
    const supabase = createClerkSupabaseClient();

    const { error } = await supabase.rpc("increment_safety_guideline_view_count", {
      guideline_id: id,
    });

    if (error) {
      logError("[SafetyGuidelines] 조회수 증가 실패", error, { id });
      // 조회수 증가 실패는 치명적이지 않으므로 에러를 던지지 않음
    } else {
      logInfo("[SafetyGuidelines] 조회수 증가 완료", { id });
    }
  } catch (error) {
    logError("[SafetyGuidelines] 조회수 증가 오류", error, { id });
    // 조회수 증가 실패는 치명적이지 않으므로 에러를 던지지 않음
  }
}

/**
 * 현재 계절에 맞는 안전 수칙 추천
 * @param limit 결과 개수 제한
 * @returns 안전 수칙 목록
 */
export async function getRecommendedSafetyGuidelines(limit: number = 5): Promise<SafetyGuideline[]> {
  // 현재 월 구하기 (1-12)
  const currentMonth = new Date().getMonth() + 1;

  // 계절 판단
  let season: "spring" | "summer" | "autumn" | "winter" | "all";
  if (currentMonth >= 3 && currentMonth <= 5) {
    season = "spring";
  } else if (currentMonth >= 6 && currentMonth <= 8) {
    season = "summer";
  } else if (currentMonth >= 9 && currentMonth <= 11) {
    season = "autumn";
  } else {
    season = "winter";
  }

  logInfo("[SafetyGuidelines] 추천 안전 수칙 조회", { season, currentMonth });

  return getSafetyGuidelines({ season, limit });
}

