/**
 * @file global-nav.tsx
 * @description GNB (Global Navigation Bar) 컴포넌트
 *
 * 전역 네비게이션 바 - 모든 페이지에서 공통으로 사용되는 상단 네비게이션
 *
 * 주요 기능:
 * 1. 로고 및 브랜드 링크
 * 2. 메인 메뉴 (홈, 안전 수칙, 피드백 등)
 * 3. 사용자 인증 버튼
 * 4. 테마 토글
 * 5. 모바일 메뉴 (햄버거 메뉴)
 *
 * 접근성:
 * - ARIA 라벨 및 역할 정의
 * - 키보드 네비게이션 지원
 * - 스크린 리더 지원
 *
 * @dependencies
 * - @clerk/nextjs: 인증 컴포넌트
 * - next/link: 라우팅
 * - components/theme-toggle.tsx: 테마 전환
 */

"use client";

import { SignedOut, SignInButton, SignUpButton, SignedIn, UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Menu, X, Home, Shield, MessageSquare, Bookmark, BarChart3, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const mainMenuItems = [
  { href: "/", label: "홈", icon: Home },
  { href: "/safety", label: "안전 수칙", icon: Shield },
  { href: "/feedback", label: "피드백", icon: MessageSquare },
];

const userMenuItems = [
  { href: "/bookmarks", label: "북마크", icon: Bookmark, requireAuth: true },
  { href: "/admin/dashboard", label: "관리자", icon: BarChart3, requireAuth: true, adminOnly: true },
  { href: "/admin/users", label: "사용자 관리", icon: Users, requireAuth: true, adminOnly: true },
];

export function GlobalNav() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useUser();

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname?.startsWith(href);
  };

  // 관리자 권한 확인 (환경변수는 클라이언트에서 접근 불가하므로, 일단 모든 로그인 사용자에게 표시)
  // 실제 권한 체크는 페이지 레벨에서 수행
  const isAdmin = user ? true : false;

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 supports-[backdrop-filter]:dark:bg-gray-900/60 shadow-sm"
      role="banner"
    >
      <nav className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8" aria-label="전역 네비게이션">
        <div className="flex justify-between items-center h-16">
          {/* 로고 및 메인 메뉴 */}
          <div className="flex items-center gap-6 lg:gap-8">
            <Link
              href="/"
              className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md"
              aria-label="Pitch Travel 홈으로 이동"
            >
              Pitch Travel
            </Link>

            {/* 데스크톱 메뉴 */}
            <div className="hidden md:flex items-center gap-1" role="menubar">
              {mainMenuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                      active
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400"
                    )}
                    aria-current={active ? "page" : undefined}
                    role="menuitem"
                  >
                    <Icon className="w-4 h-4" aria-hidden="true" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              {/* 사용자 메뉴 (로그인 시 표시) */}
              <SignedIn>
                {userMenuItems
                  .filter((item) => !item.adminOnly || isAdmin)
                  .map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                          active
                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400"
                        )}
                        aria-current={active ? "page" : undefined}
                        role="menuitem"
                      >
                        <Icon className="w-4 h-4" aria-hidden="true" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
              </SignedIn>
            </div>
          </div>

          {/* 우측 메뉴 */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <SignedOut>
              <SignInButton mode="modal">
                <Button
                  variant="ghost"
                  className="hidden sm:inline-flex hover:bg-gray-100 dark:hover:bg-gray-800"
                  aria-label="로그인"
                >
                  로그인
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white hidden sm:inline-flex"
                  aria-label="회원가입"
                >
                  회원가입
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>

            {/* 모바일 메뉴 버튼 */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label="메뉴 열기/닫기"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Menu className="w-5 h-5" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {mobileMenuOpen && (
          <div
            id="mobile-menu"
            className="md:hidden border-t border-gray-200 dark:border-gray-800 py-4"
            role="menu"
            aria-label="모바일 메뉴"
          >
            <div className="flex flex-col gap-1">
              {mainMenuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-md text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                      active
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                    aria-current={active ? "page" : undefined}
                    role="menuitem"
                  >
                    <Icon className="w-5 h-5" aria-hidden="true" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <SignedIn>
                <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                  {userMenuItems
                    .filter((item) => !item.adminOnly || isAdmin)
                    .map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-md text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                            active
                              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                          )}
                          aria-current={active ? "page" : undefined}
                          role="menuitem"
                        >
                          <Icon className="w-5 h-5" aria-hidden="true" />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                </div>
              </SignedIn>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

