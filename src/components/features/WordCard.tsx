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

      {/* 대표 한자 */}
      <h1 className="text-5xl font-black text-slate-900 tracking-wide my-1">
        {item.word}
      </h1>

      {/* 병음 (성조 표시) */}
      <span className="text-xl font-bold text-rose-600 tracking-wider mb-1">
        {item.pinyin}
      </span>

      {/* 의미 / 해석 */}
      <p className="text-sm font-medium text-slate-600 text-center mb-3">
        {item.english}
      </p>

      {/* 원어민 강사 육성 반복 듣기 버튼 */}
      <button
        onClick={onPlayWord}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm ${
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
