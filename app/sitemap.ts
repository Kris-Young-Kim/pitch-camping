/**
 * @file sitemap.ts
 * @description 동적 Sitemap 생성
 *
 * Next.js 15의 sitemap 기능을 활용하여 동적 sitemap 생성
 * TourAPI를 통해 여행지 목록을 조회하여 각 상세페이지 URL 추가
 *
 * @dependencies
 * - lib/api/travel-api.ts: travelApi 클라이언트
 * - lib/utils/travel.ts: normalizeTravelItems 유틸리티
 */

import { MetadataRoute } from "next";
import { travelApi } from "@/lib/api/travel-api";
import { normalizeTravelItems } from "@/lib/utils/travel";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://pitch-travel.vercel.app";

  // 기본 정적 페이지
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/safety`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/feedback`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  // API 키 확인
  const apiKey = process.env.TOUR_API_KEY || process.env.NEXT_PUBLIC_TOUR_API_KEY;
  if (!apiKey) {
    console.warn("[Sitemap] TOUR_API_KEY가 설정되지 않아 정적 페이지만 포함합니다.");
    return staticPages;
  }

  try {
    // 여행지 목록 조회 (최대 1000개, 실제로는 더 많은 페이지가 있을 수 있음)
    // TourAPI는 페이지네이션을 지원하므로 여러 페이지를 조회할 수 있음
    const response = await travelApi.getTravelList({
      pageNo: 1,
      numOfRows: 1000,
    });

    const items = normalizeTravelItems(
      response.response?.body?.items?.item
    );

    // 여행지 상세페이지
    const travelPages: MetadataRoute.Sitemap = items.map((travel) => ({
      url: `${baseUrl}/travels/${travel.contentid}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    console.log(`[Sitemap] ${travelPages.length}개의 여행지 페이지가 생성되었습니다.`);

    return [...staticPages, ...travelPages];
  } catch (error) {
    console.error("[Sitemap] 생성 오류:", error);
    // 에러 발생 시 최소한 정적 페이지만 반환
    return staticPages;
  }
}

