/**
 * @file create-plan.ts
 * @description 여행 일정 생성 Server Action
 *
 * 새로운 여행 일정을 생성하는 기능
 *
 * 주요 기능:
 * 1. 여행 일정 생성
 * 2. 일정 제목, 설명, 날짜 설정
 * 3. 공개 여부 설정
 *
 * @dependencies
 * - lib/supabase/server.ts: createClerkSupabaseClient
 * - @clerk/nextjs/server: auth
 */

"use server";

import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";
import { logInfo, logError } from "@/lib/utils/logger";

export interface CreateTravelPlanInput {
  title: string;
  description?: string;
  startDate?: string; // YYYY-MM-DD 형식
  endDate?: string; // YYYY-MM-DD 형식
  isPublic?: boolean;
}

export interface CreateTravelPlanResult {
  success: boolean;
  planId?: string;
  error?: string;
}

/**
 * 여행 일정 생성
 * @param input 일정 정보
 * @returns 생성 결과
 */
export async function createTravelPlan(
  input: CreateTravelPlanInput
): Promise<CreateTravelPlanResult> {
  console.group("[createTravelPlan] 여행 일정 생성 시작");
  logInfo("[createTravelPlan] 여행 일정 생성", { title: input.title });

  try {
    const { userId } = await auth();

    if (!userId) {
      console.warn("[createTravelPlan] 인증되지 않은 사용자");
      logInfo("[createTravelPlan] 인증되지 않은 사용자");
      return {
        success: false,
        error: "로그인이 필요합니다",
      };
    }

    if (!input.title || input.title.trim().length === 0) {
      return {
        success: false,
        error: "일정 제목을 입력해주세요",
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
      console.error("[createTravelPlan] 사용자 조회 실패:", userError);
      logError(
        "[createTravelPlan] 사용자 조회 실패",
        userError instanceof Error ? userError : new Error(String(userError))
      );
      return {
        success: false,
        error: "사용자 정보를 찾을 수 없습니다",
      };
    }

    // 일정 생성
    const { data: plan, error: createError } = await supabase
      .from("travel_plans")
      .insert({
        user_id: userData.id,
        title: input.title.trim(),
        description: input.description?.trim() || null,
        start_date: input.startDate || null,
        end_date: input.endDate || null,
        is_public: input.isPublic || false,
        status: "draft",
      })
      .select("id")
      .single();

    if (createError) {
      console.error("[createTravelPlan] 일정 생성 실패:", createError);
      logError(
        "[createTravelPlan] 일정 생성 실패",
        createError instanceof Error ? createError : new Error(String(createError))
      );
      return {
        success: false,
        error: "일정 생성에 실패했습니다",
      };
    }

    console.log("[createTravelPlan] 일정 생성 완료:", plan.id);
    logInfo("[createTravelPlan] 일정 생성 완료", { planId: plan.id });
    return {
      success: true,
      planId: plan.id,
    };
  } catch (error) {
    console.error("[createTravelPlan] 일정 생성 오류:", error);
    logError(
      "[createTravelPlan] 일정 생성 오류",
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

