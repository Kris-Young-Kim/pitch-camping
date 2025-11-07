/**
 * @file naver-map.tsx
 * @description 네이버 지도 컴포넌트
 *
 * Naver Maps JavaScript API v3 (NCP)를 사용한 지도 컴포넌트
 *
 * 주요 기능:
 * 1. 네이버 지도 초기화 및 표시
 * 2. 여행지 마커 표시
 * 3. 마커 클릭 시 인포윈도우 표시
 * 4. 리스트와 연동 (특정 마커로 이동)
 *
 * @dependencies
 * - types/travel.ts: TravelSite 타입
 * - lib/utils/travel.ts: parseCoordinates 좌표 파싱 함수
 * - Naver Maps JavaScript API v3 (NCP)
 */

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MapPin } from "lucide-react";
import { MapSkeleton } from "@/components/loading/map-skeleton";
import type { TravelSite } from "@/types/travel";
import { parseCoordinates } from "@/lib/utils/travel";

declare global {
  interface Window {
    naver: any;
  }
}

interface NaverMapProps {
  travels: TravelSite[];
  center?: { lat: number; lng: number };
  zoom?: number;
  onMarkerClick?: (travel: TravelSite) => void;
  selectedTravelId?: string;
  className?: string;
  // 지도 내 검색·필터·정렬 기능
  showFilterOverlay?: boolean;
  onFilterChange?: (filter: { keyword?: string; type?: string }) => void;
  currentFilter?: { keyword?: string; type?: string };
}

