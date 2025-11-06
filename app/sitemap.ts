/**
 * @file sitemap.ts
 * @description 동적 Sitemap 생성
 *
 * Next.js 15의 sitemap 기능을 활용하여 동적 sitemap 생성
 * 고캠핑 API를 통해 캠핑장 목록을 조회하여 각 상세페이지 URL 추가
 *
 * @dependencies
 * - lib/api/camping-api.ts: campingApi 클라이언트
 */

import { MetadataRoute } from "next";
import { campingApi } from "@/lib/api/camping-api";
import { normalizeItems } from "@/lib/utils/camping";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://pitch-camping.vercel.app";

  try {
    // 캠핑장 목록 조회 (최대 1000개, 실제로는 더 많은 페이지가 있을 수 있음)
    const response = await campingApi.getCampingList({
      pageNo: 1,
      numOfRows: 1000,
    });

    const items = normalizeItems(
      response.response?.body?.items?.item
    );

    // 홈페이지
    const staticPages: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1.0,
      },
    ];

    // 캠핑장 상세페이지
    const campingPages: MetadataRoute.Sitemap = items.map((camping) => ({
      url: `${baseUrl}/campings/${camping.contentId}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    return [...staticPages, ...campingPages];
  } catch (error) {
    console.error("[Sitemap] 생성 오류:", error);
    // 에러 발생 시 최소한 홈페이지만 반환
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1.0,
      },
    ];
  }
}

