# HSK 1급 150일 마스터 (HSK 1 150-Day Challenge) 🇨🇳

YouTube Mandarin Corner 원본 영상의 강사 실제 육성 음성(1,247개)과 HanziWriter 획순 쓰기를 결합한 모바일 최적화 중국어 1급 150일 챌린지 웹/앱입니다.

---

## 🌟 주요 기능

1. **150일 데일리 챌린지 (Day 1 ~ Day 150)**
   - 매일 1개 단어씩 부담 없이 꾸준히 학습
   - 오늘 학습 완료 체크 및 연속 출석(Streak) 자동 기록
   - 복습이 필요한 단어 북마크

2. **원어민 강사 육성 반복 청취 (`useAudioLooper`)**
   - 100% 원본 영상에서 직접 오려낸 강사 실제 육성 음성 탑재 (기계음 TTS 0%)
   - **반복 재생**: `1회`, `3회`, `5회`, `무한(∞)` 루프
   - **재생 속도**: `0.8x`, `1.0x`, `1.2x` 지원
   - 단어, 전체 예문, 문장 속 상세 어휘(797개) 개별 탭 재생

3. **인터랙티브 한자 획순 쓰기 (`HanziWriter`)**
   - 표준 획순 붓글씨 애니메이션 보기 (Animate)
   - 米자(미자) 격자선 위에서 터치/마우스로 가이드라인을 따라 직접 써보는 채점 모드 (Quiz/Trace)

4. **150개 전체 단어 검색 및 로드맵 서랍 (`DayDrawer`)**
   - 한자, 병음, 뜻 실시간 검색 및 원하는 Day로 원클릭 이동

---

## 🚀 빠른 시작

### 요구사항
- Node.js 18.18+ (또는 20+)

### 설치 및 실행
```bash
# 의존성 설치
npm install

# 개발 서버 실행 (포트 3030)
npm run dev

# 프로덕션 빌드
npm run build
npm run start
```

브라우저에서 `http://localhost:3030`으로 접속하세요.

---

## 📁 디렉토리 구조

```
├── docs/                      # PRD, ADR, TRD, UI 가이드 및 150단어 전체 마크다운
├── public/audio/              # 원본 영상 추출 실제 육성 음원 (1,247개)
│   ├── words/                 # 150개 단어 육성 (word_001.mp3 ~ 150.mp3)
│   ├── sentences/             # 150개 예문 문장 육성 (sentence_001.mp3 ~ 150.mp3)
│   ├── breakdown/             # 797개 문장 내 어휘 육성 (bd_001_01.mp3 ~)
│   └── video_clips/           # 150개 단어별 원본 비디오 설명 클립
├── src/
│   ├── app/                   # Next.js App Router (페이지 및 레이아웃)
│   ├── components/features/   # 핵심 컴포넌트 (WordCard, HanziWriter, AudioLooper, Drawer)
│   ├── data/                  # 150개 HSK 데이터셋 (hsk1_dataset.json)
│   ├── hooks/                 # 커스텀 훅 (useAudioLooper)
│   ├── services/              # 로컬 스토리지 진도 관리 서비스
│   └── types/                 # TypeScript 인터페이스
└── scripts/                   # 아키텍처 및 문서 검증 스크립트
```

---

## 📄 라이선스
MIT License