export function NaverMap({
  travels,
  center,
  zoom = 10,
  onMarkerClick,
  selectedTravelId,
  className = "",
  showFilterOverlay = false,
  onFilterChange,
  currentFilter,
}: NaverMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const infoWindowsRef = useRef<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const travelsRef = useRef<TravelSite[]>([]);
  const prevTravelsRef = useRef<string>(""); // 이전 travels의 contentid 문자열
  const onMarkerClickRef = useRef(onMarkerClick);

  // travels와 onMarkerClick을 ref로 저장하여 안정화
  useEffect(() => {
    travelsRef.current = travels;
  }, [travels]);

  useEffect(() => {
    onMarkerClickRef.current = onMarkerClick;
  }, [onMarkerClick]);

  // 마커 추가 함수 (initializeMap보다 먼저 정의)
  const addMarkers = useCallback(() => {
    if (!mapInstanceRef.current || !window.naver?.maps) {
      return;
    }

    const currentTravels = travelsRef.current;
    console.log("[NaverMap] 마커 추가 시작:", currentTravels.length);

    // 기존 마커 제거
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
    infoWindowsRef.current.forEach((infoWindow) => infoWindow.close());
    infoWindowsRef.current = [];

    currentTravels.forEach((travel) => {
      try {
        // 좌표 파싱 (TourAPI는 WGS84 좌표계 사용)
        const coords = parseCoordinates(travel.mapx, travel.mapy);
        if (!coords) {
          console.warn("[NaverMap] 좌표 파싱 실패:", travel);
          return;
        }

        const position = new window.naver.maps.LatLng(coords.lat, coords.lng);

        // 마커 생성 (기본 마커 사용)
        const marker = new window.naver.maps.Marker({
          position: position,
          map: mapInstanceRef.current,
          title: travel.title,
        });

        // 인포윈도우 생성
        const overview = travel.overview ? (travel.overview.length > 100 ? travel.overview.substring(0, 100) + "..." : travel.overview) : "";
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
            ">${travel.title}</h3>
            ${overview ? `<p style="font-size: 14px; color: #666; margin-bottom: 8px;">${overview}</p>` : ""}
            <div style="font-size: 12px; color: #888; margin-bottom: 12px;">
              ${travel.addr1 || ""}
            </div>
            <a href="/travels/${travel.contentid}" style="
              display: inline-block;
              padding: 6px 12px;
              background-color: #3b82f6;
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
          console.log("[NaverMap] 마커 클릭:", travel.title);

          // 다른 인포윈도우 닫기
          infoWindowsRef.current.forEach((iw) => iw.close());

          // 인포윈도우 열기
          infoWindow.open(mapInstanceRef.current, marker);

          // 콜백 호출 (ref를 통해 안정적으로 호출)
          onMarkerClickRef.current?.(travel);
        });

        markersRef.current.push(marker);
        infoWindowsRef.current.push(infoWindow);
      } catch (err) {
        console.error("[NaverMap] 마커 추가 오류:", err, travel);
      }
    });

    console.log("[NaverMap] 마커 추가 완료:", markersRef.current.length);
  }, []); // 의존성 제거 - ref를 통해 travels와 onMarkerClick 접근

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
      if (travelsRef.current.length > 0) {
        addMarkers();
      }
    } catch (err) {
      console.error("[NaverMap] 지도 초기화 오류:", err);
      setError("지도를 초기화하는데 실패했습니다.");
    }
  }, [center, zoom, addMarkers]);

  // 네이버 지도 스크립트 로드
  useEffect(() => {
    console.group("[NaverMap] 네이버 지도 초기화");
    console.log("여행지 개수:", travels.length);

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
  }, [initializeMap]); // travels.length는 로그용이므로 의존성에서 제외

  // 선택된 여행지로 지도 이동
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedTravelId || !isLoaded) {
      return;
    }

    const selectedTravel = travels.find(
      (t) => t.contentid === selectedTravelId
    );

    if (selectedTravel) {
      console.log("[NaverMap] 선택된 여행지로 이동:", selectedTravel.title);

      const coords = parseCoordinates(selectedTravel.mapx, selectedTravel.mapy);
      if (!coords) {
        console.warn("[NaverMap] 좌표 파싱 실패:", selectedTravel);
        return;
      }

      const position = new window.naver.maps.LatLng(coords.lat, coords.lng);

      mapInstanceRef.current.setCenter(position);
      mapInstanceRef.current.setZoom(15);

      // 해당 마커의 인포윈도우 열기
      const markerIndex = travels.findIndex(
        (t) => t.contentid === selectedTravelId
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
  }, [selectedTravelId, travels, isLoaded]);

  // 여행지 목록이 변경되면 마커 업데이트 (실제 변경 시에만)
  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    const currentTravels = travelsRef.current;
    
    // 이전 travels와 비교하여 실제로 변경되었는지 확인
    const currentTravelIds = currentTravels.map(t => t.contentid).sort().join(',');
    const prevTravelIds = prevTravelsRef.current;

    // 실제로 변경된 경우에만 마커 업데이트
    if (currentTravelIds !== prevTravelIds) {
      console.log("[NaverMap] 여행지 목록 변경 감지, 마커 업데이트");
      
      // 이전 travels ID 저장
      prevTravelsRef.current = currentTravelIds;
      
      if (currentTravels.length > 0) {
        addMarkers();

        // 모든 마커를 보기 위해 지도 범위 조정
        if (markersRef.current.length > 0 && mapInstanceRef.current) {
          const bounds = new window.naver.maps.LatLngBounds();
          let hasValidCoords = false;

          currentTravels.forEach((travel) => {
            const coords = parseCoordinates(travel.mapx, travel.mapy);
            if (coords) {
              bounds.extend(new window.naver.maps.LatLng(coords.lat, coords.lng));
              hasValidCoords = true;
            }
          });

          // 유효한 좌표가 있는 경우에만 지도 범위 조정
          if (hasValidCoords) {
            try {
              mapInstanceRef.current.fitBounds(bounds);
            } catch (err) {
              console.error("[NaverMap] 지도 범위 조정 실패:", err);
            }
          }
        }
      } else {
        // travels가 비어있으면 마커 제거
        markersRef.current.forEach((marker) => marker.setMap(null));
        markersRef.current = [];
        infoWindowsRef.current.forEach((infoWindow) => infoWindow.close());
        infoWindowsRef.current = [];
      }
    }
  }, [travels, isLoaded, addMarkers]); // travels는 여전히 의존성에 포함 (변경 감지용)

  return (
    <div className={`relative w-full h-full min-h-[400px] md:min-h-[600px] ${className}`} role="application" aria-label="네이버 지도">
      <div ref={mapRef} className="w-full h-full rounded-lg" aria-hidden={!isLoaded} />
      
      {/* 지도 내 필터/검색 오버레이 (선택적) */}
      {showFilterOverlay && onFilterChange && (
        <div className="absolute top-4 left-4 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 min-w-[280px] max-w-[320px]">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              지도에서 검색
            </h3>
            
            {/* 검색 입력 */}
            <div>
              <label htmlFor="map-search" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                키워드 검색
              </label>
              <input
                id="map-search"
                type="text"
                placeholder="여행지명, 주소 검색..."
                value={currentFilter?.keyword || ""}
                onChange={(e) => {
                  onFilterChange({ ...currentFilter, keyword: e.target.value });
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 마커 개수 표시 */}
            <div className="text-xs text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
              표시된 여행지: <span className="font-semibold">{travels.length}개</span>
            </div>
          </div>
        </div>
      )}

      {/* 마커 개수 표시 (오버레이 없을 때) */}
      {!showFilterOverlay && travels.length > 0 && (
        <div className="absolute top-4 right-4 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-md px-3 py-2">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {travels.length}개 여행지
          </span>
        </div>
      )}

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

