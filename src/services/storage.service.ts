import { UserProgressState, RepeatMode } from "@/types/hsk";

const STORAGE_KEY = "hsk1_challenge_progress";

const defaultState: UserProgressState = {
  currentDay: 1,
  completedDays: [],
  bookmarkedDays: [],
  streakCount: 1,
  lastStudiedDate: new Date().toISOString().split("T")[0],
  audioSettings: {
    repeatMode: "3", // 기본 3회 반복 청취 권장
    playbackRate: 1.0,
  },
};

export const storageService = {
  loadProgress(): UserProgressState {
    if (typeof window === "undefined") return defaultState;
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return defaultState;
      const parsed = JSON.parse(data);
      return { ...defaultState, ...parsed };
    } catch {
      return defaultState;
    }
  },

  saveProgress(state: Partial<UserProgressState>): void {
    if (typeof window === "undefined") return;
    try {
      const current = this.loadProgress();
      const updated = { ...current, ...state };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save progress", e);
    }
  },

  toggleCompleteDay(day: number): number[] {
    const current = this.loadProgress();
    const exists = current.completedDays.includes(day);
    const completedDays = exists
      ? current.completedDays.filter((d) => d !== day)
      : [...current.completedDays, day].sort((a, b) => a - b);
    
    // Streak 계산
    const today = new Date().toISOString().split("T")[0];
    let streakCount = current.streakCount;
    if (!exists && current.lastStudiedDate !== today) {
      streakCount += 1;
    }

    this.saveProgress({ completedDays, streakCount, lastStudiedDate: today });
    return completedDays;
  },

  toggleBookmarkDay(day: number): number[] {
    const current = this.loadProgress();
    const exists = current.bookmarkedDays.includes(day);
    const bookmarkedDays = exists
      ? current.bookmarkedDays.filter((d) => d !== day)
      : [...current.bookmarkedDays, day].sort((a, b) => a - b);
    
    this.saveProgress({ bookmarkedDays });
    return bookmarkedDays;
  },

  updateAudioSettings(settings: { repeatMode?: RepeatMode; playbackRate?: number }): void {
    const current = this.loadProgress();
    this.saveProgress({
      audioSettings: {
        ...current.audioSettings,
        ...settings,
      },
    });
  },
};
