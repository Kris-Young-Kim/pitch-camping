/**
 * @file detail-gallery.tsx
 * @description 캠핑장 이미지 갤러리 컴포넌트
 *
 * 캠핑장의 이미지를 표시하고 슬라이드 모달을 제공하는 컴포넌트
 *
 * 주요 기능:
 * 1. 대표 이미지 및 서브 이미지 표시
 * 2. 이미지 클릭 시 전체화면 모달
 * 3. 이미지 슬라이드 기능
 * 4. 이미지 없으면 기본 이미지 표시
 *
 * @dependencies
 * - components/ui/dialog.tsx: Dialog 컴포넌트
 * - types/camping.ts: CampingSiteDetail 타입
 * - lib/utils/camping.ts: getImageUrl 유틸리티
 */

"use client";

import { useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { CampingSiteDetail } from "@/types/camping";
import { getImageUrl } from "@/lib/utils/camping";

interface DetailGalleryProps {
  camping: CampingSiteDetail;
}

export function DetailGallery({ camping }: DetailGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // 이미지 목록 생성 (대표 이미지 + 추가 이미지)
  // 실제 API가 이미지 목록을 제공하는 경우 해당 필드 사용
  const images: string[] = [];
  
  if (camping.firstImageUrl) {
    images.push(camping.firstImageUrl);
  }
  
  // 추가 이미지가 있다면 포함 (실제 API 응답에 따라 조정 필요)
  // 예: camping.images?.forEach(...) 같은 형태

  const handleImageClick = (index: number) => {
    console.log("[DetailGallery] 이미지 클릭:", index);
    setSelectedImageIndex(index);
    setIsOpen(true);
  };

  const handleClose = () => {
    console.log("[DetailGallery] 갤러리 닫기");
    setIsOpen(false);
    setSelectedImageIndex(null);
  };

  const handlePrevious = () => {
    if (selectedImageIndex !== null && selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

  const handleNext = () => {
    if (selectedImageIndex !== null && selectedImageIndex < images.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    }
  };

  // 이미지가 없는 경우
  if (images.length === 0) {
    return (
      <div className="relative w-full h-64 md:h-96 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center">
        <Image
          src={getImageUrl()}
          alt={camping.facltNm}
          fill
          className="object-cover"
          sizes="100vw"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 대표 이미지 */}
      <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden cursor-pointer group">
        <Image
          src={getImageUrl(images[0])}
          alt={camping.facltNm}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-200"
          sizes="100vw"
          priority // 상세페이지 첫 이미지는 priority 로드
          onClick={() => handleImageClick(0)}
        />
        {images.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded text-sm">
            +{images.length - 1}장 더보기
          </div>
        )}
      </div>

      {/* 서브 이미지 썸네일 (있는 경우) */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.slice(1, 5).map((image, index) => (
            <div
              key={index + 1}
              className="relative w-full h-20 rounded overflow-hidden cursor-pointer group"
              onClick={() => handleImageClick(index + 1)}
            >
              <Image
                src={getImageUrl(image)}
                alt={`${camping.facltNm} 이미지 ${index + 2}`}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-200"
                sizes="(max-width: 768px) 25vw, 25vw"
              />
            </div>
          ))}
        </div>
      )}

      {/* 이미지 슬라이드 모달 */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-7xl w-full h-[90vh] p-0 bg-black/95">
          {selectedImageIndex !== null && (
            <div className="relative w-full h-full flex items-center justify-center">
              {/* 닫기 버튼 */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
                onClick={handleClose}
              >
                <X className="w-6 h-6" />
              </Button>

              {/* 이전 버튼 */}
              {selectedImageIndex > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 z-50 text-white hover:bg-white/20"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="w-8 h-8" />
                </Button>
              )}

              {/* 다음 버튼 */}
              {selectedImageIndex < images.length - 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 z-50 text-white hover:bg-white/20"
                  onClick={handleNext}
                >
                  <ChevronRight className="w-8 h-8" />
                </Button>
              )}

              {/* 이미지 */}
              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  src={getImageUrl(images[selectedImageIndex])}
                  alt={`${camping.facltNm} 이미지 ${selectedImageIndex + 1}`}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority
                />
              </div>

              {/* 이미지 인덱스 표시 */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded text-sm">
                {selectedImageIndex + 1} / {images.length}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

