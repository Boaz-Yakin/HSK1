#!/usr/bin/env bash
# scripts/sync-docs.sh
# 문서 간 일관성 검증 스크립트
# PRD/ADR/TRD 문서가 제대로 연결되어 있는지, 누락된 항목이 없는지 확인
# 사용법: bash scripts/sync-docs.sh

set -e

YELLOW='\033[1;33m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

WARNINGS=0

echo -e "${CYAN}==========================================${NC}"
echo -e "${CYAN}  Documentation Consistency Validation${NC}"
echo -e "${CYAN}==========================================${NC}"

# ──────────────────────────────────────────────────────────────────
# Helper: Count template placeholders outside fenced code blocks
# ──────────────────────────────────────────────────────────────────
count_placeholders() {
  local file="$1"
  awk '
    /^```/ { in_code = !in_code; next }
    !in_code { print }
  ' "$file" | grep -oE "\{[^{}\n]{2,}\}" 2>/dev/null | wc -l | tr -d ' '
}

# ──────────────────────────────────────────────────────────────────
# CHECK 1: PRD 필수 섹션 존재 및 기능 목록 추출
# ──────────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}📋 PRD (docs/01_PRD.md) 섹션 & 기능 확인...${NC}"

PRD_FILE="docs/01_PRD.md"
PRD_FEATURES=""

if [ ! -f "$PRD_FILE" ]; then
  echo -e "${YELLOW}⚠️  PRD 파일이 없습니다: $PRD_FILE${NC}"
  WARNINGS=$((WARNINGS + 1))
else
  for section in "Problem Statement" "Target Users" "Core Features" "Out of Scope" "Success Metrics"; do
    if grep -q "$section" "$PRD_FILE"; then
      echo -e "  ${GREEN}✅ $section${NC}"
    else
      echo -e "  ${YELLOW}⚠️  누락된 섹션: $section${NC}"
      WARNINGS=$((WARNINGS + 1))
    fi
  done

  # PRD 내 F-001, F-002 형태 추출
  PRD_FEATURES=$(grep -oE "F-[0-9]{3}" "$PRD_FILE" 2>/dev/null | sort -u || true)
  if [ -n "$PRD_FEATURES" ]; then
    FEAT_JOIN=$(echo "$PRD_FEATURES" | tr '\n' ' ')
    echo -e "  PRD 정의 기능: $FEAT_JOIN"
  fi
  
  PH_COUNT=$(count_placeholders "$PRD_FILE")
  if [ "$PH_COUNT" -gt 3 ]; then
    echo -e "  ${YELLOW}⚠️  PRD에 미작성 플레이스홀더 $PH_COUNT개 발견 — 내용을 채워주세요${NC}"
    WARNINGS=$((WARNINGS + 1))
  else
    echo -e "  ${GREEN}✅ PRD 플레이스홀더 허용 범위 내 ($PH_COUNT개)${NC}"
  fi
fi

# ──────────────────────────────────────────────────────────────────
# CHECK 2: ADR에 최소 1개의 실제 결정 사항이 있는지
# ──────────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}📋 ADR (docs/02_ADR.md) 검증...${NC}"

ADR_FILE="docs/02_ADR.md"
if [ ! -f "$ADR_FILE" ]; then
  echo -e "${YELLOW}⚠️  ADR 파일이 없습니다: $ADR_FILE${NC}"
  WARNINGS=$((WARNINGS + 1))
else
  ADR_COUNT=$(grep -c "^## ADR-" "$ADR_FILE" 2>/dev/null || echo "0")
  echo -e "  발견된 ADR 항목: ${ADR_COUNT}개"
  
  ADR_PH_COUNT=$(count_placeholders "$ADR_FILE")
  if [ "$ADR_PH_COUNT" -gt 5 ]; then
    echo -e "  ${YELLOW}⚠️  미작성 ADR 플레이스홀더 ${ADR_PH_COUNT}개 발견 — 실제 결정 사항을 채워주세요${NC}"
    WARNINGS=$((WARNINGS + 1))
  else
    echo -e "  ${GREEN}✅ ADR 플레이스홀더 허용 범위 내 ($ADR_PH_COUNT개)${NC}"
  fi
fi

# ──────────────────────────────────────────────────────────────────
# CHECK 3: TRD Status 및 PRD 기능 매핑 확인
# ──────────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}📋 TRD (docs/03_TRD.md) 진행 상황 및 매핑 확인...${NC}"

TRD_FILE="docs/03_TRD.md"
if [ ! -f "$TRD_FILE" ]; then
  echo -e "${YELLOW}⚠️  TRD 파일이 없습니다: $TRD_FILE${NC}"
  WARNINGS=$((WARNINGS + 1))
else
  PROPOSED=$(grep -c "Status.*Proposed" "$TRD_FILE" 2>/dev/null || echo "0")
  IN_PROGRESS=$(grep -c "Status.*In Progress" "$TRD_FILE" 2>/dev/null || echo "0")
  DONE=$(grep -c "Status.*Done" "$TRD_FILE" 2>/dev/null || echo "0")
  
  echo -e "  📌 Proposed (미시작):  ${PROPOSED}개"
  echo -e "  🔄 In Progress (진행): ${IN_PROGRESS}개"
  echo -e "  ✅ Done (완료):        ${DONE}개"
  
  if [ "$IN_PROGRESS" -gt 3 ]; then
    echo -e "  ${YELLOW}⚠️  동시에 너무 많은 기능이 In Progress 상태입니다 (WIP 제한 권장: 3개 이하)${NC}"
    WARNINGS=$((WARNINGS + 1))
  fi

  # PRD 기능이 TRD에 존재하는지 확인
  if [ -n "$PRD_FEATURES" ]; then
    for fid in $PRD_FEATURES; do
      if ! grep -q "$fid" "$TRD_FILE"; then
        echo -e "  ${YELLOW}⚠️  PRD 기능 '$fid'가 아직 TRD에 언급/설계되지 않았습니다.${NC}"
        WARNINGS=$((WARNINGS + 1))
      fi
    done
  fi
fi

# ──────────────────────────────────────────────────────────────────
# CHECK 4: task.md 존재 및 PRD 기능 추적 여부
# ──────────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}📋 task.md 확인...${NC}"

TASK_FILE="task.md"
if [ ! -f "$TASK_FILE" ]; then
  echo -e "  ${YELLOW}⚠️  task.md 파일 없음 — 작업 추적이 되지 않고 있습니다${NC}"
  WARNINGS=$((WARNINGS + 1))
else
  TODO_COUNT=$(grep -c "\[ \]" "$TASK_FILE" 2>/dev/null || echo "0")
  IN_PROGRESS_COUNT=$(grep -c "\[/\]" "$TASK_FILE" 2>/dev/null || echo "0")
  DONE_COUNT=$(grep -c "\[x\]" "$TASK_FILE" 2>/dev/null || echo "0")
  
  echo -e "  📌 미완료: ${TODO_COUNT}개  🔄 진행중: ${IN_PROGRESS_COUNT}개  ✅ 완료: ${DONE_COUNT}개"

  if [ -n "$PRD_FEATURES" ]; then
    for fid in $PRD_FEATURES; do
      if ! grep -q "$fid" "$TASK_FILE"; then
        echo -e "  ${YELLOW}⚠️  PRD 기능 '$fid'가 task.md에 추적 항목으로 등록되지 않았습니다.${NC}"
        WARNINGS=$((WARNINGS + 1))
      fi
    done
  fi
fi

# ──────────────────────────────────────────────────────────────────
# CHECK 5: .knowledge 폴더 확인
# ──────────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}📋 .knowledge/ 폴더 확인...${NC}"

KNOWLEDGE_COUNT=$(find .knowledge/ -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
echo -e "  지식 문서: ${KNOWLEDGE_COUNT}개"

if [ "$KNOWLEDGE_COUNT" -lt 2 ]; then
  echo -e "  ${YELLOW}⚠️  .knowledge/ 문서가 부족합니다. 패턴 & 주의사항을 추가해주세요${NC}"
  WARNINGS=$((WARNINGS + 1))
else
  echo -e "  ${GREEN}✅ 지식 베이스 구축됨 ($KNOWLEDGE_COUNT개 문서)${NC}"
fi

# ──────────────────────────────────────────────────────────────────
# 결과 요약
# ──────────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}==========================================${NC}"
echo -e "${CYAN}  Sync Summary${NC}"
echo -e "${CYAN}==========================================${NC}"

if [ $WARNINGS -gt 0 ]; then
  echo -e "${YELLOW}⚠️  경고: $WARNINGS 건 — 문서를 보완하세요${NC}"
else
  echo -e "${GREEN}🎉 모든 문서 일관성 검사 통과!${NC}"
fi

echo ""
echo "문서 검증 완료."
exit 0
