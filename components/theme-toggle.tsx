/**
 * @file theme-toggle.tsx
 * @description 테마 전환 버튼 컴포넌트
 *
 * 다크/라이트 모드 전환을 위한 버튼 컴포넌트
 * 접근성을 고려하여 키보드 네비게이션 및 ARIA 속성 포함
 *
 * 주요 기능:
 * 1. 시스템 설정 / 라이트 / 다크 모드 전환
 * 2. 키보드 접근성 지원 (Enter, Space)
 * 3. 스크린 리더 지원 (aria-label)
 * 4. 부드러운 트랜지션 애니메이션
 *
 * @dependencies
 * - next-themes: useTheme 훅
 * - lucide-react: Sun, Moon 아이콘
 * - components/ui/button.tsx: Button 컴포넌트
 */

"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // 하이드레이션 완료 후 렌더링 (다크 모드 깜빡임 방지)
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // 서버 사이드 렌더링 시 기본 버튼 표시 (깜빡임 방지)
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        aria-label="테마 전환"
        disabled
      >
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  const currentTheme = resolvedTheme || theme;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          aria-label="테마 전환 메뉴 열기"
          aria-expanded="false"
          aria-haspopup="true"
        >
          {currentTheme === "dark" ? (
            <Moon className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Sun className="h-4 w-4" aria-hidden="true" />
          )}
          <span className="sr-only">테마 전환</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="cursor-pointer"
          aria-label="라이트 모드로 전환"
        >
          <Sun className="mr-2 h-4 w-4" aria-hidden="true" />
          <span>라이트</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="cursor-pointer"
          aria-label="다크 모드로 전환"
        >
          <Moon className="mr-2 h-4 w-4" aria-hidden="true" />
          <span>다크</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="cursor-pointer"
          aria-label="시스템 설정 사용"
        >
          <Monitor className="mr-2 h-4 w-4" aria-hidden="true" />
          <span>시스템</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

