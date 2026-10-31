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

      {/* 대표 한자 - 압도적인 점보 폰트 */}
      <h1 className="text-7xl sm:text-8xl md:text-9xl font-black text-slate-950 tracking-normal my-2 font-sans select-text">
        {item.word}
      </h1>

      {/* 병음 (성조 표시) - 선명하고 큼직한 발음 */}
      <span className="text-3xl sm:text-4xl font-extrabold text-rose-600 tracking-wider mb-2">
        {item.pinyin}
      </span>

      {/* 의미 / 해석 */}
      <p className="text-lg md:text-xl font-semibold text-slate-700 text-center mb-4">
        {item.english}
      </p>

      {/* 원어민 강사 육성 반복 듣기 버튼 */}
      <button
        onClick={onPlayWord}
        className={`flex items-center gap-2.5 px-7 py-3.5 rounded-full text-base font-bold transition-all shadow-sm ${
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
