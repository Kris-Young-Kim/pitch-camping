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
import { normalizeTravelItems } from "@/lib/utils/travel";
import { DetailGallery } from "@/components/travel-detail/detail-gallery";
import { ShareButton } from "@/components/travel-detail/share-button";
import { BookmarkButton } from "@/components/travel-detail/bookmark-button";
import { ContactButton } from "@/components/travel-detail/contact-button";
// import { WeatherWidget } from "@/components/travel-detail/weather-widget"; // 추후 개발 예정
import { TransportInfo } from "@/components/travel-detail/transport-info";
// import { SafetyRecommendations } from "@/components/travel-detail/safety-recommendations"; // 추후 개발 예정
import { PetFriendlyInfo } from "@/components/travel-detail/pet-friendly-info";
import { PetFriendlyReviewSection } from "@/components/travel-detail/pet-friendly-review-section";
import { AdSidebar } from "@/components/ads/ad-sidebar";
import { LocalNav } from "@/components/navigation/local-nav";
// import { SideNav } from "@/components/navigation/side-nav"; // 추후 개발 예정
import { trackView } from "@/lib/api/analytics";
import { getTravelTypeName } from "@/lib/utils/travel";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
// import { Home, Shield, MessageSquare } from "lucide-react"; // 추후 개발 예정
import type { TravelSiteDetail } from "@/types/travel";
import type { Metadata } from "next";

interface TravelDetailPageProps {
  params: Promise<{ contentId: string }>;
}

// 동적 메타데이터 생성
export async function generateMetadata({
  params,
}: TravelDetailPageProps): Promise<Metadata> {
  try {
    const { contentId } = await params;

    let detail: TravelSiteDetail | null = null;

    // 1. TourAPI 시도
    try {
      const response = await travelApi.getTravelDetail(contentId);
      const items = normalizeTravelItems(
        response.response?.body?.items?.item
      ) as TravelSiteDetail[];
      detail = items[0] || null;
    } catch (tourApiError) {
      // 2. Supabase fallback (에러는 조용히 처리)
      try {
        const serviceClient = getServiceRoleClient();
        const { data: travelData, error: supabaseError } = await serviceClient
          .from("travels")
          .select("*")
          .eq("contentid", contentId)
          .maybeSingle(); // .single() 대신 .maybeSingle() 사용

        if (supabaseError) {
          console.warn("[generateMetadata] Supabase 조회 오류:", supabaseError);
        }

        if (travelData) {
          // Supabase 데이터를 TravelSiteDetail 형식으로 변환
          detail = {
            contentid: travelData.contentid,
            contenttypeid: travelData.contenttypeid,
            title: travelData.title,
            addr1: travelData.addr1,
            addr2: travelData.addr2,
            mapx: travelData.mapx,
            mapy: travelData.mapy,
            firstimage: travelData.firstimage,
            firstimage2: travelData.firstimage2,
            tel: travelData.tel,
            homepage: travelData.homepage,
            cat1: travelData.cat1,
            cat2: travelData.cat2,
            cat3: travelData.cat3,
            areacode: travelData.areacode,
            sigungucode: travelData.sigungucode,
            zipcode: travelData.zipcode,
            overview: travelData.overview,
          } as TravelSiteDetail;
        }
      } catch (supabaseError) {
        // Supabase fallback 실패는 무시 (기본 메타데이터 반환)
        console.warn("[generateMetadata] Supabase fallback 실패:", supabaseError);
      }
    }

    if (!detail) {
      // 데이터가 없어도 메타데이터는 반환 (페이지는 렌더링되도록)
      return {
        title: `여행지 상세 정보 | Pitch Travel`,
        description: "여행지 상세 정보를 확인하세요",
      };
    }

    const title = `${detail.title} | Pitch Travel`;
    const description =
      detail.overview?.substring(0, 100) ||
      "여행지 상세 정보를 확인하세요";
    const image = detail.firstimage || "/og-image.png";

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
    // generateMetadata에서 에러가 발생해도 기본 메타데이터 반환
    // 이렇게 하면 페이지가 렌더링될 수 있음
    console.error("[generateMetadata] 메타데이터 생성 실패:", error);
    return {
      title: "여행지 상세 정보 | Pitch Travel",
      description: "여행지 상세 정보를 확인하세요",
    };
  }
}

