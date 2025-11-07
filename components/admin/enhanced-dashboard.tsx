/**
 * @file enhanced-dashboard.tsx
 * @description 고도화된 관리자 대시보드 컴포넌트
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Download, RefreshCw, Clock } from "lucide-react";
import { TimeSeriesChart } from "@/components/admin/time-series-chart";
import { RegionTypeBarChart } from "@/components/admin/region-type-bar-chart";
import { PieChartComponent } from "@/components/admin/pie-chart";
import { UserBehaviorAnalytics } from "@/components/admin/user-behavior-analytics";
import { DetailedRegionTypeStats } from "@/components/admin/detailed-region-type-stats";
import { PerformanceMonitoring } from "@/components/admin/performance-monitoring";
import { CostAnalysis } from "@/components/admin/cost-analysis";
import { Predictions } from "@/components/admin/predictions";
import { getTimeSeriesStats, type TimePeriod } from "@/actions/admin-stats/get-time-series-stats";
import { getRegionTypeStats } from "@/actions/admin-stats/get-region-type-stats";
import { toast } from "sonner";
import type { TimeSeriesStats } from "@/actions/admin-stats/get-time-series-stats";
import type { RegionStats, TypeStats } from "@/actions/admin-stats/get-region-type-stats";

export function EnhancedDashboard() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("30days");
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesStats[]>([]);
  const [regionStats, setRegionStats] = useState<RegionStats[]>([]);
  const [typeStats, setTypeStats] = useState<TypeStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<number>(30); // 초 단위

  const loadData = useCallback(async () => {
    console.group("[EnhancedDashboard] 데이터 로드 시작");
    setLoading(true);

    try {
      const [timeSeriesResult, regionTypeResult] = await Promise.all([
        getTimeSeriesStats(timePeriod),
        getRegionTypeStats(),
      ]);

      if (timeSeriesResult.success && timeSeriesResult.data) {
        setTimeSeriesData(timeSeriesResult.data);
      } else {
        toast.error(timeSeriesResult.error || "시간대별 통계를 불러오는데 실패했습니다.");
      }

      if (regionTypeResult.success) {
        if (regionTypeResult.regionStats) {
          setRegionStats(regionTypeResult.regionStats);
        }
        if (regionTypeResult.typeStats) {
          setTypeStats(regionTypeResult.typeStats);
        }
      } else {
        toast.error(regionTypeResult.error || "지역별/타입별 통계를 불러오는데 실패했습니다.");
      }
    } catch (error) {
      console.error("[EnhancedDashboard] 데이터 로드 오류:", error);
      toast.error("데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
      console.groupEnd();
    }
  }, [timePeriod]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 자동 새로고침
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      console.log(`[EnhancedDashboard] 자동 새로고침 (${refreshInterval}초)`);
      loadData();
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loadData]);

  const handleExport = () => {
    console.group("[EnhancedDashboard] 데이터 내보내기");
    const exportData = {
      timeSeries: timeSeriesData,
      regionStats,
      typeStats,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dashboard-export-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("데이터가 내보내졌습니다.");
    console.groupEnd();
  };

  // 파이 차트용 데이터 준비
  const regionPieData = regionStats.slice(0, 8).map((stat) => ({
    name: stat.areaname,
    value: stat.travelCount,
  }));

  const typePieData = typeStats.slice(0, 8).map((stat) => ({
    name: stat.typeName,
    value: stat.travelCount,
  }));

  if (loading && timeSeriesData.length === 0) {
    return (
      <div className="text-center py-12 text-gray-600 dark:text-gray-400">
        데이터를 불러오는 중...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 컨트롤 패널 */}
      <Card>
        <CardHeader>
          <CardTitle>대시보드 설정</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="time-period">기간 선택:</Label>
              <Select value={timePeriod} onValueChange={(value) => setTimePeriod(value as TimePeriod)}>
                <SelectTrigger id="time-period" className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">오늘</SelectItem>
                  <SelectItem value="yesterday">어제</SelectItem>
                  <SelectItem value="7days">최근 7일</SelectItem>
                  <SelectItem value="30days">최근 30일</SelectItem>
                  <SelectItem value="3months">최근 3개월</SelectItem>
                  <SelectItem value="1year">최근 1년</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="auto-refresh"
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
              />
              <Label htmlFor="auto-refresh">자동 새로고침</Label>
            </div>

            {autoRefresh && (
              <div className="flex items-center gap-2">
                <Label htmlFor="refresh-interval">간격:</Label>
                <Select
                  value={refreshInterval.toString()}
                  onValueChange={(value) => setRefreshInterval(Number(value))}
                >
                  <SelectTrigger id="refresh-interval" className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5초</SelectItem>
                    <SelectItem value="10">10초</SelectItem>
                    <SelectItem value="30">30초</SelectItem>
                    <SelectItem value="60">1분</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <Button variant="outline" size="sm" onClick={loadData}>
                <RefreshCw className="w-4 h-4 mr-2" />
                새로고침
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                내보내기
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 차트 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TimeSeriesChart data={timeSeriesData} title="시간대별 통계 추이" />
        <PieChartComponent data={regionPieData} title="지역별 여행지 분포" />
        <PieChartComponent data={typePieData} title="타입별 여행지 분포" />
      </div>

      {/* 지역별/타입별 바 차트 */}
      <RegionTypeBarChart regionStats={regionStats} typeStats={typeStats} />

      {/* 사용자 행동 분석 */}
      <UserBehaviorAnalytics />

      {/* 지역별/타입별 상세 통계 */}
      <DetailedRegionTypeStats />

      {/* 성능 모니터링 */}
      <PerformanceMonitoring />

      {/* 비용 분석 */}
      <CostAnalysis />

      {/* 예측 분석 */}
      <Predictions />
    </div>
  );
}

