/**
 * @file get-plans.ts
 * @description 여행 일정 목록 조회 Server Action
 *
 * 사용자의 여행 일정 목록을 조회하는 기능
 *
 * 주요 기능:
 * 1. 사용자별 일정 목록 조회
 * 2. 일정별 여행지 개수 포함
 * 3. 정렬 및 필터링 지원
 *
 * @dependencies
 * - lib/supabase/server.ts: createClerkSupabaseClient
 * - @clerk/nextjs/server: auth
 */

"use server";

import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";
import { logInfo, logError } from "@/lib/utils/logger";

export interface TravelPlan {
  id: string;
  title: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  status: "draft" | "planned" | "in_progress" | "completed" | "cancelled";
  isPublic: boolean;
  shareToken: string | null;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 여행 일정 목록 조회
 * @param status 일정 상태 필터 (선택적)
 * @returns 여행 일정 목록
 */
export async function getTravelPlans(
  status?: "draft" | "planned" | "in_progress" | "completed" | "cancelled"
): Promise<TravelPlan[]> {
  console.group("[getTravelPlans] 여행 일정 목록 조회 시작");
  logInfo("[getTravelPlans] 여행 일정 목록 조회", { status });

  try {
    const { userId } = await auth();

    if (!userId) {
      console.warn("[getTravelPlans] 인증되지 않은 사용자");
      logInfo("[getTravelPlans] 인증되지 않은 사용자");
      return [];
    }

    const supabase = await createClerkSupabaseClient();

    // 사용자 ID 조회
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", userId)
      .single();

    if (userError || !userData) {
      console.error("[getTravelPlans] 사용자 조회 실패:", userError);
      logError(
        "[getTravelPlans] 사용자 조회 실패",
        userError instanceof Error ? userError : new Error(String(userError))
      );
      return [];
    }

    // 일정 목록 조회
    let plansQuery = supabase
      .from("travel_plans")
      .select("id, title, description, start_date, end_date, status, is_public, share_token, created_at, updated_at")
      .eq("user_id", userData.id)
      .order("created_at", { ascending: false });

    if (status) {
      plansQuery = plansQuery.eq("status", status);
    }

    const { data: plans, error: plansError } = await plansQuery;

    if (plansError) {
      console.error("[getTravelPlans] 일정 조회 실패:", plansError);
      logError(
        "[getTravelPlans] 일정 조회 실패",
        plansError instanceof Error ? plansError : new Error(String(plansError))
      );
      return [];
    }

    if (!plans || plans.length === 0) {
      console.log("[getTravelPlans] 일정 없음");
      logInfo("[getTravelPlans] 일정 없음");
      return [];
    }

    // 각 일정별 여행지 개수 조회
    const plansWithCount: TravelPlan[] = await Promise.all(
      plans.map(async (plan) => {
        const { count } = await supabase
          .from("travel_plan_items")
          .select("*", { count: "exact", head: true })
          .eq("plan_id", plan.id);

        return {
          id: plan.id,
          title: plan.title,
          description: plan.description,
          startDate: plan.start_date,
          endDate: plan.end_date,
          status: plan.status as TravelPlan["status"],
          isPublic: plan.is_public,
          shareToken: plan.share_token,
          itemCount: count || 0,
          createdAt: plan.created_at,
          updatedAt: plan.updated_at,
        };
      })
    );

    console.log("[getTravelPlans] 일정 개수:", plansWithCount.length);
    logInfo("[getTravelPlans] 일정 목록 조회 완료", {
      totalCount: plansWithCount.length,
    });
    console.groupEnd();

    return plansWithCount;
  } catch (error) {
    console.error("[getTravelPlans] 일정 목록 조회 오류:", error);
    logError(
      "[getTravelPlans] 일정 목록 조회 오류",
      error instanceof Error ? error : new Error(String(error))
    );
    console.groupEnd();
    return [];
  }
}

