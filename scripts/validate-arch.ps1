# scripts/validate-arch.ps1
# Architecture rules validation script for Windows PowerShell
# Usage: powershell -ExecutionPolicy Bypass -File scripts/validate-arch.ps1

$ErrorActionPreference = "Continue"

$ErrorsCount = 0
$WarningsCount = 0

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Architecture Rules Validation" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

if (-not (Test-Path "src")) {
    Write-Host "[INFO] 'src' directory does not exist yet. Skipping validation." -ForegroundColor Gray
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host "[PASS] No source code violations detected (fresh project)." -ForegroundColor Green
    exit 0
}

# -------------------------------------------------------------------
# RULE 1: Client components calling external APIs directly
# Detects: fetch() with literal URL, variable, template literal,
#          and common HTTP clients (axios, ky, got)
# -------------------------------------------------------------------
Write-Host "`n[RULE 1] Checking external API calls in Client Components..." -ForegroundColor White

$clientFiles = Get-ChildItem -Path "src" -Recurse -Include *.ts, *.tsx, *.js, *.jsx -ErrorAction SilentlyContinue | Where-Object {
    $c = Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue
    $c -match "['""]use client['""]"
}

$rule1Violations = @()
foreach ($f in $clientFiles) {
    $c = Get-Content $f.FullName -Raw -ErrorAction SilentlyContinue
    # 1) fetch()로 http/https 리터럴 URL 직접 호출
    $hasFetchLiteral  = $c -match "fetch\(\s*['"`"]https?://"
    # 2) fetch()로 변수/템플릿 리터럴 경유 호출 (변수명 앞에 https 포함 여부로 추론)
    $hasFetchVar      = $c -match "fetch\(\s*[a-zA-Z_`$]"
    # 3) axios / ky / got 등 HTTP 클라이언트 직접 호출
    $hasHttpClient    = $c -match "(axios|ky|got)\.(get|post|put|patch|delete)\("
    $hasAxiosCreate   = $c -match "axios\.create\("

    if ($hasFetchLiteral -or $hasHttpClient -or $hasAxiosCreate) {
        $rule1Violations += $f.FullName
    } elseif ($hasFetchVar) {
        # 변수 경유는 false-positive 가능성 있어 WARNING 처리
        Write-Host "[WARN] Possible external fetch via variable in: $($f.FullName)" -ForegroundColor Yellow
        $WarningsCount++
    }
}

if ($rule1Violations.Count -gt 0) {
    Write-Host "[FAIL] Client Component calls external API directly (fetch/axios/ky/got):" -ForegroundColor Red
    $rule1Violations | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
    $ErrorsCount++
} else {
    Write-Host "[PASS] No direct external API calls in Client Components." -ForegroundColor Green
}

# -------------------------------------------------------------------
# RULE 2: Secret environment variables exposed to client
# -------------------------------------------------------------------
Write-Host "`n[RULE 2] Checking secret env vars exposed to Client Components..." -ForegroundColor White

$rule2Violations = @()
foreach ($f in $clientFiles) {
    $lines = Get-Content $f.FullName -ErrorAction SilentlyContinue
    $lineNum = 0
    foreach ($line in $lines) {
        $lineNum++
        if ($line -match "process\.env\.([A-Z0-9_]+)" -and $line -notmatch "NEXT_PUBLIC_") {
            $rule2Violations += "$($f.FullName):$lineNum $line"
        }
    }
}

if ($rule2Violations.Count -gt 0) {
    Write-Host "[WARN] Client Component references non-public env variables:" -ForegroundColor Yellow
    $rule2Violations | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
    $WarningsCount++
} else {
    Write-Host "[PASS] No secret env variables detected in Client Components." -ForegroundColor Green
}

# -------------------------------------------------------------------
# RULE 3: TypeScript 'any' type usage
# -------------------------------------------------------------------
Write-Host "`n[RULE 3] Checking for TypeScript 'any' type usage..." -ForegroundColor White

$tsFiles = Get-ChildItem -Path "src" -Recurse -Include *.ts, *.tsx -ErrorAction SilentlyContinue
$rule3Violations = @()
foreach ($f in $tsFiles) {
    $lines = Get-Content $f.FullName -ErrorAction SilentlyContinue
    $lineNum = 0
    foreach ($line in $lines) {
        $lineNum++
        if ($line -match ":\s*any\b" -and $line -notmatch "eslint-disable" -and $line -notmatch "@ts-ignore") {
            $rule3Violations += "$($f.FullName):$lineNum $line"
        }
    }
}

