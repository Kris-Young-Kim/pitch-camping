/**
 * @file get-plan-detail.ts
 * @description 여행 일정 상세 조회 Server Action
 *
 * 특정 여행 일정의 상세 정보와 포함된 여행지 목록을 조회하는 기능
 *
 * 주요 기능:
 * 1. 일정 기본 정보 조회
 * 2. 일정별 여행지 목록 조회 (일차별 정렬)
 * 3. 여행지 상세 정보 포함
 *
 * @dependencies
 * - lib/supabase/server.ts: createClerkSupabaseClient
 * - @clerk/nextjs/server: auth
 * - types/travel.ts: TravelSite 타입
 */

"use server";

import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { auth } from "@clerk/nextjs/server";
import { logInfo, logError } from "@/lib/utils/logger";
import type { TravelSite } from "@/types/travel";
import { TravelApiClient } from "@/lib/api/travel-api";
import { normalizeTravelItems } from "@/lib/utils/travel";

export interface PlanItem {
  id: string;
  contentId: string;
  dayNumber: number;
  orderIndex: number;
  visitDate: string | null;
  visitTime: string | null;
  notes: string | null;
  travel: TravelSite | null;
}

export interface TravelPlanDetail {
  id: string;
  title: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  status: "draft" | "planned" | "in_progress" | "completed" | "cancelled";
  isPublic: boolean;
  shareToken: string | null;
  items: PlanItem[];
  createdAt: string;
  updatedAt: string;
}

/**
 * 여행 일정 상세 조회
 * @param planId 일정 ID
 * @param shareToken 공유 토큰 (공개 일정 접근용, 선택적)
 * @returns 일정 상세 정보
 */
export async function getTravelPlanDetail(
  planId: string,
  shareToken?: string
): Promise<TravelPlanDetail | null> {
  console.group("[getTravelPlanDetail] 일정 상세 조회 시작");
  logInfo("[getTravelPlanDetail] 일정 상세 조회", { planId, hasShareToken: !!shareToken });

  try {
    const { userId } = await auth();
    const supabase = await createClerkSupabaseClient();

    // 일정 조회
    let planQuery = supabase
      .from("travel_plans")
      .select("id, title, description, start_date, end_date, status, is_public, share_token, user_id, created_at, updated_at")
      .eq("id", planId);

    // 공유 토큰이 있으면 공개 일정으로 접근
    if (shareToken) {
      planQuery = planQuery.eq("share_token", shareToken).eq("is_public", true);
    }

    const { data: plan, error: planError } = await planQuery.single();

    if (planError || !plan) {
      console.error("[getTravelPlanDetail] 일정 조회 실패:", planError);
      logError(
        "[getTravelPlanDetail] 일정 조회 실패",
        planError instanceof Error ? planError : new Error(String(planError))
      );
      return null;
    }

    // 권한 확인 (공개 일정이 아니면 소유자만 접근 가능)
    if (!plan.is_public) {
      if (!userId) {
        console.warn("[getTravelPlanDetail] 인증되지 않은 사용자");
        return null;
      }

      const { data: userData } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", userId)
        .single();

      if (!userData || plan.user_id !== userData.id) {
        console.warn("[getTravelPlanDetail] 권한 없음");
        return null;
      }
    }

    // 일정별 여행지 목록 조회
    const { data: items, error: itemsError } = await supabase
      .from("travel_plan_items")
      .select("id, content_id, day_number, order_index, visit_date, visit_time, notes")
      .eq("plan_id", planId)
      .order("day_number", { ascending: true })
      .order("order_index", { ascending: true });

    if (itemsError) {
      console.error("[getTravelPlanDetail] 여행지 목록 조회 실패:", itemsError);
      logError(
        "[getTravelPlanDetail] 여행지 목록 조회 실패",
        itemsError instanceof Error ? itemsError : new Error(String(itemsError))
      );
      return null;
    }

    // 여행지 상세 정보 조회
    const travelApi = new TravelApiClient();
    const planItems: PlanItem[] = await Promise.all(
      (items || []).map(async (item) => {
        let travel: TravelSite | null = null;

        try {
          const detail = await travelApi.getTravelDetail(item.content_id);
          if (detail.response?.body?.items?.item) {
            const normalized = normalizeTravelItems(detail.response.body.items.item);
            if (normalized.length > 0) {
              travel = normalized[0];
            }
          }
        } catch (error) {
          console.warn(`[getTravelPlanDetail] 여행지 ${item.content_id} 조회 실패:`, error);
          // TourAPI 실패 시 Supabase에서 조회 시도
          try {
            const serviceClient = getServiceRoleClient();
            const { data: travelData } = await serviceClient
              .from("travels")
              .select("*")
              .eq("contentid", item.content_id)
              .single();

            if (travelData) {
              travel = {
                contentid: travelData.contentid,
                contenttypeid: travelData.contenttypeid,
                title: travelData.title,
                addr1: travelData.addr1,
                addr2: travelData.addr2,
                mapx: travelData.mapx,
                mapy: travelData.mapy,
                firstimage: travelData.firstimage,
                firstimage2: travelData.firstimage2,
                tel: travelData.tel,
                homepage: travelData.homepage,
                cat1: travelData.cat1,
                cat2: travelData.cat2,
                cat3: travelData.cat3,
                areacode: travelData.areacode,
                sigungucode: travelData.sigungucode,
                zipcode: travelData.zipcode,
                overview: travelData.overview,
              };
            }
          } catch (supabaseError) {
            console.error(`[getTravelPlanDetail] Supabase 조회 실패 (${item.content_id}):`, supabaseError);
          }
        }

        return {
          id: item.id,
          contentId: item.content_id,
          dayNumber: item.day_number,
          orderIndex: item.order_index,
          visitDate: item.visit_date,
          visitTime: item.visit_time,
          notes: item.notes,
          travel,
        };
      })
    );

    const planDetail: TravelPlanDetail = {
      id: plan.id,
      title: plan.title,
      description: plan.description,
      startDate: plan.start_date,
      endDate: plan.end_date,
      status: plan.status as TravelPlanDetail["status"],
      isPublic: plan.is_public,
      shareToken: plan.share_token,
      items: planItems,
      createdAt: plan.created_at,
      updatedAt: plan.updated_at,
    };

    console.log("[getTravelPlanDetail] 일정 상세 조회 완료");
    logInfo("[getTravelPlanDetail] 일정 상세 조회 완료", {
      planId: planDetail.id,
      itemCount: planDetail.items.length,
    });
    console.groupEnd();

    return planDetail;
  } catch (error) {
    console.error("[getTravelPlanDetail] 일정 상세 조회 오류:", error);
    logError(
      "[getTravelPlanDetail] 일정 상세 조회 오류",
      error instanceof Error ? error : new Error(String(error))
    );
    console.groupEnd();
    return null;
  }
}

