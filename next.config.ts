import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "img.clerk.com" },
      // 고캠핑 API 이미지 도메인 (실제 도메인에 맞게 수정 필요)
      { hostname: "**.go.kr" },
      { hostname: "**.data.go.kr" },
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
