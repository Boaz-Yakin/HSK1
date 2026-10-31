export interface BreakdownWord {
  id: string;
  hanzi: string;
  pinyin: string;
  english: string;
  audioSrc: string;
}

export interface HSKItem {
  id: number;
  day: number;
  word: string;
  pinyin: string;
  pos: string;
  english: string;
  sentence: string;
  sentencePinyin: string;
  sentenceEnglish: string;
  wordAudioSrc: string;
  sentenceAudioSrc: string;
  videoClipSrc?: string;
  breakdown: BreakdownWord[];
}

export type RepeatMode = '1' | '3' | '5' | 'inf';

export interface UserProgressState {
  currentDay: number;
  completedDays: number[];
  bookmarkedDays: number[];
  streakCount: number;
  lastStudiedDate: string;
  audioSettings: {
    repeatMode: RepeatMode;
    playbackRate: number;
  };
}
