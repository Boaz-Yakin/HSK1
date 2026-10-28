#!/usr/bin/env bash
# scripts/init-project.sh
# Bootstrap script to initialize a new project from this template
# Usage: bash scripts/init-project.sh "ProjectName" "AuthorName"

set -e

PROJECT_NAME="$1"
AUTHOR="$2"
TODAY=$(date +"%Y-%m-%d")

CYAN='\033[0;36m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}==========================================${NC}"
echo -e "${CYAN}  Project Initializer (Custom Harness)   ${NC}"
echo -e "${CYAN}==========================================${NC}"

if [ -z "$PROJECT_NAME" ]; then
  read -rp "Enter Project Name (e.g., InventoryHub): " PROJECT_NAME
fi

if [ -z "$AUTHOR" ]; then
  read -rp "Enter Author Name (e.g., Alex): " AUTHOR
fi

if [ -z "$PROJECT_NAME" ]; then
  echo -e "${RED}[ERROR] Project Name is required.${NC}"
  exit 1
fi

echo ""
echo "📋 [1/2] Replacing template placeholders..."
echo "  - Project Name: $PROJECT_NAME"
echo "  - Author:       $AUTHOR"
echo "  - Date:         $TODAY"

FILES=("AGENTS.md" "CLAUDE.md" "GEMINI.md" "docs/01_PRD.md" "docs/02_ADR.md" "docs/03_TRD.md")

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    # Cross-platform sed inplace
    if [[ "$OSTYPE" == "darwin"* ]]; then
      sed -i '' "s/{프로젝트명}/$PROJECT_NAME/g" "$file"
      sed -i '' "s/{이름}/$AUTHOR/g" "$file"
      sed -i '' "s/{YYYY-MM-DD}/$TODAY/g" "$file"
    else
      sed -i "s/{프로젝트명}/$PROJECT_NAME/g" "$file"
      sed -i "s/{이름}/$AUTHOR/g" "$file"
      sed -i "s/{YYYY-MM-DD}/$TODAY/g" "$file"
    fi
    echo -e "  ${GREEN}[OK] Updated $file${NC}"
  fi
done

echo ""
echo "📁 [2/2] Scaffolding standard directory structure..."

DIRS=(
  "src/app"
  "src/components/ui"
  "src/components/features"
  "src/types"
  "src/lib"
  "src/services"
  "src/hooks"
  "src/constants"
)

for dir in "${DIRS[@]}"; do
  if [ ! -d "$dir" ]; then
    mkdir -p "$dir"
    touch "$dir/.gitkeep"
    echo -e "  ${GREEN}[CREATE] $dir${NC}"
  else
    echo "  [SKIP] $dir already exists"
  fi
done

echo ""
echo -e "${CYAN}==========================================${NC}"
echo -e "${GREEN}  Project Initialized Successfully!${NC}"
echo -e "${CYAN}==========================================${NC}"
echo "Next steps:"
echo "  1. Review docs/01_PRD.md to specify your MVP features."
echo "  2. Review docs/02_ADR.md for technical decisions."
echo "  3. Run: bash scripts/sync-docs.sh"
