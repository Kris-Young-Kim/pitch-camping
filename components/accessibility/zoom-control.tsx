/**
 * @file zoom-control.tsx
 * @description 화면 확대/축소 컨트롤 컴포넌트
 *
 * 사용자가 화면을 확대/축소할 수 있는 기능 제공
 * 100%, 125%, 150%, 200% 단계별 조절 지원
 *
 * @dependencies
 * - components/ui/button.tsx: Button 컴포넌트
 * - lucide-react: ZoomIn, ZoomOut, RotateCcw 아이콘
 */

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

const ZOOM_LEVELS = [100, 125, 150, 200] as const;
const STORAGE_KEY = "pitch_travel_zoom_level";

export function ZoomControl() {
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // localStorage에서 저장된 확대율 불러오기
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const level = parseInt(saved, 10);
        if (ZOOM_LEVELS.includes(level as typeof ZOOM_LEVELS[number])) {
          setZoomLevel(level);
          applyZoom(level);
        }
      }
    }
  }, []);

  // 확대율 적용
  const applyZoom = (level: number) => {
    if (typeof document !== "undefined") {
      const body = document.body;
      // CSS 변수를 사용하여 확대율 적용
      body.style.setProperty("--zoom-level", `${level / 100}`);
      body.style.transform = `scale(${level / 100})`;
      body.style.transformOrigin = "top left";
      // 레이아웃 깨짐 방지를 위한 너비 조정
      const width = (100 / (level / 100)).toFixed(2);
      body.style.width = `${width}%`;
    }
  };

  // 확대
  const handleZoomIn = () => {
    const currentIndex = ZOOM_LEVELS.indexOf(zoomLevel as typeof ZOOM_LEVELS[number]);
    if (currentIndex < ZOOM_LEVELS.length - 1) {
      const newLevel = ZOOM_LEVELS[currentIndex + 1];
      setZoomLevel(newLevel);
      applyZoom(newLevel);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, newLevel.toString());
      }
    }
  };

  // 축소
  const handleZoomOut = () => {
    const currentIndex = ZOOM_LEVELS.indexOf(zoomLevel as typeof ZOOM_LEVELS[number]);
    if (currentIndex > 0) {
      const newLevel = ZOOM_LEVELS[currentIndex - 1];
      setZoomLevel(newLevel);
      applyZoom(newLevel);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, newLevel.toString());
      }
    }
  };

  // 초기화 (100%로 복원)
  const handleReset = () => {
    setZoomLevel(100);
    applyZoom(100);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, "100");
    }
  };

  // 키보드 단축키 지원 (Ctrl + +, Ctrl + -)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "=" || e.key === "+") {
          e.preventDefault();
          handleZoomIn();
        } else if (e.key === "-") {
          e.preventDefault();
          handleZoomOut();
        } else if (e.key === "0") {
          e.preventDefault();
          handleReset();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [zoomLevel]);

  const canZoomIn = zoomLevel < ZOOM_LEVELS[ZOOM_LEVELS.length - 1];
  const canZoomOut = zoomLevel > ZOOM_LEVELS[0];

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleZoomOut}
        disabled={!canZoomOut}
        aria-label="화면 축소"
        title="화면 축소 (Ctrl + -)"
      >
        <ZoomOut className="w-4 h-4" aria-hidden="true" />
      </Button>
      <span className="text-sm font-medium min-w-[3rem] text-center" aria-live="polite">
        {zoomLevel}%
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={handleZoomIn}
        disabled={!canZoomIn}
        aria-label="화면 확대"
        title="화면 확대 (Ctrl + +)"
      >
        <ZoomIn className="w-4 h-4" aria-hidden="true" />
      </Button>
      {zoomLevel !== 100 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          aria-label="확대율 초기화"
          title="확대율 초기화 (Ctrl + 0)"
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
        </Button>
      )}
    </div>
  );
}

