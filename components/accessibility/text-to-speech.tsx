/**
 * @file text-to-speech.tsx
 * @description 음성 출력 기능 컴포넌트
 *
 * Web Speech API를 활용하여 페이지 텍스트를 음성으로 읽어주는 기능
 * 전체 페이지 읽기 및 선택 영역 읽기 지원
 *
 * @dependencies
 * - components/ui/button.tsx: Button 컴포넌트
 * - lucide-react: Volume2, VolumeX, Play, Pause, Square 아이콘
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Play, Pause, Square } from "lucide-react";

interface TextToSpeechProps {
  className?: string;
}

export function TextToSpeech({ className }: TextToSpeechProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState(1.0);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Web Speech API 지원 여부 확인
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setIsSupported(true);
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // 페이지의 모든 텍스트 추출
  const extractPageText = (): string => {
    if (typeof document === "undefined") return "";

    const main = document.querySelector("main") || document.body;
    const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        // 스크립트, 스타일, 숨김 요소 제외
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if (
          parent.tagName === "SCRIPT" ||
          parent.tagName === "STYLE" ||
          parent.classList.contains("sr-only") ||
          parent.hidden ||
          parent.style.display === "none"
        ) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    const texts: string[] = [];
    let node;
    while ((node = walker.nextNode())) {
      const text = node.textContent?.trim();
      if (text && text.length > 0) {
        texts.push(text);
      }
    }

    return texts.join(". ");
  };

  // 선택된 텍스트 가져오기
  const getSelectedText = (): string => {
    if (typeof window === "undefined") return "";
    const selection = window.getSelection();
    return selection?.toString().trim() || "";
  };

  // 전체 페이지 읽기
  const handleReadPage = () => {
    if (!synthRef.current || !isSupported) return;

    // 현재 재생 중이면 중지
    if (isPlaying) {
      handleStop();
      return;
    }

    const text = extractPageText();
    if (!text) {
      alert("읽을 내용이 없습니다.");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ko-KR"; // 한국어
    utterance.rate = rate;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = (error) => {
      console.error("[TextToSpeech] 오류:", error);
      setIsPlaying(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  };

  // 선택 영역 읽기
  const handleReadSelection = () => {
    if (!synthRef.current || !isSupported) return;

    const text = getSelectedText();
    if (!text) {
      alert("읽을 텍스트를 선택해주세요.");
      return;
    }

    // 현재 재생 중이면 중지
    if (isPlaying) {
      handleStop();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ko-KR";
    utterance.rate = rate;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = (error) => {
      console.error("[TextToSpeech] 오류:", error);
      setIsPlaying(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  };

  // 일시정지/재개
  const handlePauseResume = () => {
    if (!synthRef.current) return;

    if (isPaused) {
      synthRef.current.resume();
      setIsPaused(false);
    } else {
      synthRef.current.pause();
      setIsPaused(true);
    }
  };

  // 중지
  const handleStop = () => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    utteranceRef.current = null;
  };

  // 속도 조절
  const handleRateChange = (newRate: number) => {
    setRate(newRate);
    if (utteranceRef.current && synthRef.current) {
      utteranceRef.current.rate = newRate;
      // 재생 중이면 다시 시작
      if (isPlaying) {
        handleStop();
        setTimeout(() => {
          if (utteranceRef.current) {
            synthRef.current?.speak(utteranceRef.current);
          }
        }, 100);
      }
    }
  };

  if (!isSupported) {
    return (
      <div className={className}>
        <p className="text-sm text-muted-foreground">
          음성 출력 기능은 이 브라우저에서 지원되지 않습니다.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleReadPage}
          aria-label={isPlaying ? "읽기 중지" : "전체 페이지 읽기"}
        >
          {isPlaying ? (
            <Square className="w-4 h-4 mr-2" aria-hidden="true" />
          ) : (
            <Play className="w-4 h-4 mr-2" aria-hidden="true" />
          )}
          {isPlaying ? "중지" : "전체 읽기"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReadSelection}
          aria-label="선택 영역 읽기"
        >
          <Volume2 className="w-4 h-4 mr-2" aria-hidden="true" />
          선택 읽기
        </Button>
        {isPlaying && (
          <Button
            variant="outline"
            size="sm"
            onClick={handlePauseResume}
            aria-label={isPaused ? "재개" : "일시정지"}
          >
            {isPaused ? (
              <Play className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Pause className="w-4 h-4" aria-hidden="true" />
            )}
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="speech-rate" className="text-sm font-medium">
          속도:
        </label>
        <input
          id="speech-rate"
          type="range"
          min="0.5"
          max="2.0"
          step="0.1"
          value={rate}
          onChange={(e) => handleRateChange(parseFloat(e.target.value))}
          className="flex-1"
          aria-label="읽기 속도 조절"
        />
        <span className="text-sm text-muted-foreground min-w-[3rem] text-right">
          {rate.toFixed(1)}x
        </span>
      </div>
    </div>
  );
}

