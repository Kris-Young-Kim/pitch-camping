/**
 * @file camping.ts
 * @description 캠핑장 관련 유틸리티 함수
 *
 * 좌표 변환, 필터링, 포맷팅 등의 유틸리티 함수
 *
 * @dependencies
 * - types/camping.ts: 타입 정의
 */

import type { CampingSite } from "@/types/camping";

/**
 * API 응답 데이터를 배열로 정규화
 * 단일 항목 또는 배열을 배열로 변환
 * @param items 단일 항목, 배열, 또는 undefined
 * @returns 항상 배열 반환
 */
export function normalizeItems<T>(items: T | T[] | undefined): T[] {
  if (!items) {
    return [];
  }
  return Array.isArray(items) ? items : [items];
}

/**
 * KATEC 좌표계를 WGS84 좌표계로 변환
 * 고캠핑 API는 KATEC 좌표계를 사용하며, 정수형으로 저장됨 (실제값 * 10000000)
 *
 * @param mapX 경도 (KATEC, 정수형)
 * @param mapY 위도 (KATEC, 정수형)
 * @returns WGS84 좌표 { lng: 경도, lat: 위도 }
 */
export function convertKATECToWGS84(
  mapX: number,
  mapY: number
): { lng: number; lat: number } {
  console.log("[utils/camping] 좌표 변환 시작:", { mapX, mapY });

  // KATEC 정수형을 실수형으로 변환
  const katecX = mapX / 10000000;
  const katecY = mapY / 10000000;

  // KATEC → WGS84 변환 공식
  // 참고: 한국 지역 기준 변환 공식
  const RE = 6371.00877; // 지구 반경(km)
  const GRID = 5.0; // 격자 간격(km)
  const SLAT1 = 30.0; // 투영 위도1(degree)
  const SLAT2 = 60.0; // 투영 위도2(degree)
  const OLON = 126.0; // 기준점 경도(degree)
  const OLAT = 38.0; // 기준점 위도(degree)
  // const XO = 43; // 기준점 X좌표(GRID) - 현재 사용 안 함
  // const YO = 136; // 기준점 Y좌표(GRID) - 현재 사용 안 함

  const DEGRAD = Math.PI / 180.0;
  const RADDEG = 180.0 / Math.PI;

  const re = RE / GRID;
  const slat1 = SLAT1 * DEGRAD;
  const slat2 = SLAT2 * DEGRAD;
  const olon = OLON * DEGRAD;
  // const olat = OLAT * DEGRAD; // 현재 사용되지 않음 (알고리즘 참고용)

  let sn =
    Math.tan(Math.PI * 0.25 + slat2 * 0.5) /
    Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
  let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sf = (Math.pow(sf, sn) * Math.cos(slat1)) / sn;
  // ro 계산은 사용되지 않지만 알고리즘의 일부이므로 유지
  // const _ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
  // const _roValue = (re * sf) / Math.pow(_ro, sn);

  let ra = Math.tan(Math.PI * 0.25 + katecY * DEGRAD * 0.5);
  ra = (re * sf) / Math.pow(ra, sn);
  let theta = katecX * DEGRAD - olon;
  if (theta > Math.PI) theta -= 2.0 * Math.PI;
  if (theta < -Math.PI) theta += 2.0 * Math.PI;
  theta *= sn;

  const lng = (theta * RADDEG) / ra + OLON;
  const lat = ((ra * Math.cos(theta)) / Math.cos(katecY * DEGRAD)) * RADDEG -
    OLAT;

  const result = {
    lng: Number(lng.toFixed(6)),
    lat: Number(lat.toFixed(6)),
  };

  console.log("[utils/camping] 좌표 변환 완료:", result);
  return result;
}

/**
 * 전화번호 포맷팅
 * @param tel 전화번호 문자열
 * @returns 포맷팅된 전화번호 (예: 02-1234-5678)
 */
