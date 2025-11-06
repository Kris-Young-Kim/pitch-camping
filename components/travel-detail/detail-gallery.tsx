/**
 * @file detail-gallery.tsx
 * @description 여행지 이미지 갤러리 컴포넌트
 *
 * 여행지의 이미지를 표시하고 슬라이드 모달을 제공하는 컴포넌트
 *
 * 주요 기능:
 * 1. TourAPI 이미지 목록 조회
 * 2. 대표 이미지 및 서브 이미지 표시
 * 3. 이미지 클릭 시 전체화면 모달
 * 4. 이미지 슬라이드 기능
 * 5. 이미지 없으면 기본 이미지 표시
 *
 * @dependencies
 * - components/ui/dialog.tsx: Dialog 컴포넌트
 * - types/travel.ts: TravelSiteDetail, TravelImage 타입
 * - lib/api/travel-api.ts: travelApi 클라이언트
 * - lib/utils/travel.ts: getImageUrl 유틸리티
 */

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { TravelSiteDetail, TravelImage } from "@/types/travel";
import { getImageUrl } from "@/lib/utils/travel";

interface DetailGalleryProps {
  travel: TravelSiteDetail;
}

export function DetailGallery({ travel }: DetailGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);

  // TourAPI 이미지 목록 조회
  useEffect(() => {
    const fetchImages = async () => {
      if (!travel.contentid) return;

      console.group("[DetailGallery] 이미지 목록 조회 시작");
      setIsLoadingImages(true);

      try {
        // 대표 이미지 추가
        const imageList: string[] = [];
        if (travel.firstimage) {
          imageList.push(travel.firstimage);
        }

        // TourAPI 이미지 목록 조회 (API Route를 통해)
        const response = await fetch(`/api/travels/${travel.contentid}/images`);
        if (!response.ok) {
          throw new Error("이미지 목록 조회 실패");
        }
        const data = await response.json();
        const imageItems: TravelImage[] = Array.isArray(data.response?.body?.items?.item)
          ? data.response.body.items.item
          : data.response?.body?.items?.item
          ? [data.response.body.items.item]
          : [];

        // 이미지 URL 추가 (중복 제거)
        imageItems.forEach((item) => {
          if (item.originimgurl && !imageList.includes(item.originimgurl)) {
            imageList.push(item.originimgurl);
          }
        });

        console.log("[DetailGallery] 이미지 목록 조회 완료:", imageList.length);
        setImages(imageList);
      } catch (err) {
        console.error("[DetailGallery] 이미지 목록 조회 오류:", err);
        // 에러 발생 시 대표 이미지만 사용
        if (travel.firstimage) {
          setImages([travel.firstimage]);
        }
      } finally {
        setIsLoadingImages(false);
        console.groupEnd();
      }
    };

    fetchImages();
  }, [travel.contentid, travel.firstimage]);

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

  // 키보드 네비게이션
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        handlePrevious();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedImageIndex, images.length]);

  // 이미지가 없는 경우
  if (images.length === 0 && !isLoadingImages) {
    return (
      <div className="relative w-full h-64 md:h-96 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center">
        <Image
          src={getImageUrl()}
          alt={travel.title}
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
        {isLoadingImages ? (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
        ) : (
          <>
            <Image
              src={getImageUrl(images[0] || travel.firstimage)}
              alt={travel.title}
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
          </>
        )}
      </div>

      {/* 서브 이미지 썸네일 (있는 경우) */}
      {images.length > 1 && !isLoadingImages && (
        <div className="grid grid-cols-4 gap-2">
          {images.slice(1, 5).map((image, index) => (
            <div
              key={index + 1}
              className="relative w-full h-20 rounded overflow-hidden cursor-pointer group"
              onClick={() => handleImageClick(index + 1)}
            >
              <Image
                src={getImageUrl(image)}
                alt={`${travel.title} 이미지 ${index + 2}`}
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
                aria-label="갤러리 닫기"
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
                  aria-label="이전 이미지"
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
                  aria-label="다음 이미지"
                >
                  <ChevronRight className="w-8 h-8" />
                </Button>
              )}

              {/* 이미지 */}
              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  src={getImageUrl(images[selectedImageIndex])}
                  alt={`${travel.title} 이미지 ${selectedImageIndex + 1}`}
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

