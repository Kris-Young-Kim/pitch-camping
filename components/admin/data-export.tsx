/**
 * @file data-export.tsx
 * @description 데이터 내보내기 UI 컴포넌트
 */

"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Download, Database, FileText } from "lucide-react";
import { exportStatistics } from "@/actions/admin-stats/export-statistics";
import { exportBackup } from "@/actions/admin-stats/export-backup";
import { toast } from "sonner";
import type { ExportFormat } from "@/actions/admin-stats/export-statistics";

export function DataExport() {
  const [dataType, setDataType] = useState<
    | "time_series"
    | "region_type"
    | "performance"
    | "cost"
    | "user_behavior"
    | "predictions"
    | "all"
  >("all");
  const [format, setFormat] = useState<ExportFormat>("json");
  const [period, setPeriod] = useState<"7days" | "30days" | "90days">("30days");
  const [isPending, startTransition] = useTransition();

  const handleExport = () => {
    startTransition(async () => {
      console.group("[DataExport] 데이터 내보내기 요청");
      const result = await exportStatistics({
        dataType,
        format,
        period: dataType === "time_series" || dataType === "all" ? period : undefined,
      });

      if (result.success && result.filename && result.content) {
        try {
          const blob = new Blob([result.content], {
            type: format === "json" ? "application/json" : "text/csv;charset=utf-8;",
          });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = result.filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          toast.success("데이터를 내보냈습니다.");
        } catch (error) {
          console.error("[DataExport] 파일 다운로드 오류", error);
          toast.error("파일 다운로드 중 오류가 발생했습니다.");
        }
      } else {
        toast.error(result.error || "데이터 내보내기에 실패했습니다.");
      }
      console.groupEnd();
    });
  };

  const handleBackup = () => {
    startTransition(async () => {
      console.group("[DataExport] 백업 데이터 내보내기 요청");
      const result = await exportBackup();

      if (result.success && result.filename && result.content) {
        try {
          const blob = new Blob([result.content], {
            type: "application/json",
          });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = result.filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          toast.success("백업 데이터를 내보냈습니다.");
        } catch (error) {
          console.error("[DataExport] 백업 다운로드 오류", error);
          toast.error("백업 다운로드 중 오류가 발생했습니다.");
        }
      } else {
        toast.error(result.error || "백업 데이터 내보내기에 실패했습니다.");
      }
      console.groupEnd();
    });
  };

  const dataTypeNames: Record<string, string> = {
    time_series: "시간대별 통계",
    region_type: "지역별/타입별 통계",
    performance: "성능 모니터링",
    cost: "비용 분석",
    user_behavior: "사용자 행동 분석",
    predictions: "예측 분석",
    all: "전체 통계",
  };

  return (
    <div className="space-y-6">
      {/* 통계 데이터 내보내기 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            통계 데이터 내보내기
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 데이터 유형 선택 */}
          <div className="space-y-2">
            <Label>데이터 유형</Label>
            <Select value={dataType} onValueChange={(value) => setDataType(value as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 통계</SelectItem>
                <SelectItem value="time_series">시간대별 통계</SelectItem>
                <SelectItem value="region_type">지역별/타입별 통계</SelectItem>
                <SelectItem value="performance">성능 모니터링</SelectItem>
                <SelectItem value="cost">비용 분석</SelectItem>
                <SelectItem value="user_behavior">사용자 행동 분석</SelectItem>
                <SelectItem value="predictions">예측 분석</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 기간 선택 (time_series 또는 all인 경우) */}
          {(dataType === "time_series" || dataType === "all") && (
            <div className="space-y-2">
              <Label>기간</Label>
              <Select value={period} onValueChange={(value) => setPeriod(value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">최근 7일</SelectItem>
                  <SelectItem value="30days">최근 30일</SelectItem>
                  <SelectItem value="90days">최근 90일</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* 파일 형식 선택 */}
          <div className="space-y-2">
            <Label>파일 형식</Label>
            <RadioGroup value={format} onValueChange={(value) => setFormat(value as ExportFormat)}>
              <div className="flex items-center space-x-3 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2">
                <RadioGroupItem value="json" id="export-json" />
                <Label htmlFor="export-json" className="flex-1 cursor-pointer">
                  JSON (권장)
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    구조화된 데이터를 그대로 저장합니다.
                  </p>
                </Label>
              </div>
              <div className="flex items-center space-x-3 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2">
                <RadioGroupItem value="csv" id="export-csv" />
                <Label htmlFor="export-csv" className="flex-1 cursor-pointer">
                  CSV (Excel 호환)
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    스프레드시트에서 열 수 있게 쉼표로 구분합니다.
                  </p>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* 내보내기 버튼 */}
          <Button onClick={handleExport} disabled={isPending} className="w-full">
            <Download className="w-4 h-4 mr-2" />
            {isPending ? "내보내는 중..." : `${dataTypeNames[dataType]} 내보내기`}
          </Button>
        </CardContent>
      </Card>

      {/* 백업 데이터 내보내기 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            백업 데이터 내보내기
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              모든 주요 테이블의 데이터를 JSON 형식으로 백업합니다. 대량 데이터이므로 다운로드에
              시간이 걸릴 수 있습니다.
            </p>
            <Button onClick={handleBackup} disabled={isPending} variant="outline" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              {isPending ? "백업 중..." : "백업 데이터 다운로드"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

