/**
 * @file route.ts
 * @description 안전 수칙 API 라우트
 *
 * 클라이언트 사이드에서 안전 수칙을 조회할 수 있는 API 엔드포인트
 *
 * @dependencies
 * - lib/api/safety-guidelines.ts: getSafetyGuidelines 함수
 */

import { NextRequest, NextResponse } from "next/server";
import { getSafetyGuidelines } from "@/lib/api/safety-guidelines";
import { logError, logInfo } from "@/lib/utils/logger";

export async function GET(request: NextRequest) {
  logInfo("[SafetyGuidelinesAPI] 요청 시작");

  try {
    const searchParams = request.nextUrl.searchParams;
    const season = searchParams.get("season") as
      | "spring"
      | "summer"
      | "autumn"
      | "winter"
      | "all"
      | null;
    const topic = searchParams.get("topic");
    const search = searchParams.get("search");
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;

    const filter: any = {};
    if (season && season !== "all") {
      filter.season = season;
    }
    if (topic && topic !== "all") {
      filter.topic = topic;
    }
    if (search) {
      filter.search = search;
    }
    if (limit) {
      filter.limit = limit;
    }

    const guidelines = await getSafetyGuidelines(filter);

    logInfo("[SafetyGuidelinesAPI] 요청 완료", { count: guidelines.length });
    return NextResponse.json(guidelines);
  } catch (error) {
    logError("[SafetyGuidelinesAPI] 요청 오류", error);
    return NextResponse.json({ error: "안전 수칙 조회 실패" }, { status: 500 });
  }
}

