/**
 * @file camping-card.tsx
 * @description 캠핑장 카드 컴포넌트
 *
 * 캠핑장 목록에서 각 캠핑장을 표시하는 카드 컴포넌트
 *
 * 주요 기능:
 * 1. 썸네일 이미지 표시 (없으면 기본 이미지)
 * 2. 캠핑장명 및 주소 표시
 * 3. 캠핑 타입 뱃지 표시
 * 4. 시설 아이콘 표시
 * 5. 클릭 시 상세페이지 이동
 *
 * @dependencies
 * - types/camping.ts: CampingSite 타입
 * - lib/utils/camping.ts: getImageUrl, formatAddress 유틸리티
 * - lucide-react: 아이콘
 */

"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Home, Wifi, Zap, Droplets, Car } from "lucide-react";
import type { CampingSite } from "@/types/camping";
import { getImageUrl, formatAddress } from "@/lib/utils/camping";

interface CampingCardProps {
  camping: CampingSite;
}

export function CampingCard({ camping }: CampingCardProps) {
  const handleCardClick = () => {
    console.log("[CampingCard] 카드 클릭:", {
      contentId: camping.contentId,
      name: camping.facltNm,
    });
  };

  return (
    <Link
      href={`/campings/${camping.contentId}`}
      onClick={handleCardClick}
      className="group block bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden border border-gray-200 dark:border-gray-700"
    >
      {/* 이미지 영역 */}
      <div className="relative w-full h-48 overflow-hidden bg-gray-200 dark:bg-gray-700">
        <Image
          src={getImageUrl(camping.firstImageUrl)}
          alt={camping.facltNm}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-200"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* 캠핑 타입 뱃지 */}
        {camping.induty && (
          <div className="absolute top-2 left-2">
            <span className="px-2 py-1 text-xs font-semibold bg-green-600 text-white rounded">
              {camping.induty}
            </span>
          </div>
        )}
      </div>

      {/* 내용 영역 */}
      <div className="p-4 space-y-3">
        {/* 캠핑장명 */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
          {camping.facltNm}
        </h3>

        {/* 주소 */}
        <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-1">
            {formatAddress(camping.addr1, camping.addr2)}
          </span>
        </div>

        {/* 한줄 소개 */}
        {camping.lineIntro && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {camping.lineIntro}
          </p>
        )}

        {/* 시설 아이콘 */}
        {camping.sbrsCl && (
          <div className="flex items-center gap-3 flex-wrap">
            {camping.sbrsCl.includes("화장실") && (
              <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                <Droplets className="w-4 h-4" />
                <span>화장실</span>
              </div>
            )}
            {camping.sbrsCl.includes("샤워장") && (
              <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                <Droplets className="w-4 h-4" />
                <span>샤워장</span>
              </div>
            )}
            {camping.sbrsCl.includes("전기") && (
              <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                <Zap className="w-4 h-4" />
                <span>전기</span>
              </div>
            )}
            {camping.sbrsCl.includes("와이파이") && (
              <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                <Wifi className="w-4 h-4" />
                <span>와이파이</span>
              </div>
            )}
            {camping.sbrsCl.includes("주차") && (
              <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                <Car className="w-4 h-4" />
                <span>주차</span>
              </div>
            )}
          </div>
        )}

        {/* 연락처 정보 (있는 경우) */}
        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500 pt-2 border-t border-gray-200 dark:border-gray-700">
          {camping.tel && (
            <div className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              <span>{camping.tel}</span>
            </div>
          )}
          {camping.homepage && (
            <div className="flex items-center gap-1">
              <Home className="w-3 h-3" />
              <span>홈페이지</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

