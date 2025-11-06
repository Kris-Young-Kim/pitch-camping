/**
 * @file reservation-button.tsx
 * @description 예약 버튼 컴포넌트
 *
 * 캠핑장 예약을 위한 버튼 컴포넌트
 * 현재는 외부 링크 방식으로 구현 (향후 API 연동 시 확장)
 *
 * 주요 기능:
 * 1. 홈페이지 링크로 예약 페이지 이동
 * 2. 전화번호가 있는 경우 전화 연결
 * 3. 예약 가능 여부 표시
 *
 * @dependencies
 * - components/ui/button.tsx: Button 컴포넌트
 * - lucide-react: Calendar, Phone, ExternalLink 아이콘
 */

"use client";

import { Button } from "@/components/ui/button";
import { Calendar, Phone, ExternalLink } from "lucide-react";
import type { CampingSiteDetail } from "@/types/camping";

interface ReservationButtonProps {
  camping: CampingSiteDetail;
  className?: string;
}

/**
 * 홈페이지 URL에서 예약 페이지 경로 추출 또는 생성
 * 실제 구현 시 캠핑장별 예약 시스템에 맞게 수정 필요
 */
function getReservationUrl(homepage?: string): string | null {
  if (!homepage) return null;
  
  // 홈페이지 URL 정규화
  let url = homepage.trim();
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }

  // 일부 캠핑장은 홈페이지에 예약 페이지가 포함되어 있을 수 있음
  // 현재는 홈페이지 그대로 사용 (향후 개별 매핑 필요)
  return url;
}

export function ReservationButton({ camping, className }: ReservationButtonProps) {
  const reservationUrl = getReservationUrl(camping.homepage);
  const hasPhone = !!camping.tel;

  // 예약 가능 여부 (홈페이지 또는 전화번호가 있으면 예약 가능)
  const isAvailable = reservationUrl || hasPhone;

  const handleReservation = () => {
    console.group("[ReservationButton] 예약 시작");
    console.log("캠핑장:", camping.facltNm);
    console.log("홈페이지:", camping.homepage);
    console.log("전화번호:", camping.tel);

    if (reservationUrl) {
      // 홈페이지로 이동 (새 창에서 열기)
      console.log("[ReservationButton] 예약 페이지로 이동:", reservationUrl);
      window.open(reservationUrl, "_blank", "noopener,noreferrer");
    } else if (hasPhone) {
      // 전화 연결
      console.log("[ReservationButton] 전화 연결:", camping.tel);
      window.location.href = `tel:${camping.tel}`;
    }

    console.groupEnd();
  };

  if (!isAvailable) {
    return (
      <Button
        variant="outline"
        size="lg"
        disabled
        className={className}
        aria-label="예약 불가"
      >
        <Calendar className="w-4 h-4 mr-2" aria-hidden="true" />
        예약 정보 없음
      </Button>
    );
  }

  return (
    <Button
      onClick={handleReservation}
      size="lg"
      className={`bg-green-600 hover:bg-green-700 text-white ${className || ""}`}
      aria-label={reservationUrl ? "예약 페이지 열기" : "전화 연결"}
    >
      {reservationUrl ? (
        <>
          <Calendar className="w-4 h-4 mr-2" aria-hidden="true" />
          예약하기
          <ExternalLink className="w-4 h-4 ml-2" aria-hidden="true" />
        </>
      ) : (
        <>
          <Phone className="w-4 h-4 mr-2" aria-hidden="true" />
          전화 예약
        </>
      )}
    </Button>
  );
}

