/**
 * @file travel.ts
 * @description 여행지 관련 유틸리티 함수
 *
 * 여행지 데이터 처리, 포맷팅, 필터링 등의 유틸리티 함수
 */

import type { TravelSite } from "@/types/travel";

/**
 * 좌표 변환 (필요 시)
 * TourAPI는 WGS84 좌표계를 사용하므로 일반적으로 변환 불필요
 * @param mapx 경도 (문자열)
 * @param mapy 위도 (문자열)
 * @returns 변환된 좌표 객체
 */
export function parseCoordinates(
  mapx?: string,
  mapy?: string
): { lng: number; lat: number } | null {
  if (!mapx || !mapy) {
    return null;
  }

  try {
    const lng = parseFloat(mapx);
    const lat = parseFloat(mapy);

    if (isNaN(lng) || isNaN(lat)) {
      return null;
    }

    return { lng, lat };
  } catch {
    return null;
  }
}

/**
 * 전화번호 포맷팅
 * @param tel 전화번호 문자열
 * @returns 포맷팅된 전화번호
 */
export function formatPhoneNumber(tel?: string): string {
  if (!tel) {
    return "";
  }

  // 하이픈이 없는 경우 추가
  const cleaned = tel.replace(/[^0-9]/g, "");
  
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  }
  
  return tel; // 포맷팅 실패 시 원본 반환
}

/**
 * 주소 포맷팅
 * @param addr1 기본 주소
 * @param addr2 상세 주소
 * @returns 포맷팅된 주소
 */
export function formatAddress(addr1?: string, addr2?: string): string {
  if (!addr1) {
    return "";
  }

  if (addr2) {
    return `${addr1} ${addr2}`;
  }

  return addr1;
}

/**
 * 홈페이지 URL 검증 및 포맷팅
 * @param homepage 홈페이지 URL
 * @returns 검증된 URL 또는 빈 문자열
 */
export function formatHomepage(homepage?: string): string {
  if (!homepage) {
    return "";
  }

  // http:// 또는 https://가 없으면 추가
  if (!homepage.startsWith("http://") && !homepage.startsWith("https://")) {
    return `https://${homepage}`;
  }

  return homepage;
}

/**
 * 이미지 URL 처리
 * @param imageUrl 이미지 URL
 * @returns 유효한 이미지 URL 또는 기본 이미지 URL
 */
export function getImageUrl(imageUrl?: string): string {
  if (!imageUrl) {
    // 기본 이미지 URL (나중에 프로젝트에 맞게 수정)
    return "/placeholder-travel.jpg";
  }

  return imageUrl;
}

/**
 * 여행지 타입명 가져오기
 * @param contentTypeId 콘텐츠 타입 ID
 * @returns 여행지 타입명
 */
export function getTravelTypeName(contentTypeId?: string): string {
  const typeMap: Record<string, string> = {
    "12": "관광지",
    "14": "문화시설",
    "15": "축제",
    "32": "숙박",
    "38": "쇼핑",
    "39": "음식점",
  };

  return contentTypeId ? typeMap[contentTypeId] || "기타" : "기타";
}

/**
 * API 응답 데이터 정규화
 * TourAPI 응답의 item 필드를 배열로 변환
 * @param items API 응답의 item 필드 (단일 객체 또는 배열)
 * @returns 정규화된 배열
 */
export function normalizeTravelItems(
  items: TravelSite | TravelSite[] | undefined
): TravelSite[] {
  if (!items) {
    return [];
  }
  return Array.isArray(items) ? items : [items];
}

/**
 * 여행지 필터링 (클라이언트 사이드)
 * @param items 여행지 목록
 * @param keyword 검색 키워드
 * @returns 필터링된 여행지 목록
 */
export function filterTravelsByKeyword(
  items: TravelSite[],
  keyword: string
): TravelSite[] {
  if (!keyword || keyword.trim() === "") {
    return items;
  }

  const lowerKeyword = keyword.toLowerCase();

  return items.filter((item) => {
    const title = item.title?.toLowerCase() || "";
    const addr1 = item.addr1?.toLowerCase() || "";
    const addr2 = item.addr2?.toLowerCase() || "";
    const overview = item.overview?.toLowerCase() || "";

    return (
      title.includes(lowerKeyword) ||
      addr1.includes(lowerKeyword) ||
      addr2.includes(lowerKeyword) ||
      overview.includes(lowerKeyword)
    );
  });
}

/**
 * 여행지 정렬 (클라이언트 사이드)
 * @param items 여행지 목록
 * @param sortOrder 정렬 옵션
 * @returns 정렬된 여행지 목록
 */
export function sortTravels(
  items: TravelSite[],
  sortOrder: "name" | "region" | "popular" = "name"
): TravelSite[] {
  const sorted = [...items];

  switch (sortOrder) {
    case "name":
      sorted.sort((a, b) => {
        const titleA = a.title || "";
        const titleB = b.title || "";
        return titleA.localeCompare(titleB, "ko");
      });
      break;
    case "region":
      sorted.sort((a, b) => {
        const addrA = a.addr1 || "";
        const addrB = b.addr1 || "";
        return addrA.localeCompare(addrB, "ko");
      });
      break;
    case "popular":
      // 인기순은 서버에서 처리하거나 조회수 기반으로 정렬
      // 현재는 제목순으로 대체
      sorted.sort((a, b) => {
        const titleA = a.title || "";
        const titleB = b.title || "";
        return titleA.localeCompare(titleB, "ko");
      });
      break;
  }

  return sorted;
}

