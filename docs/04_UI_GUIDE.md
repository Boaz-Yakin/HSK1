# UI/UX Style Guide: HSK 1급 150일 마스터 앱
<!-- 디자인 시스템 및 UI 컴포넌트 표준 -->

## 1. Design Principles (디자인 원칙)

1. **Mobile First**: 기본 레이아웃은 모바일 기기(너비 390px ~ 430px)에 최적화된 앱 쉘로 렌더링되며, 데스크톱에서는 중앙 모바일 목업 프레임으로 정돈됨.
2. **Pinyin & Tone Clarity**: 중국어 학습에서 가장 중요한 성조와 병음을 크고 선명하게 표시.
3. **Tactile Feedback**: 한자 쓰기 및 오디오 반복 재생 시 시각적 애니메이션 및 명확한 상태 표시.

---

## 2. Color Palette (색상 체계)

| 색상명 | Hex Code | 용도 |
|--------|----------|------|
| **Brand Primary (Chinese Crimson)** | `#E11D48` (Rose-600) | 주요 액션 버튼, Day 뱃지, 활성 탭 |
| **Accent Gold (Mandarin Gold)** | `#F59E0B` (Amber-500) | 성조 포인트, 연속 출석 Streak, 한자 획순 가이드 |
| **Success Emerald** | `#10B981` (Emerald-500) | 획순 쓰기 성공, 일일 학습 완료 체크 |
| **Surface Dark (Canvas)** | `#0F172A` (Slate-900) | 다크 모드 배경 및 한자 캔버스 배경 |
| **Paper White** | `#FFFFFF` / `#F8FAFC` | 라이트 모드 카드 배경 |
| **Text Primary** | `#0F172A` / `#F8FAFC` | 한자 본문 텍스트 |
| **Text Muted** | `#64748B` (Slate-500) | 영문 뜻, 보조 설명 |

---

## 3. Typography (타이포그래피)

- **한자 폰트**: `"PingFang SC", "Noto Sans SC", "Microsoft YaHei", sans-serif`
- **단어 표기 (Word Hero)**: `text-7xl sm:text-8xl md:text-9xl font-black` (화면 가득 시원시원한 초대형 폰트)
- **병음 표기 (Pinyin)**: `text-3xl sm:text-4xl font-extrabold text-rose-600 tracking-wider`
- **문장 표기 (Sentence)**: `text-3xl sm:text-4xl font-black leading-relaxed tracking-wide`
- **문장 병음 표기 (Sentence Pinyin)**: `text-lg sm:text-xl font-bold text-rose-600`

---

## 4. Stroke Writing Canvas Specs (한자 쓰기 캔버스 규격)

- **Canvas Size**: 가로 220px × 세로 220px (모바일 화면 중앙 배치).
- **Background Grid**: 米자 격자선(미자격: 4분면 십자선 + 대각선 가이드라인 점선) 표시.
- **Stroke Color**: `#0F172A` (진한 붓글씨 색상).
- **Guide Outline Color**: `#CBD5E1` (은은한 회색 가이드).
- **Drawing Stroke Color**: `#E11D48` (사용자가 그리는 실시간 획).

---

## 5. Audio Looper UI (오디오 반복 컨트롤러)

- **반복 선택 토글**: `[1x] [3x] [5x] [∞]` 알약 모양 세그먼트 버튼.
- **재생 속도 토글**: `[0.8x] [1.0x] [1.2x]`.
- **재생 중 표시**: 음파 이퀄라이저 애니메이션 및 현재 반복 회차 표시 (예: `2 / 3 회 재생 중`).
