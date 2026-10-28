# Custom Harness Framework

AI 에이전트(Antigravity, Gemini Pro, Claude Code, Cursor 등)가 프로젝트를 일관된 컨텍스트로 이해하고, 기획부터 설계, 구현까지 높은 품질로 개발할 수 있도록 가드레일과 검증 파이프라인을 제공하는 범용 프레임워크입니다.

## 핵심 철학

> "AI가 *맥락을 잃지 않고* 개발할 수 있도록 구조를 만드는 것"
>
> 좋은 코드는 좋은 설계 문서에서 나온다. AI 에이전트가 임의로 Over-engineer 하거나 Scope를 벗어나지 않도록, 명확한 문서(Design-First)와 자동 검증 장치를 제공한다.

---

## 디렉토리 구조

```
.
├── CLAUDE.md                # ⭐ Claude Code 메인 컨텍스트 (항상 로드됨)
├── GEMINI.md                # ⭐ Antigravity / Gemini 메인 컨텍스트
├── AGENTS.md                # ⭐ 범용 AI 에이전트 (Cursor, Windsurf 등) 규칙
├── task.md                  # 프로젝트 작업 단계별 추적 (AI가 실시간 업데이트)
├── docs/
│   ├── 01_PRD.md            # Product Requirements Document (무엇을, 왜 만드는가?)
│   ├── 02_ADR.md            # Architecture Decision Record (어떤 구조로?)
│   ├── 03_TRD.md            # Technical Requirements Document (어떻게 구현하는가?)
│   └── 04_UI_GUIDE.md       # UI/UX 디자인 가이드
├── .claude/
│   └── hfw.jsonc            # harness framework 워크플로우 설정
├── .knowledge/
│   ├── README.md            # 지식 인덱스
│   ├── patterns/            # 검증된 코드 패턴 레퍼런스 (API, Service 등)
│   └── gotchas/             # 실전 함정 & 주의사항 (Hydration, RLS, Server-Client 경계)
├── scripts/
│   ├── init-project.ps1     # 새 프로젝트 템플릿 초기화 & 디렉토리 생성 (Windows PowerShell)
│   ├── init-project.sh      # 새 프로젝트 템플릿 초기화 & 디렉토리 생성 (Linux / macOS / Bash)
│   ├── validate-arch.ps1    # 아키텍처 규칙 위반 자동 검사 (Windows PowerShell)
│   ├── sync-docs.ps1        # 문서 일관성 검사 (Windows PowerShell)
│   ├── validate-arch.sh     # 아키텍처 규칙 위반 자동 검사 (Linux / macOS / Bash)
│   └── sync-docs.sh         # 문서 일관성 검사 (Linux / macOS / Bash)
└── .github/workflows/
    └── validate.yml         # GitHub Actions 자동 검증 CI 파이프라인
```

---

## 핵심 문서

| 문서 | 목적 | 언제 작성하는가? |
|------|------|----------------|
| [01_PRD.md](docs/01_PRD.md) | 제품 목표, 사용자, MVP 스코프, Out of Scope | 프로젝트 시작 시 |
| [02_ADR.md](docs/02_ADR.md) | 기술 스택, 아키텍처 결정 및 근거 | 중요한 기술 결정 시마다 |
| [03_TRD.md](docs/03_TRD.md) | 기능별 세부 설계 (API, 데이터 모델, 에러 처리) | 기능 구현 전 (Design-First) |
| [04_UI_GUIDE.md](docs/04_UI_GUIDE.md) | 색상, 타이포그래피, 컴포넌트 패턴 | 컴포넌트 작성 전 |

---

## AI 에이전트 개발 워크플로우

### 1. 기본 개발 사이클

```
1. 기획 → docs/01_PRD.md 작성
2. 설계 → docs/02_ADR.md + docs/03_TRD.md 작성
3. 구현 → 코드 작성 (CLAUDE.md / GEMINI.md CRITICAL 규칙 준수)
4. 검증 → 검증 스크립트 실행
5. 문서화 → PRD/ADR/TRD 변경사항 및 task.md 반영
```

### 2. Antigravity (Gemini Pro) 환경에서 사용법
1. `docs/01_PRD.md` ~ `03_TRD.md`에 기획 및 설계를 작성합니다.
2. 에이전트에게 지시합니다:
   > *"docs 문서를 바탕으로 기본 아키텍처와 초기 코드를 세팅해줘. task.md도 갱신해줘."*
3. Planning Mode에서 수립된 계획을 승인하면 에이전트가 코드를 단계별로 생성하고 검증 스크립트를 자동 실행합니다.

---

## 아키텍처 검증 스크립트

```bash
# Windows PowerShell 환경
powershell -ExecutionPolicy Bypass -File scripts/validate-arch.ps1
powershell -ExecutionPolicy Bypass -File scripts/sync-docs.ps1

# Linux / macOS / Git Bash 환경
bash scripts/validate-arch.sh
bash scripts/sync-docs.sh
```

### `validate-arch` 검사 항목
- ✅ Client Component에서 외부 API 직접 호출 금지
- ✅ 시크릿 환경 변수 클라이언트 번들 노출 금지
- ✅ TypeScript `any` 타입 사용 금지
- ✅ DB 직접 접근 (services 레이어 우회) 금지
- ✅ `console.log` 프로덕션 코드 잔류 검사

---

## 새 프로젝트에 적용하는 방법

1. **이 레포를 복사하거나 템플릿으로 생성한다.**
2. **초기화 스크립트를 실행하여 프로젝트명과 디렉토리 구조를 자동 세팅한다:**
   ```bash
   # Windows PowerShell
   powershell -ExecutionPolicy Bypass -File scripts/init-project.ps1 -ProjectName "내프로젝트" -Author "작성자"

   # Linux / macOS / Bash
   bash scripts/init-project.sh "내프로젝트" "작성자"
   ```
3. **`CLAUDE.md` / `GEMINI.md`의 기술 스택 섹션을 프로젝트에 맞게 확인/조정한다.**
4. **`docs/01_PRD.md`부터 순서대로 기획 및 요구사항을 작성한다.**
5. **AI 에이전트에게 "docs 문서를 읽고 시작해"라고 지시한다.**
6. 개발 중 새로운 패턴이나 함정 발견 시 `.knowledge/` 폴더에 지속적으로 축적한다.
