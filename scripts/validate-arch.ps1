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
# Helper: Gather client files
# -------------------------------------------------------------------
$clientFiles = Get-ChildItem -Path "src" -Recurse -Include *.ts, *.tsx, *.js, *.jsx -ErrorAction SilentlyContinue | Where-Object {
    $c = Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue
    $c -match "['""]use client['""]"
}

# -------------------------------------------------------------------
# RULE 1: Client components calling external APIs directly
# Detects: fetch() with external http(s) URL, or external HTTP clients
# (Relative internal API calls like fetch('/api/...') are allowed)
# -------------------------------------------------------------------
Write-Host "`n[RULE 1] Checking external API calls in Client Components..." -ForegroundColor White

$rule1Violations = @()
foreach ($f in $clientFiles) {
    $lines = Get-Content $f.FullName -ErrorAction SilentlyContinue
    $lineNum = 0
    foreach ($line in $lines) {
        $lineNum++
        # 1) fetch() with literal external http/https URL
        $hasExternalFetch = $line -match "fetch\(\s*['`"]https?://"
        # 2) direct axios/ky/got calls to external http/https
        $hasExternalClient = $line -match "(axios|ky|got)\.(get|post|put|patch|delete)\(\s*['`"]https?://"
        $hasAxiosCreate = $line -match "axios\.create\("

        if ($hasExternalFetch -or $hasExternalClient -or $hasAxiosCreate) {
            $rule1Violations += "$($f.FullName):$lineNum $line"
        }
    }
}

if ($rule1Violations.Count -gt 0) {
    Write-Host "[FAIL] Client Component calls external API directly (must go through app/api/ or Server Component):" -ForegroundColor Red
    $rule1Violations | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
    $ErrorsCount++
} else {
    Write-Host "[PASS] No direct external API calls in Client Components." -ForegroundColor Green
}

# -------------------------------------------------------------------
# RULE 2: Secret environment variables exposed to client
# Detects non-NEXT_PUBLIC_ and non-NODE_ENV process.env references
# -------------------------------------------------------------------
Write-Host "`n[RULE 2] Checking secret env vars exposed to Client Components..." -ForegroundColor White

$rule2Violations = @()
foreach ($f in $clientFiles) {
    $lines = Get-Content $f.FullName -ErrorAction SilentlyContinue
    $lineNum = 0
    foreach ($line in $lines) {
        $lineNum++
        if ($line -match "process\.env\.([A-Z0-9_]+)") {
            $varName = $matches[1]
            if ($varName -notmatch "^NEXT_PUBLIC_" -and $varName -ne "NODE_ENV") {
                $rule2Violations += "$($f.FullName):$lineNum $line"
            }
        }
    }
}

if ($rule2Violations.Count -gt 0) {
    Write-Host "[FAIL] Client Component references secret env variables (lacks NEXT_PUBLIC_ prefix):" -ForegroundColor Red
    $rule2Violations | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
    $ErrorsCount++
} else {
    Write-Host "[PASS] No secret env variables detected in Client Components." -ForegroundColor Green
}

# -------------------------------------------------------------------
# RULE 3: TypeScript 'any' type usage
# Detects ': any', 'as any', '<any>', 'any[]', 'Promise<any>'
# -------------------------------------------------------------------
Write-Host "`n[RULE 3] Checking for TypeScript 'any' type usage..." -ForegroundColor White

$tsFiles = Get-ChildItem -Path "src" -Recurse -Include *.ts, *.tsx -ErrorAction SilentlyContinue | Where-Object {
    $_.FullName -notmatch "(__tests__|\.test\.|\.spec\.|\.d\.ts$)"
}
$rule3Violations = @()
foreach ($f in $tsFiles) {
    $lines = Get-Content $f.FullName -ErrorAction SilentlyContinue
    $lineNum = 0
    foreach ($line in $lines) {
        $lineNum++
        if ($line -match "(:\s*any\b|as\s+any\b|<any>|any\[\]|Promise<any>)" -and $line -notmatch "eslint-disable" -and $line -notmatch "@ts-ignore") {
            $rule3Violations += "$($f.FullName):$lineNum $line"
        }
    }
}

if ($rule3Violations.Count -gt 0) {
    Write-Host "[FAIL] 'any' type usage found (prefer 'unknown' or specific types):" -ForegroundColor Red
    $rule3Violations | Select-Object -First 10 | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
    $ErrorsCount++
} else {
    Write-Host "[PASS] No explicit 'any' types found." -ForegroundColor Green
}

# -------------------------------------------------------------------
# RULE 4: Direct DB access bypassing services/ layer
# Detects: Supabase, Prisma, Drizzle, Knex direct calls anywhere
#          outside src/services/ and src/lib/ (DB client initialization)
# -------------------------------------------------------------------
Write-Host "`n[RULE 4] Checking direct DB access bypassing services layer..." -ForegroundColor White

$allCodeFiles = Get-ChildItem -Path "src" -Recurse -Include *.ts, *.tsx, *.js, *.jsx -ErrorAction SilentlyContinue | Where-Object {
    $normalized = $_.FullName.Replace("\", "/")
    $normalized -notmatch "/services/" -and 
    $normalized -notmatch "/lib/(supabase|prisma|db|database|drizzle)/" -and
    $normalized -notmatch "(__tests__|\.test\.|\.spec\.)"
}

$rule4Violations = @()
foreach ($f in $allCodeFiles) {
    $lines = Get-Content $f.FullName -ErrorAction SilentlyContinue
    $lineNum = 0
    foreach ($line in $lines) {
        $lineNum++
        $hasSupabase = $line -match "supabase\.from\("
        $hasPrisma   = $line -match "(prisma\.[a-zA-Z]+\.|new PrismaClient\()"
        $hasDrizzle  = $line -match "db\.(select|insert|update|delete)\("
        $hasKnex     = $line -match "knex\(['`"]"

        if ($hasSupabase -or $hasPrisma -or $hasDrizzle -or $hasKnex) {
            $rule4Violations += "$($f.FullName):$lineNum $line"
        }
    }
}

if ($rule4Violations.Count -gt 0) {
    Write-Host "[FAIL] Direct DB access found outside services/ layer (Supabase/Prisma/Drizzle/Knex):" -ForegroundColor Red
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
