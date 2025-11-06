import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "img.clerk.com" },
      // 한국관광공사 TourAPI 이미지 도메인
      { 
        hostname: "tong.visitkorea.or.kr",
        protocol: "https",
        pathname: "/**",
      }, // TourAPI 이미지 서버 (주요)
      { 
        hostname: "api.visitkorea.or.kr",
        protocol: "https",
        pathname: "/**",
      }, // TourAPI 이미지 서버 (대체)
      { 
        hostname: "**.visitkorea.or.kr",
        protocol: "https",
        pathname: "/**",
      }, // 모든 visitkorea.or.kr 서브도메인
      // 공공데이터 포털 이미지 도메인
      { 
        hostname: "**.go.kr",
        protocol: "https",
        pathname: "/**",
      },
      { 
        hostname: "**.data.go.kr",
        protocol: "https",
        pathname: "/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400, // 24시간 캐시
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: false,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
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
