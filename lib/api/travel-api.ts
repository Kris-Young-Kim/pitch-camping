/**
 * @file travel-api.ts
 * @description 한국관광공사 TourAPI 클라이언트 모듈
 *
 * 한국관광공사 TourAPI를 호출하는 클라이언트 클래스
 * 환경변수에서 API 키를 가져와 사용
 *
 * 주요 기능:
 * 1. 여행지 목록 조회 (지역기반)
 * 2. 여행지 상세 정보 조회
 * 3. 키워드 검색
 * 4. 이미지 목록 조회
 *
 * @dependencies
 * - types/travel.ts: API 응답 타입 정의
 */

import type {
  TravelFilter,
  TravelListResponse,
  TravelDetailResponse,
  TravelImageListResponse,
} from "@/types/travel";
import { measureApiResponse } from "@/lib/utils/performance";
import { logError, logInfo } from "@/lib/utils/logger";
import { trackApiRequest } from "@/lib/utils/metrics";

/**
 * 한국관광공사 TourAPI 클라이언트 클래스
 */
export class TravelApiClient {
  private baseUrl: string;
  private serviceKey: string;
  private readonly timeout: number = 10000; // 10초

  constructor() {
    // 서버 사이드에서는 TOUR_API_KEY 사용
    // 클라이언트 사이드에서는 NEXT_PUBLIC_TOUR_API_KEY 사용
    this.serviceKey =
      typeof window === "undefined"
        ? process.env.TOUR_API_KEY || ""
        : process.env.NEXT_PUBLIC_TOUR_API_KEY || "";

    // TourAPI Base URL
    this.baseUrl =
      process.env.NEXT_PUBLIC_TOUR_API_BASE_URL ||
      "http://apis.data.go.kr/B551011/KorService1";

    // 빌드 시점이나 클라이언트 사이드에서는 조용히 처리
    const isBuildTime = process.env.NEXT_PHASE === "phase-production-build";
    const isClientSide = typeof window !== "undefined";
    if (!this.serviceKey && !isBuildTime && !isClientSide) {
      logError("[TravelApiClient] API 키가 설정되지 않았습니다.");
    }
  }

  /**
   * API 요청 공통 메서드
   */
  private async request<T>(
    endpoint: string,
    params: Record<string, string | number | undefined> = {}
  ): Promise<T> {
    // API 키 확인
    if (!this.serviceKey) {
      const error = new Error("API 키가 설정되지 않았습니다.");
      logError(`[TravelApiClient] API 요청 실패: ${endpoint}`, error, { params });
      throw error;
    }

    logInfo(`[TravelApiClient] API 요청: ${endpoint}`, { params });

    const url = new URL(`${this.baseUrl}${endpoint}`);

    // 공통 파라미터 추가
    url.searchParams.append("serviceKey", decodeURIComponent(this.serviceKey));
    url.searchParams.append("MobileApp", "PitchTravel");
    url.searchParams.append("MobileOS", "ETC");
    url.searchParams.append("_type", "json"); // JSON 응답 요청

    // 추가 파라미터 추가
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.append(key, String(value));
      }
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    const startTime = Date.now();

