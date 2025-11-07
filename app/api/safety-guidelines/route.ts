/**
 * @file route.ts
 * @description 여행 안전 정보 API 라우트
 *
 * 클라이언트 사이드에서 여행 안전 정보를 조회할 수 있는 API 엔드포인트
 *
 * @dependencies
 * - lib/api/safety-guidelines.ts: getTravelSafetyGuidelines 함수
 */

import { NextRequest, NextResponse } from "next/server";
import { getTravelSafetyGuidelines, TravelSafetyGuidelineFilter } from "@/lib/api/safety-guidelines";
import { logError, logInfo } from "@/lib/utils/logger";

export async function GET(request: NextRequest) {
  logInfo("[TravelSafetyGuidelinesAPI] 요청 시작");

  try {
    const searchParams = request.nextUrl.searchParams;
    const travel_type = searchParams.get("travel_type") as
      | "domestic"
      | "overseas"
      | "free"
      | "package"
      | "all"
      | null;
    const topic = searchParams.get("topic");
    const region = searchParams.get("region");
    const country_code = searchParams.get("country_code");
    const search = searchParams.get("search");
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!) : undefined;

    const filter: TravelSafetyGuidelineFilter = {};
    if (travel_type && travel_type !== "all") {
      filter.travel_type = travel_type;
    }
    if (topic && topic !== "all") {
      filter.topic = topic;
    }
    if (region) {
      filter.region = region;
    }
    if (country_code) {
      filter.country_code = country_code;
    }
    if (search) {
      filter.search = search;
    }
    if (limit) {
      filter.limit = limit;
    }
    if (offset) {
      filter.offset = offset;
    }

    const guidelines = await getTravelSafetyGuidelines(filter);

    logInfo("[TravelSafetyGuidelinesAPI] 요청 완료", { count: guidelines.length });
    return NextResponse.json(guidelines);
  } catch (error) {
    logError("[TravelSafetyGuidelinesAPI] 요청 오류", error);
    return NextResponse.json({ error: "여행 안전 정보 조회 실패" }, { status: 500 });
  }
}

