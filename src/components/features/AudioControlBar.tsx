"use client";

import React from "react";
import { Volume2, VolumeX, Repeat, Gauge } from "lucide-react";
import { RepeatMode } from "@/types/hsk";

interface AudioControlBarProps {
  isPlaying: boolean;
  activeLabel: string | null;
  currentLoop: number;
  targetLoops: number;
  repeatMode: RepeatMode;
  playbackRate: number;
  onStop: () => void;
  onSetRepeatMode: (mode: RepeatMode) => void;
  onSetPlaybackRate: (rate: number) => void;
}

export const AudioControlBar: React.FC<AudioControlBarProps> = ({
  isPlaying,
  activeLabel,
  currentLoop,
  targetLoops,
  repeatMode,
  playbackRate,
  onStop,
  onSetRepeatMode,
  onSetPlaybackRate,
}) => {
  const repeatModes: { label: string; value: RepeatMode }[] = [
    { label: "1회", value: "1" },
    { label: "3회", value: "3" },
    { label: "5회", value: "5" },
    { label: "무한", value: "inf" },
  ];

  const playbackRates = [0.8, 1.0, 1.2];

  return (
    <div className="bg-white border-t border-slate-200 px-4 py-2.5 shadow-lg z-20">
      {/* 재생 중 상태 알림 배너 */}
      {isPlaying && (
        <div className="flex items-center justify-between bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl mb-2 animate-fade-in">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
            </span>
            <div className="flex flex-col truncate">
              <span className="text-xs font-bold text-rose-800 truncate">
                {activeLabel || "오디오 재생 중"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-rose-700 bg-white px-2 py-0.5 rounded-full border border-rose-200">
              {targetLoops === Infinity ? `${currentLoop}회차 (무한)` : `${currentLoop} / ${targetLoops}회`}
            </span>
            <button
              onClick={onStop}
              className="p-1 text-rose-700 hover:text-rose-900 bg-white hover:bg-rose-100 rounded-lg transition-colors"
              title="정지"
            >
              <VolumeX className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 설정 컨트롤 바: 반복 모드 & 배속 토글 */}
      <div className="flex items-center justify-between gap-2">
        {/* 반복 모드 세그먼트 */}
        <div className="flex items-center gap-1">
          <Repeat className="w-3.5 h-3.5 text-slate-400 mr-0.5" />
          <div className="flex bg-slate-100 p-0.5 rounded-lg">
            {repeatModes.map((item) => (
              <button
                key={item.value}
                onClick={() => onSetRepeatMode(item.value)}
                className={`px-2 py-1 text-[11px] font-bold rounded-md transition-all ${
                  repeatMode === item.value
                    ? "bg-rose-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* 재생 속도 세그먼트 */}
        <div className="flex items-center gap-1">
          <Gauge className="w-3.5 h-3.5 text-slate-400 mr-0.5" />
          <div className="flex bg-slate-100 p-0.5 rounded-lg">
            {playbackRates.map((rate) => (
              <button
                key={rate}
                onClick={() => onSetPlaybackRate(rate)}
                className={`px-2 py-1 text-[11px] font-bold rounded-md transition-all ${
                  playbackRate === rate
                    ? "bg-slate-800 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
