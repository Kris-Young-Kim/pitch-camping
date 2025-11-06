/**
 * @file safety-video.tsx
 * @description 안전 수칙 동영상 컴포넌트
 *
 * 안전 수칙 동영상을 표시하는 컴포넌트
 * YouTube, 외부 링크, 내부 저장 동영상 지원
 *
 * @dependencies
 * - Next.js Image 컴포넌트
 */

import { Play, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SafetyVideoProps {
  videoUrl: string;
  videoType: "youtube" | "external" | "internal" | null;
  title?: string;
  thumbnailUrl?: string;
}

/**
 * YouTube URL에서 비디오 ID 추출
 */
function getYouTubeVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export function SafetyVideo({ videoUrl, videoType, title, thumbnailUrl }: SafetyVideoProps) {
  if (!videoUrl) return null;

  // YouTube 동영상
  if (videoType === "youtube") {
    const videoId = getYouTubeVideoId(videoUrl);
    if (videoId) {
      return (
        <Card>
          {title && (
            <CardHeader>
              <CardTitle>{title}</CardTitle>
            </CardHeader>
          )}
          <CardContent>
            <div className="aspect-video w-full overflow-hidden rounded-lg">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title={title || "안전 수칙 동영상"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
                aria-label={title || "안전 수칙 동영상"}
              />
            </div>
          </CardContent>
        </Card>
      );
    }
  }

  // 외부 링크 또는 내부 저장 동영상
  return (
    <Card>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="aspect-video w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 relative">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={title || "동영상 썸네일"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Play className="w-16 h-16 text-gray-400" aria-hidden="true" />
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              asChild
              variant="secondary"
              size="lg"
              className="bg-white/90 hover:bg-white"
            >
              <a
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
                aria-label={`${title || "동영상"} 보기`}
              >
                <Play className="w-5 h-5" aria-hidden="true" />
                동영상 보기
                <ExternalLink className="w-4 h-4" aria-hidden="true" />
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