if ($rule3Violations.Count -gt 0) {
    Write-Host "[WARN] 'any' type usage found (prefer 'unknown' or specific types):" -ForegroundColor Yellow
    $rule3Violations | Select-Object -First 10 | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
    $WarningsCount++
} else {
    Write-Host "[PASS] No explicit 'any' types found." -ForegroundColor Green
}

# -------------------------------------------------------------------
# RULE 4: Direct DB access bypassing services/ layer
# Detects: Supabase, Prisma, Drizzle, Knex direct calls in
#          components/ or app/ (outside services/)
# -------------------------------------------------------------------
Write-Host "`n[RULE 4] Checking direct DB access bypassing services layer..." -ForegroundColor White

$compFiles = Get-ChildItem -Path "src/components", "src/app" -Recurse -Include *.ts, *.tsx, *.js, *.jsx -ErrorAction SilentlyContinue
$rule4Violations = @()
foreach ($f in $compFiles) {
    $normalized = $f.FullName.Replace("\", "/")
    if ($normalized -match "/services/") { continue }
    $c = Get-Content $f.FullName -Raw -ErrorAction SilentlyContinue
    # Supabase: supabase.from()
    $hasSupabase = $c -match "supabase\.from\("
    # Prisma: prisma.<model>. or new PrismaClient()
    $hasPrisma   = $c -match "(prisma\.[a-zA-Z]+\.|new PrismaClient\()"
    # Drizzle: db.select() / db.insert() / db.update() / db.delete()
    $hasDrizzle  = $c -match "db\.(select|insert|update|delete)\("
    # Knex: knex('<table>')
    $hasKnex     = $c -match "knex\(['"`"]"

    if ($hasSupabase -or $hasPrisma -or $hasDrizzle -or $hasKnex) {
        $rule4Violations += $f.FullName
    }
}

if ($rule4Violations.Count -gt 0) {
    Write-Host "[FAIL] Direct DB access found in components/pages (use services/ layer):" -ForegroundColor Red
    $rule4Violations | Select-Object -First 10 | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
    $ErrorsCount++
} else {
    Write-Host "[PASS] No direct DB access bypassing services." -ForegroundColor Green
}

# -------------------------------------------------------------------
# RULE 5: Stray console.log statements
# -------------------------------------------------------------------
Write-Host "`n[RULE 5] Checking stray console.log statements..." -ForegroundColor White

$rule5Violations = @()
foreach ($f in $tsFiles) {
    if ($f.FullName -match "(__tests__|\.test\.|\.spec\.)") { continue }
    $lines = Get-Content $f.FullName -ErrorAction SilentlyContinue
    $lineNum = 0
    foreach ($line in $lines) {
        $lineNum++
        if ($line -match "console\.log\(") {
            $rule5Violations += "$($f.FullName):$lineNum $line"
        }
    }
}

if ($rule5Violations.Count -gt 0) {
    Write-Host "[WARN] console.log statements found in production code:" -ForegroundColor Yellow
    $rule5Violations | Select-Object -First 10 | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
    $WarningsCount++
} else {
    Write-Host "[PASS] No stray console.log statements." -ForegroundColor Green
}

# -------------------------------------------------------------------
# Summary
# -------------------------------------------------------------------
Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "  Validation Summary" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

if ($ErrorsCount -gt 0) {
    Write-Host "[ERROR] $ErrorsCount error(s) found. (Must be resolved)" -ForegroundColor Red
}
if ($WarningsCount -gt 0) {
    Write-Host "[WARNING] $WarningsCount warning(s) found." -ForegroundColor Yellow
}
if ($ErrorsCount -eq 0 -and $WarningsCount -eq 0) {
    Write-Host "[SUCCESS] All architecture rules passed!" -ForegroundColor Green
}

if ($ErrorsCount -gt 0) {
    Write-Host "`nArchitecture validation failed." -ForegroundColor Red
    exit 1
}

Write-Host "`nArchitecture validation completed successfully." -ForegroundColor Green
exit 0
