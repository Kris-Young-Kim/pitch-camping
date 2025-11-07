/**
 * @file add-item.ts
 * @description 여행 일정에 여행지 추가 Server Action
 *
 * 북마크한 여행지를 일정에 추가하는 기능
 *
 * 주요 기능:
 * 1. 일정에 여행지 추가
 * 2. 일차 및 순서 설정
 * 3. 방문 날짜/시간 설정
 *
 * @dependencies
 * - lib/supabase/server.ts: createClerkSupabaseClient
 * - @clerk/nextjs/server: auth
 */

"use server";

import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";
import { logInfo, logError } from "@/lib/utils/logger";

export interface AddPlanItemInput {
  planId: string;
  contentId: string;
  dayNumber: number;
  orderIndex?: number;
  visitDate?: string; // YYYY-MM-DD 형식
  visitTime?: string; // HH:MM 형식
  notes?: string;
}

export interface AddPlanItemResult {
  success: boolean;
  itemId?: string;
  error?: string;
}

/**
 * 여행 일정에 여행지 추가
 * @param input 여행지 정보
 * @returns 추가 결과
 */
export async function addPlanItem(
  input: AddPlanItemInput
): Promise<AddPlanItemResult> {
  console.group("[addPlanItem] 일정에 여행지 추가 시작");
  logInfo("[addPlanItem] 일정에 여행지 추가", {
    planId: input.planId,
    contentId: input.contentId,
    dayNumber: input.dayNumber,
  });

  try {
    const { userId } = await auth();

    if (!userId) {
      console.warn("[addPlanItem] 인증되지 않은 사용자");
      logInfo("[addPlanItem] 인증되지 않은 사용자");
      return {
        success: false,
        error: "로그인이 필요합니다",
      };
    }

    if (input.dayNumber < 1) {
      return {
        success: false,
        error: "일차는 1 이상이어야 합니다",
      };
    }

    const supabase = await createClerkSupabaseClient();

    // 사용자 ID 조회
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", userId)
      .single();

    if (userError || !userData) {
      console.error("[addPlanItem] 사용자 조회 실패:", userError);
      logError(
        "[addPlanItem] 사용자 조회 실패",
        userError instanceof Error ? userError : new Error(String(userError))
      );
      return {
        success: false,
        error: "사용자 정보를 찾을 수 없습니다",
      };
    }

    // 일정 소유권 확인
    const { data: plan, error: planError } = await supabase
      .from("travel_plans")
      .select("id, user_id")
      .eq("id", input.planId)
      .single();

    if (planError || !plan) {
      console.error("[addPlanItem] 일정 조회 실패:", planError);
      logError(
        "[addPlanItem] 일정 조회 실패",
        planError instanceof Error ? planError : new Error(String(planError))
      );
      return {
        success: false,
        error: "일정을 찾을 수 없습니다",
      };
    }

    if (plan.user_id !== userData.id) {
      console.warn("[addPlanItem] 권한 없음");
      logInfo("[addPlanItem] 권한 없음");
      return {
        success: false,
        error: "이 일정을 수정할 권한이 없습니다",
      };
    }

    // 같은 일차 내 최대 order_index 조회
    const { data: existingItems } = await supabase
      .from("travel_plan_items")
      .select("order_index")
      .eq("plan_id", input.planId)
      .eq("day_number", input.dayNumber)
      .order("order_index", { ascending: false })
      .limit(1);

    const maxOrderIndex = existingItems && existingItems.length > 0
      ? existingItems[0].order_index
      : -1;

    const orderIndex = input.orderIndex !== undefined
      ? input.orderIndex
      : maxOrderIndex + 1;

    // 여행지 추가
    const { data: item, error: insertError } = await supabase
      .from("travel_plan_items")
      .insert({
        plan_id: input.planId,
        content_id: input.contentId,
        day_number: input.dayNumber,
        order_index: orderIndex,
        visit_date: input.visitDate || null,
        visit_time: input.visitTime || null,
        notes: input.notes?.trim() || null,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("[addPlanItem] 여행지 추가 실패:", insertError);
      
      // 중복 추가 에러 처리
      if (insertError.code === "23505") {
        return {
          success: false,
          error: "이미 해당 일차에 추가된 여행지입니다",
        };
      }

      logError(
        "[addPlanItem] 여행지 추가 실패",
        insertError instanceof Error ? insertError : new Error(String(insertError))
      );
      return {
        success: false,
        error: "여행지 추가에 실패했습니다",
      };
    }

    console.log("[addPlanItem] 여행지 추가 완료:", item.id);
    logInfo("[addPlanItem] 여행지 추가 완료", { itemId: item.id });
    return {
      success: true,
      itemId: item.id,
    };
  } catch (error) {
    console.error("[addPlanItem] 여행지 추가 오류:", error);
    logError(
      "[addPlanItem] 여행지 추가 오류",
      error instanceof Error ? error : new Error(String(error))
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다",
    };
  } finally {
    console.groupEnd();
  }
}

