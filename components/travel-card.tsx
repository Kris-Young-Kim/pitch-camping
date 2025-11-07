/**
 * @file travel-card.tsx
 * @description 여행지 카드 컴포넌트
 *
 * 여행지 목록에서 각 여행지를 표시하는 카드 컴포넌트
 *
 * 주요 기능:
 * 1. 썸네일 이미지 표시 (없으면 기본 이미지)
 * 2. 여행지명 및 주소 표시
 * 3. 여행지 타입 뱃지 표시
 * 4. 카테고리 정보 표시
 * 5. 클릭 시 상세페이지 이동
 *
 * @dependencies
 * - types/travel.ts: TravelSite 타입
 * - lib/utils/travel.ts: getImageUrl, formatAddress, getTravelTypeName 유틸리티
 * - lucide-react: 아이콘
 */

"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Home } from "lucide-react";
import type { TravelSite } from "@/types/travel";
import { getImageUrl, formatAddress, getTravelTypeName } from "@/lib/utils/travel";

interface TravelCardProps {
  travel: TravelSite;
  onCardClick?: (travel: TravelSite) => void;
}

export function TravelCard({ travel, onCardClick }: TravelCardProps) {
  const handleCardClick = () => {
    console.log("[TravelCard] 카드 클릭:", {
      contentid: travel.contentid,
      title: travel.title,
    });
    onCardClick?.(travel);
  };

  return (
    <Link
      href={`/travels/${travel.contentid}`}
      onClick={() => {
        handleCardClick();
      }}
      className="group block bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      aria-label={`${travel.title} 여행지 상세 정보 보기`}
    >
      {/* 이미지 영역 - 16:9 비율 */}
      <div className="relative w-full aspect-[16/9] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
        <Image
          src={getImageUrl(travel.firstimage)}
          alt={`${travel.title} 여행지 이미지`}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={false}
          loading="lazy"
        />
        {/* 그라데이션 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* 여행지 타입 뱃지 */}
        {travel.contenttypeid && (
          <div className="absolute top-3 left-3 z-10">
            <span className="px-3 py-1.5 text-xs font-semibold bg-blue-600/95 backdrop-blur-sm text-white rounded-full shadow-lg" aria-label={`여행지 타입: ${getTravelTypeName(travel.contenttypeid)}`}>
              {getTravelTypeName(travel.contenttypeid)}
            </span>
          </div>
        )}
      </div>

      {/* 내용 영역 */}
      <div className="p-5 space-y-3">
        {/* 여행지명 */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors min-h-[3rem]">
          {travel.title}
        </h3>

        {/* 주소 */}
        <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
          <span className="line-clamp-1">
            {formatAddress(travel.addr1, travel.addr2)}
          </span>
        </div>

        {/* 개요 (한줄 소개) */}
        {travel.overview && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
            {travel.overview.length > 100 
              ? `${travel.overview.substring(0, 100)}...` 
              : travel.overview}
          </p>
        )}

        {/* 카테고리 정보 */}
        {(travel.cat1 || travel.cat2) && (
          <div className="flex items-center gap-2 flex-wrap pt-2" role="list" aria-label="여행지 카테고리">
            {travel.cat1 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-full" role="listitem">
                <span>{travel.cat1}</span>
              </div>
            )}
            {travel.cat2 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-full" role="listitem">
                <span>{travel.cat2}</span>
              </div>
            )}
          </div>
        )}

        {/* 북마크 태그 (북마크 목록에서만 표시) */}
        {"tags" in travel && travel.tags && travel.tags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-2" role="list" aria-label="북마크 태그">
            {travel.tags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/30 rounded-full border border-blue-200 dark:border-blue-800"
                style={tag.color ? { borderColor: tag.color, backgroundColor: `${tag.color}20` } : undefined}
                role="listitem"
              >
                <span style={tag.color ? { color: tag.color } : undefined}>
                  {tag.name}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* 연락처 정보 (있는 경우) */}
        {(travel.tel || travel.homepage) && (
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-700">
            {travel.tel && (
              <div className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                <Phone className="w-3.5 h-3.5" />
                <span>{travel.tel}</span>
              </div>
            )}
            {travel.homepage && (
              <div className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                <Home className="w-3.5 h-3.5" />
                <span>홈페이지</span>
              </div>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

