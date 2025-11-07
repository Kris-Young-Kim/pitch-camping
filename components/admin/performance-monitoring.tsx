/**
 * @file performance-monitoring.tsx
 * @description 성능 모니터링 UI 컴포넌트
 */

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Clock, Activity } from "lucide-react";
import { getPerformanceMetrics } from "@/actions/admin-stats/get-performance-metrics";
import { toast } from "sonner";
import type {
  PerformanceStatistics,
  ErrorRate,
} from "@/actions/admin-stats/get-performance-metrics";
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

type Period = "1hour" | "24hours" | "7days" | "30days";

export function PerformanceMonitoring() {
  const [period, setPeriod] = useState<Period>("24hours");
  const [apiResponseStats, setApiResponseStats] = useState<PerformanceStatistics | null>(null);
  const [pageLoadStats, setPageLoadStats] = useState<PerformanceStatistics | null>(null);
  const [webVitals, setWebVitals] = useState<{
    lcp?: PerformanceStatistics;
    fid?: PerformanceStatistics;
    cls?: PerformanceStatistics;
  } | null>(null);
  const [errorRates, setErrorRates] = useState<ErrorRate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, [period]);

  const loadMetrics = async () => {
    console.group("[PerformanceMonitoring] 성능 메트릭 로드 시작");
    setLoading(true);

    try {
      const result = await getPerformanceMetrics(period);

      if (result.success) {
        if (result.apiResponseStats) setApiResponseStats(result.apiResponseStats);
        if (result.pageLoadStats) setPageLoadStats(result.pageLoadStats);
        if (result.webVitals) setWebVitals(result.webVitals);
        if (result.errorRates) setErrorRates(result.errorRates);
      } else {
        toast.error(result.error || "성능 메트릭을 불러오는데 실패했습니다.");
      }
    } catch (error) {
      console.error("[PerformanceMonitoring] 성능 메트릭 로드 오류:", error);
      toast.error("데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
      console.groupEnd();
    }
  };

  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getStatusBadge = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) {
      return <Badge className="bg-green-600">양호</Badge>;
    } else if (value <= thresholds.warning) {
      return <Badge className="bg-yellow-600">주의</Badge>;
    } else {
      return <Badge className="bg-red-600">경고</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-600 dark:text-gray-400">
        성능 메트릭을 불러오는 중...
      </div>
    );
  }

  // 에러율 차트 데이터
  const errorRateChartData = errorRates
    .filter((er) => er.totalRequests > 0)
    .slice(0, 10)
    .map((er) => ({
      name: er.endpoint || "unknown",
      에러율: er.errorRate,
      에러수: er.errorCount,
      총요청: er.totalRequests,
    }));

  return (
    <div className="space-y-6">
      {/* 기간 선택 */}
      <Card>
        <CardHeader>
          <CardTitle>성능 모니터링</CardTitle>
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
                <SelectItem value="1hour">최근 1시간</SelectItem>
                <SelectItem value="24hours">최근 24시간</SelectItem>
                <SelectItem value="7days">최근 7일</SelectItem>
                <SelectItem value="30days">최근 30일</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* API 응답 시간 통계 */}
      {apiResponseStats && apiResponseStats.count > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              API 응답 시간 통계
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">평균</div>
                <div className="text-2xl font-bold">{formatTime(apiResponseStats.average)}</div>
                {getStatusBadge(apiResponseStats.average, { good: 500, warning: 2000 })}
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">중앙값</div>
                <div className="text-2xl font-bold">{formatTime(apiResponseStats.median)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">P95</div>
                <div className="text-2xl font-bold">{formatTime(apiResponseStats.p95)}</div>
                {getStatusBadge(apiResponseStats.p95, { good: 1000, warning: 3000 })}
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">P99</div>
                <div className="text-2xl font-bold">{formatTime(apiResponseStats.p99)}</div>
                {getStatusBadge(apiResponseStats.p99, { good: 2000, warning: 5000 })}
              </div>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              총 요청 수: {apiResponseStats.count.toLocaleString()}건
            </div>
          </CardContent>
        </Card>
      )}

      {/* 페이지 로드 시간 통계 */}
      {pageLoadStats && pageLoadStats.count > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              페이지 로드 시간 통계
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">평균</div>
                <div className="text-2xl font-bold">{formatTime(pageLoadStats.average)}</div>
                {getStatusBadge(pageLoadStats.average, { good: 2000, warning: 4000 })}
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">중앙값</div>
                <div className="text-2xl font-bold">{formatTime(pageLoadStats.median)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">P95</div>
                <div className="text-2xl font-bold">{formatTime(pageLoadStats.p95)}</div>
                {getStatusBadge(pageLoadStats.p95, { good: 3000, warning: 5000 })}
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">P99</div>
                <div className="text-2xl font-bold">{formatTime(pageLoadStats.p99)}</div>
                {getStatusBadge(pageLoadStats.p99, { good: 5000, warning: 8000 })}
              </div>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              총 페이지 로드: {pageLoadStats.count.toLocaleString()}건
            </div>
          </CardContent>
        </Card>
      )}

      {/* Web Vitals */}
      {webVitals && (
        <Card>
          <CardHeader>
            <CardTitle>Web Vitals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {webVitals.lcp && webVitals.lcp.count > 0 && (
                <div>
                  <div className="text-sm font-medium mb-2">LCP (Largest Contentful Paint)</div>
                  <div className="text-2xl font-bold mb-2">{formatTime(webVitals.lcp.average)}</div>
                  {getStatusBadge(webVitals.lcp.average, { good: 2500, warning: 4000 })}
                  <div className="text-xs text-gray-500 mt-1">
                    P95: {formatTime(webVitals.lcp.p95)}
                  </div>
                </div>
              )}
              {webVitals.fid && webVitals.fid.count > 0 && (
                <div>
                  <div className="text-sm font-medium mb-2">FID (First Input Delay)</div>
                  <div className="text-2xl font-bold mb-2">{formatTime(webVitals.fid.average)}</div>
                  {getStatusBadge(webVitals.fid.average, { good: 100, warning: 300 })}
                  <div className="text-xs text-gray-500 mt-1">
                    P95: {formatTime(webVitals.fid.p95)}
                  </div>
                </div>
              )}
              {webVitals.cls && webVitals.cls.count > 0 && (
                <div>
                  <div className="text-sm font-medium mb-2">CLS (Cumulative Layout Shift)</div>
                  <div className="text-2xl font-bold mb-2">{webVitals.cls.average.toFixed(3)}</div>
                  {getStatusBadge(webVitals.cls.average, { good: 0.1, warning: 0.25 })}
                  <div className="text-xs text-gray-500 mt-1">
                    P95: {webVitals.cls.p95.toFixed(3)}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 에러율 */}
      {errorRates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              에러율 모니터링
            </CardTitle>
          </CardHeader>
          <CardContent>
            {errorRateChartData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={errorRateChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="에러율" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {errorRates
                    .filter((er) => er.totalRequests > 0 && er.errorRate > 0)
                    .slice(0, 10)
                    .map((er, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div>
                          <div className="font-medium">{er.endpoint || "unknown"}</div>
                          <div className="text-sm text-gray-500">
                            에러: {er.errorCount}건 / 총 요청: {er.totalRequests}건
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-2xl font-bold ${
                              er.errorRate > 5 ? "text-red-600" : er.errorRate > 1 ? "text-yellow-600" : "text-green-600"
                            }`}
                          >
                            {er.errorRate.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-600" />
                <p>에러가 없습니다.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 데이터 없음 */}
      {(!apiResponseStats || apiResponseStats.count === 0) &&
        (!pageLoadStats || pageLoadStats.count === 0) &&
        (!webVitals || (webVitals.lcp?.count === 0 && webVitals.fid?.count === 0 && webVitals.cls?.count === 0)) && (
          <div className="text-center py-12 text-gray-600 dark:text-gray-400">
            <Activity className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>아직 수집된 성능 메트릭이 없습니다.</p>
            <p className="text-sm mt-2">성능 메트릭은 자동으로 수집됩니다.</p>
          </div>
        )}
    </div>
  );
}

