"use client";

import React from "react";
import { Volume2 } from "lucide-react";
import { BreakdownWord } from "@/types/hsk";

interface BreakdownListProps {
  breakdown: BreakdownWord[];
  playingBreakdownId: string | null;
  onPlayBreakdown: (audioSrc: string, label: string, id: string) => void;
}

export const BreakdownList: React.FC<BreakdownListProps> = ({
  breakdown,
  playingBreakdownId,
  onPlayBreakdown,
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      {breakdown.map((item) => {
        const isPlaying = playingBreakdownId === item.id;

        return (
          <button
            key={item.id}
            onClick={() =>
              onPlayBreakdown(item.audioSrc, `${item.hanzi} (${item.pinyin})`, item.id)
            }
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-left transition-all ${
              isPlaying
                ? "bg-rose-50 border-rose-300 ring-2 ring-rose-100 shadow-xs"
                : "bg-white hover:bg-slate-50 border-slate-200"
            }`}
          >
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold text-slate-900 leading-none">
                  {item.hanzi}
                </span>
                <span className="text-[10px] font-semibold text-rose-600 leading-none">
                  {item.pinyin}
                </span>
              </div>
              {item.english && (
                <span className="text-[9px] text-slate-500 max-w-[130px] truncate leading-tight mt-0.5">
                  {item.english}
                </span>
              )}
            </div>

            <Volume2
              className={`w-3.5 h-3.5 shrink-0 ${
                isPlaying ? "text-rose-600 animate-pulse" : "text-slate-400"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};
