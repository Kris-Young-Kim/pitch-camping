/**
 * @file route.ts
 * @description 여행지 목록 조회 API Route
 *
 * 서버 사이드에서 TourAPI를 호출하여 CORS 문제를 해결
 * 클라이언트는 이 API Route를 통해 여행지 목록을 조회
 *
 * @dependencies
 * - lib/api/travel-api.ts: TravelApiClient
 * - types/travel.ts: TravelFilter, TravelListResponse
 */

import { NextRequest, NextResponse } from "next/server";
import { travelApi } from "@/lib/api/travel-api";
import type { TravelFilter } from "@/types/travel";
import { logError } from "@/lib/utils/logger";

// OPTIONS 요청 처리 (CORS preflight)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function GET(request: NextRequest) {
  console.group("[API /api/travels] 여행지 목록 조회");
  
  try {
    // 환경 변수 확인
    const apiKey = process.env.TOUR_API_KEY;
    if (!apiKey) {
      console.error("[API] TOUR_API_KEY 환경 변수가 설정되지 않았습니다.");
      console.groupEnd();
      return NextResponse.json(
        { 
          error: "API 키가 설정되지 않았습니다.",
          message: "서버 환경 변수 TOUR_API_KEY를 확인해주세요."
        },
        { status: 500 }
      );
    }
    
    const searchParams = request.nextUrl.searchParams;
    
    console.log("[API] 쿼리 파라미터:", Object.fromEntries(searchParams.entries()));
    
    const filter: TravelFilter = {
      pageNo: parseInt(searchParams.get("pageNo") || "1", 10),
      numOfRows: parseInt(searchParams.get("numOfRows") || "20", 10),
      areaCode: searchParams.get("areaCode") || undefined,
      sigunguCode: searchParams.get("sigunguCode") || undefined,
      contentTypeId: searchParams.get("contentTypeId") || undefined,
      cat1: searchParams.get("cat1") || undefined,
      cat2: searchParams.get("cat2") || undefined,
      cat3: searchParams.get("cat3") || undefined,
      keyword: searchParams.get("keyword") || undefined,
      arrange: searchParams.get("arrange") || undefined,
    };

    console.log("[API] 필터:", filter);
    console.log("[API] API 키 존재 여부:", !!apiKey);
    console.log("[API] API 키 길이:", apiKey?.length || 0);
    console.log("[API] TourAPI 호출 시작");
    
    // 키워드가 있으면 검색, 없으면 목록 조회
    let response;
    try {
      if (filter.keyword) {
        const { keyword, ...searchFilter } = filter;
        response = await travelApi.searchTravel(keyword, searchFilter);
      } else {
        response = await travelApi.getTravelList(filter);
      }
      console.log("[API] TourAPI 응답 성공");
      console.log("[API] 응답 데이터 구조:", {
        hasResponse: !!response,
        hasBody: !!response?.response,
        hasHeader: !!response?.response?.header,
        resultCode: response?.response?.header?.resultCode,
        resultMsg: response?.response?.header?.resultMsg,
        itemCount: response?.response?.body?.items?.item?.length || 0,
      });
    } catch (apiError) {
      console.error("[API] TourAPI 호출 중 오류:", apiError);
      console.error("[API] TourAPI 오류 상세:", {
        message: apiError instanceof Error ? apiError.message : String(apiError),
        stack: apiError instanceof Error ? apiError.stack : undefined,
        name: apiError instanceof Error ? apiError.name : "UnknownError",
      });
      throw apiError;
    }
    
    console.groupEnd();
    
    // CORS 헤더 추가 및 캐싱 설정
    return NextResponse.json(response, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600", // 5분 캐시, 10분 stale-while-revalidate
      },
    });
  } catch (error) {
    console.error("[API] 여행지 목록 조회 오류:", error);
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류";
    const errorStack = error instanceof Error ? error.stack : undefined;
    const errorName = error instanceof Error ? error.name : "UnknownError";
    
    // 상세 에러 정보 로깅
    console.error("[API] 에러 상세:", {
      name: errorName,
      message: errorMessage,
      stack: errorStack,
      apiKeyExists: !!process.env.TOUR_API_KEY,
      apiKeyLength: process.env.TOUR_API_KEY?.length || 0,
    });
    
    logError("[API /api/travels] API 요청 실패", error instanceof Error ? error : new Error(String(error)), {
      searchParams: Object.fromEntries(request.nextUrl.searchParams.entries()),
      errorMessage,
      errorStack,
      errorName,
      apiKeyExists: !!process.env.TOUR_API_KEY,
    });
    console.groupEnd();
    
    // 프로덕션에서도 에러 상세 정보 제공 (디버깅용)
    return NextResponse.json(
      { 
        error: errorMessage,
        errorName,
        message: "여행지 목록을 불러오는데 실패했습니다.",
        details: {
          apiKeyConfigured: !!process.env.TOUR_API_KEY,
          ...(process.env.NODE_ENV === "development" && {
            stack: errorStack,
            fullError: String(error),
          }),
        },
      },
      { status: 500 }
    );
  }
}

