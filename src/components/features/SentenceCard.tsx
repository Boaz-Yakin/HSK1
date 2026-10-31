"use client";

import React from "react";
import { Volume2 } from "lucide-react";
import { HSKItem } from "@/types/hsk";
import { BreakdownList } from "./BreakdownList";

interface SentenceCardProps {
  item: HSKItem;
  isPlayingSentence: boolean;
  playingBreakdownId: string | null;
  onPlaySentence: () => void;
  onPlayBreakdown: (bdAudioSrc: string, bdLabel: string, bdId: string) => void;
}

export const SentenceCard: React.FC<SentenceCardProps> = ({
  item,
  isPlayingSentence,
  playingBreakdownId,
  onPlaySentence,
  onPlayBreakdown,
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col">
      {/* 헤더 & 문장 듣기 버튼 */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Example Sentence (실전 예문)
        </span>
        <button
          onClick={onPlaySentence}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
            isPlayingSentence
              ? "bg-rose-600 text-white ring-2 ring-rose-200 animate-pulse"
              : "bg-slate-100 hover:bg-slate-200 text-slate-700"
          }`}
        >
          <Volume2 className="w-3.5 h-3.5" />
          {isPlayingSentence ? "문장 재생 중" : "문장 듣기"}
        </button>
      </div>

      {/* 중국어 문장 - 대형 점보 폰트 */}
      <div className="text-3xl sm:text-4xl font-black text-slate-950 leading-relaxed mb-3 tracking-wide font-sans select-text">
        {item.sentence}
      </div>

      {/* 문장 병음 - 큼직한 발음 표시 */}
      <div className="text-lg sm:text-xl font-bold text-rose-600 mb-3 tracking-wide">
        {item.sentencePinyin}
      </div>

      {/* 영어 번역 */}
      <div className="text-base font-medium text-slate-700 bg-slate-50 p-3.5 rounded-xl mb-4 border border-slate-100">
        {item.sentenceEnglish}
      </div>

      {/* 문장 속 단어별 상세 분해 (Word Breakdown) */}
      {item.breakdown && item.breakdown.length > 0 && (
        <div className="mt-1 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400">
              단어별 발음 & 뜻 콕콕 집어듣기
            </span>
            <span className="text-[10px] text-slate-400">
              클릭하여 원어민 육성 청취
            </span>
          </div>

          <BreakdownList
            breakdown={item.breakdown}
            playingBreakdownId={playingBreakdownId}
            onPlayBreakdown={onPlayBreakdown}
          />
        </div>
      )}
    </div>
  );
};
