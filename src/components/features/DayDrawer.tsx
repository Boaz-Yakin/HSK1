"use client";

import React, { useState, useMemo } from "react";
import { X, Search, CheckCircle, Bookmark, Sparkles } from "lucide-react";
import { HSKItem } from "@/types/hsk";

interface DayDrawerProps {
  isOpen: boolean;
  items: HSKItem[];
  currentDay: number;
  completedDays: number[];
  bookmarkedDays: number[];
  onClose: () => void;
  onSelectDay: (day: number) => void;
}

export const DayDrawer: React.FC<DayDrawerProps> = ({
  isOpen,
  items,
  currentDay,
  completedDays,
  bookmarkedDays,
  onClose,
  onSelectDay,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "completed" | "bookmarked">("all");

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // 텍스트 검색 필터
      const matchesSearch =
        searchTerm === "" ||
        item.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.pinyin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.day.toString() === searchTerm;

      // 탭 필터
      if (!matchesSearch) return false;
      if (filterType === "completed") return completedDays.includes(item.day);
      if (filterType === "bookmarked") return bookmarkedDays.includes(item.day);
      return true;
    });
  }, [items, searchTerm, filterType, completedDays, bookmarkedDays]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* 딤 배경 */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* 서랍 컨테이너 (최대 400px) */}
      <div className="relative w-full max-w-[380px] bg-white h-full flex flex-col z-10 shadow-2xl animate-slide-in-right">
        {/* 상단 헤더 */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-rose-600" />
            <h2 className="text-base font-bold text-slate-900">
              150일 로드맵 & 단어 목록
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 검색 인풋 */}
        <div className="p-3 border-b border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="단어, 병음, 뜻, Day 번호 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-100 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
          </div>

          {/* 서브 탭 필터 */}
          <div className="flex gap-1.5 mt-2">
            {(
              [
                { label: `전체 (${items.length})`, value: "all" },
                { label: `완료 (${completedDays.length})`, value: "completed" },
                { label: `북마크 (${bookmarkedDays.length})`, value: "bookmarked" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilterType(tab.value)}
                className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all ${
                  filterType === tab.value
                    ? "bg-slate-800 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 리스트 영역 */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <span className="text-sm">검색 결과가 없습니다.</span>
            </div>
          ) : (
            filteredItems.map((item) => {
              const isSelected = item.day === currentDay;
              const isCompleted = completedDays.includes(item.day);
              const isBookmarked = bookmarkedDays.includes(item.day);

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectDay(item.day);
                    onClose();
                  }}
                  className={`w-full px-4 py-3 flex items-center justify-between text-left transition-colors ${
                    isSelected
                      ? "bg-rose-50/80 border-l-4 border-rose-600"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                        isSelected
                          ? "bg-rose-600 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      D{item.day}
                    </span>

                    <div className="flex flex-col">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-black text-slate-900 font-sans">
                          {item.word}
                        </span>
                        <span className="text-sm font-bold text-rose-600">
                          {item.pinyin}
                        </span>
                      </div>
                      <span className="text-xs text-slate-600 truncate max-w-[200px]">
                        {item.english}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isBookmarked && (
                      <Bookmark className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    )}
                    {isCompleted && (
                      <CheckCircle className="w-4 h-4 fill-emerald-500 text-white" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
