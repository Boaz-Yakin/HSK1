"use client";

import React from "react";
import { Volume2 } from "lucide-react";
import { HSKItem } from "@/types/hsk";

interface WordCardProps {
  item: HSKItem;
  isPlaying: boolean;
  onPlayWord: () => void;
}

export const WordCard: React.FC<WordCardProps> = ({
  item,
  isPlaying,
  onPlayWord,
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col items-center relative overflow-hidden">
      {/* 우측 상단 품사 태그 */}
      {item.pos && (
        <span className="absolute top-3 right-3 text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full uppercase">
          {item.pos}
        </span>
      )}

      {/* 대표 한자 - 시인성 극대화 대형 폰트 */}
      <h1 className="text-6xl md:text-7xl font-black text-slate-900 tracking-wide my-2 font-sans">
        {item.word}
      </h1>

      {/* 병음 (성조 표시) - 선명한 크기 */}
      <span className="text-2xl md:text-3xl font-bold text-rose-600 tracking-wider mb-2">
        {item.pinyin}
      </span>

      {/* 의미 / 해석 */}
      <p className="text-base md:text-lg font-medium text-slate-700 text-center mb-4">
        {item.english}
      </p>

      {/* 원어민 강사 육성 반복 듣기 버튼 */}
      <button
        onClick={onPlayWord}
        className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all shadow-sm ${
          isPlaying
            ? "bg-rose-600 text-white ring-4 ring-rose-100 animate-pulse"
            : "bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700"
        }`}
      >
        <Volume2 className="w-4 h-4" />
        {isPlaying ? "발음 반복 재생 중..." : "원어민 발음 반복 듣기"}
      </button>
    </div>
  );
};
