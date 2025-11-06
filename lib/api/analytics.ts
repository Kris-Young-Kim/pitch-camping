/**
 * @file analytics.ts
 * @description 분석 및 통계 추적 유틸리티
 *
 * 캠핑장 조회수, 사용자 활동 등을 추적하는 함수들
 *
 * 주요 기능:
 * 1. 캠핑장 조회수 증가
 * 2. 사용자 활동 기록
 * 3. 통계 데이터 조회
 *
 * @dependencies
 * - lib/supabase/server.ts: createClerkSupabaseClient
 * - lib/supabase/clerk-client.ts: useClerkSupabaseClient (클라이언트용)
 */

"use server";

import { createClerkSupabaseClient } from "@/lib/supabase/server";

/**
 * 캠핑장 조회수 증가
 * @param contentId 고캠핑 API contentId
 */
export async function trackView(contentId: string): Promise<void> {
  console.group(`[Analytics] 조회수 추적: ${contentId}`);

  try {
    const supabase = await createClerkSupabaseClient();

    // camping_stats 테이블에 조회수 증가
    const { error: statsError } = await supabase.rpc("increment_view_count", {
      p_content_id: contentId,
    });

    // RPC 함수가 없으면 직접 업데이트
    if (statsError) {
      console.log("[Analytics] RPC 함수 없음, 직접 업데이트 시도");
      
      const { error: upsertError } = await supabase
        .from("camping_stats")
        .upsert(
          {
            content_id: contentId,
            view_count: 1,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "content_id",
            ignoreDuplicates: false,
          }
        );

      if (upsertError) {
        // 레코드가 없으면 INSERT, 있으면 UPDATE
        const { data: existing } = await supabase
          .from("camping_stats")
          .select("view_count")
          .eq("content_id", contentId)
          .single();

        if (existing) {
          // 기존 레코드 업데이트
          const { error: updateError } = await supabase
            .from("camping_stats")
            .update({
              view_count: (existing.view_count || 0) + 1,
              last_viewed_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("content_id", contentId);

          if (updateError) {
            console.error("[Analytics] 조회수 업데이트 실패:", updateError);
          }
        } else {
          // 새 레코드 생성
          const { error: insertError } = await supabase
            .from("camping_stats")
            .insert({
              content_id: contentId,
              view_count: 1,
              last_viewed_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });

          if (insertError) {
            console.error("[Analytics] 조회수 생성 실패:", insertError);
          }
        }
      }
    }

    console.log("[Analytics] 조회수 추적 완료");
  } catch (error) {
    console.error("[Analytics] 조회수 추적 오류:", error);
    // 에러가 발생해도 사용자 경험에 영향을 주지 않도록 조용히 실패
  } finally {
    console.groupEnd();
  }
}

/**
 * 사용자 활동 기록
 * @param contentId 고캠핑 API contentId
 * @param activityType 활동 유형 ('view', 'bookmark', 'share')
 * @param userId 사용자 ID (선택적, 비인증 사용자는 null)
 */
export async function trackActivity(
  contentId: string,
  activityType: "view" | "bookmark" | "share",
  userId?: string | null
): Promise<void> {
  console.group(`[Analytics] 사용자 활동 기록: ${activityType} - ${contentId}`);

  try {
    const supabase = await createClerkSupabaseClient();

    const { error } = await supabase.from("user_activity").insert({
      user_id: userId || null,
      content_id: contentId,
      activity_type: activityType,
    });

    if (error) {
      console.error("[Analytics] 활동 기록 실패:", error);
    } else {
      console.log("[Analytics] 활동 기록 완료");
    }
  } catch (error) {
    console.error("[Analytics] 활동 기록 오류:", error);
  } finally {
    console.groupEnd();
  }
}

/**
 * 캠핑장 통계 조회
 * @param contentId 고캠핑 API contentId
 * @returns 통계 데이터 또는 null
 */
export async function getCampingStats(contentId: string) {
  console.log(`[Analytics] 통계 조회: ${contentId}`);

  try {
    const supabase = await createClerkSupabaseClient();

    const { data, error } = await supabase
      .from("camping_stats")
      .select("*")
      .eq("content_id", contentId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("[Analytics] 통계 조회 실패:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("[Analytics] 통계 조회 오류:", error);
    return null;
  }
}

