# Architecture Decision Records
<!-- ADR: "어떤 시스템/기술 구조를 가져가는가?" -->

## 철학

> 사용자 경험(UX) 최우선 & 지연 시간 최소화. 외부 서버 없이 100% 로컬에서 동작하는 초경량 모바일 퍼스트 아키텍처. 한자 획순 쓰기와 강사 육성 오디오 반복 재생의 인터랙션을 부드럽게 구현한다.

---

## ADR-001: 프레임워크 선택 - Next.js 15 (App Router) + Mobile-First PWA

**상태**: Accepted  
**결정일**: 2026-10-31  
**결정자**: Antigravity & User

### Context (배경)
모바일 환경(스마트폰 터치)에서 한자를 직접 손으로 쓰고, 음원을 빠르게 재생할 수 있는 앱이 필요하다. 네이티브 빌드(Xcode/Android Studio) 의존성을 최소화하고 웹과 모바일 어디서나 즉시 실행 가능하며 PWA(홈 화면에 추가) 형태로 설치 가능한 기술 스택이 필요했다.

### Decision (결정)
Next.js 15 App Router + TypeScript + Tailwind CSS를 채택한다.
- 모바일 뷰포트 컨테이너 레이아웃 (최대 폭 480px의 앱 쉘 구조).
- 빠른 로딩과 정적 에셋(JSON + MP3) 제공을 위해 Next.js 정적 서빙 활용.

### Consequences (결과 & 트레이드오프)
| 장점 | 단점 |
|------|------|
| 브라우저에서 즉시 개발 및 실행 가능 | 순수 네이티브 앱스토어 배포 시 웹뷰 래퍼(Capacitor) 필요 |
| `hanzi-writer` 라이브러리의 SVG/Canvas 기능을 100% 온전히 활용 가능 | 오프라인 캐싱을 위한 Service Worker 설정 필요 |
| 서버 비용 $0 (정적 호스팅 또는 로컬 서버로 구동) | |

---

## ADR-002: 한자 획순 렌더링 & 터치 트레이싱 라이브러리 - `hanzi-writer`

**상태**: Accepted  
**결정일**: 2026-10-31  
**결정자**: Antigravity & User

### Context (배경)
한자 획순을 정확하게 애니메이션으로 보여주고, 사용자가 화면에 손가락이나 스타일러스로 그렸을 때 획순의 정확도를 실시간으로 감지/가이드해 주는 기능이 필수적이다.

### Decision (결정)
검증된 오픈소스 라이브러리인 `hanzi-writer`를 채택한다.
- 기능: 획순 애니메이션(animate), 획별 순차 가이드(showOutline), 인터랙티브 쓰기 퀴즈(quiz: 실시간 획 검증, 오답 가이드, 완료 콜백).
- 오픈 한자 획순 데이터셋(Makemeahanzi 기반)을 지원하여 HSK 1급 150단어의 모든 한자를 완벽 렌더링.

---

## ADR-003: 오디오 재생 및 구간 반복 아키텍처 - Custom HTML5/Web Audio Hook

**상태**: Accepted  
**결정일**: 2026-10-31  
**결정자**: Antigravity & User

### Context (배경)
사용자가 발음을 1번만 듣는 것이 아니라, 3회, 5회, 또는 무한 반복해서 들을 수 있어야 하며, 배속 조절(0.8x, 1.0x, 1.2x) 및 문장 내 특정 단어 탭 시 해당 단어 육성 재생이 즉각 이루어져야 한다.

### Decision (결정)
React Custom Hook `useAudioPlayer`를 개발하여 오디오 재생 상태(재생/일시정지, 현재 재생 트랙, 반복 모드 1x/3x/5x/∞, 배속)를 단일 상태 머신으로 제어한다.
- 로컬 파일 경로: `/audio/words/word_XXX.mp3`, `/audio/sentences/sentence_XXX.mp3`, `/audio/breakdown/bd_XXX_YY.mp3`.
- 오디오 캐싱 및 사전 로드(Preload)를 통해 터치 시 지연 없는 즉각 재생 보장.

---

## ADR-004: 데이터 및 상태 영속화 - JSON 정적 데이터 + LocalStorage/Zustand

**상태**: Accepted  
**결정일**: 2026-10-31  
**결정자**: Antigravity & User

### Context (배경)
사용자의 일일 학습 진도(Day 1 ~ Day 150 완료 여부, 즐겨찾기, 연속 출석일 Streak)를 외부 로그인 없이 영구 보존해야 한다.

### Decision (결정)
- 단어 데이터: 추출 완료된 150개 단어, 문장, 분해 어휘를 결합한 `src/data/hsk1_dataset.json` 파일로 정적 포함.
- 사용자 학습 상태: Zustand + LocalStorage persist 미들웨어를 사용하여 브라우저 재접속 시에도 학습 진도 100% 복원.
