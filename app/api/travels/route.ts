/**
 * @file route.ts
 * @description 여행지 목록 조회 API Route
 *
 * 한국관광공사 TourAPI를 우선 사용하고, 실패 시 Supabase를 fallback으로 사용
 * TourAPI 응답 형식과 호환되도록 데이터 변환
 *
 * @dependencies
 * - lib/api/travel-api.ts: TourAPI 클라이언트
 * - lib/supabase/server.ts: Supabase 서버 클라이언트
 * - types/travel.ts: TravelFilter, TravelListResponse
 */

import { NextRequest, NextResponse } from "next/server";
import { TravelApiClient } from "@/lib/api/travel-api";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import type { TravelFilter, TravelListResponse } from "@/types/travel";
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

    // 1. TourAPI 시도
    try {
      console.log("[API] TourAPI 조회 시작");
      const travelApi = new TravelApiClient();
      
      // 키워드 검색이 있는 경우 searchTravel 사용, 없으면 getTravelList 사용
      let response: TravelListResponse;
      
      if (filter.keyword) {
        console.log("[API] TourAPI 키워드 검색 사용");
        const { keyword, ...restFilter } = filter;
        response = await travelApi.searchTravel(keyword, restFilter);
      } else {
        console.log("[API] TourAPI 지역기반 조회 사용");
        response = await travelApi.getTravelList(filter);
      }

      console.log("[API] TourAPI 응답 성공:", {
        itemCount: response.response?.body?.items?.item?.length || 0,
        totalCount: response.response?.body?.totalCount || 0,
      });

      console.groupEnd();
      
      // CORS 헤더 추가 및 캐싱 설정
      return NextResponse.json(response, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      });
    } catch (tourApiError) {
      console.warn("[API] TourAPI 조회 실패, Supabase fallback 시도:", tourApiError);
      logError("[API /api/travels] TourAPI 조회 실패, Supabase fallback", tourApiError instanceof Error ? tourApiError : new Error(String(tourApiError)), {
        filter,
      });
      
      // 2. Supabase fallback
      console.log("[API] Supabase 조회 시작 (fallback)");
      
      // Supabase 서버 클라이언트 생성
      const supabase = createClerkSupabaseClient();
      
      // Supabase 쿼리 빌더 시작
      let query = supabase.from("travels").select("*", { count: "exact" });
      
      // 필터 적용
      if (filter.areaCode) {
        query = query.eq("areacode", filter.areaCode);
      }
      
      if (filter.sigunguCode) {
        query = query.eq("sigungucode", filter.sigunguCode);
      }
      
      if (filter.contentTypeId) {
        query = query.eq("contenttypeid", filter.contentTypeId);
      }
      
      if (filter.cat1) {
        query = query.eq("cat1", filter.cat1);
      }
      
      if (filter.cat2) {
        query = query.eq("cat2", filter.cat2);
      }
      
      if (filter.cat3) {
        query = query.eq("cat3", filter.cat3);
      }
      
      // 키워드 검색 (제목 또는 개요에서 검색)
      if (filter.keyword) {
        query = query.or(`title.ilike.%${filter.keyword}%,overview.ilike.%${filter.keyword}%`);
      }
      
      // 정렬
      if (filter.arrange === "A") {
        // 제목순
        query = query.order("title", { ascending: true });
      } else if (filter.arrange === "B") {
        // 조회순 (travel_stats와 조인 필요하지만 일단 생성일순으로 대체)
        query = query.order("created_at", { ascending: false });
      } else if (filter.arrange === "C") {
        // 수정일순
        query = query.order("updated_at", { ascending: false });
      } else if (filter.arrange === "D") {
        // 생성일순
        query = query.order("created_at", { ascending: false });
      } else {
        // 기본: 생성일순
        query = query.order("created_at", { ascending: false });
      }
      
      // 페이지네이션
      const pageNo = filter.pageNo || 1;
      const numOfRows = filter.numOfRows || 20;
      const from = (pageNo - 1) * numOfRows;
      const to = from + numOfRows - 1;
      
      query = query.range(from, to);
      
      console.log("[API] Supabase 쿼리 실행");
      const { data, error, count } = await query;
      
      if (error) {
        console.error("[API] Supabase 오류:", error);
        throw new Error(`Supabase 조회 실패: ${error.message}`);
      }
      
      console.log("[API] Supabase 응답 성공:", {
        itemCount: data?.length || 0,
        totalCount: count || 0,
      });

      // TourAPI 응답 형식으로 변환
      const response: TravelListResponse = {
        response: {
          header: {
            resultCode: "0000",
            resultMsg: "OK",
          },
          body: {
            items: {
              item: data || [],
            },
            numOfRows: numOfRows,
            pageNo: pageNo,
            totalCount: count || 0,
          },
        },
      };

      console.groupEnd();
      
      // CORS 헤더 추가 및 캐싱 설정
      return NextResponse.json(response, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      });
    }
  } catch (error) {
    console.error("[API] 여행지 목록 조회 오류:", error);
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류";
    const errorStack = error instanceof Error ? error.stack : undefined;
    const errorName = error instanceof Error ? error.name : "UnknownError";
    
    logError("[API /api/travels] 모든 데이터 소스 조회 실패", error instanceof Error ? error : new Error(String(error)), {
      searchParams: Object.fromEntries(request.nextUrl.searchParams.entries()),
      errorMessage,
      errorStack,
      errorName,
    });
    console.groupEnd();
    
    return NextResponse.json(
      { 
        error: errorMessage,
        errorName,
        message: "여행지 목록을 불러오는데 실패했습니다.",
        details: {
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

