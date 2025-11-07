/**
 * @file app/api/performance/error/route.ts
 * @description 에러 로그 기록 API Route
 */

import { NextRequest, NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  console.group("[PerformanceError] 에러 로그 기록 요청");

  try {
    const body = await request.json();
    const { errorType, errorMessage, errorStack, endpoint, metadata } = body;

    if (!errorType || !errorMessage) {
      console.warn("[PerformanceError] 필수 파라미터 누락");
      console.groupEnd();
      return NextResponse.json(
        { error: "필수 파라미터가 누락되었습니다." },
        { status: 400 }
      );
    }

    // 사용자 ID 가져오기 (선택적)
    let userId: string | null = null;
    try {
      const { userId: clerkUserId } = await auth();
      if (clerkUserId) {
        const supabase = getServiceRoleClient();
        const { data: userData } = await supabase
          .from("users")
          .select("id")
          .eq("clerk_id", clerkUserId)
          .single();
        userId = userData?.id || null;
      }
    } catch {
      // 인증 실패는 무시 (비인증 사용자도 에러 로그 기록 가능)
    }

    const supabase = getServiceRoleClient();

    const { error } = await supabase.from("error_logs").insert({
      error_type: errorType,
      error_message: errorMessage,
      error_stack: errorStack || null,
      endpoint: endpoint || null,
      user_id: userId,
      metadata: metadata || {},
    });

    if (error) {
      console.error("[PerformanceError] 에러 로그 기록 실패:", error);
      console.groupEnd();
      return NextResponse.json({ error: "에러 로그 기록에 실패했습니다." }, { status: 500 });
    }

    console.log("[PerformanceError] 에러 로그 기록 완료:", { errorType, endpoint });
    console.groupEnd();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PerformanceError] 에러 로그 기록 오류:", error);
    console.groupEnd();
    return NextResponse.json(
      { error: "에러 로그 기록 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

