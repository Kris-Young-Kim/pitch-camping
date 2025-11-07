/**
 * @file advanced-filters.tsx
 * @description 고급 필터링 컴포넌트 (기간 필터, 프리셋 관리 포함)
 */

"use client";

import { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Save, Trash2, Calendar, Filter } from "lucide-react";
import { toast } from "sonner";
import type { TravelFilter } from "@/types/travel";
import { getFilterPresets } from "@/actions/filters/get-filter-presets";
import { createFilterPreset } from "@/actions/filters/create-filter-preset";
import { deleteFilterPreset } from "@/actions/filters/delete-filter-preset";
import type { FilterPreset } from "@/actions/filters/get-filter-presets";

interface AdvancedFiltersProps {
  currentFilter: TravelFilter;
  onFilterChange: (filter: TravelFilter) => void;
}

export function AdvancedFilters({ currentFilter, onFilterChange }: AdvancedFiltersProps) {
  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const [isPresetDialogOpen, setIsPresetDialogOpen] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [presetDescription, setPresetDescription] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [dateRange, setDateRange] = useState<{ start?: string; end?: string }>({});
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    loadPresets();
  }, []);

  const loadPresets = async () => {
    console.group("[AdvancedFilters] 필터 프리셋 로드");
    const result = await getFilterPresets("travel");
    if (result.success && result.presets) {
      setPresets(result.presets);
    }
    console.groupEnd();
  };

  const handleSavePreset = () => {
    startTransition(async () => {
      console.group("[AdvancedFilters] 필터 프리셋 저장");
      const result = await createFilterPreset({
        name: presetName,
        description: presetDescription || undefined,
        filterType: "travel",
        filterConfig: {
          ...currentFilter,
          dateRange,
        },
        isDefault,
      });

      if (result.success) {
        toast.success("필터 프리셋이 저장되었습니다.");
        setIsPresetDialogOpen(false);
        setPresetName("");
        setPresetDescription("");
        setIsDefault(false);
        loadPresets();
      } else {
        toast.error(result.error || "필터 프리셋 저장에 실패했습니다.");
      }
      console.groupEnd();
    });
  };

  const handleLoadPreset = (preset: FilterPreset) => {
    console.group("[AdvancedFilters] 필터 프리셋 로드");
    const config = preset.filterConfig;
    const newFilter: TravelFilter = {
      areaCode: config.areaCode,
      contentTypeId: config.contentTypeId,
      keyword: config.keyword,
      petFriendly: config.petFriendly,
      arrange: config.arrange,
      pageNo: 1,
    };
    onFilterChange(newFilter);
    if (config.dateRange) {
      setDateRange(config.dateRange);
    }
    toast.success(`"${preset.name}" 필터 프리셋을 적용했습니다.`);
    console.groupEnd();
  };

  const handleDeletePreset = (presetId: string) => {
    startTransition(async () => {
      console.group("[AdvancedFilters] 필터 프리셋 삭제");
      const result = await deleteFilterPreset(presetId);
      if (result.success) {
        toast.success("필터 프리셋이 삭제되었습니다.");
        loadPresets();
      } else {
        toast.error(result.error || "필터 프리셋 삭제에 실패했습니다.");
      }
      console.groupEnd();
    });
  };

  const handleDateRangeChange = (type: "start" | "end", value: string) => {
    const newRange = { ...dateRange, [type]: value };
    setDateRange(newRange);
    // 기간 필터 적용 (추후 API에서 지원 시)
    onFilterChange({
      ...currentFilter,
      // dateRange는 현재 API에서 지원하지 않으므로 주석 처리
      // dateRange: newRange,
    });
  };

  return (
    <div className="space-y-4">
      {/* 기간 필터 */}
      <div className="flex items-center gap-4 p-4 border rounded-lg">
        <Calendar className="w-5 h-5 text-gray-500" />
        <div className="flex-1 grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start-date">시작 날짜</Label>
            <Input
              id="start-date"
              type="date"
              value={dateRange.start || ""}
              onChange={(e) => handleDateRangeChange("start", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end-date">종료 날짜</Label>
            <Input
              id="end-date"
              type="date"
              value={dateRange.end || ""}
              onChange={(e) => handleDateRangeChange("end", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 필터 프리셋 관리 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            필터 프리셋
          </Label>
          <Dialog open={isPresetDialogOpen} onOpenChange={setIsPresetDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Save className="w-4 h-4 mr-2" />
                저장
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>필터 프리셋 저장</DialogTitle>
                <DialogDescription>
                  현재 필터 설정을 저장하여 나중에 빠르게 불러올 수 있습니다.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="preset-name">이름</Label>
                  <Input
                    id="preset-name"
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    placeholder="예: 서울 관광지"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preset-description">설명</Label>
                  <Textarea
                    id="preset-description"
                    value={presetDescription}
                    onChange={(e) => setPresetDescription(e.target.value)}
                    placeholder="필터 프리셋에 대한 설명을 입력하세요"
                    rows={3}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="preset-is-default"
                    checked={isDefault}
                    onCheckedChange={setIsDefault}
                  />
                  <Label htmlFor="preset-is-default">기본 프리셋으로 설정</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsPresetDialogOpen(false)}>
                  취소
                </Button>
                <Button onClick={handleSavePreset} disabled={isPending || !presetName.trim()}>
                  저장
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* 저장된 프리셋 목록 */}
        {presets.length > 0 ? (
          <div className="space-y-2">
            {presets.map((preset) => (
              <div
                key={preset.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleLoadPreset(preset)}
                      className="text-sm font-medium hover:underline"
                    >
                      {preset.name}
                    </button>
                    {preset.isDefault && (
                      <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                        기본
                      </span>
                    )}
                  </div>
                  {preset.description && (
                    <p className="text-xs text-gray-500 mt-1">{preset.description}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeletePreset(preset.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">
            저장된 필터 프리셋이 없습니다.
          </p>
        )}
      </div>
    </div>
  );
}

