"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Play, RotateCcw, PenTool, CheckCircle2 } from "lucide-react";

interface HanziWriterQuizOptions {
  showOutline?: boolean;
  onMistake?: (strokeData: unknown) => void;
  onCorrectStroke?: (strokeData: unknown) => void;
  onComplete?: (summary: unknown) => void;
}

interface HanziWriterInstance {
  showCharacter: () => void;
  hideCharacter: () => void;
  animateCharacter: () => void;
  quiz: (options: HanziWriterQuizOptions) => void;
}

interface HanziWriterCanvasProps {
  word: string; // 예: "爱" 또는 "爸爸"
  size?: number;
}

export const HanziWriterCanvas: React.FC<HanziWriterCanvasProps> = ({
  word,
  size = 220,
}) => {
  // 한자만 추출 (특수문자 제외)
  const characters = Array.from(word).filter((char) =>
    /[\u4e00-\u9fff]/.test(char)
  );

  const [selectedCharIndex, setSelectedCharIndex] = useState(0);
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const targetContainerRef = useRef<HTMLDivElement | null>(null);
  const writerRef = useRef<HanziWriterInstance | null>(null);

  const activeChar = characters[selectedCharIndex] || characters[0] || "爱";

  // 단어가 바뀌면 인덱스 초기화
  useEffect(() => {
    setSelectedCharIndex(0);
    setIsQuizMode(false);
    setIsQuizComplete(false);
    setMistakes(0);
  }, [word]);

  const initWriter = useCallback(async (char: string) => {
    if (!targetContainerRef.current) return;
    setIsLoading(true);
    setIsQuizComplete(false);
    setMistakes(0);

    // 기존 내용 비우기
    targetContainerRef.current.innerHTML = "";

    try {
      const HanziWriter = (await import("hanzi-writer")).default;

      const writer = HanziWriter.create(targetContainerRef.current, char, {
        width: size,
        height: size,
        padding: 16,
        showOutline: true,
        strokeAnimationSpeed: 1.2,
        delayBetweenStrokes: 150,
        strokeColor: "#0f172a",
        outlineColor: "#cbd5e1",
        highlightColor: "#e11d48",
        drawingColor: "#e11d48",
        drawingWidth: 6,
        showCharacter: true,
      });

      writerRef.current = writer;
      setIsLoading(false);
    } catch (err) {
      console.error("Failed to load HanziWriter", err);
      setIsLoading(false);
    }
  }, [size]);

  useEffect(() => {
    initWriter(activeChar);
  }, [activeChar, initWriter]);

  // 애니메이션 재생
  const handleAnimate = () => {
    if (!writerRef.current) return;
    setIsQuizMode(false);
    setIsQuizComplete(false);
    writerRef.current.showCharacter();
    writerRef.current.animateCharacter();
  };

  // 따라 쓰기 (Quiz 모드)
  const handleStartQuiz = () => {
    if (!writerRef.current) return;
    setIsQuizMode(true);
    setIsQuizComplete(false);
    setMistakes(0);
    writerRef.current.hideCharacter();

    writerRef.current.quiz({
      showOutline: true,
      onMistake: (_strokeData: unknown) => {
        setMistakes((prev) => prev + 1);
      },
      onCorrectStroke: (_strokeData: unknown) => {
        // 맞춘 획 진행
      },
      onComplete: (_summary: unknown) => {
        setIsQuizComplete(true);
      },
    });
  };

  // 캔버스 초기화
  const handleReset = () => {
    initWriter(activeChar);
    setIsQuizMode(false);
  };

  return (
    <div className="flex flex-col items-center bg-white rounded-2xl p-4 shadow-sm border border-slate-100 w-full">
      {/* 여러 글자일 때 글자 선택 탭 */}
      {characters.length > 1 && (
        <div className="flex gap-2 mb-3 bg-slate-100 p-1 rounded-xl">
          {characters.map((char, index) => (
            <button
              key={`${char}-${index}`}
              onClick={() => {
                setSelectedCharIndex(index);
                setIsQuizMode(false);
              }}
              className={`px-4 py-1.5 rounded-lg text-lg font-bold transition-all ${
                selectedCharIndex === index
                  ? "bg-rose-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {char}
            </button>
          ))}
        </div>
      )}

      {/* 米자 격자선 캔버스 영역 */}
      <div className="relative rounded-xl overflow-hidden shadow-inner mizi-grid border border-slate-200">
        <div
          ref={targetContainerRef}
          className="touch-none cursor-crosshair"
          style={{ width: `${size}px`, height: `${size}px` }}
        />

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <span className="text-xs text-slate-400">한자 로딩 중...</span>
          </div>
        )}

        {/* 쓰기 성공 오버레이 */}
        {isQuizComplete && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-500/90 text-white animate-fade-in backdrop-blur-xs">
            <CheckCircle2 className="w-12 h-12 mb-1" />
            <span className="text-base font-bold">쓰기 완료!</span>
            <span className="text-xs opacity-90">
              {mistakes === 0 ? "완벽해요! (오답 0회)" : `오답 ${mistakes}회 후 완성`}
            </span>
            <button
              onClick={handleStartQuiz}
              className="mt-3 px-3 py-1 bg-white text-emerald-700 text-xs font-bold rounded-full shadow-sm hover:bg-emerald-50"
            >
              다시 쓰기
            </button>
          </div>
        )}
      </div>

      {/* 쓰기 안내 문구 */}
      <div className="mt-2 text-center h-5">
        {isQuizMode && !isQuizComplete && (
          <span className="text-xs text-rose-600 font-medium animate-pulse">
            👆 획순에 맞추어 선을 그어보세요
            {mistakes > 0 && ` (실수 ${mistakes}회)`}
          </span>
        )}
        {!isQuizMode && !isQuizComplete && (
          <span className="text-xs text-slate-500">
            획순 애니메이션을 보거나 직접 따라 써보세요
          </span>
        )}
      </div>

      {/* 인터랙션 버튼 컨트롤러 */}
      <div className="flex gap-2 mt-2 w-full max-w-[260px]">
        <button
          onClick={handleAnimate}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-all"
        >
          <Play className="w-3.5 h-3.5 text-slate-600" />
          획순 보기
        </button>

        <button
          onClick={handleStartQuiz}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-xl transition-all shadow-xs ${
            isQuizMode
              ? "bg-rose-600 text-white"
              : "bg-rose-50 hover:bg-rose-100 text-rose-700"
          }`}
        >
          <PenTool className="w-3.5 h-3.5" />
          따라 쓰기
        </button>

        <button
          onClick={handleReset}
          title="초기화"
          className="p-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-600 rounded-xl transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
