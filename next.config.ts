import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "img.clerk.com" },
      // 한국관광공사 TourAPI 이미지 도메인
      { hostname: "tong.visitkorea.or.kr" }, // TourAPI 이미지 서버
      { hostname: "api.visitkorea.or.kr" }, // TourAPI 이미지 서버 (대체)
      { hostname: "**.visitkorea.or.kr" }, // 모든 visitkorea.or.kr 서브도메인
      // 공공데이터 포털 이미지 도메인 (기존)
      { hostname: "**.go.kr" },
      { hostname: "**.data.go.kr" },
      // 고캠핑 API 이미지 도메인 (호환성 유지)
      { hostname: "gocamping.or.kr" },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400, // 24시간 캐시
  },
  // 성능 최적화
  compress: true,
  poweredByHeader: false,
  // 번들 분석 (프로덕션에서만)
  ...(process.env.ANALYZE === "true" && {
    webpack: (config) => {
      config.optimization = {
        ...config.optimization,
        moduleIds: "deterministic",
        runtimeChunk: "single",
        splitChunks: {
          chunks: "all",
          cacheGroups: {
            default: false,
            vendors: false,
            vendor: {
              name: "vendor",
              chunks: "all",
              test: /node_modules/,
              priority: 20,
            },
            common: {
              name: "common",
              minChunks: 2,
              chunks: "all",
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
          },
        },
      };
      return config;
    },
  }),
};

export default nextConfig;
