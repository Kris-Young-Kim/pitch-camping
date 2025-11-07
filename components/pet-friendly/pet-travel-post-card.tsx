/**
 * @file pet-travel-post-card.tsx
 * @description 반려동물 동반 여행 커뮤니티 게시글 카드 컴포넌트
 */

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, Eye, BookOpen, Lightbulb, CheckSquare, MapPin } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import Link from "next/link";
import type { PetTravelPost } from "@/actions/pet-friendly/community/get-pet-travel-posts";
import { togglePetTravelPostLike } from "@/actions/pet-friendly/community/toggle-pet-travel-post-like";
import { toast } from "sonner";

interface PetTravelPostCardProps {
  post: PetTravelPost;
  onUpdate?: () => void;
}

function getPostTypeIcon(type: PetTravelPost["postType"]) {
  switch (type) {
    case "review":
      return <BookOpen className="w-4 h-4" />;
    case "tip":
      return <Lightbulb className="w-4 h-4" />;
    case "checklist":
      return <CheckSquare className="w-4 h-4" />;
  }
}

function getPostTypeLabel(type: PetTravelPost["postType"]) {
  switch (type) {
    case "review":
      return "후기";
    case "tip":
      return "팁";
    case "checklist":
      return "체크리스트";
  }
}

export function PetTravelPostCard({ post, onUpdate }: PetTravelPostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [isToggling, setIsToggling] = useState(false);

  const handleToggleLike = async () => {
    if (isToggling) return;

    console.group("[PetTravelPostCard] 좋아요 토글 요청");
    setIsToggling(true);
    const previousLiked = isLiked;
    const previousCount = likeCount;

    // 낙관적 업데이트
    setIsLiked(!isLiked);
    setLikeCount((prev) => (previousLiked ? prev - 1 : prev + 1));

    try {
      const result = await togglePetTravelPostLike(post.id);
      if (!result.success) {
        // 실패 시 롤백
        setIsLiked(previousLiked);
        setLikeCount(previousCount);
        toast.error(result.error || "좋아요 처리에 실패했습니다.");
      }
    } catch (error) {
      // 실패 시 롤백
      setIsLiked(previousLiked);
      setLikeCount(previousCount);
      toast.error("좋아요 처리 중 오류가 발생했습니다.");
    } finally {
      setIsToggling(false);
      console.groupEnd();
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-emerald-600">
                {getPostTypeIcon(post.postType)}
                <span className="ml-1">{getPostTypeLabel(post.postType)}</span>
              </Badge>
              {post.travelContentId && (
                <Link
                  href={`/travels/${post.travelContentId}`}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                >
                  <MapPin className="w-3 h-3" />
                  여행지 보기
                </Link>
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {post.title}
            </h3>
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              <span>{post.userName}</span>
              <span>•</span>
              <span>{format(new Date(post.createdAt), "PPP", { locale: ko })}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">{post.content}</p>

        {/* 태그 */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* 통계 및 액션 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {post.viewCount}
            </span>
            <button
              onClick={handleToggleLike}
              disabled={isToggling}
              className={`flex items-center gap-1 transition ${
                isLiked
                  ? "text-red-600 dark:text-red-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
              {likeCount}
            </button>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              {post.commentCount}
            </span>
          </div>
          <Link href={`/pet-travel/community/${post.id}`}>
            <Button variant="outline" size="sm">
              자세히 보기
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

