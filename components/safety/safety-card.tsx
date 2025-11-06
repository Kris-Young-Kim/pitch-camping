/**
 * @file safety-card.tsx
 * @description 안전 수칙 카드 컴포넌트
 *
 * 안전 수칙 목록에서 개별 안전 수칙을 표시하는 카드 컴포넌트
 *
 * 주요 기능:
 * 1. 안전 수칙 제목, 썸네일 이미지 표시
 * 2. 계절/주제 태그 표시
 * 3. 클릭 시 상세 페이지로 이동
 *
 * @dependencies
 * - components/ui/card.tsx: Card 컴포넌트
 * - lucide-react: 아이콘
 * - types: SafetyGuideline 타입
 */

"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Calendar, Tag } from "lucide-react";
import type { SafetyGuideline } from "@/lib/api/safety-guidelines";

interface SafetyCardProps {
  guideline: SafetyGuideline;
  showSeason?: boolean;
  showTopic?: boolean;
}

const SEASON_LABELS: Record<string, string> = {
  spring: "봄",
  summer: "여름",
  autumn: "가을",
  winter: "겨울",
  all: "전체",
};

const TOPIC_LABELS: Record<string, string> = {
  food_poisoning: "식중독",
  water_play: "물놀이",
  insects: "벌레",
  wildlife: "야생동물",
  weather: "이상기후",
  heat: "폭염",
  heater: "난로",
  gas: "가스",
  co: "일산화탄소",
  preparation: "준비사항",
  general: "일반",
};

export function SafetyCard({ guideline, showSeason = true, showTopic = true }: SafetyCardProps) {
  const seasonLabel = guideline.season ? SEASON_LABELS[guideline.season] : null;
  const topicLabel = TOPIC_LABELS[guideline.topic] || guideline.topic;

  return (
    <Link href={`/safety/${guideline.id}`} className="block">
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
        {/* 썸네일 이미지 */}
        {guideline.image_url && (
          <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
            <Image
              src={guideline.image_url}
              alt={guideline.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}

        <CardHeader>
          <CardTitle className="line-clamp-2 min-h-[3rem]">{guideline.title}</CardTitle>
          <div className="flex flex-wrap gap-2 mt-2">
            {showSeason && seasonLabel && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Calendar className="w-3 h-3" aria-hidden="true" />
                {seasonLabel}
              </Badge>
            )}
            {showTopic && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Tag className="w-3 h-3" aria-hidden="true" />
                {topicLabel}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
            {guideline.content.replace(/[#*]/g, "").substring(0, 100)}...
          </p>
        </CardContent>

        <CardFooter className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3" aria-hidden="true" />
            안전 수칙
          </div>
          {guideline.view_count > 0 && (
            <span>조회 {guideline.view_count.toLocaleString()}</span>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}

