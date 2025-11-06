import type { Metadata } from "next";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { koKR } from "@clerk/localizations";
import { Geist, Geist_Mono } from "next/font/google";

import { ThemeProvider } from "next-themes";
import { SyncUserProvider } from "@/components/providers/sync-user-provider";
import { Toaster } from "@/components/ui/sonner";
import { ThemeToggle } from "@/components/theme-toggle";
import { WebVitals } from "@/components/web-vitals";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // FOUT 방지
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap", // FOUT 방지
  preload: false, // Mono 폰트는 덜 중요하므로 preload 비활성화
});

export const metadata: Metadata = {
  title: {
    default: "Pitch Camping - 캠핑장 정보 서비스",
    template: "%s | Pitch Camping",
  },
  description:
    "전국의 캠핑장 정보를 쉽게 검색하고, 지도에서 확인하며, 상세 정보를 조회할 수 있는 웹 서비스",
  keywords: [
    "캠핑장",
    "캠핑",
    "야영장",
    "글램핑",
    "카라반",
    "캠핑장 검색",
    "캠핑 정보",
    "고캠핑",
  ],
  authors: [{ name: "Pitch Camping" }],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://pitch-camping.vercel.app",
    siteName: "Pitch Camping",
    title: "Pitch Camping - 캠핑장 정보 서비스",
    description:
      "전국의 캠핑장 정보를 쉽게 검색하고, 지도에서 확인하며, 상세 정보를 조회할 수 있는 웹 서비스",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Pitch Camping",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pitch Camping - 캠핑장 정보 서비스",
    description:
      "전국의 캠핑장 정보를 쉽게 검색하고, 지도에서 확인하며, 상세 정보를 조회할 수 있는 웹 서비스",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={koKR}>
      <html lang="ko" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange={false}
          >
            <SyncUserProvider>
              {/* Skip to content 링크 (접근성) */}
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                메인 콘텐츠로 건너뛰기
              </a>

              <header className="flex justify-end items-center p-4 gap-4 h-16">
                <ThemeToggle />
                <SignedOut>
                  <SignInButton />
                  <SignUpButton>
                    <button className="bg-[#6c47ff] text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                      Sign Up
                    </button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <UserButton />
                </SignedIn>
              </header>
              <main id="main-content">{children}</main>
              <Toaster />
              <WebVitals />
            </SyncUserProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
