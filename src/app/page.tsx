"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import datasetRaw from "@/data/hsk1_dataset.json";
import { HSKItem } from "@/types/hsk";
import { storageService } from "@/services/storage.service";
import { useAudioLooper } from "@/hooks/useAudioLooper";
import { DayHeader } from "@/components/features/DayHeader";
import { WordCard } from "@/components/features/WordCard";
import { HanziWriterCanvas } from "@/components/features/HanziWriterCanvas";
import { SentenceCard } from "@/components/features/SentenceCard";
import { AudioControlBar } from "@/components/features/AudioControlBar";
import { DayDrawer } from "@/components/features/DayDrawer";

const items: HSKItem[] = datasetRaw as HSKItem[];

export default function HomePage() {
  const [currentDay, setCurrentDay] = useState(1);
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [bookmarkedDays, setBookmarkedDays] = useState<number[]>([]);
  const [streakCount, setStreakCount] = useState(1);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"listen" | "write">("listen");

  // 오디오 루퍼 훅
  const audioLooper = useAudioLooper();

  // 초기 상태 로드
  useEffect(() => {
    const progress = storageService.loadProgress();
    setCurrentDay(progress.currentDay || 1);
    setCompletedDays(progress.completedDays || []);
    setBookmarkedDays(progress.bookmarkedDays || []);
    setStreakCount(progress.streakCount || 1);
  }, []);

  // 현재 Day의 HSK 아이템
  const currentItem = useMemo(() => {
    return items.find((item) => item.day === currentDay) || items[0];
  }, [currentDay]);

  // Day 변경 핸들러
  const handleSelectDay = useCallback((day: number) => {
    if (day >= 1 && day <= items.length) {
      setCurrentDay(day);
      storageService.saveProgress({ currentDay: day });
      audioLooper.stop();
    }
  }, [audioLooper]);

  // 오늘 학습 완료 토글
  const handleToggleComplete = useCallback(() => {
    const updated = storageService.toggleCompleteDay(currentDay);
    setCompletedDays(updated);
    const progress = storageService.loadProgress();
    setStreakCount(progress.streakCount);
  }, [currentDay]);

  // 북마크 토글
  const handleToggleBookmark = useCallback(() => {
    const updated = storageService.toggleBookmarkDay(currentDay);
    setBookmarkedDays(updated);
  }, [currentDay]);

  // 단어 발음 재생
  const handlePlayWord = () => {
    audioLooper.play(
      currentItem.wordAudioSrc,
      `단어: ${currentItem.word} (${currentItem.pinyin})`
    );
  };

  // 문장 발음 재생
  const handlePlaySentence = () => {
    audioLooper.play(
      currentItem.sentenceAudioSrc,
      `예문: ${currentItem.sentence}`
    );
  };

  // 분해 어휘 탭 재생
  const [playingBreakdownId, setPlayingBreakdownId] = useState<string | null>(null);

  const handlePlayBreakdown = (audioSrc: string, label: string, id: string) => {
    setPlayingBreakdownId(id);
    audioLooper.play(audioSrc, `단어: ${label}`);
  };

  // 오디오 정지 시 분해 id 초기화
  useEffect(() => {
    if (!audioLooper.isPlaying) {
      setPlayingBreakdownId(null);
    }
  }, [audioLooper.isPlaying]);

  return (
    <div className="flex flex-col h-full bg-slate-50 relative select-none">
      {/* 상단 헤더 & 진도 바 */}
      <DayHeader
        currentDay={currentDay}
        totalDays={items.length}
        isCompleted={completedDays.includes(currentDay)}
        isBookmarked={bookmarkedDays.includes(currentDay)}
        streakCount={streakCount}
        onPrev={() => handleSelectDay(currentDay - 1)}
        onNext={() => handleSelectDay(currentDay + 1)}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onToggleComplete={handleToggleComplete}
        onToggleBookmark={handleToggleBookmark}
      />

      {/* 학습 모드 탭 (듣기 & 예문 / 한자 획순 쓰기) */}
      <div className="flex px-4 pt-2 pb-1 bg-white gap-2 border-b border-slate-100">
        <button
          onClick={() => setActiveTab("listen")}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
            activeTab === "listen"
              ? "bg-rose-600 text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          🎧 발음 반복 & 예문
        </button>
        <button
          onClick={() => setActiveTab("write")}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
            activeTab === "write"
              ? "bg-rose-600 text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          ✍️ 한자 획순 쓰기
        </button>
      </div>

      {/* 메인 학습 콘텐츠 영역 (스크롤 가능) */}
      <main className="flex-1 overflow-y-auto p-4 space-y-3.5 no-scrollbar pb-6">
        {activeTab === "listen" ? (
          <>
            {/* 단어 메인 카드 */}
            <WordCard
              item={currentItem}
              isPlaying={
                audioLooper.isPlaying &&
                audioLooper.activeSrc === currentItem.wordAudioSrc
              }
              onPlayWord={handlePlayWord}
            />

            {/* 실전 예문 카드 및 상세 어휘 분해 탭 */}
            <SentenceCard
              item={currentItem}
              isPlayingSentence={
                audioLooper.isPlaying &&
                audioLooper.activeSrc === currentItem.sentenceAudioSrc
              }
              playingBreakdownId={playingBreakdownId}
              onPlaySentence={handlePlaySentence}
              onPlayBreakdown={handlePlayBreakdown}
            />
          </>
        ) : (
          /* 한자 획순 쓰기 탭 */
          <div className="flex flex-col items-center space-y-3">
            <div className="text-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Stroke Order & Handwriting
              </span>
              <h2 className="text-4xl sm:text-5xl font-black text-slate-900 my-1.5 font-sans">
                {currentItem.word} <span className="text-rose-600 text-2xl sm:text-3xl font-extrabold ml-1.5">{currentItem.pinyin}</span>
              </h2>
            </div>

            <HanziWriterCanvas word={currentItem.word} size={270} />
          </div>
        )}
      </main>

      {/* 하단 오디오 제어 바 (반복 횟수, 속도, 현재 재생 트랙) */}
      <AudioControlBar
        isPlaying={audioLooper.isPlaying}
        activeLabel={audioLooper.activeLabel}
        currentLoop={audioLooper.currentLoop}
        targetLoops={audioLooper.targetLoops}
        repeatMode={audioLooper.repeatMode}
        playbackRate={audioLooper.playbackRate}
        onStop={audioLooper.stop}
        onSetRepeatMode={audioLooper.setRepeatMode}
        onSetPlaybackRate={audioLooper.setPlaybackRate}
      />

      {/* 전체 목록 & 검색 슬라이드 서랍 */}
      <DayDrawer
        isOpen={isDrawerOpen}
        items={items}
        currentDay={currentDay}
        completedDays={completedDays}
        bookmarkedDays={bookmarkedDays}
        onClose={() => setIsDrawerOpen(false)}
        onSelectDay={handleSelectDay}
      />
    </div>
  );
}
