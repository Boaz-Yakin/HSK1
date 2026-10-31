# 프로젝트 작업 목록 (Task Tracker)

> [!NOTE]
> AI 에이전트는 작업 착수 시 `[/]`(진행중)로 표시하고, 완료 시 `[x]`(완료)로 업데이트합니다.

---

## 📌 Phase 0: 기획 & 설계 (Design-First)
- [x] 0.1 제품 기획서 확정 (`docs/01_PRD.md`)
- [x] 0.2 아키텍처 및 기술 스택 결정 (`docs/02_ADR.md`)
- [x] 0.3 초기 핵심 기능 TRD 작성 (`docs/03_TRD.md`)
- [x] 0.4 UI/UX 디자인 시스템 확인 (`docs/04_UI_GUIDE.md`)

---

## 🏗️ Phase 1: 기반 아키텍처 & 초기 셋업
- [x] 1.1 데이터 통합 에셋 생성 (`src/data/hsk1_dataset.json` - 150단어, 문장, 797개 분해 어휘, 음원 경로)
- [x] 1.2 Next.js 15 + TypeScript + Tailwind CSS 프로젝트 초기화 및 `public/audio/` 에셋 연결
- [x] 1.3 TypeScript 인터페이스 정의 (`src/types/hsk.ts`)
- [x] 1.4 오디오 반복 재생 엔진 구현 (`src/hooks/useAudioLooper.ts`)
- [x] 1.5 로컬 스토리지 진도 관리 서비스 구현 (`src/services/storage.service.ts`)

---

## ⚡ Phase 2: 핵심 기능 구현 (MVP)
- [x] 2.1 [F-001] 150일 데일리 챌린지 뷰 및 Day 네비게이션 (`DayHeader`, `ProgressBar`)
- [x] 2.2 [F-002] 단어 & 문장 반복 청취 플레이어 (`WordCard`, `SentenceCard`, `AudioControlBar`)
- [x] 2.3 [F-003] HanziWriter 인터랙티브 한자 획순 애니메이션 및 터치 따라 쓰기 (`HanziWriterCanvas`)
- [x] 2.4 [F-004] 문장 상세 어휘(797개) 분석 탭 및 개별 음원 재생 (`BreakdownList`)
- [x] 2.5 [F-005] 150단어 전체 목록 서랍(Drawer) 및 실시간 검색 필터링 (`DayDrawer`)
- [x] 2.6 [F-006] 학습 완료 체크, 복습 북마크 및 Streak 연속 출석 카운터

---

## 🛡️ Phase 3: QA 및 아키텍처 검증
- [x] 3.1 아키텍처 규칙 검증 통과 (`scripts/validate-arch.ps1`)
- [x] 3.2 문서 동기화 및 완성도 확인 (`scripts/sync-docs.ps1`)
- [x] 3.3 린트 및 타입 체크 통과 (`npm run type-check`)
- [x] 3.4 프로덕션 정적 빌드 통과 (`npm run build`)
