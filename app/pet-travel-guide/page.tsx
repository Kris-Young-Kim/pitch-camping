/**
 * @file page.tsx
 * @description 반려동물 동반 여행 가이드 페이지
 *
 * 반려동물 동반 여행에 대한 가이드, 주의사항, 체크리스트를 제공하는 페이지
 *
 * 주요 기능:
 * 1. 반려동물 동반 여행 가이드 콘텐츠
 * 2. 주의사항 및 체크리스트
 * 3. 지역별 반려동물 동반 가능 여행지 추천
 * 4. 반려동물 동반 여행 팁
 *
 * @dependencies
 * - components/navigation/local-nav.tsx: LocalNav
 * - components/navigation/side-nav.tsx: SideNav
 */

import { LocalNav } from "@/components/navigation/local-nav";
import { SideNav } from "@/components/navigation/side-nav";
import { Home, Shield, MessageSquare, Heart, AlertTriangle, CheckCircle, MapPin, Dog, Cat } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "반려동물 동반 여행 가이드 | Pitch Travel",
  description: "반려동물과 함께하는 여행을 위한 가이드, 주의사항, 체크리스트를 확인하세요.",
  openGraph: {
    title: "반려동물 동반 여행 가이드 | Pitch Travel",
    description: "반려동물과 함께하는 여행을 위한 가이드, 주의사항, 체크리스트를 확인하세요.",
    type: "website",
  },
};

export default function PetTravelGuidePage() {
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
            <span className="text-gray-900 dark:text-white font-medium">반려동물 동반 여행 가이드</span>
          </nav>
        </div>
      </LocalNav>

      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* 좌측 컬럼 - 메인 콘텐츠 (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* 헤더 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <Heart className="w-8 h-8 text-green-600 dark:text-green-400 fill-current" />
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                  반려동물 동반 여행 가이드
                </h1>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                반려동물과 함께하는 즐거운 여행을 위한 가이드와 팁을 확인하세요.
              </p>
            </div>

            {/* 여행 전 체크리스트 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                여행 전 체크리스트
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <Dog className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    반려동물 건강 확인
                  </h3>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 dark:text-blue-400 mt-0.5">✓</span>
                      <span>예방접종 완료 여부 확인</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 dark:text-blue-400 mt-0.5">✓</span>
                      <span>건강검진 및 처방약 준비</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 dark:text-blue-400 mt-0.5">✓</span>
                      <span>반려동물 등록증 및 건강증명서 준비</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 dark:text-blue-400 mt-0.5">✓</span>
                      <span>여행지 지역의 동물병원 위치 확인</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <Cat className="w-5 h-5 text-green-600 dark:text-green-400" />
                    필수 준비물
                  </h3>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                      <span>목줄, 하네스, 입마개 (필요시)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                      <span>반려동물 여행용 케이지 또는 캐리어</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                      <span>사료, 간식, 물병</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                      <span>배변봉투, 휴대용 화장실</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                      <span>수건, 세제, 빗 등 위생용품</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                      <span>반려동물 사진 및 연락처가 적힌 명찰</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    숙박 예약 확인
                  </h3>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-400 mt-0.5">✓</span>
                      <span>반려동물 동반 가능 여부 사전 확인</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-400 mt-0.5">✓</span>
                      <span>반려동물 추가 요금 및 규정 확인</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-400 mt-0.5">✓</span>
                      <span>반려동물 크기 및 마리 수 제한 확인</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 여행 중 주의사항 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                여행 중 주의사항
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">안전 수칙</h3>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                      <span>반려동물을 항상 목줄로 관리하고, 사람이 많은 곳에서는 더욱 주의하세요.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                      <span>반려동물의 배변은 반드시 수거하고, 지정된 장소에 버려주세요.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                      <span>반려동물을 혼자 두지 마세요. 차량 내부는 특히 위험합니다.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                      <span>반려동물이 다른 사람이나 동물에게 해를 끼치지 않도록 주의하세요.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                      <span>반려동물이 금지된 구역에 들어가지 않도록 확인하세요.</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">건강 관리</h3>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                      <span>충분한 물과 사료를 제공하고, 급격한 환경 변화에 주의하세요.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                      <span>더위나 추위에 민감한 반려동물은 실내에서 휴식할 수 있도록 배려하세요.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                      <span>반려동물의 이상 징후가 보이면 즉시 동물병원을 방문하세요.</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">매너</h3>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 dark:text-green-400 mt-0.5">•</span>
                      <span>다른 사람들이 반려동물을 좋아하지 않을 수 있음을 이해하세요.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 dark:text-green-400 mt-0.5">•</span>
                      <span>반려동물이 과도하게 짖거나 소란을 피우지 않도록 관리하세요.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 dark:text-green-400 mt-0.5">•</span>
                      <span>숙박 시설의 규정을 준수하고, 시설을 깨끗하게 사용하세요.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 지역별 추천 여행지 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                지역별 반려동물 동반 가능 여행지
              </h2>
              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400">
                  반려동물과 함께 즐길 수 있는 여행지를 찾아보세요. 필터에서 "반려동물 동반 가능" 옵션을 선택하면
                  반려동물 동반이 가능한 여행지만 확인할 수 있습니다.
                </p>
                <Link
                  href="/?petFriendly=true"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                >
                  <Heart className="w-5 h-5" />
                  반려동물 동반 가능 여행지 보기
                </Link>
              </div>
            </div>

            {/* 여행 팁 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Shield className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                반려동물 동반 여행 팁
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">차량 여행</h3>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 dark:text-indigo-400 mt-0.5">💡</span>
                      <span>2시간마다 휴게소에서 산책과 배변을 시켜주세요.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 dark:text-indigo-400 mt-0.5">💡</span>
                      <span>차량 내부 온도 관리에 주의하고, 반려동물을 혼자 두지 마세요.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 dark:text-indigo-400 mt-0.5">💡</span>
                      <span>안전을 위해 반려동물 전용 안전벨트나 케이지를 사용하세요.</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">숙박</h3>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 dark:text-purple-400 mt-0.5">💡</span>
                      <span>예약 전 반려동물 동반 가능 여부를 반드시 확인하세요.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 dark:text-purple-400 mt-0.5">💡</span>
                      <span>반려동물 추가 요금과 규정을 사전에 확인하세요.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 dark:text-purple-400 mt-0.5">💡</span>
                      <span>반려동물이 시설을 손상시키지 않도록 주의하세요.</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-800">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">야외 활동</h3>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-teal-600 dark:text-teal-400 mt-0.5">💡</span>
                      <span>반려동물이 들어가도 되는 구역인지 확인하세요.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-teal-600 dark:text-teal-400 mt-0.5">💡</span>
                      <span>야생동물이나 위험한 식물에 접촉하지 않도록 주의하세요.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-teal-600 dark:text-teal-400 mt-0.5">💡</span>
                      <span>반려동물이 물에 빠지거나 길을 잃지 않도록 관리하세요.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 우측 컬럼 - 사이드바 (1/3) */}
          <div className="lg:col-span-1 space-y-6">
            {/* SNB: 빠른 링크 */}
            <SideNav
              title="빠른 링크"
              items={[
                { href: "/", label: "홈", icon: <Home className="w-4 h-4" /> },
                { href: "/?petFriendly=true", label: "반려동물 동반 가능 여행지", icon: <Heart className="w-4 h-4" /> },
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

