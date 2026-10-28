#!/usr/bin/env bash
# scripts/validate-arch.sh
# 아키텍처 규칙 준수 여부 검증 스크립트
# 사용법: bash scripts/validate-arch.sh
# CI에서도 실행 가능. 위반 발견 시 exit code 1 반환

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

echo -e "${CYAN}==========================================${NC}"
echo -e "${CYAN}  Architecture Rules Validation${NC}"
echo -e "${CYAN}==========================================${NC}"

if [ ! -d "src" ]; then
  echo "[INFO] 'src' 디렉토리가 아직 없습니다. 검사를 건너뜁니다."
  echo -e "${CYAN}==========================================${NC}"
  echo -e "${GREEN}[PASS] 신규 프로젝트: 위반 사항 없음.${NC}"
  exit 0
fi

# ──────────────────────────────────────────────────────────────────
# Helper: Client Component 파일 목록 수집
# ──────────────────────────────────────────────────────────────────
CLIENT_FILES=$(grep -rl "['\"]use client['\"]" src/ 2>/dev/null || true)

# ──────────────────────────────────────────────────────────────────
# RULE 1: Client Component에서 외부 API 직접 호출 금지
# Detects: fetch('http(s)://...'), 외부 axios/ky/got 직접 호출
# 허용: fetch('/api/...') 등 내부 Route Handler 상대경로 호출
# CRITICAL: CLAUDE.md / GEMINI.md 규칙 #1
# ──────────────────────────────────────────────────────────────────
echo ""
echo "📋 RULE 1: Client Component에서 외부 API 직접 호출 검사..."

RULE1_VIOLATIONS=""
if [ -n "$CLIENT_FILES" ]; then
  # 1) 'use client' 파일에서 fetch('https?://...') 리터럴 외부 URL 호출
  FETCH_EXT_VIOLATIONS=$(echo "$CLIENT_FILES" | xargs grep -En "fetch\(\s*['\"\`]https?://" 2>/dev/null || true)
  # 2) axios/ky/got 외부 HTTP 호출 및 axios.create
  HTTP_EXT_VIOLATIONS=$(echo "$CLIENT_FILES" | xargs grep -En "(axios|ky|got)\.(get|post|put|patch|delete)\(\s*['\"\`]https?://|axios\.create\(" 2>/dev/null || true)

  if [ -n "$FETCH_EXT_VIOLATIONS" ] || [ -n "$HTTP_EXT_VIOLATIONS" ]; then
    RULE1_VIOLATIONS="${FETCH_EXT_VIOLATIONS}${HTTP_EXT_VIOLATIONS}"
  fi
fi

if [ -n "$RULE1_VIOLATIONS" ]; then
  echo -e "${RED}[FAIL] Client Component에서 외부 API 직접 호출 발견 (app/api/ 또는 Server Component 경유 필수):${NC}"
  echo "$RULE1_VIOLATIONS"
  ERRORS=$((ERRORS + 1))
else
  echo -e "${GREEN}[PASS] Client Component 내 외부 API 직접 호출 없음.${NC}"
fi

# ──────────────────────────────────────────────────────────────────
# RULE 2: 환경 변수 시크릿 클라이언트 번들 노출 금지
# Detects: NEXT_PUBLIC_ 및 NODE_ENV를 제외한 process.env 참조
# CRITICAL: CLAUDE.md / GEMINI.md 규칙 #2
# ──────────────────────────────────────────────────────────────────
echo ""
echo "📋 RULE 2: 시크릿 환경 변수 클라이언트 노출 검사..."

RULE2_VIOLATIONS=""
if [ -n "$CLIENT_FILES" ]; then
  # Client files referencing process.env.<VAR> that is not NEXT_PUBLIC_ and not NODE_ENV
  RULE2_VIOLATIONS=$(echo "$CLIENT_FILES" | xargs grep -En "process\.env\.[A-Z0-9_]+" 2>/dev/null | \
    grep -v "NEXT_PUBLIC_" | \
    grep -v "process\.env\.NODE_ENV" || true)
fi

if [ -n "$RULE2_VIOLATIONS" ]; then
  echo -e "${RED}[FAIL] Client Component에서 시크릿 환경 변수 참조 발견 (NEXT_PUBLIC_ 접두사 누락):${NC}"
  echo "$RULE2_VIOLATIONS"
  ERRORS=$((ERRORS + 1))
else
  echo -e "${GREEN}[PASS] Client Component에 노출된 시크릿 환경 변수 없음.${NC}"
fi

