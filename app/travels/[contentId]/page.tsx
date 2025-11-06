/**
 * @file page.tsx
 * @description 여행지 상세페이지
 *
 * 여행지의 상세 정보를 표시하는 페이지
 *
 * 주요 기능:
 * 1. TourAPI를 통한 상세 정보 조회
 * 2. 기본 정보, 운영 정보, 시설 정보 표시
 * 3. 이미지 갤러리
 * 4. 지도 표시
 * 5. 공유 기능
 * 6. 동적 메타데이터 생성
 *
 * @dependencies
 * - types/travel.ts: TravelSiteDetail 타입
 * - lib/api/travel-api.ts: travelApi 클라이언트
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import { travelApi } from "@/lib/api/travel-api";
import { TravelApiClient } from "@/lib/api/travel-api";
import { DetailGallery } from "@/components/travel-detail/detail-gallery";
import { ShareButton } from "@/components/travel-detail/share-button";
import { BookmarkButton } from "@/components/travel-detail/bookmark-button";
import { ContactButton } from "@/components/travel-detail/contact-button";
import { WeatherWidget } from "@/components/travel-detail/weather-widget";
import { LocalNav } from "@/components/navigation/local-nav";
import { SideNav } from "@/components/navigation/side-nav";
import { trackView } from "@/lib/api/analytics";
import { getTravelTypeName } from "@/lib/utils/travel";
import { Home, Shield, MessageSquare } from "lucide-react";
import type { TravelSiteDetail } from "@/types/travel";
import type { Metadata } from "next";

interface TravelDetailPageProps {
  params: Promise<{ contentId: string }>;
}

// 동적 메타데이터 생성
export async function generateMetadata({
  params,
}: TravelDetailPageProps): Promise<Metadata> {
  const { contentId } = await params;

  try {
    console.log("[TravelDetailPage] 메타데이터 생성 시작:", contentId);
    const response = await travelApi.getTravelDetail(contentId);
    const items = TravelApiClient.normalizeItems(
      response.response?.body?.items?.item
    ) as TravelSiteDetail[];
    const detail = items[0];

    if (!detail) {
      return {
        title: "여행지를 찾을 수 없습니다",
      };
    }

    const title = `${detail.title} | Pitch Travel`;
    const description =
      detail.overview?.substring(0, 100) ||
      "여행지 상세 정보를 확인하세요";
    const image = detail.firstimage || "/og-image.png";

    console.log("[TravelDetailPage] 메타데이터 생성 완료:", {
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
            alt: detail.title,
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
    console.error("[TravelDetailPage] 메타데이터 생성 오류:", error);
    return {
      title: "여행지 상세 정보",
    };
  }
}

export default async function TravelDetailPage({
  params,
}: TravelDetailPageProps) {
  const { contentId } = await params;

  console.group(`[TravelDetailPage] 페이지 로드: ${contentId}`);

  let detail: TravelSiteDetail | null = null;
  let introInfo: TravelSiteDetail | null = null;
  let error: string | null = null;

  try {
    console.log("[TravelDetailPage] API 호출 시작");

    // 공통정보 조회
    const commonResponse = await travelApi.getTravelDetail(contentId);
    console.log("[TravelDetailPage] 공통정보 API 응답:", commonResponse);

    const commonItems = TravelApiClient.normalizeItems(
      commonResponse.response?.body?.items?.item
    ) as TravelSiteDetail[];

    if (commonItems.length === 0) {
      console.warn("[TravelDetailPage] 데이터 없음");
      error = "여행지 정보를 찾을 수 없습니다.";
    } else {
      detail = commonItems[0];
      console.log("[TravelDetailPage] 여행지 정보:", {
        name: detail.title,
        address: detail.addr1,
        contentTypeId: detail.contenttypeid,
      });

      // 소개정보 조회 (contentTypeId가 있는 경우)
      if (detail.contenttypeid) {
        try {
          const introResponse = await travelApi.getTravelDetailIntro(
            contentId,
            detail.contenttypeid
          );
          const introItems = TravelApiClient.normalizeItems(
            introResponse.response?.body?.items?.item
          ) as TravelSiteDetail[];

          if (introItems.length > 0) {
            introInfo = introItems[0];
            // 소개정보를 detail에 병합
            detail = { ...detail, ...introInfo };
            console.log("[TravelDetailPage] 소개정보 병합 완료");
          }
        } catch (introErr) {
          console.warn("[TravelDetailPage] 소개정보 조회 실패 (무시):", introErr);
          // 소개정보 조회 실패는 무시하고 공통정보만 사용
        }
      }
    }
  } catch (err) {
    console.error("[TravelDetailPage] API 호출 오류:", err);
    error =
      err instanceof Error
        ? err.message
        : "여행지 정보를 불러오는데 실패했습니다.";
  } finally {
    console.groupEnd();
  }

  if (error || !detail) {
    notFound();
  }

  // 조회수 추적 (비동기, 에러 발생해도 페이지 렌더링 계속)
  trackView(contentId).catch((err) => {
    console.error("[TravelDetailPage] 조회수 추적 오류:", err);
  });

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* LNB: 브레드크럼 네비게이션 */}
      <LocalNav className="sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm" aria-label="브레드크럼">
            <Link
              href="/"
              className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md"
            >
              홈
            </Link>
            <span className="text-gray-400 dark:text-gray-600" aria-hidden="true">
              /
            </span>
            <span className="text-gray-900 dark:text-white font-medium">{detail.title}</span>
          </nav>
        </div>
      </LocalNav>

      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        {/* Hero Section - 이미지 갤러리 */}
        <div className="mb-8">
          <DetailGallery travel={detail} />
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
                    {detail.title}
                  </h1>
                  <div className="flex items-center gap-3 flex-wrap">
                    {detail.contenttypeid && (
                      <span className="px-3 py-1.5 text-sm font-semibold bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-full">
                        {getTravelTypeName(detail.contenttypeid)}
                      </span>
                    )}
                    {detail.cat1 && (
                      <span className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-full">
                        {detail.cat1}
                        {detail.cat2 && ` · ${detail.cat2}`}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <ContactButton travel={detail} />
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
                      {detail.zipcode && ` (${detail.zipcode})`}
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
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-base font-medium hover:underline transition-colors"
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
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-base font-medium hover:underline transition-colors break-all"
                    >
                      {detail.homepage}
                    </a>
                  </div>
                )}

                {detail.overview && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      📝 개요
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed text-base">
                      {detail.overview}
                    </p>
                  </div>
                )}

                {/* 운영 정보 */}
                {(detail.usetime || detail.restdate || detail.usetimefestival) && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      ⏰ 운영 정보
                    </h3>
                    <div className="space-y-2">
                      {detail.usetime && (
                        <p className="text-gray-700 dark:text-gray-300 text-base">
                          <span className="font-medium">이용시간:</span> {detail.usetime}
                        </p>
                      )}
                      {detail.usetimefestival && (
                        <p className="text-gray-700 dark:text-gray-300 text-base">
                          <span className="font-medium">축제 이용시간:</span> {detail.usetimefestival}
                        </p>
                      )}
                      {detail.restdate && (
                        <p className="text-gray-700 dark:text-gray-300 text-base">
                          <span className="font-medium">휴무일:</span> {detail.restdate}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* 시설 정보 */}
                {(detail.infocenter || detail.parking || detail.parkingfee || detail.usefee) && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      🔧 시설 정보
                    </h3>
                    <div className="space-y-2">
                      {detail.infocenter && (
                        <p className="text-gray-700 dark:text-gray-300 text-base">
                          <span className="font-medium">문의 및 안내:</span> {detail.infocenter}
                        </p>
                      )}
                      {detail.parking && (
                        <p className="text-gray-700 dark:text-gray-300 text-base">
                          <span className="font-medium">주차시설:</span> {detail.parking}
                        </p>
                      )}
                      {detail.parkingfee && (
                        <p className="text-gray-700 dark:text-gray-300 text-base">
                          <span className="font-medium">주차요금:</span> {detail.parkingfee}
                        </p>
                      )}
                      {detail.usefee && (
                        <p className="text-gray-700 dark:text-gray-300 text-base">
                          <span className="font-medium">이용요금:</span> {detail.usefee}
                        </p>
                      )}
                      {detail.discountinfo && (
                        <p className="text-gray-700 dark:text-gray-300 text-base">
                          <span className="font-medium">할인정보:</span> {detail.discountinfo}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* 기타 정보 */}
                {(detail.chkbabycarriage || detail.chkpet || detail.chkcreditcard) && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      ℹ️ 기타 정보
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {detail.chkbabycarriage && (
                        <span className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-full">
                          유모차 대여: {detail.chkbabycarriage}
                        </span>
                      )}
                      {detail.chkpet && (
                        <span className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-full">
                          애완동물: {detail.chkpet}
                        </span>
                      )}
                      {detail.chkcreditcard && (
                        <span className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-full">
                          신용카드: {detail.chkcreditcard}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 우측 컬럼 - 사이드바 (1/3) */}
          <div className="lg:col-span-1 space-y-6">
            {/* 날씨 위젯 */}
            <WeatherWidget travel={detail} />

            {/* SNB: 빠른 링크 */}
            <SideNav
              title="빠른 링크"
              items={[
                { href: "/", label: "홈", icon: <Home className="w-4 h-4" /> },
                { href: "/safety", label: "안전 수칙", icon: <Shield className="w-4 h-4" /> },
                { href: "/feedback", label: "피드백", icon: <MessageSquare className="w-4 h-4" /> },
              ]}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

