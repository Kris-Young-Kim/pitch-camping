/**
 * @file page.tsx
 * @description 캠핑장 상세페이지
 *
 * 캠핑장의 상세 정보를 표시하는 페이지
 *
 * 주요 기능:
 * 1. 고캠핑 API를 통한 상세 정보 조회
 * 2. 기본 정보, 시설 정보, 운영 정보 표시
 * 3. 이미지 갤러리
 * 4. 지도 표시
 * 5. 공유 기능
 * 6. 동적 메타데이터 생성
 *
 * @dependencies
 * - types/camping.ts: CampingSiteDetail 타입
 * - lib/api/camping-api.ts: campingApi 클라이언트
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { campingApi, CampingApiClient } from "@/lib/api/camping-api";
import { DetailGallery } from "@/components/camping-detail/detail-gallery";
import { ShareButton } from "@/components/camping-detail/share-button";
import { BookmarkButton } from "@/components/camping-detail/bookmark-button";
import { ReviewSection } from "@/components/camping-detail/review-section";
import { ReservationButton } from "@/components/camping-detail/reservation-button";
import { SafetyRecommendations } from "@/components/safety/safety-recommendations";
import { trackView } from "@/lib/api/analytics";
import type { CampingSiteDetail } from "@/types/camping";
import type { Metadata } from "next";

interface CampingDetailPageProps {
  params: Promise<{ contentId: string }>;
}

// 동적 메타데이터 생성
export async function generateMetadata({
  params,
}: CampingDetailPageProps): Promise<Metadata> {
  const { contentId } = await params;

  try {
    console.log("[CampingDetailPage] 메타데이터 생성 시작:", contentId);
    const response = await campingApi.getCampingDetail(contentId);
    const detail = CampingApiClient.normalizeItems(
      response.response?.body?.items?.item
    )[0];

    if (!detail) {
      return {
        title: "캠핑장을 찾을 수 없습니다",
      };
    }

    const title = `${detail.facltNm} | Pitch Camping`;
    const description =
      detail.lineIntro ||
      detail.intro?.substring(0, 100) ||
      "캠핑장 상세 정보를 확인하세요";
    const image = detail.firstImageUrl || "/og-image.png";

    console.log("[CampingDetailPage] 메타데이터 생성 완료:", {
      title,
      description: description.substring(0, 50) + "...",
    });

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [
          {
            url: image,
            width: 1200,
            height: 630,
            alt: detail.facltNm,
          },
        ],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [image],
      },
    };
  } catch (error) {
    console.error("[CampingDetailPage] 메타데이터 생성 오류:", error);
    return {
      title: "캠핑장 상세 정보",
    };
  }
}

export default async function CampingDetailPage({
  params,
}: CampingDetailPageProps) {
  const { contentId } = await params;

  console.group(`[CampingDetailPage] 페이지 로드: ${contentId}`);

  let detail: CampingSiteDetail | null = null;
  let error: string | null = null;

  try {
    console.log("[CampingDetailPage] API 호출 시작");
    const response = await campingApi.getCampingDetail(contentId);
    console.log("[CampingDetailPage] API 응답:", response);

    const items = CampingApiClient.normalizeItems(
      response.response?.body?.items?.item
    );

    if (items.length === 0) {
      console.warn("[CampingDetailPage] 데이터 없음");
      error = "캠핑장 정보를 찾을 수 없습니다.";
    } else {
      detail = items[0];
      console.log("[CampingDetailPage] 캠핑장 정보:", {
        name: detail.facltNm,
        address: detail.addr1,
      });
    }
  } catch (err) {
    console.error("[CampingDetailPage] API 호출 오류:", err);
    error =
      err instanceof Error
        ? err.message
        : "캠핑장 정보를 불러오는데 실패했습니다.";
  } finally {
    console.groupEnd();
  }

  if (error || !detail) {
    notFound();
  }

  // 조회수 추적 (비동기, 에러 발생해도 페이지 렌더링 계속)
  trackView(contentId).catch((err) => {
    console.error("[CampingDetailPage] 조회수 추적 오류:", err);
  });

  return (
    <main className="min-h-[calc(100vh-80px)] py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* 뒤로가기 버튼 */}
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            목록으로 돌아가기
          </Button>
        </Link>

        {/* 기본 정보 섹션 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {detail.facltNm}
            </h1>
            <div className="flex gap-2">
              <ShareButton contentId={contentId} />
              <BookmarkButton contentId={contentId} />
            </div>
          </div>

          {/* 이미지 갤러리 */}
          <DetailGallery camping={detail} />

          {/* 예약 버튼 (눈에 띄는 위치) */}
          <div className="mt-6 mb-6">
            <ReservationButton camping={detail} />
          </div>

          <div className="space-y-4 mt-6">
            {detail.addr1 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  주소
                </h3>
                <p className="text-gray-900 dark:text-white">
                  {detail.addr1} {detail.addr2 || ""}
                </p>
              </div>
            )}

            {detail.tel && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  전화번호
                </h3>
                <a
                  href={`tel:${detail.tel}`}
                  className="text-green-600 dark:text-green-400 hover:underline"
                >
                  {detail.tel}
                </a>
              </div>
            )}

            {detail.homepage && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  홈페이지
                </h3>
                <a
                  href={detail.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 dark:text-green-400 hover:underline"
                >
                  {detail.homepage}
                </a>
              </div>
            )}

            {detail.intro && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  소개
                </h3>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {detail.intro}
                </p>
              </div>
            )}

            {detail.sbrsCl && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  시설
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {detail.sbrsCl}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 리뷰 섹션 */}
        <ReviewSection contentId={contentId} />

        {/* 안전 수칙 추천 */}
        <SafetyRecommendations campingType={detail.induty} />
      </div>
    </main>
  );
}

