/**
 * @file detailed-region-type-stats.tsx
 * @description 지역별/타입별 상세 통계 UI 컴포넌트 (시군구별, 지역-타입 조합)
 */

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getDetailedRegionTypeStats } from "@/actions/admin-stats/get-detailed-region-type-stats";
import { toast } from "sonner";
import type {
  SigunguStats,
  RegionTypeCombinationStats,
} from "@/actions/admin-stats/get-detailed-region-type-stats";

export function DetailedRegionTypeStats() {
  const [sigunguStats, setSigunguStats] = useState<SigunguStats[]>([]);
  const [regionTypeCombinations, setRegionTypeCombinations] = useState<
    RegionTypeCombinationStats[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    console.group("[DetailedRegionTypeStats] 데이터 로드 시작");
    setLoading(true);

    try {
      const result = await getDetailedRegionTypeStats();

      if (result.success) {
        if (result.sigunguStats) setSigunguStats(result.sigunguStats);
        if (result.regionTypeCombinations)
          setRegionTypeCombinations(result.regionTypeCombinations);
      } else {
        toast.error(result.error || "상세 통계 데이터를 불러오는데 실패했습니다.");
      }
    } catch (error) {
      console.error("[DetailedRegionTypeStats] 데이터 로드 오류:", error);
      toast.error("데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
      console.groupEnd();
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-600 dark:text-gray-400">
        데이터를 불러오는 중...
      </div>
    );
  }

  // 시군구별 차트 데이터 (TOP 20)
  const sigunguChartData = sigunguStats.slice(0, 20).map((stat) => ({
    name: `${stat.areaname} ${stat.sigunguname}`,
    여행지: stat.travelCount,
    조회수: stat.viewCount,
    북마크: stat.bookmarkCount,
    리뷰: stat.reviewCount,
  }));

  // 지역-타입 조합 차트 데이터 (TOP 20)
  const combinationChartData = regionTypeCombinations.slice(0, 20).map((stat) => ({
    name: `${stat.areaname} - ${stat.typeName}`,
    여행지: stat.travelCount,
    조회수: stat.viewCount,
    북마크: stat.bookmarkCount,
    리뷰: stat.reviewCount,
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>지역별/타입별 상세 통계</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="sigungu">
            <TabsList>
              <TabsTrigger value="sigungu">시군구별 통계</TabsTrigger>
              <TabsTrigger value="combination">지역-타입 조합 통계</TabsTrigger>
            </TabsList>

            <TabsContent value="sigungu" className="mt-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  시군구별 여행지 통계 (총 {sigunguStats.length}개 시군구)
                </p>
              </div>
              <ResponsiveContainer width="100%" height={500}>
                <BarChart data={sigunguChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={120} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="여행지" fill="#3b82f6" />
                  <Bar dataKey="조회수" fill="#10b981" />
                  <Bar dataKey="북마크" fill="#f59e0b" />
                  <Bar dataKey="리뷰" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>

              {/* 시군구별 상세 테이블 */}
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">지역</th>
                      <th className="text-left p-2">시군구</th>
                      <th className="text-right p-2">여행지</th>
                      <th className="text-right p-2">조회수</th>
                      <th className="text-right p-2">북마크</th>
                      <th className="text-right p-2">리뷰</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sigunguStats.slice(0, 30).map((stat, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="p-2">{stat.areaname}</td>
                        <td className="p-2">{stat.sigunguname}</td>
                        <td className="text-right p-2">{stat.travelCount}</td>
                        <td className="text-right p-2">{stat.viewCount.toLocaleString()}</td>
                        <td className="text-right p-2">{stat.bookmarkCount.toLocaleString()}</td>
                        <td className="text-right p-2">{stat.reviewCount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="combination" className="mt-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  지역-타입 조합 통계 (총 {regionTypeCombinations.length}개 조합)
                </p>
              </div>
              <ResponsiveContainer width="100%" height={500}>
                <BarChart data={combinationChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={120} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="여행지" fill="#3b82f6" />
                  <Bar dataKey="조회수" fill="#10b981" />
                  <Bar dataKey="북마크" fill="#f59e0b" />
                  <Bar dataKey="리뷰" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>

              {/* 지역-타입 조합 상세 테이블 */}
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">지역</th>
                      <th className="text-left p-2">타입</th>
                      <th className="text-right p-2">여행지</th>
                      <th className="text-right p-2">조회수</th>
                      <th className="text-right p-2">북마크</th>
                      <th className="text-right p-2">리뷰</th>
                    </tr>
                  </thead>
                  <tbody>
                    {regionTypeCombinations.slice(0, 30).map((stat, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="p-2">{stat.areaname}</td>
                        <td className="p-2">{stat.typeName}</td>
                        <td className="text-right p-2">{stat.travelCount}</td>
                        <td className="text-right p-2">{stat.viewCount.toLocaleString()}</td>
                        <td className="text-right p-2">{stat.bookmarkCount.toLocaleString()}</td>
                        <td className="text-right p-2">{stat.reviewCount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