# ──────────────────────────────────────────────────────────────────
# RULE 3: any 타입 사용 금지
# Detects: ': any', 'as any', '<any>', 'any[]', 'Promise<any>'
# CRITICAL: CLAUDE.md / GEMINI.md 규칙 #4
# ──────────────────────────────────────────────────────────────────
echo ""
echo "📋 RULE 3: TypeScript any 타입 사용 검사..."

ANY_VIOLATIONS=$(grep -rnE "(:\s*any\b|as\s+any\b|<any>|any\[\]|Promise<any>)" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | \
  grep -v "__tests__" | \
  grep -v "\.test\." | \
  grep -v "\.spec\." | \
  grep -v "\.d\.ts:" | \
  grep -v "// eslint-disable" | \
  grep -v "// @ts-ignore" || true)

if [ -n "$ANY_VIOLATIONS" ]; then
  echo -e "${RED}[FAIL] 'any' 타입 사용 발견 (unknown 또는 구체적 타입 정의 필요):${NC}"
  echo "$ANY_VIOLATIONS" | head -15
  ERRORS=$((ERRORS + 1))
else
  echo -e "${GREEN}[PASS] 명시적 'any' 타입 미발견.${NC}"
fi

# ──────────────────────────────────────────────────────────────────
# RULE 4: DB 접근은 services/ 레이어 경유 확인
# Detects: Supabase, Prisma, Drizzle, Knex direct calls outside services/
# CRITICAL: CLAUDE.md / GEMINI.md 규칙 #5
# ──────────────────────────────────────────────────────────────────
echo ""
echo "📋 RULE 4: DB 직접 접근 (services 레이어 우회) 검사..."

NON_SERVICE_FILES=$(find src/ -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) 2>/dev/null | \
  grep -v "/services/" | \
  grep -v "/lib/supabase/" | \
  grep -v "/lib/prisma/" | \
  grep -v "/lib/db/" | \
  grep -v "/lib/database/" | \
  grep -v "/lib/drizzle/" | \
  grep -v "__tests__" | \
  grep -v "\.test\." | \
  grep -v "\.spec\." || true)

DB_VIOLATIONS=""
if [ -n "$NON_SERVICE_FILES" ]; then
  DB_VIOLATIONS=$(echo "$NON_SERVICE_FILES" | xargs grep -En "(supabase\.from\(|prisma\.[a-zA-Z]+\.|new PrismaClient\(|db\.(select|insert|update|delete)\(|knex\(['\"])" 2>/dev/null || true)
fi

if [ -n "$DB_VIOLATIONS" ]; then
  echo -e "${RED}[FAIL] services/ 레이어 외곽에서 DB 직접 접근 발견 (Supabase/Prisma/Drizzle/Knex):${NC}"
  echo "$DB_VIOLATIONS" | head -10
  echo "  → services/ 레이어를 통해서만 데이터베이스에 접근해야 합니다."
  ERRORS=$((ERRORS + 1))
else
  echo -e "${GREEN}[PASS] services/ 레이어 우회 DB 직접 접근 없음.${NC}"
fi

# ──────────────────────────────────────────────────────────────────
# RULE 5: console.log 프로덕션 코드 잔류 검사
# ──────────────────────────────────────────────────────────────────
echo ""
echo "📋 RULE 5: console.log 잔류 검사..."

CONSOLE_VIOLATIONS=$(grep -rn "console\.log(" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | \
  grep -v "__tests__" | \
  grep -v "\.test\." | \
  grep -v "\.spec\." || true)

if [ -n "$CONSOLE_VIOLATIONS" ]; then
  echo -e "${YELLOW}[WARN] console.log 발견 (프로덕션 배포 전 제거 권장):${NC}"
  echo "$CONSOLE_VIOLATIONS" | head -10
  WARNINGS=$((WARNINGS + 1))
else
  echo -e "${GREEN}[PASS] 잔류 console.log 없음.${NC}"
fi

# ──────────────────────────────────────────────────────────────────
# 결과 요약
# ──────────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}==========================================${NC}"
echo -e "${CYAN}  Validation Summary${NC}"
echo -e "${CYAN}==========================================${NC}"

if [ $ERRORS -gt 0 ]; then
  echo -e "${RED}[ERROR] 오류: $ERRORS 건 (반드시 수정 필요)${NC}"
fi
if [ $WARNINGS -gt 0 ]; then
  echo -e "${YELLOW}[WARN] 경고: $WARNINGS 건 (검토 권장)${NC}"
fi
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo -e "${GREEN}[SUCCESS] 모든 아키텍처 규칙 통과!${NC}"
fi

echo ""

if [ $ERRORS -gt 0 ]; then
  echo -e "${RED}아키텍처 규칙 위반으로 인해 실패합니다.${NC}"
  exit 1
fi

echo -e "${GREEN}아키텍처 검증 완료.${NC}"
exit 0
