/**
 * @file alert-system.tsx
 * @description 알림 시스템 UI 컴포넌트
 */

"use client";

import { useState, useEffect, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Bell, Plus, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import { createAlertRule } from "@/actions/admin-alerts/create-alert-rule";
import { getAlertRules } from "@/actions/admin-alerts/get-alert-rules";
import { checkAlerts } from "@/actions/admin-alerts/check-alerts";
import { getAlertHistory } from "@/actions/admin-alerts/get-alert-history";
import { toast } from "sonner";
import type { AlertRule } from "@/actions/admin-alerts/get-alert-rules";
import type { AlertHistory } from "@/actions/admin-alerts/get-alert-history";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

export function AlertSystem() {
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [history, setHistory] = useState<AlertHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // 새 규칙 폼 상태
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    metricType: "error_rate" as const,
    thresholdValue: 5,
    thresholdOperator: ">=" as const,
    checkIntervalMinutes: 5,
    enabled: true,
    channels: [] as string[],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rulesResult, historyResult] = await Promise.all([
        getAlertRules(),
        getAlertHistory(20),
      ]);

      if (rulesResult.success && rulesResult.rules) {
        setRules(rulesResult.rules);
      }

      if (historyResult.success && historyResult.history) {
        setHistory(historyResult.history);
      }
    } catch (error) {
      console.error("[AlertSystem] 데이터 로드 오류:", error);
      toast.error("데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRule = () => {
    startTransition(async () => {
      console.group("[AlertSystem] 알림 규칙 생성 요청");
      const result = await createAlertRule(formData);

      if (result.success) {
        toast.success("알림 규칙이 생성되었습니다.");
        setIsDialogOpen(false);
        setFormData({
          name: "",
          description: "",
          metricType: "error_rate",
          thresholdValue: 5,
          thresholdOperator: ">=",
          checkIntervalMinutes: 5,
          enabled: true,
          channels: [],
        });
        loadData();
      } else {
        toast.error(result.error || "알림 규칙 생성에 실패했습니다.");
      }
      console.groupEnd();
    });
  };

  const handleCheckAlerts = () => {
    startTransition(async () => {
      console.group("[AlertSystem] 알림 체크 요청");
      const result = await checkAlerts();

      if (result.success) {
        toast.success(`${result.alertsTriggered || 0}개의 알림이 발송되었습니다.`);
        loadData();
      } else {
        toast.error(result.error || "알림 체크에 실패했습니다.");
      }
      console.groupEnd();
    });
  };

  const metricTypeNames: Record<string, string> = {
    user_count: "사용자 수",
    error_rate: "에러율",
    api_response_time: "API 응답 시간",
    page_load_time: "페이지 로드 시간",
    cost: "비용",
    traffic: "트래픽",
    performance: "성능",
  };

  const channelNames: Record<string, string> = {
    email: "이메일",
    webhook: "웹훅",
    slack: "Slack",
    discord: "Discord",
  };

  const statusColors: Record<string, string> = {
    sent: "bg-green-600",
    failed: "bg-red-600",
    pending: "bg-yellow-600",
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-600 dark:text-gray-400">
        알림 시스템을 불러오는 중...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 알림 규칙 관리 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              알림 규칙
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCheckAlerts} disabled={isPending}>
                알림 체크
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    규칙 추가
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>알림 규칙 추가</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>규칙 이름</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="예: 에러율 모니터링"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>설명</Label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                        placeholder="규칙에 대한 설명"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>지표 유형</Label>
                        <Select
                          value={formData.metricType}
                          onValueChange={(value) =>
                            setFormData({ ...formData, metricType: value as any })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user_count">사용자 수</SelectItem>
                            <SelectItem value="error_rate">에러율</SelectItem>
                            <SelectItem value="api_response_time">API 응답 시간</SelectItem>
                            <SelectItem value="page_load_time">페이지 로드 시간</SelectItem>
                            <SelectItem value="cost">비용</SelectItem>
                            <SelectItem value="traffic">트래픽</SelectItem>
                            <SelectItem value="performance">성능</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>비교 연산자</Label>
                        <Select
                          value={formData.thresholdOperator}
                          onValueChange={(value) =>
                            setFormData({ ...formData, thresholdOperator: value as any })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value=">">초과 (&gt;)</SelectItem>
                            <SelectItem value=">=">이상 (&gt;=)</SelectItem>
                            <SelectItem value="<">미만 (&lt;)</SelectItem>
                            <SelectItem value="<=">이하 (&lt;=)</SelectItem>
                            <SelectItem value="==">같음 (==)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>임계값</Label>
                        <Input
                          type="number"
                          value={formData.thresholdValue}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              thresholdValue: parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>체크 간격 (분)</Label>
                        <Input
                          type="number"
                          value={formData.checkIntervalMinutes}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              checkIntervalMinutes: parseInt(e.target.value) || 5,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>알림 채널</Label>
                      <div className="grid grid-cols-2 gap-4">
                        {["email", "webhook", "slack", "discord"].map((channel) => (
                          <div key={channel} className="flex items-center space-x-2">
                            <Checkbox
                              id={channel}
                              checked={formData.channels.includes(channel)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFormData({
                                    ...formData,
                                    channels: [...formData.channels, channel],
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    channels: formData.channels.filter((c) => c !== channel),
                                  });
                                }
                              }}
                            />
                            <Label htmlFor={channel} className="cursor-pointer">
                              {channelNames[channel]}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="enabled"
                        checked={formData.enabled}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, enabled: checked })
                        }
                      />
                      <Label htmlFor="enabled" className="cursor-pointer">
                        활성화
                      </Label>
                    </div>
                    <Button onClick={handleCreateRule} disabled={isPending} className="w-full">
                      {isPending ? "생성 중..." : "규칙 생성"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {rules.length === 0 ? (
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
              알림 규칙이 없습니다.
            </div>
          ) : (
            <div className="space-y-3">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div>
                    <div className="font-medium">{rule.name}</div>
                    {rule.description && (
                      <div className="text-sm text-gray-500">{rule.description}</div>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge>{metricTypeNames[rule.metricType] || rule.metricType}</Badge>
                      <span className="text-sm">
                        {rule.thresholdOperator} {rule.thresholdValue}
                      </span>
                      <Badge className={rule.enabled ? "bg-green-600" : "bg-gray-600"}>
                        {rule.enabled ? "활성" : "비활성"}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      채널: {rule.channels.map((c) => channelNames[c] || c).join(", ")} | 체크
                      간격: {rule.checkIntervalMinutes}분
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 알림 이력 */}
      <Card>
        <CardHeader>
          <CardTitle>알림 이력</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
              알림 이력이 없습니다.
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={statusColors[alert.status] || "bg-gray-600"}>
                        {alert.status === "sent"
                          ? "발송됨"
                          : alert.status === "failed"
                          ? "실패"
                          : "대기중"}
                      </Badge>
                      <Badge>{channelNames[alert.channel] || alert.channel}</Badge>
                      <Badge variant="outline">
                        {metricTypeNames[alert.metricType] || alert.metricType}
                      </Badge>
                    </div>
                    <div className="text-sm">{alert.message}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {format(new Date(alert.createdAt), "yyyy-MM-dd HH:mm:ss", { locale: ko })}
                    </div>
                  </div>
                  {alert.status === "failed" && alert.errorMessage && (
                    <div className="text-xs text-red-600 ml-4">{alert.errorMessage}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

