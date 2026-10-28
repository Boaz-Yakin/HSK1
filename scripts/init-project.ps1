# scripts/init-project.ps1
# Bootstrap script to initialize a new project from this template
# Usage: powershell -ExecutionPolicy Bypass -File scripts/init-project.ps1 -ProjectName "MyProject" -Author "Developer"

param (
    [string]$ProjectName,
    [string]$Author
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Project Initializer (Custom Harness)   " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

if (-not $ProjectName) {
    $ProjectName = Read-Host "Enter Project Name (e.g., InventoryHub)"
}
if (-not $Author) {
    $Author = Read-Host "Enter Author Name (e.g., Alex)"
}

if (-not $ProjectName) {
    Write-Host "[ERROR] Project Name is required." -ForegroundColor Red
    exit 1
}

$Today = (Get-Date).ToString("yyyy-MM-dd")

Write-Host "`n[1/2] Replacing template placeholders..." -ForegroundColor White
Write-Host "  - Project Name: $ProjectName" -ForegroundColor Gray
Write-Host "  - Author:       $Author" -ForegroundColor Gray
Write-Host "  - Date:         $Today" -ForegroundColor Gray

$targetFiles = @(
    "AGENTS.md",
    "CLAUDE.md",
    "GEMINI.md",
    "docs/01_PRD.md",
    "docs/02_ADR.md",
    "docs/03_TRD.md"
)

foreach ($f in $targetFiles) {
    if (Test-Path $f) {
        $content = Get-Content $f -Raw -Encoding UTF8
        $content = $content.Replace("{프로젝트명}", $ProjectName)
        $content = $content.Replace("{이름}", $Author)
        $content = $content.Replace("{YYYY-MM-DD}", $Today)
        Set-Content -Path $f -Value $content -Encoding UTF8 -NoNewline
        Write-Host "  [OK] Updated $f" -ForegroundColor Green
    }
}

Write-Host "`n[2/2] Scaffolding standard directory structure..." -ForegroundColor White

$directories = @(
    "src/app",
    "src/components/ui",
    "src/components/features",
    "src/types",
    "src/lib",
    "src/services",
    "src/hooks",
    "src/constants"
)

foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "  [CREATE] $dir" -ForegroundColor Green
    } else {
        Write-Host "  [SKIP] $dir already exists" -ForegroundColor Gray
    }
}

# Create a sample .gitkeep in each empty directory if needed
foreach ($dir in $directories) {
    $keepFile = Join-Path $dir ".gitkeep"
    if (-not (Test-Path $keepFile)) {
        Set-Content -Path $keepFile -Value "" -Encoding ASCII
    }
}

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "  Project Initialized Successfully!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Next steps:" -ForegroundColor White
Write-Host "  1. Review docs/01_PRD.md to specify your MVP features." -ForegroundColor White
Write-Host "  2. Review docs/02_ADR.md for technical decisions." -ForegroundColor White
Write-Host "  3. Run: powershell -ExecutionPolicy Bypass -File scripts/sync-docs.ps1" -ForegroundColor White
