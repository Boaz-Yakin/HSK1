"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { RepeatMode } from "@/types/hsk";
import { storageService } from "@/services/storage.service";

export interface AudioLooperState {
  isPlaying: boolean;
  activeSrc: string | null;
  activeLabel: string | null;
  repeatMode: RepeatMode;
  playbackRate: number;
  currentLoop: number;
  targetLoops: number; // 1, 3, 5, or Infinity
}

export function useAudioLooper() {
  const [state, setState] = useState<AudioLooperState>({
    isPlaying: false,
    activeSrc: null,
    activeLabel: null,
    repeatMode: "3",
    playbackRate: 1.0,
    currentLoop: 0,
    targetLoops: 3,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const loopCountRef = useRef<number>(0);
  const targetLoopsRef = useRef<number>(3);
  const repeatModeRef = useRef<RepeatMode>("3");
  const playbackRateRef = useRef<number>(1.0);
  const isCancelledRef = useRef<boolean>(false);

  // 초기 설정 복원
  useEffect(() => {
    const saved = storageService.loadProgress();
    if (saved.audioSettings) {
      const mode = saved.audioSettings.repeatMode || "3";
      const rate = saved.audioSettings.playbackRate || 1.0;
      const targets = mode === "inf" ? Infinity : parseInt(mode, 10);
      repeatModeRef.current = mode;
      targetLoopsRef.current = targets;
      playbackRateRef.current = rate;
      setState((s) => ({
        ...s,
        repeatMode: mode,
        playbackRate: rate,
        targetLoops: targets,
      }));
    }
  }, []);

  const stop = useCallback(() => {
    isCancelledRef.current = true;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setState((s) => ({
      ...s,
      isPlaying: false,
      activeSrc: null,
      activeLabel: null,
      currentLoop: 0,
    }));
  }, []);

  const play = useCallback((src: string, label: string) => {
    stop();
    isCancelledRef.current = false;
    loopCountRef.current = 1;

    const audio = new Audio(src);
    audio.playbackRate = playbackRateRef.current;
    audioRef.current = audio;

    const target = targetLoopsRef.current;

    setState((s) => ({
      ...s,
      isPlaying: true,
      activeSrc: src,
      activeLabel: label,
      currentLoop: 1,
      targetLoops: target,
    }));

    const playNextLoop = () => {
      if (isCancelledRef.current || !audioRef.current) return;

      const current = loopCountRef.current;
      const maxLoops = targetLoopsRef.current;

      if (maxLoops === Infinity || current < maxLoops) {
        loopCountRef.current += 1;
        setState((s) => ({
          ...s,
          currentLoop: loopCountRef.current,
        }));
        // 루프 사이의 자연스러운 쉼 (350ms)
        setTimeout(() => {
          if (!isCancelledRef.current && audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {});
          }
        }, 350);
      } else {
        stop();
      }
    };

    audio.onended = playNextLoop;
    audio.onerror = () => stop();

    audio.play().catch((err) => {
      console.warn("Audio autoplay blocked or failed", err);
      stop();
    });
  }, [stop]);

  const setRepeatMode = useCallback((mode: RepeatMode) => {
    repeatModeRef.current = mode;
    const target = mode === "inf" ? Infinity : parseInt(mode, 10);
    targetLoopsRef.current = target;
    storageService.updateAudioSettings({ repeatMode: mode });
    setState((s) => ({
      ...s,
      repeatMode: mode,
      targetLoops: target,
    }));
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    playbackRateRef.current = rate;
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
    storageService.updateAudioSettings({ playbackRate: rate });
    setState((s) => ({
      ...s,
      playbackRate: rate,
    }));
  }, []);

  return {
    ...state,
    play,
    stop,
    setRepeatMode,
    setPlaybackRate,
  };
}
