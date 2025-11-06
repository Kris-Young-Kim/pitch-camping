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
import { campingApi } from "@/lib/api/camping-api";
import { normalizeItems } from "@/lib/utils/camping";
import { DetailGallery } from "@/components/camping-detail/detail-gallery";
import { ShareButton } from "@/components/camping-detail/share-button";
import { BookmarkButton } from "@/components/camping-detail/bookmark-button";
import { ReviewSection } from "@/components/camping-detail/review-section";
import { ReservationButton } from "@/components/camping-detail/reservation-button";
import { SafetyRecommendations } from "@/components/safety/safety-recommendations";
import { LocalNav } from "@/components/navigation/local-nav";
import { SideNav } from "@/components/navigation/side-nav";
import { trackView } from "@/lib/api/analytics";
import { Home, Shield, MessageSquare } from "lucide-react";
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
    const detail = normalizeItems(
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

    const items = normalizeItems(
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
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* LNB: 브레드크럼 네비게이션 */}
      <LocalNav className="sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm" aria-label="브레드크럼">
            <Link
              href="/"
              className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-md"
            >
              홈
            </Link>
            <span className="text-gray-400 dark:text-gray-600" aria-hidden="true">
              /
            </span>
            <span className="text-gray-900 dark:text-white font-medium">{detail.facltNm}</span>
          </nav>
        </div>
      </LocalNav>

      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">

        {/* Hero Section - 이미지 갤러리 */}
        <div className="mb-8">
          <DetailGallery camping={detail} />
        </div>

        {/* 메인 콘텐츠 그리드 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* 좌측 컬럼 - 메인 정보 (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* 제목 및 액션 버튼 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 md:p-8">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                    {detail.facltNm}
                  </h1>
                  {detail.induty && (
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="px-3 py-1.5 text-sm font-semibold bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 rounded-full">
                        {detail.induty}
                      </span>
                      {detail.doNm && (
                        <span className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-full">
                          📍 {detail.doNm} {detail.sigunguNm || ""}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <ShareButton contentId={contentId} />
                  <BookmarkButton contentId={contentId} />
                </div>
              </div>

              {/* 기본 정보 */}
              <div className="space-y-5 pt-6 border-t border-gray-200 dark:border-gray-700">
                {detail.addr1 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      📍 주소
                    </h3>
                    <p className="text-gray-900 dark:text-white text-base">
                      {detail.addr1} {detail.addr2 || ""}
                    </p>
                  </div>
                )}

                {detail.tel && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      📞 전화번호
                    </h3>
                    <a
                      href={`tel:${detail.tel}`}
                      className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-base font-medium hover:underline transition-colors"
                    >
                      {detail.tel}
                    </a>
                  </div>
                )}

                {detail.homepage && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      🌐 홈페이지
                    </h3>
                    <a
                      href={detail.homepage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-base font-medium hover:underline transition-colors break-all"
                    >
                      {detail.homepage}
                    </a>
                  </div>
                )}

                {detail.intro && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      📝 소개
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed text-base">
                      {detail.intro}
                    </p>
                  </div>
                )}

                {detail.sbrsCl && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      🔧 시설
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {detail.sbrsCl.split(",").map((facility, index) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-full"
                        >
                          {facility.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 리뷰 섹션 */}
            <ReviewSection contentId={contentId} />

            {/* 안전 수칙 추천 */}
            <SafetyRecommendations campingType={detail.induty} />
          </div>

          {/* 우측 컬럼 - 사이드바 (1/3) */}
          <div className="lg:col-span-1 space-y-6">
            {/* SNB: 빠른 링크 */}
            <SideNav
              title="빠른 링크"
              items={[
                { href: "/", label: "홈", icon: <Home className="w-4 h-4" /> },
                { href: "/safety", label: "안전 수칙", icon: <Shield className="w-4 h-4" /> },
                { href: "/feedback", label: "피드백", icon: <MessageSquare className="w-4 h-4" /> },
              ]}
            />

            {/* 예약 버튼 - Sticky */}
            <div className="lg:sticky lg:top-24">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <ReservationButton camping={detail} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