export function formatPhoneNumber(tel?: string): string {
  if (!tel) {
    return "";
  }

  // 숫자만 추출
  const numbers = tel.replace(/\D/g, "");

  // 전화번호 형식에 따라 포맷팅
  if (numbers.length === 10) {
    // 02-1234-5678 형식
    return `${numbers.slice(0, 2)}-${numbers.slice(2, 6)}-${numbers.slice(
      6
    )}`;
  } else if (numbers.length === 11) {
    // 010-1234-5678 형식
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
  }

  return tel; // 형식이 맞지 않으면 원본 반환
}

/**
 * 주소 포맷팅 (addr1 + addr2)
 * @param addr1 기본 주소
 * @param addr2 상세 주소
 * @returns 포맷팅된 전체 주소
 */
export function formatAddress(addr1?: string, addr2?: string): string {
  if (!addr1) {
    return "";
  }
  return addr2 ? `${addr1} ${addr2}` : addr1;
}

/**
 * 홈페이지 URL 검증 및 포맷팅
 * @param homepage 홈페이지 URL
 * @returns 포맷팅된 URL (http:// 또는 https:// 추가)
 */
export function formatHomepageUrl(homepage?: string): string {
  if (!homepage) {
    return "";
  }

  // 이미 http:// 또는 https://로 시작하는지 확인
  if (homepage.startsWith("http://") || homepage.startsWith("https://")) {
    return homepage;
  }

  // 없으면 https:// 추가
  return `https://${homepage}`;
}

/**
 * 캠핑장명 문자열 검색
 * @param text 검색 대상 텍스트
 * @param keyword 검색 키워드
 * @returns 매칭 여부
 */
export function searchInText(text: string, keyword: string): boolean {
  if (!keyword || keyword.trim() === "") {
    return true;
  }

  const normalizedText = text.toLowerCase().trim();
  const normalizedKeyword = keyword.toLowerCase().trim();

  return normalizedText.includes(normalizedKeyword);
}

/**
 * 캠핑장 목록 필터링
 * @param items 캠핑장 목록
 * @param keyword 검색 키워드
 * @returns 필터링된 목록
 */
export function filterCampingSites(
  items: CampingSite[],
  keyword?: string
): CampingSite[] {
  if (!keyword || keyword.trim() === "") {
    return items;
  }

  console.log("[utils/camping] 필터링 시작:", { keyword, itemCount: items.length });

  const filtered = items.filter((item) => {
    // 캠핑장명 검색
    if (searchInText(item.facltNm, keyword)) {
      return true;
    }

    // 주소 검색
    if (item.addr1 && searchInText(item.addr1, keyword)) {
      return true;
    }

    // 한줄 소개 검색
    if (item.lineIntro && searchInText(item.lineIntro, keyword)) {
      return true;
    }

    return false;
  });

  console.log("[utils/camping] 필터링 완료:", { filteredCount: filtered.length });
  return filtered;
}

/**
 * 이미지 URL 검증 및 기본 이미지 반환
 * @param imageUrl 이미지 URL
 * @param defaultImage 기본 이미지 URL
 * @returns 유효한 이미지 URL
 */
export function getImageUrl(
  imageUrl?: string,
  defaultImage: string = "/images/default-camping.jpg"
): string {
  if (!imageUrl || imageUrl.trim() === "") {
    return defaultImage;
  }

  // URL 유효성 검사
  try {
    new URL(imageUrl);
    return imageUrl;
  } catch {
    return defaultImage;
  }
}

/**
 * 시설 문자열 파싱 (쉼표로 구분된 시설 목록)
 * @param facilityString 시설 문자열 (예: "화장실, 샤워장, 전기")
 * @returns 시설 배열
 */
export function parseFacilities(facilityString?: string): string[] {
  if (!facilityString) {
    return [];
  }

  return facilityString
    .split(",")
    .map((facility) => facility.trim())
    .filter((facility) => facility.length > 0);
}

/**
 * 시설 포함 여부 확인
 * @param facilityString 시설 문자열
 * @param targetFacility 찾을 시설명
 * @returns 포함 여부
 */
export function hasFacility(
  facilityString?: string,
  targetFacility?: string
): boolean {
  if (!facilityString || !targetFacility) {
    return false;
  }

  const facilities = parseFacilities(facilityString);
  return facilities.some(
    (facility) => facility.toLowerCase() === targetFacility.toLowerCase()
  );
}

