# TRD-001: HSK 1급 150일 학습 모바일 앱 기술 설계서
<!-- Technical Requirements Document: "어떻게 구현하는가?" -->

**상태**: Approved  
**작성일**: 2026-10-31  
**관련 PRD**: [PRD-001](01_PRD.md) | **관련 ADR**: [ADR-001](02_ADR.md#adr-001), [ADR-002](02_ADR.md#adr-002), [ADR-003](02_ADR.md#adr-003)

---

## 0. Feature Mapping (PRD Features -> Architecture Components)

| Feature ID | 기능명 | 주요 컴포넌트 & 레이어 | 상태 |
|------------|--------|------------------------|------|
| **F-001** | 150일 데일리 챌린지 로드맵 | `src/components/features/DayHeader.tsx`, `ProgressBar` | Done |
| **F-002** | 오디오 무한/N회 반복 플레이어 | `src/hooks/useAudioLooper.ts`, `AudioControlBar.tsx` | Done |
| **F-003** | 인터랙티브 한자 획순 쓰기 (HanziWriter) | `src/components/features/HanziWriterCanvas.tsx` | Done |
| **F-004** | 문장 상세 어휘 분석 탭 | `src/components/features/BreakdownList.tsx`, `SentenceCard.tsx` | Done |
| **F-005** | 단어 탐색 & 검색 (Drawer / Search) | `src/components/features/DayDrawer.tsx` | Done |
| **F-006** | 로컬 오프라인 데이터 및 상태 저장 | `src/services/storage.service.ts`, `hsk1_dataset.json` | Done |

---

## 1. Data Schema & Types (`src/types/hsk.ts`)

```typescript
export interface BreakdownWord {
  id: string;             // 예: "bd_001_01"
  hanzi: string;          // 예: "我"
  pinyin: string;         // 예: "wǒ"
  english: string;        // 예: "I, me"
  audioSrc: string;       // 예: "/audio/breakdown/bd_001_01.mp3"
}

export interface HSKItem {
  id: number;             // 1 ~ 150 (Day 번호와 1:1 매핑)
  word: string;           // 예: "爱"
  pinyin: string;         // 예: "ài"
  pos: string;            // 예: "verb" (품사)
  english: string;        // 예: "to love"
  korean?: string;        // 한국어 뜻 (자동 매핑)
  sentence: string;       // 예: "我爱我爸爸。"
  sentencePinyin: string; // 예: "Wǒ ài wǒ bàba."
  sentenceEnglish: string;// 예: "I love my dad."
  wordAudioSrc: string;   // 예: "/audio/words/word_001.mp3"
  sentenceAudioSrc: string; // 예: "/audio/sentences/sentence_001.mp3"
  videoClipSrc?: string;  // 예: "/audio/video_clips/clip_001.m4a"
  breakdown: BreakdownWord[];
}

export interface UserProgressState {
  currentDay: number;                   // 현재 선택된 학습일 (1 ~ 150)
  completedDays: number[];              // 학습 완료한 Day 배열
  bookmarkedDays: number[];             // 즐겨찾기한 Day 배열
  streakCount: number;                  // 연속 학습일
  lastStudiedDate: string;              // YYYY-MM-DD
  audioSettings: {
    repeatMode: '1' | '3' | '5' | 'inf'; // 반복 청취 횟수
    playbackRate: number;               // 0.8 | 1.0 | 1.2
    autoPlayNext: boolean;
  };
}
```

---

## 2. Audio Engine Specification (`src/hooks/useAudioLooper.ts`)

### 상태 머신 (State Machine)
- **Idle**: 재생 대기
- **Playing**: 음원 재생 중 (현재 반복 카운트 `currentLoop` 증가)
- **Paused**: 일시정지

### 반복 제어 로직
1. 재생 요청 발생: `play(audioSrc, repeatCount)`
2. 음원 종료 이벤트(`ended`) 수신:
   - `repeatMode === 'inf'`: 즉시 오디오 `currentTime = 0; play()`
   - `currentLoop < targetRepeat`: `currentLoop++`, 지연 시간(400ms) 후 다시 `play()`
   - `currentLoop >= targetRepeat`: 재생 종료, 상태를 `Idle`로 복원

---

## 3. Hanzi Stroke Order Component (`src/components/features/HanziWriterCanvas.tsx`)

### 구현 원리
- `hanzi-writer` 인스턴스를 React `useRef`로 마운트된 `<div>` 요소에 바인딩.
- 글자별 탭 전환: 단어가 복수 한자(예: `爸爸`, `高兴`)인 경우 글자 단위(탭)로 전환하여 한 글자씩 연습.
- 2가지 모드 지원:
  1. **애니메이션 보기 (Watch)**: `writer.animateCharacter()`를 통해 획순과 붓글씨 동선 시각화.
  2. **직접 따라 쓰기 (Trace/Quiz)**: `writer.quiz({ showOutline: true, onMistake: (data) => ..., onComplete: () => ... })`로 터치 드로잉 획순 자동 채점.

---

## 4. Component Structure (`src/`)

```
src/
├── app/
│   ├── layout.tsx              # 전역 폰트 및 모바일 쉘 컨테이너
│   └── page.tsx                # 메인 150일 데일리 학습 화면
├── components/
│   ├── features/
│   │   ├── DayHeader.tsx       # Day 1/150 표시, 이전/다음 네비게이션, 완료 체크
│   │   ├── WordCard.tsx        # 대표 단어, 병음, 품사, 음원 재생기
│   │   ├── StrokeSection.tsx   # HanziWriter 획순 애니메이션 및 쓰기 캔버스
│   │   ├── SentenceCard.tsx    # 예문 문장, 성조 병음, 영어/한국어 뜻, 문장 오디오
│   │   ├── BreakdownList.tsx   # 문장 내 단어별 분해 칩 및 개별 음원 재생
│   │   └── DayDrawer.tsx       # 150일 전체 목록 및 검색 슬라이드 메뉴
│   └── ui/
│       ├── Button.tsx
│       ├── AudioButton.tsx     # 재생/반복 인디케이터 포함 버튼
│       └── ProgressBar.tsx     # 150일 진도율 바
├── hooks/
│   └── useAudioLooper.ts       # 반복 오디오 훅
├── services/
│   ├── study.service.ts        # 150개 단어 검색/필터링 및 학습 상태 관리
│   └── storage.service.ts      # LocalStorage 저장/불러오기
└── types/
    └── hsk.ts                  # 데이터 타입 정의
```

---

## 5. Security & Performance

- 모든 오디오 에셋은 `public/audio/`로 제공되어 Next.js 정적 서빙 활용.
- 외부 API 통신이 없으므로 클라이언트 시크릿 키 유출 위험 원천 차단.
- 가상 리스트 렌더링(DayDrawer)으로 150개 목록 스크롤 최적화.
