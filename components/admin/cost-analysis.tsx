/**
 * @file cost-analysis.tsx
 * @description 비용 분석 UI 컴포넌트
 */

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, TrendingUp, DollarSign, Lightbulb } from "lucide-react";
import { getCostAnalysis } from "@/actions/admin-stats/get-cost-analysis";
import { toast } from "sonner";
import type {
  ServiceCost,
  MonthlyCost,
} from "@/actions/admin-stats/get-cost-analysis";
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
} from "recharts";

type Period = "1month" | "3months" | "6months" | "12months";

export function CostAnalysis() {
  const [period, setPeriod] = useState<Period>("1month");
  const [currentMonth, setCurrentMonth] = useState<MonthlyCost | null>(null);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyCost[]>([]);
  const [serviceBreakdown, setServiceBreakdown] = useState<ServiceCost[]>([]);
  const [totalCost, setTotalCost] = useState<number>(0);
  const [costOptimization, setCostOptimization] = useState<{
    suggestions: string[];
    potentialSavings: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCostAnalysis();
  }, [period]);

  const loadCostAnalysis = async () => {
    console.group("[CostAnalysis] 비용 분석 로드 시작");
    setLoading(true);

    try {
      const result = await getCostAnalysis(period);

      if (result.success) {
        if (result.currentMonth) setCurrentMonth(result.currentMonth);
        if (result.monthlyTrends) setMonthlyTrends(result.monthlyTrends);
        if (result.serviceBreakdown) setServiceBreakdown(result.serviceBreakdown);
        if (result.totalCost !== undefined) setTotalCost(result.totalCost);
        if (result.costOptimization) setCostOptimization(result.costOptimization);
      } else {
        toast.error(result.error || "비용 분석을 불러오는데 실패했습니다.");
      }
    } catch (error) {
      console.error("[CostAnalysis] 비용 분석 로드 오류:", error);
      toast.error("데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
      console.groupEnd();
    }
  };

  const formatCost = (cost: number): string => {
    if (cost >= 10000) {
      return `${(cost / 10000).toFixed(1)}만원`;
    }
    return `${Math.round(cost).toLocaleString()}원`;
  };

  const getServiceName = (serviceName: string): string => {
    const names: Record<string, string> = {
      vercel: "Vercel",
      supabase: "Supabase",
      naver_map: "네이버 지도",
      tour_api: "TourAPI",
      clerk: "Clerk",
    };
    return names[serviceName] || serviceName;
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-600 dark:text-gray-400">
        비용 분석을 불러오는 중...
      </div>
    );
  }

  // 월별 트렌드 차트 데이터
  const trendChartData = monthlyTrends.map((month) => ({
    month: month.month.slice(5), // MM 형식
    비용: month.totalCost,
  }));

  // 서비스별 비용 차트 데이터
  const serviceCostData = serviceBreakdown
    .reduce((acc, sc) => {
      const existing = acc.find((item) => item.service === sc.serviceName);
      if (existing) {
        existing.비용 += sc.totalCost;
      } else {
        acc.push({
          service: getServiceName(sc.serviceName),
          비용: sc.totalCost,
        });
      }
      return acc;
    }, [] as { service: string; 비용: number }[])
    .sort((a, b) => b.비용 - a.비용)
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {/* 기간 선택 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            비용 분석
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <label htmlFor="period-select" className="text-sm font-medium">
              기간 선택:
            </label>
            <Select value={period} onValueChange={(value) => setPeriod(value as Period)}>
              <SelectTrigger id="period-select" className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1month">최근 1개월</SelectItem>
                <SelectItem value="3months">최근 3개월</SelectItem>
                <SelectItem value="6months">최근 6개월</SelectItem>
                <SelectItem value="12months">최근 12개월</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 총 비용 */}
      <Card>
        <CardHeader>
          <CardTitle>총 비용</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold mb-2">{formatCost(totalCost)}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {period === "1month"
              ? "최근 1개월"
              : period === "3months"
              ? "최근 3개월"
              : period === "6months"
              ? "최근 6개월"
              : "최근 12개월"}{" "}
            누적 비용
          </div>
        </CardContent>
      </Card>

      {/* 월별 트렌드 */}
      {monthlyTrends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              월별 비용 트렌드
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCost(value)} />
                <Legend />
                <Line type="monotone" dataKey="비용" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* 서비스별 비용 */}
      {serviceCostData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>서비스별 비용</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={serviceCostData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="service" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCost(value)} />
                <Legend />
                <Bar dataKey="비용" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* 서비스별 상세 내역 */}
      {serviceBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>서비스별 상세 내역</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {serviceBreakdown
                .sort((a, b) => b.totalCost - a.totalCost)
                .slice(0, 20)
                .map((sc, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div>
                      <div className="font-medium">
                        {getServiceName(sc.serviceName)} - {sc.operationType}
                      </div>
                      <div className="text-sm text-gray-500">
                        호출 수: {sc.count.toLocaleString()}건 | 사용량:{" "}
                        {sc.totalUnits.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{formatCost(sc.totalCost)}</div>
                      <div className="text-xs text-gray-500">
                        평균: {formatCost(sc.averageCost)}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 비용 최적화 제안 */}
      {costOptimization && costOptimization.suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-600" />
              비용 최적화 제안
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {costOptimization.suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg"
                >
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{suggestion}</p>
                </div>
              ))}
              {costOptimization.potentialSavings > 0 && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-sm font-medium text-green-800 dark:text-green-200">
                    예상 절감액: {formatCost(costOptimization.potentialSavings)}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 데이터 없음 */}
      {totalCost === 0 && serviceBreakdown.length === 0 && (
        <div className="text-center py-12 text-gray-600 dark:text-gray-400">
          <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>아직 수집된 비용 데이터가 없습니다.</p>
          <p className="text-sm mt-2">API 호출 시 자동으로 비용이 추적됩니다.</p>
        </div>
      )}
    </div>
  );
}

