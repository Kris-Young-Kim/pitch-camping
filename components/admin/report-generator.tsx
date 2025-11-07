/**
 * @file report-generator.tsx
 * @description 리포트 생성 UI 컴포넌트
 */

"use client";

import { useState, useTransition, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Download, FileText, Calendar } from "lucide-react";
import { generateReport } from "@/actions/admin-stats/generate-report";
import { getReports } from "@/actions/admin-stats/get-reports";
import { toast } from "sonner";
import type { Report } from "@/actions/admin-stats/get-reports";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

export function ReportGenerator() {
  const [reportType, setReportType] = useState<"daily" | "weekly" | "monthly" | "custom">("weekly");
  const [periodStart, setPeriodStart] = useState<string>("");
  const [periodEnd, setPeriodEnd] = useState<string>("");
  const [metrics, setMetrics] = useState({
    timeSeries: true,
    regionType: true,
    performance: false,
    cost: false,
    userBehavior: false,
    predictions: false,
  });
  const [reports, setReports] = useState<Report[]>([]);
  const [isPending, startTransition] = useTransition();
  const [loadingReports, setLoadingReports] = useState(false);

  const loadReports = async () => {
    setLoadingReports(true);
    try {
      const result = await getReports(20);
      if (result.success && result.reports) {
        setReports(result.reports);
      } else {
        toast.error(result.error || "리포트 목록을 불러오는데 실패했습니다.");
      }
    } catch (error) {
      console.error("[ReportGenerator] 리포트 목록 로드 오류:", error);
      toast.error("데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoadingReports(false);
    }
  };

  // 초기 로드
  useEffect(() => {
    loadReports();
  }, []);

  const handleGenerate = () => {
    startTransition(async () => {
      console.group("[ReportGenerator] 리포트 생성 요청");
      const result = await generateReport({
        reportType,
        periodStart: reportType === "custom" ? periodStart : undefined,
        periodEnd: reportType === "custom" ? periodEnd : undefined,
        metrics,
        format: "json",
      });

      if (result.success) {
        toast.success("리포트가 생성되었습니다.");
        loadReports(); // 목록 새로고침
      } else {
        toast.error(result.error || "리포트 생성에 실패했습니다.");
      }
      console.groupEnd();
    });
  };

  const handleDownload = (reportId: string, title: string) => {
    const url = `/api/reports/${reportId}/download`;
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("리포트를 다운로드했습니다.");
  };

  const reportTypeNames: Record<string, string> = {
    daily: "일일",
    weekly: "주간",
    monthly: "월간",
    custom: "커스텀",
  };

  return (
    <div className="space-y-6">
      {/* 리포트 생성 폼 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            리포트 생성
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 리포트 유형 선택 */}
          <div className="space-y-2">
            <Label>리포트 유형</Label>
            <Select
              value={reportType}
              onValueChange={(value) => setReportType(value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">일일 리포트</SelectItem>
                <SelectItem value="weekly">주간 리포트</SelectItem>
                <SelectItem value="monthly">월간 리포트</SelectItem>
                <SelectItem value="custom">커스텀 리포트</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 커스텀 기간 선택 */}
          {reportType === "custom" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>시작일</Label>
                <Input
                  type="date"
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>종료일</Label>
                <Input
                  type="date"
                  value={periodEnd}
                  onChange={(e) => setPeriodEnd(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* 포함할 지표 선택 */}
          <div className="space-y-3">
            <Label>포함할 지표</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="timeSeries"
                  checked={metrics.timeSeries}
                  onCheckedChange={(checked) =>
                    setMetrics({ ...metrics, timeSeries: checked === true })
                  }
                />
                <Label htmlFor="timeSeries" className="cursor-pointer">
                  시간대별 통계
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="regionType"
                  checked={metrics.regionType}
                  onCheckedChange={(checked) =>
                    setMetrics({ ...metrics, regionType: checked === true })
                  }
                />
                <Label htmlFor="regionType" className="cursor-pointer">
                  지역별/타입별 통계
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="performance"
                  checked={metrics.performance}
                  onCheckedChange={(checked) =>
                    setMetrics({ ...metrics, performance: checked === true })
                  }
                />
                <Label htmlFor="performance" className="cursor-pointer">
                  성능 모니터링
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="cost"
                  checked={metrics.cost}
                  onCheckedChange={(checked) =>
                    setMetrics({ ...metrics, cost: checked === true })
                  }
                />
                <Label htmlFor="cost" className="cursor-pointer">
                  비용 분석
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="userBehavior"
                  checked={metrics.userBehavior}
                  onCheckedChange={(checked) =>
                    setMetrics({ ...metrics, userBehavior: checked === true })
                  }
                />
                <Label htmlFor="userBehavior" className="cursor-pointer">
                  사용자 행동 분석
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="predictions"
                  checked={metrics.predictions}
                  onCheckedChange={(checked) =>
                    setMetrics({ ...metrics, predictions: checked === true })
                  }
                />
                <Label htmlFor="predictions" className="cursor-pointer">
                  예측 분석
                </Label>
              </div>
            </div>
          </div>

          {/* 생성 버튼 */}
          <Button onClick={handleGenerate} disabled={isPending} className="w-full">
            {isPending ? "생성 중..." : "리포트 생성"}
          </Button>
        </CardContent>
      </Card>

      {/* 생성된 리포트 목록 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            생성된 리포트
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingReports ? (
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
              로딩 중...
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
              생성된 리포트가 없습니다.
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div>
                    <div className="font-medium">{report.title}</div>
                    <div className="text-sm text-gray-500">
                      {reportTypeNames[report.reportType]} | {report.periodStart} ~ {report.periodEnd}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      생성일: {format(new Date(report.createdAt), "yyyy-MM-dd HH:mm", { locale: ko })}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(report.id, report.title)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    다운로드
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

