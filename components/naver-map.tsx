/**
 * @file naver-map.tsx
 * @description 네이버 지도 컴포넌트
 *
 * Naver Maps JavaScript API v3 (NCP)를 사용한 지도 컴포넌트
 *
 * 주요 기능:
 * 1. 네이버 지도 초기화 및 표시
 * 2. 캠핑장 마커 표시
 * 3. 마커 클릭 시 인포윈도우 표시
 * 4. 리스트와 연동 (특정 마커로 이동)
 *
 * @dependencies
 * - types/camping.ts: CampingSite 타입
 * - lib/utils/camping.ts: convertKATECToWGS84 좌표 변환 함수
 * - Naver Maps JavaScript API v3 (NCP)
 */

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MapPin } from "lucide-react";
import { MapSkeleton } from "@/components/loading/map-skeleton";
import type { CampingSite } from "@/types/camping";
import { convertKATECToWGS84 } from "@/lib/utils/camping";

declare global {
  interface Window {
    naver: any;
  }
}

interface NaverMapProps {
  campings: CampingSite[];
  center?: { lat: number; lng: number };
  zoom?: number;
  onMarkerClick?: (camping: CampingSite) => void;
  selectedCampingId?: string;
  className?: string;
}

export function NaverMap({
  campings,
  center,
  zoom = 10,
  onMarkerClick,
  selectedCampingId,
  className = "",
}: NaverMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const infoWindowsRef = useRef<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 마커 추가 함수 (initializeMap보다 먼저 정의)
  const addMarkers = useCallback(() => {
    if (!mapInstanceRef.current || !window.naver?.maps) {
      return;
    }

    console.log("[NaverMap] 마커 추가 시작:", campings.length);

    // 기존 마커 제거
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
    infoWindowsRef.current.forEach((infoWindow) => infoWindow.close());
    infoWindowsRef.current = [];

    campings.forEach((camping) => {
      try {
        // 좌표 변환 (KATEC → WGS84)
        const { lat, lng } = convertKATECToWGS84(camping.mapX, camping.mapY);

        const position = new window.naver.maps.LatLng(lat, lng);

        // 마커 생성 (기본 마커 사용)
        const marker = new window.naver.maps.Marker({
          position: position,
          map: mapInstanceRef.current,
          title: camping.facltNm,
        });

        // 인포윈도우 생성
        const infoWindowContent = `
          <div style="
            padding: 12px;
            min-width: 200px;
            max-width: 300px;
          ">
            <h3 style="
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 8px;
              color: #111;
            ">${camping.facltNm}</h3>
            ${camping.lineIntro ? `<p style="font-size: 14px; color: #666; margin-bottom: 8px;">${camping.lineIntro}</p>` : ""}
            <div style="font-size: 12px; color: #888; margin-bottom: 12px;">
              ${camping.addr1}
            </div>
            <a href="/campings/${camping.contentId}" style="
              display: inline-block;
              padding: 6px 12px;
              background-color: #22c55e;
              color: white;
              text-decoration: none;
              border-radius: 4px;
              font-size: 14px;
            ">상세보기</a>
          </div>
        `;

        const infoWindow = new window.naver.maps.InfoWindow({
          content: infoWindowContent,
        });

        // 마커 클릭 이벤트
        window.naver.maps.Event.addListener(marker, "click", () => {
          console.log("[NaverMap] 마커 클릭:", camping.facltNm);

          // 다른 인포윈도우 닫기
          infoWindowsRef.current.forEach((iw) => iw.close());

          // 인포윈도우 열기
          infoWindow.open(mapInstanceRef.current, marker);

          // 콜백 호출
          onMarkerClick?.(camping);
        });

        markersRef.current.push(marker);
        infoWindowsRef.current.push(infoWindow);
      } catch (err) {
        console.error("[NaverMap] 마커 추가 오류:", err, camping);
      }
    });

    console.log("[NaverMap] 마커 추가 완료:", markersRef.current.length);
  }, [campings, onMarkerClick]);

  // 지도 초기화 함수
  const initializeMap = useCallback(() => {
    if (!mapRef.current || !window.naver?.maps) {
      console.error("[NaverMap] 지도 초기화 실패: 요소 또는 API가 없음");
      return;
    }

    try {
      console.log("[NaverMap] 지도 초기화 시작");

      // 기본 중심 좌표 (한국 중심)
      const defaultCenter = center
        ? new window.naver.maps.LatLng(center.lat, center.lng)
        : new window.naver.maps.LatLng(37.5665, 126.978); // 서울 좌표

      // 지도 생성
      const mapOptions = {
        center: defaultCenter,
        zoom: zoom,
      };

      mapInstanceRef.current = new window.naver.maps.Map(
        mapRef.current,
        mapOptions
      );

      console.log("[NaverMap] 지도 생성 완료");
      setIsLoaded(true);

      // 마커 표시
      if (campings.length > 0) {
        addMarkers();
      }
    } catch (err) {
      console.error("[NaverMap] 지도 초기화 오류:", err);
      setError("지도를 초기화하는데 실패했습니다.");
    }
  }, [center, zoom, campings.length, addMarkers]);

  // 네이버 지도 스크립트 로드
  useEffect(() => {
    console.group("[NaverMap] 네이버 지도 초기화");
    console.log("캠핑장 개수:", campings.length);

    const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;

    if (!clientId) {
      console.error("[NaverMap] 네이버 지도 Client ID가 설정되지 않았습니다.");
      setError("네이버 지도 서비스를 사용할 수 없습니다.");
      return;
    }

    // 스크립트가 이미 로드되어 있는지 확인
    if (window.naver && window.naver.maps) {
      console.log("[NaverMap] 네이버 지도 API 이미 로드됨");
      initializeMap();
      return;
    }

    // 스크립트 로드
    const script = document.createElement("script");
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`;
    script.async = true;
    script.onload = () => {
      console.log("[NaverMap] 네이버 지도 API 로드 완료");
      initializeMap();
    };
    script.onerror = () => {
      console.error("[NaverMap] 네이버 지도 API 로드 실패");
      setError("네이버 지도를 불러오는데 실패했습니다.");
    };

    document.head.appendChild(script);

    return () => {
      // 클린업: 마커 및 인포윈도우 제거
      if (markersRef.current.length > 0) {
        markersRef.current.forEach((marker) => marker.setMap(null));
        markersRef.current = [];
      }
      if (infoWindowsRef.current.length > 0) {
        infoWindowsRef.current.forEach((infoWindow) => infoWindow.close());
        infoWindowsRef.current = [];
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initializeMap]); // campings.length는 로그용이므로 의존성에서 제외

  // 선택된 캠핑장으로 지도 이동
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedCampingId || !isLoaded) {
      return;
    }

    const selectedCamping = campings.find(
      (c) => c.contentId === selectedCampingId
    );

    if (selectedCamping) {
      console.log("[NaverMap] 선택된 캠핑장으로 이동:", selectedCamping.facltNm);

      const { lat, lng } = convertKATECToWGS84(
        selectedCamping.mapX,
        selectedCamping.mapY
      );

      const position = new window.naver.maps.LatLng(lat, lng);

      mapInstanceRef.current.setCenter(position);
      mapInstanceRef.current.setZoom(15);

      // 해당 마커의 인포윈도우 열기
      const markerIndex = campings.findIndex(
        (c) => c.contentId === selectedCampingId
      );
      if (markerIndex >= 0 && infoWindowsRef.current[markerIndex]) {
        infoWindowsRef.current.forEach((iw) => iw.close());
        const marker = markersRef.current[markerIndex];
        if (marker) {
          infoWindowsRef.current[markerIndex].open(
            mapInstanceRef.current,
            marker
          );
        }
      }
    }
  }, [selectedCampingId, campings, isLoaded]);

  // 캠핑장 목록이 변경되면 마커 업데이트
  useEffect(() => {
    if (isLoaded && campings.length > 0) {
      addMarkers();

      // 모든 마커를 보기 위해 지도 범위 조정
      if (markersRef.current.length > 0 && mapInstanceRef.current) {
        const bounds = new window.naver.maps.LatLngBounds();

        campings.forEach((camping) => {
          const { lat, lng } = convertKATECToWGS84(camping.mapX, camping.mapY);
          bounds.extend(new window.naver.maps.LatLng(lat, lng));
        });

        mapInstanceRef.current.fitBounds(bounds);
      }
    }
  }, [campings, isLoaded, addMarkers]);

  return (
    <div className={`relative w-full h-full min-h-[400px] md:min-h-[600px] ${className}`} role="application" aria-label="네이버 지도">
      <div ref={mapRef} className="w-full h-full rounded-lg" aria-hidden={!isLoaded} />
      {!isLoaded && <MapSkeleton />}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg" role="alert">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" aria-hidden="true" />
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}

