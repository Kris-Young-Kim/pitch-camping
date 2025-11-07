/**
 * @file tag-autocomplete.tsx
 * @description 태그 자동완성 입력 컴포넌트
 *
 * 태그 입력 시 기존 태그 목록을 기반으로 자동완성 기능을 제공하는 컴포넌트
 *
 * 주요 기능:
 * 1. 태그명 입력 시 자동완성 제안
 * 2. 기존 태그 목록에서 검색
 * 3. 태그 선택 또는 새 태그 생성
 * 4. 키보드 네비게이션 지원
 *
 * @dependencies
 * - actions/bookmarks/tags/get-tags.ts: getBookmarkTags
 * - components/ui/input.tsx: Input 컴포넌트
 * - components/ui/command.tsx: Command 컴포넌트 (shadcn/ui)
 */

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { getBookmarkTags, type BookmarkTag } from "@/actions/bookmarks/tags/get-tags";
import { Tag, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (tag: BookmarkTag | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  excludeTagIds?: string[]; // 제외할 태그 ID 목록
}

export function TagAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "태그명을 입력하세요...",
  className,
  disabled = false,
  excludeTagIds = [],
}: TagAutocompleteProps) {
  const [tags, setTags] = useState<BookmarkTag[]>([]);
  const [suggestions, setSuggestions] = useState<BookmarkTag[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // 태그 목록 조회
  useEffect(() => {
    async function fetchTags() {
      setLoading(true);
      try {
        const data = await getBookmarkTags("name");
        // 제외할 태그 필터링
        const filteredTags = excludeTagIds.length > 0
          ? data.filter((tag) => !excludeTagIds.includes(tag.id))
          : data;
        setTags(filteredTags);
      } catch (error) {
        console.error("[TagAutocomplete] 태그 목록 조회 실패:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTags();
  }, [excludeTagIds]);

  // 입력값에 따른 자동완성 제안 업데이트
  useEffect(() => {
    if (!value.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      setSelectedIndex(-1);
      return;
    }

    const searchTerm = value.toLowerCase().trim();
    const matched = tags.filter((tag) =>
      tag.name.toLowerCase().includes(searchTerm)
    );

    // 정확히 일치하는 태그가 있으면 첫 번째로, 그 다음 부분 일치
    const exactMatch = matched.find((tag) => tag.name.toLowerCase() === searchTerm);
    const sorted = exactMatch
      ? [exactMatch, ...matched.filter((tag) => tag.id !== exactMatch.id)]
      : matched;

    setSuggestions(sorted.slice(0, 5)); // 최대 5개만 표시
    setShowSuggestions(sorted.length > 0);
    setSelectedIndex(-1);
  }, [value, tags]);

  // 태그 선택
  const handleSelectTag = useCallback(
    (tag: BookmarkTag) => {
      onChange(tag.name);
      setShowSuggestions(false);
      setSelectedIndex(-1);
      onSelect?.(tag);
      inputRef.current?.blur();
    },
    [onChange, onSelect]
  );

  // 새 태그 생성 (입력값 그대로 사용)
  const handleCreateNew = useCallback(() => {
    if (!value.trim()) return;
    setShowSuggestions(false);
    setSelectedIndex(-1);
    onSelect?.(null); // null은 새 태그를 의미
    inputRef.current?.blur();
  }, [value, onSelect]);

  // 키보드 이벤트 처리
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === "Enter" && value.trim()) {
        e.preventDefault();
        handleCreateNew();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelectTag(suggestions[selectedIndex]);
        } else if (value.trim()) {
          handleCreateNew();
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // 외부 클릭 시 제안 목록 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    if (showSuggestions) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showSuggestions]);

  // 선택된 인덱스에 해당하는 제안 항목으로 스크롤
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionsRef.current) {
      const selectedElement = suggestionsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [selectedIndex]);

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          className="pr-10"
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange("");
              setShowSuggestions(false);
              onSelect?.(null);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="입력 초기화"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 자동완성 제안 목록 */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto"
        >
          {suggestions.map((tag, index) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => handleSelectTag(tag)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
                index === selectedIndex && "bg-blue-50 dark:bg-blue-900/30"
              )}
            >
              <Tag
                className="w-4 h-4 flex-shrink-0"
                style={tag.color ? { color: tag.color } : undefined}
              />
              <span className="flex-1 text-sm text-gray-900 dark:text-white">
                {tag.name}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                ({tag.bookmarkCount})
              </span>
            </button>
          ))}

          {/* 새 태그 생성 옵션 (입력값이 기존 태그와 정확히 일치하지 않을 때) */}
          {value.trim() &&
            !suggestions.some(
              (tag) => tag.name.toLowerCase() === value.toLowerCase().trim()
            ) && (
              <button
                type="button"
                onClick={handleCreateNew}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-t border-gray-200 dark:border-gray-700",
                  selectedIndex === suggestions.length &&
                    "bg-blue-50 dark:bg-blue-900/30"
                )}
              >
                <Tag className="w-4 h-4 flex-shrink-0 text-gray-400" />
                <span className="flex-1 text-sm text-gray-600 dark:text-gray-400">
                  새 태그 만들기: &quot;{value.trim()}&quot;
                </span>
              </button>
            )}
        </div>
      )}

      {/* 로딩 상태 */}
      {loading && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            태그 목록을 불러오는 중...
          </div>
        </div>
      )}
    </div>
  );
}

