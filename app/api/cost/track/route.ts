/**
 * @file app/api/cost/track/route.ts
 * @description API 사용량 및 비용 기록 API Route
 */

import { NextRequest, NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";

export async function POST(request: NextRequest) {
  console.group("[CostTrack] 사용량 기록 요청");

  try {
    const body = await request.json();
    const { serviceName, operationType, endpoint, costPerUnit, units, totalCost, metadata } = body;

    if (!serviceName || !operationType) {
      console.warn("[CostTrack] 필수 파라미터 누락");
      console.groupEnd();
      return NextResponse.json(
        { error: "필수 파라미터가 누락되었습니다." },
        { status: 400 }
      );
    }

    const supabase = getServiceRoleClient();

    const { error } = await supabase.from("api_usage_logs").insert({
      service_name: serviceName,
      operation_type: operationType,
      endpoint: endpoint || null,
      cost_per_unit: Number(costPerUnit) || 0,
      units: Number(units) || 1,
      total_cost: Number(totalCost) || 0,
      metadata: metadata || {},
    });

    if (error) {
      console.error("[CostTrack] 사용량 기록 실패:", error);
      console.groupEnd();
      return NextResponse.json({ error: "사용량 기록에 실패했습니다." }, { status: 500 });
    }

    console.log("[CostTrack] 사용량 기록 완료:", { serviceName, operationType, totalCost });
    console.groupEnd();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CostTrack] 사용량 기록 오류:", error);
    console.groupEnd();
    return NextResponse.json(
      { error: "사용량 기록 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

