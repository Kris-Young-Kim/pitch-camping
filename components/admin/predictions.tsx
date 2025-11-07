/**
 * @file predictions.tsx
 * @description 예측 분석 UI 컴포넌트
 */

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, MapPin, Activity, DollarSign } from "lucide-react";
import {
  getUserGrowthPrediction,
  getPopularTravelPrediction,
  getTrafficPrediction,
  getRevenuePrediction,
} from "@/actions/admin-stats/get-predictions";
import { toast } from "sonner";
import type {
  UserGrowthPrediction,
  PopularTravelPrediction,
  TrafficPrediction,
  RevenuePrediction,
} from "@/actions/admin-stats/get-predictions";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

export function Predictions() {
  const [userGrowth, setUserGrowth] = useState<UserGrowthPrediction | null>(null);
  const [popularTravels, setPopularTravels] = useState<PopularTravelPrediction | null>(null);
  const [traffic, setTraffic] = useState<TrafficPrediction | null>(null);
  const [revenue, setRevenue] = useState<RevenuePrediction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllPredictions();
  }, []);

  const loadAllPredictions = async () => {
    console.group("[Predictions] 예측 분석 로드 시작");
    setLoading(true);

    try {
      const [userGrowthResult, popularTravelsResult, trafficResult, revenueResult] =
        await Promise.all([
          getUserGrowthPrediction(30),
          getPopularTravelPrediction(),
          getTrafficPrediction(),
          getRevenuePrediction(6),
        ]);

      if (userGrowthResult.success) setUserGrowth(userGrowthResult);
      else toast.error(userGrowthResult.error || "사용자 증가 예측 실패");

      if (popularTravelsResult.success) setPopularTravels(popularTravelsResult);
      else toast.error(popularTravelsResult.error || "인기 여행지 예측 실패");

      if (trafficResult.success) setTraffic(trafficResult);
      else toast.error(trafficResult.error || "트래픽 예측 실패");

      if (revenueResult.success) setRevenue(revenueResult);
      else toast.error(revenueResult.error || "수익 예측 실패");
    } catch (error) {
      console.error("[Predictions] 예측 분석 로드 오류:", error);
      toast.error("데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
      console.groupEnd();
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 10000) {
      return `${(num / 10000).toFixed(1)}만`;
    }
    return num.toLocaleString();
  };

  const formatCurrency = (num: number): string => {
    if (num >= 100000000) {
      return `${(num / 100000000).toFixed(1)}억원`;
    } else if (num >= 10000) {
      return `${(num / 10000).toFixed(1)}만원`;
    }
    return `${Math.round(num).toLocaleString()}원`;
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-600 dark:text-gray-400">
        예측 분석을 불러오는 중...
      </div>
    );
  }

  // 사용자 증가 예측 차트 데이터
  const userGrowthChartData = [
    ...(userGrowth?.historicalData?.map((d) => ({
      date: d.date.slice(5), // MM-DD
      사용자: d.users,
      type: "실제",
    })) || []),
    ...(userGrowth?.predictions?.map((p) => ({
      date: p.date.slice(5), // MM-DD
      사용자: p.predicted,
      type: "예측",
      lowerBound: p.lowerBound,
      upperBound: p.upperBound,
    })) || []),
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>예측 분석</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="user-growth" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="user-growth">사용자 증가</TabsTrigger>
              <TabsTrigger value="popular-travels">인기 여행지</TabsTrigger>
              <TabsTrigger value="traffic">트래픽</TabsTrigger>
              <TabsTrigger value="revenue">수익</TabsTrigger>
            </TabsList>

            {/* 사용자 증가 예측 */}
            <TabsContent value="user-growth" className="space-y-4">
              {userGrowth?.success ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">일평균 증가율</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {userGrowth.growthRate?.toFixed(2) || 0}%
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">다음 달 예측</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {formatNumber(userGrowth.nextMonthPrediction || 0)}명
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">30일 후 예측</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {formatNumber(
                            userGrowth.predictions?.[userGrowth.predictions.length - 1]
                              ?.predicted || 0
                          )}
                          명
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  {userGrowthChartData.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>사용자 증가 추이 및 예측</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={400}>
                          <AreaChart data={userGrowthChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Area
                              type="monotone"
                              dataKey="사용자"
                              stroke="#3b82f6"
                              fill="#3b82f6"
                              fillOpacity={0.6}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                  {userGrowth?.error || "데이터를 불러올 수 없습니다."}
                </div>
              )}
            </TabsContent>

            {/* 인기 여행지 예측 */}
            <TabsContent value="popular-travels" className="space-y-4">
              {popularTravels?.success && popularTravels.predictions ? (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>예상 인기 여행지 TOP 10</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {popularTravels.predictions.slice(0, 10).map((travel, index) => (
                          <div
                            key={travel.contentId}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                                {index + 1}
                              </div>
                              <div>
                                <div className="font-medium">{travel.title}</div>
                                <div className="text-sm text-gray-500">
                                  현재 인기도: {formatNumber(travel.currentPopularity)}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold">
                                {formatNumber(travel.predictedPopularity)}
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Badge
                                  className={
                                    travel.growthRate > 0
                                      ? "bg-green-600"
                                      : travel.growthRate < 0
                                      ? "bg-red-600"
                                      : "bg-gray-600"
                                  }
                                >
                                  {travel.growthRate > 0 ? "+" : ""}
                                  {travel.growthRate.toFixed(1)}%
                                </Badge>
                                <Badge className="bg-purple-600">
                                  계절성 {travel.seasonalFactor.toFixed(1)}x
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                  {popularTravels?.error || "데이터를 불러올 수 없습니다."}
                </div>
              )}
            </TabsContent>

            {/* 트래픽 예측 */}
            <TabsContent value="traffic" className="space-y-4">
              {traffic?.success ? (
                <>
                  {traffic.hourlyPredictions && (
                    <Card>
                      <CardHeader>
                        <CardTitle>시간대별 예상 트래픽</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={traffic.hourlyPredictions}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="hour" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="predictedViews" fill="#10b981" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  )}
                  {traffic.seasonalPredictions && (
                    <Card>
                      <CardHeader>
                        <CardTitle>계절별 예상 트래픽</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={traffic.seasonalPredictions}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="predictedViews" fill="#3b82f6" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                  {traffic?.error || "데이터를 불러올 수 없습니다."}
                </div>
              )}
            </TabsContent>

            {/* 수익 예측 */}
            <TabsContent value="revenue" className="space-y-4">
              {revenue?.success && revenue.predictions ? (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>총 예상 수익</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold">
                        {formatCurrency(revenue.totalPredictedRevenue || 0)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        향후 {revenue.predictions.length}개월 예상 수익
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>월별 수익 예측</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={revenue.predictions}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip formatter={(value: number) => formatCurrency(value)} />
                          <Legend />
                          <Bar dataKey="adRevenue" stackId="a" fill="#3b82f6" name="광고 수익" />
                          <Bar
                            dataKey="bookingRevenue"
                            stackId="a"
                            fill="#10b981"
                            name="예약 수수료"
                          />
                          <Bar
                            dataKey="subscriptionRevenue"
                            stackId="a"
                            fill="#f59e0b"
                            name="구독 수익"
                          />
                          <Bar
                            dataKey="partnershipRevenue"
                            stackId="a"
                            fill="#8b5cf6"
                            name="제휴 수익"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>월별 상세 내역</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {revenue.predictions.map((pred, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                          >
                            <div>
                              <div className="font-medium">{pred.month}</div>
                              <div className="text-sm text-gray-500">
                                광고: {formatCurrency(pred.adRevenue)} | 예약:{" "}
                                {formatCurrency(pred.bookingRevenue)} | 구독:{" "}
                                {formatCurrency(pred.subscriptionRevenue)} | 제휴:{" "}
                                {formatCurrency(pred.partnershipRevenue)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold">
                                {formatCurrency(pred.predictedRevenue)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                  {revenue?.error || "데이터를 불러올 수 없습니다."}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

