/**
 * @file accessibility-toolbar.tsx
 * @description 접근성 도구 모음 컴포넌트
 *
 * 화면 확대/축소 및 음성 출력 기능을 제공하는 플로팅 도구 모음
 * 우측 하단에 고정되어 모든 페이지에서 사용 가능
 *
 * @dependencies
 * - components/accessibility/zoom-control.tsx: ZoomControl 컴포넌트
 * - components/accessibility/text-to-speech.tsx: TextToSpeech 컴포넌트
 * - components/ui/button.tsx: Button 컴포넌트
 * - components/ui/dialog.tsx: Dialog 컴포넌트
 * - lucide-react: Accessibility, X 아이콘
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Accessibility, X } from "lucide-react";
import { ZoomControl } from "./zoom-control";
import { TextToSpeech } from "./text-to-speech";

export function AccessibilityToolbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            size="lg"
            className="rounded-full shadow-lg h-14 w-14 p-0"
            aria-label="접근성 도구 열기"
            title="접근성 도구"
          >
            <Accessibility className="w-6 h-6" aria-hidden="true" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>접근성 도구</DialogTitle>
            <DialogDescription>
              화면 확대/축소 및 음성 출력 기능을 사용할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">화면 확대/축소</h3>
              <ZoomControl />
              <p className="text-sm text-muted-foreground mt-2">
                키보드 단축키: Ctrl + + (확대), Ctrl + - (축소), Ctrl + 0 (초기화)
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">음성 출력</h3>
              <TextToSpeech />
              <p className="text-sm text-muted-foreground mt-2">
                전체 페이지 또는 선택한 텍스트를 음성으로 읽어줍니다.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