export default async function TravelDetailPage({
  params,
}: TravelDetailPageProps) {
  const { contentId } = await params;

  let detail: TravelSiteDetail | null = null;
  let introInfo: TravelSiteDetail | null = null;
  let petFriendly: boolean = false;
  let error: string | null = null;

  try {
    // Supabase에서 반려동물 동반 정보 조회
    try {
      const supabase = createClerkSupabaseClient();
      const { data: travelData } = await supabase
        .from("travels")
        .select("pet_friendly")
        .eq("contentid", contentId)
        .maybeSingle(); // .single() 대신 .maybeSingle() 사용

      if (travelData?.pet_friendly) {
        petFriendly = true;
      }
    } catch (petErr) {
      // 반려동물 정보 조회 실패는 무시
    }

    // 공통정보 조회 (TourAPI 우선, 실패 시 Supabase fallback)
    try {
      const commonResponse = await travelApi.getTravelDetail(contentId);
      const commonItems = normalizeTravelItems(
        commonResponse.response?.body?.items?.item
      ) as TravelSiteDetail[];

      if (commonItems.length > 0) {
        detail = commonItems[0];

        // 소개정보 조회 (contentTypeId가 있는 경우)
        if (detail.contenttypeid) {
          try {
            const introResponse = await travelApi.getTravelDetailIntro(
              contentId,
              detail.contenttypeid
            );
            const introItems = normalizeTravelItems(
              introResponse.response?.body?.items?.item
            ) as TravelSiteDetail[];

            if (introItems.length > 0) {
              introInfo = introItems[0];
              detail = { ...detail, ...introInfo };
            }
          } catch (introErr) {
            // 소개정보 조회 실패는 무시하고 공통정보만 사용
          }
        }
      } else {
        throw new Error("TourAPI 응답에 데이터가 없습니다.");
      }
    } catch (tourApiError) {
      // TourAPI 실패 (500 에러는 조용히 처리, 다른 에러만 로깅)
      const tourApiErrorObj = tourApiError instanceof Error 
        ? tourApiError 
        : new Error(String(tourApiError));
      
      // 500 에러는 일시적 서버 오류이므로 조용히 처리 (Supabase fallback으로 진행)
      const is500Error = tourApiErrorObj.message.includes("500") || 
        (tourApiErrorObj as Error & { status?: number }).status === 500;
      
      if (!is500Error) {
        console.warn("[TravelDetailPage] TourAPI 조회 실패:", {
          contentId,
          error: tourApiErrorObj.message,
        });
      }

      // Supabase fallback
      try {
        const serviceClient = getServiceRoleClient();
        const { data: travelData, error: supabaseError } = await serviceClient
          .from("travels")
          .select("*")
          .eq("contentid", contentId)
          .maybeSingle(); // .single() 대신 .maybeSingle() 사용하여 에러 방지

        if (supabaseError) {
          console.warn("[TravelDetailPage] Supabase 조회 오류:", supabaseError);
        }

        if (travelData) {
          console.log("[TravelDetailPage] Supabase에서 데이터 조회 성공:", contentId);
          detail = {
            contentid: travelData.contentid,
            contenttypeid: travelData.contenttypeid,
            title: travelData.title,
            addr1: travelData.addr1,
            addr2: travelData.addr2,
            mapx: travelData.mapx,
            mapy: travelData.mapy,
            firstimage: travelData.firstimage,
            firstimage2: travelData.firstimage2,
            tel: travelData.tel,
            homepage: travelData.homepage,
            cat1: travelData.cat1,
            cat2: travelData.cat2,
            cat3: travelData.cat3,
            areacode: travelData.areacode,
            sigungucode: travelData.sigungucode,
            zipcode: travelData.zipcode,
            overview: travelData.overview,
          } as TravelSiteDetail;
        } else {
          console.warn("[TravelDetailPage] Supabase에서도 데이터를 찾을 수 없음:", contentId);
          error = "여행지 정보를 찾을 수 없습니다.";
        }
      } catch (supabaseError) {
        const supabaseErrorObj = supabaseError instanceof Error 
          ? supabaseError 
          : new Error(String(supabaseError));
        console.error("[TravelDetailPage] Supabase fallback 실패:", {
          contentId,
          error: supabaseErrorObj.message,
        });
        error = "여행지 정보를 불러오는데 실패했습니다.";
      }
    }
  } catch (err) {
    error =
      err instanceof Error
        ? err.message
        : "여행지 정보를 불러오는데 실패했습니다.";
  }

  if (!detail) {
    console.error("[TravelDetailPage] 여행지 데이터 없음:", {
      contentId,
      error,
      tourApiFailed: error?.includes("TourAPI") || false,
      supabaseFailed: error?.includes("Supabase") || false,
    });
    notFound();
  }

  // 조회수 추적 (비동기, 에러 발생해도 페이지 렌더링 계속)
  trackView(contentId).catch(() => {
    // 조회수 추적 실패는 무시
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

        {/* 반려동물 동반 정보 */}
        {petFriendly && (
          <>
            <PetFriendlyInfo contentId={contentId} petFriendly={petFriendly} />
            <PetFriendlyReviewSection contentId={contentId} />
          </>
        )}
          </div>

          {/* 우측 컬럼 - 사이드바 (1/3) */}
          <div className="lg:col-span-1 space-y-6">
            {/* 날씨 위젯 - 추후 개발 예정 */}
            {/* <WeatherWidget travel={detail} /> */}

            {/* 교통 정보 */}
            <TransportInfo travel={detail} />

            {/* 여행 안전 정보 - 추후 개발 예정 */}
            {/* <SafetyRecommendations travel={detail} /> */}

            {/* 사이드바 광고 */}
            <AdSidebar sticky={false} />

            {/* SNB: 빠른 링크 - 추후 개발 예정 */}
            {/* <SideNav
              title="빠른 링크"
              items={[
                { href: "/", label: "홈", icon: <Home className="w-4 h-4" /> },
                { href: "/safety", label: "안전 수칙", icon: <Shield className="w-4 h-4" /> },
                { href: "/feedback", label: "피드백", icon: <MessageSquare className="w-4 h-4" /> },
              ]}
            /> */}
          </div>
        </div>
      </div>
    </main>
  );
}

