/**
 * @file camping-api.ts
 * @description 고캠핑 API 클라이언트 모듈
 *
 * 고캠핑 공공 API를 호출하는 클라이언트 클래스
 * 환경변수에서 API 키를 가져와 사용
 *
 * 주요 기능:
 * 1. 캠핑장 목록 조회
 * 2. 캠핑장 상세 정보 조회
 * 3. 키워드 검색
 *
 * @dependencies
 * - types/camping.ts: API 응답 타입 정의
 */

import type {
  CampingFilter,
  CampingListResponse,
  CampingDetailResponse,
} from "@/types/camping";
import { measureApiResponse } from "@/lib/utils/performance";
import { logError, logInfo } from "@/lib/utils/logger";
import { trackApiRequest } from "@/lib/utils/metrics";

/**
 * 고캠핑 API 클라이언트 클래스
 */
export class CampingApiClient {
  private baseUrl: string;
  private serviceKey: string;
  private readonly timeout: number = 10000; // 10초

  constructor() {
    // 서버 사이드에서는 GOCAMPING_API_KEY 사용
    // 클라이언트 사이드에서는 NEXT_PUBLIC_GOCAMPING_API_KEY 사용
    this.serviceKey =
      typeof window === "undefined"
        ? process.env.GOCAMPING_API_KEY || ""
        : process.env.NEXT_PUBLIC_GOCAMPING_API_KEY || "";

    // 고캠핑 API Base URL (실제 API 명세서 확인 후 수정 필요)
    // 일반적인 공공데이터 포털 구조: http://apis.data.go.kr/B551011/GoCamping
    this.baseUrl =
      process.env.NEXT_PUBLIC_GOCAMPING_API_BASE_URL ||
      "http://apis.data.go.kr/B551011/GoCamping";

    // 빌드 시점에는 조용히 처리 (환경 변수가 없을 수 있음)
    const isBuildTime = process.env.NEXT_PHASE === "phase-production-build";
    if (!this.serviceKey && !isBuildTime) {
      logError("[CampingApiClient] API 키가 설정되지 않았습니다.");
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
      logError(`[CampingApiClient] API 요청 실패: ${endpoint}`, error, { params });
      throw error;
    }

    logInfo(`[CampingApiClient] API 요청: ${endpoint}`, { params });

    const url = new URL(`${this.baseUrl}${endpoint}`);

    // 공통 파라미터 추가
    url.searchParams.append("serviceKey", this.serviceKey);
    url.searchParams.append("MobileApp", "PitchCamping");
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
              revalidate: endpoint === "/detailIntro" ? 21600 : 3600, // 상세: 6시간, 목록: 1시간
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
        logError(`API 오류 (${data.response?.header?.resultCode})`, new Error(errorMsg), { endpoint, params });
        throw new Error(`API 오류 (${data.response?.header?.resultCode}): ${errorMsg}`);
      }

      trackApiRequest(true, responseTime); // 성공 추적
      logInfo(`API 요청 성공: ${endpoint}`, { params });
      return data as T;
    } catch (error) {
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      trackApiRequest(false, responseTime); // 실패 추적

      if (error instanceof Error && error.name === "AbortError") {
        logError("[CampingApiClient] API 요청 시간 초과", error, { endpoint });
        throw new Error("API 요청 시간이 초과되었습니다.");
      }

      logError("[CampingApiClient] API 요청 중 오류 발생", error, { endpoint, params });
      throw error;
    }
  }

  /**
   * 캠핑장 목록 조회
   * @param filter 필터 옵션
   * @returns 캠핑장 목록 응답
   */
  async getCampingList(
    filter: CampingFilter = {}
  ): Promise<CampingListResponse> {
    logInfo("[CampingApiClient] 캠핑장 목록 조회", { filter });

    const params: Record<string, string | number | undefined> = {
      pageNo: filter.pageNo || 1,
      numOfRows: filter.numOfRows || 20,
    };

    // 지역 필터
    if (filter.doNm) {
      params.doNm = filter.doNm;
    }
    if (filter.sigunguNm) {
      params.sigunguNm = filter.sigunguNm;
    }

    // 캠핑 타입 필터
    if (filter.induty) {
      params.induty = filter.induty;
    }

    // 시설 필터
    if (filter.sbrsCl) {
      params.sbrsCl = filter.sbrsCl;
    }

    // 키워드 검색
    if (filter.keyword) {
      params.keyword = filter.keyword;
    }

    // 정렬 옵션 (API에서 지원하는 경우)
    // 주의: 실제 API 명세서에 따라 파라미터명 변경 필요
    if (filter.sortOrder) {
      // 예시: sortOrder 파라미터 (실제 API 명세서 확인 필요)
      params.arrange = filter.sortOrder;
    }

    return this.request<CampingListResponse>("/basedList", params);
  }

  /**
   * 캠핑장 상세 정보 조회
   * @param contentId 캠핑장 콘텐츠 ID
   * @returns 캠핑장 상세 정보 응답
   */
  async getCampingDetail(contentId: string): Promise<CampingDetailResponse> {
    logInfo(`[CampingApiClient] 캠핑장 상세 정보 조회`, { contentId });

    if (!contentId) {
      throw new Error("contentId는 필수입니다.");
    }

    const params: Record<string, string | number | undefined> = {
      contentId,
    };

    return this.request<CampingDetailResponse>("/detailIntro", params);
  }

  /**
   * 키워드 검색
   * @param keyword 검색 키워드
   * @param filter 추가 필터 옵션
   * @returns 캠핑장 목록 응답
   */
  async searchCamping(
    keyword: string,
    filter: Omit<CampingFilter, "keyword"> = {}
  ): Promise<CampingListResponse> {
    logInfo(`[CampingApiClient] 키워드 검색`, { keyword, filter });

    if (!keyword || keyword.trim() === "") {
      throw new Error("검색 키워드는 필수입니다.");
    }

    return this.getCampingList({
      ...filter,
      keyword: keyword.trim(),
    });
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
 */
export const campingApi = new CampingApiClient();

