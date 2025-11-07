/**
 * @file app/api/performance/track/route.ts
 * @description 성능 메트릭 기록 API Route
 */

import { NextRequest, NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";

export async function POST(request: NextRequest) {
  console.group("[PerformanceTrack] 메트릭 기록 요청");

  try {
    const body = await request.json();
    const { metricType, metricName, value, endpoint, metadata } = body;

    if (!metricType || !metricName || value === undefined) {
      console.warn("[PerformanceTrack] 필수 파라미터 누락");
      console.groupEnd();
      return NextResponse.json(
        { error: "필수 파라미터가 누락되었습니다." },
        { status: 400 }
      );
    }

    const supabase = getServiceRoleClient();

    const { error } = await supabase.from("performance_metrics").insert({
      metric_type: metricType,
      metric_name: metricName,
      endpoint: endpoint || null,
      value: Number(value),
      unit: "ms",
      metadata: metadata || {},
    });

    if (error) {
      console.error("[PerformanceTrack] 메트릭 기록 실패:", error);
      console.groupEnd();
      return NextResponse.json({ error: "메트릭 기록에 실패했습니다." }, { status: 500 });
    }

    console.log("[PerformanceTrack] 메트릭 기록 완료:", { metricType, metricName, value });
    console.groupEnd();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PerformanceTrack] 메트릭 기록 오류:", error);
    console.groupEnd();
    return NextResponse.json({ error: "메트릭 기록 중 오류가 발생했습니다." }, { status: 500 });
  }
}

