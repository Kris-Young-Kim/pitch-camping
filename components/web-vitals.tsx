/**
 * @file web-vitals.tsx
 * @description Web Vitals 모니터링 컴포넌트
 *
 * Lighthouse 성능 메트릭 (LCP, FID, CLS 등)을 측정하고 로깅
 * 프로덕션 환경에서 성능 분석 서비스 연동 가능
 *
 * @dependencies
 * - lib/utils/performance.ts: measurePageLoad 함수
 */

"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { measurePageLoad, reportWebVital } from "@/lib/utils/performance";

export function WebVitals() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 페이지 로드 시간 측정
    measurePageLoad(pathname || "/");

    // Web Vitals 측정 (필요시 web-vitals 라이브러리 사용)
    // import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';
    // 
    // getCLS(console.log);
    // getFID(console.log);
    // getFCP(console.log);
    // getLCP(console.log);
    // getTTFB(console.log);

    // 간단한 LCP 측정
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === "largest-contentful-paint") {
          const lcp = entry as PerformanceEntry & { renderTime?: number; loadTime?: number };
          const value = lcp.renderTime || lcp.loadTime || 0;
          console.log(`[Web Vitals] LCP: ${value.toFixed(2)}ms`, { pathname });
          
          // 데이터베이스에 저장
          reportWebVital("lcp", value, pathname || "/");
          
          // 성능 임계값 체크 (LCP < 2.5초가 좋음)
          if (value > 2500) {
            console.warn(`[Web Vitals] LCP가 임계값을 초과했습니다: ${value.toFixed(2)}ms`);
          }
        }
      });
    });

    try {
      observer.observe({ entryTypes: ["largest-contentful-paint"] });
    } catch {
      // 브라우저가 지원하지 않는 경우 무시
    }

    // CLS 측정 (간단한 버전)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      });
    });

    try {
      clsObserver.observe({ entryTypes: ["layout-shift"] });
    } catch {
      // 브라우저가 지원하지 않는 경우 무시
    }

    // 페이지 언로드 시 CLS 값 로깅 및 저장
    const handleUnload = () => {
      if (clsValue > 0) {
        console.log(`[Web Vitals] CLS: ${clsValue.toFixed(4)}`, { pathname });
        
        // 데이터베이스에 저장
        reportWebVital("cls", clsValue, pathname || "/");
        
        if (clsValue > 0.1) {
          console.warn(`[Web Vitals] CLS가 임계값을 초과했습니다: ${clsValue.toFixed(4)}`);
        }
      }
    };

    window.addEventListener("beforeunload", handleUnload);

    return () => {
      observer.disconnect();
      clsObserver.disconnect();
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [pathname]);

  return null; // 이 컴포넌트는 렌더링하지 않음
}