    try {
      const response = await measureApiResponse(
        () =>
          fetch(url.toString(), {
            signal: controller.signal,
            headers: {
              Accept: "application/json",
            },
            next: {
              revalidate: endpoint.includes("detailCommon") ? 21600 : 3600, // 상세: 6시간, 목록: 1시간
            },
          }),
        endpoint
      );

      clearTimeout(timeoutId);

      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        trackApiRequest(false, responseTime); // 실패 추적
        throw new Error(
          `API 요청 실패: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      // 응답 검증
      if (data.response?.header?.resultCode !== "0000") {
        trackApiRequest(false, responseTime); // 실패 추적
        const errorMsg =
          data.response?.header?.resultMsg || "알 수 없는 API 오류";
        logError(
          `API 오류 (${data.response?.header?.resultCode})`,
          new Error(errorMsg),
          { endpoint, params }
        );
        throw new Error(
          `API 오류 (${data.response?.header?.resultCode}): ${errorMsg}`
        );
      }

      trackApiRequest(true, responseTime); // 성공 추적
      logInfo(`API 요청 성공: ${endpoint}`, { params });
      return data as T;
    } catch (error) {
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      trackApiRequest(false, responseTime); // 실패 추적

      if (error instanceof Error && error.name === "AbortError") {
        logError("[TravelApiClient] API 요청 시간 초과", error, { endpoint });
        throw new Error("API 요청 시간이 초과되었습니다.");
      }

      logError(
        "[TravelApiClient] API 요청 중 오류 발생",
        error,
        { endpoint, params }
      );
      throw error;
    }
  }

  /**
   * 여행지 목록 조회 (지역기반)
   * @param filter 필터 옵션
   * @returns 여행지 목록 응답
   */
  async getTravelList(
    filter: TravelFilter = {}
  ): Promise<TravelListResponse> {
    logInfo("[TravelApiClient] 여행지 목록 조회", { filter });

    const params: Record<string, string | number | undefined> = {
      pageNo: filter.pageNo || 1,
      numOfRows: filter.numOfRows || 20,
    };

    // 지역 필터
    if (filter.areaCode) {
      params.areaCode = filter.areaCode;
    }
    if (filter.sigunguCode) {
      params.sigunguCode = filter.sigunguCode;
    }

    // 여행지 타입 필터
    if (filter.contentTypeId) {
      params.contentTypeId = filter.contentTypeId;
    }

    // 카테고리 필터
    if (filter.cat1) {
      params.cat1 = filter.cat1;
    }
    if (filter.cat2) {
      params.cat2 = filter.cat2;
    }
    if (filter.cat3) {
      params.cat3 = filter.cat3;
    }

    // 정렬 옵션
    if (filter.arrange) {
      params.arrange = filter.arrange;
    }

    return this.request<TravelListResponse>("/areaBasedList", params);
  }

  /**
   * 여행지 상세 정보 조회 (공통정보)
   * @param contentId 여행지 콘텐츠 ID
   * @returns 여행지 상세 정보 응답
   */
  async getTravelDetail(contentId: string): Promise<TravelDetailResponse> {
    logInfo(`[TravelApiClient] 여행지 상세 정보 조회`, { contentId });

    if (!contentId) {
      throw new Error("contentId는 필수입니다.");
    }

    const params: Record<string, string | number | undefined> = {
      contentId,
      defaultYN: "Y", // 기본정보 조회
      firstImageYN: "Y", // 대표이미지 조회
      areacodeYN: "Y", // 지역코드 조회
      catcodeYN: "Y", // 서비스분류코드 조회
      addrinfoYN: "Y", // 주소정보 조회
      mapinfoYN: "Y", // 좌표정보 조회
      overviewYN: "Y", // 개요정보 조회
    };

    return this.request<TravelDetailResponse>("/detailCommon", params);
  }

  /**
   * 여행지 상세 정보 조회 (소개정보)
   * @param contentId 여행지 콘텐츠 ID
   * @param contentTypeId 콘텐츠 타입 ID
   * @returns 여행지 상세 정보 응답
   */
  async getTravelDetailIntro(
    contentId: string,
    contentTypeId: string
  ): Promise<TravelDetailResponse> {
    logInfo(`[TravelApiClient] 여행지 소개 정보 조회`, { contentId, contentTypeId });

    if (!contentId || !contentTypeId) {
      throw new Error("contentId와 contentTypeId는 필수입니다.");
    }

    const params: Record<string, string | number | undefined> = {
      contentId,
      contentTypeId,
    };

    return this.request<TravelDetailResponse>("/detailIntro", params);
  }

  /**
   * 여행지 이미지 목록 조회
   * @param contentId 여행지 콘텐츠 ID
   * @returns 여행지 이미지 목록 응답
   */
  async getTravelImages(contentId: string): Promise<TravelImageListResponse> {
    logInfo(`[TravelApiClient] 여행지 이미지 목록 조회`, { contentId });

    if (!contentId) {
      throw new Error("contentId는 필수입니다.");
    }

    const params: Record<string, string | number | undefined> = {
      contentId,
      imageYN: "Y", // 이미지 조회
      subImageYN: "Y", // 서브 이미지 조회
    };

    return this.request<TravelImageListResponse>("/detailImage", params);
  }

  /**
   * 키워드 검색
   * @param keyword 검색 키워드
   * @param filter 추가 필터 옵션
   * @returns 여행지 목록 응답
   */
  async searchTravel(
    keyword: string,
    filter: Omit<TravelFilter, "keyword"> = {}
  ): Promise<TravelListResponse> {
    logInfo(`[TravelApiClient] 키워드 검색`, { keyword, filter });

    if (!keyword || keyword.trim() === "") {
      throw new Error("검색 키워드는 필수입니다.");
    }

    const params: Record<string, string | number | undefined> = {
      keyword: keyword.trim(),
      pageNo: filter.pageNo || 1,
      numOfRows: filter.numOfRows || 20,
    };

    // 지역 필터
    if (filter.areaCode) {
      params.areaCode = filter.areaCode;
    }
    if (filter.sigunguCode) {
      params.sigunguCode = filter.sigunguCode;
    }

    // 여행지 타입 필터
    if (filter.contentTypeId) {
      params.contentTypeId = filter.contentTypeId;
    }

    // 정렬 옵션
    if (filter.arrange) {
      params.arrange = filter.arrange;
    }

    return this.request<TravelListResponse>("/searchKeyword", params);
  }

  /**
   * 응답 데이터를 배열로 변환 (단일 항목 또는 배열 처리)
   */
  static normalizeItems<T>(items: T | T[] | undefined): T[] {
    if (!items) {
      return [];
    }
    return Array.isArray(items) ? items : [items];
  }
}

/**
 * 싱글톤 인스턴스 생성 및 export
 * 서버 사이드에서만 인스턴스화되도록 lazy initialization 사용
 */
let travelApiInstance: TravelApiClient | null = null;

export const travelApi = (() => {
  // 서버 사이드에서만 인스턴스 생성
  if (typeof window === "undefined") {
    if (!travelApiInstance) {
      travelApiInstance = new TravelApiClient();
    }
    return travelApiInstance;
  }
  // 클라이언트 사이드에서는 더미 객체 반환 (실제로는 사용되지 않음)
  // 클라이언트는 API Route를 통해 호출해야 함
  return {
    getTravelList: () => Promise.reject(new Error("클라이언트에서는 API Route를 사용하세요")),
    getTravelDetail: () => Promise.reject(new Error("클라이언트에서는 API Route를 사용하세요")),
    searchTravel: () => Promise.reject(new Error("클라이언트에서는 API Route를 사용하세요")),
    getTravelImages: () => Promise.reject(new Error("클라이언트에서는 API Route를 사용하세요")),
  } as TravelApiClient;
})();

