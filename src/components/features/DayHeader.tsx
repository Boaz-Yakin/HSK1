"use client";

import React from "react";
import { ChevronLeft, ChevronRight, Menu, CheckCircle, Bookmark, Flame } from "lucide-react";

interface DayHeaderProps {
  currentDay: number;
  totalDays: number;
  isCompleted: boolean;
  isBookmarked: boolean;
  streakCount: number;
  onPrev: () => void;
  onNext: () => void;
  onOpenDrawer: () => void;
  onToggleComplete: () => void;
  onToggleBookmark: () => void;
}

export const DayHeader: React.FC<DayHeaderProps> = ({
  currentDay,
  totalDays,
  isCompleted,
  isBookmarked,
  streakCount,
  onPrev,
  onNext,
  onOpenDrawer,
  onToggleComplete,
  onToggleBookmark,
}) => {
  const progressPercent = Math.round((currentDay / totalDays) * 100);

  return (
    <header className="bg-white border-b border-slate-100 px-4 pt-3 pb-2 sticky top-0 z-20">
      {/* 상단 라인: 메뉴 버튼, 스트릭 뱃지, 북마크, 완료 체크 */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={onOpenDrawer}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
          title="단어 목록 / 검색"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* 중앙 연속 출석 Streak & Day 네비게이션 */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onPrev}
            disabled={currentDay <= 1}
            className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full border border-slate-200">
            <span className="text-xs font-black text-rose-600 tracking-wider">
              DAY {currentDay}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              / {totalDays}
            </span>
          </div>

          <button
            onClick={onNext}
            disabled={currentDay >= totalDays}
            className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* 우측 북마크 & 오늘 완료 버튼 */}
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleBookmark}
            title={isBookmarked ? "북마크 해제" : "복습 북마크"}
            className={`p-2 rounded-xl transition-all ${
              isBookmarked
                ? "text-amber-500 bg-amber-50"
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Bookmark className={`w-5 h-5 ${isBookmarked ? "fill-amber-500" : ""}`} />
          </button>

          <button
            onClick={onToggleComplete}
            title={isCompleted ? "학습 완료 취소" : "오늘 학습 완료"}
            className={`p-2 rounded-xl transition-all ${
              isCompleted
                ? "text-emerald-600 bg-emerald-50"
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            }`}
          >
            <CheckCircle className={`w-5 h-5 ${isCompleted ? "fill-emerald-600 text-white" : ""}`} />
          </button>
        </div>
      </div>

      {/* 진도율 프로그레스 바 */}
      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden flex">
        <div
          className="bg-rose-500 h-full transition-all duration-300 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 스트릭 인디케이터 서브 바 */}
      <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1 px-0.5">
        <span className="flex items-center gap-1 font-medium text-amber-600">
          <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          연속 {streakCount}일째 도전 중
        </span>
        <span>전체 진행률 {progressPercent}%</span>
      </div>
    </header>
  );
};
