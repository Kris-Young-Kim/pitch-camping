/**
 * @file robots.ts
 * @description Robots.txt 생성
 *
 * 검색 엔진 크롤러를 위한 robots.txt 설정
 * 모든 검색 엔진 허용 및 sitemap URL 지정
 *
 * @dependencies
 * - next/headers: MetadataRoute.Robots
 */

import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://pitch-camping.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

