param(
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]] $TaskArgs,

  [string] $Task = '',
  [string] $ImplementModel = 'qwen',
  [string] $ReviewModel = '',
  [switch] $SkipValidate,
  [switch] $SkipReview,
  [switch] $DryRun
)

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $repoRoot

if ([string]::IsNullOrWhiteSpace($Task) -and $TaskArgs.Count -gt 0) {
  $Task = ($TaskArgs -join ' ')
}

if ([string]::IsNullOrWhiteSpace($Task)) {
  Write-Host 'Usage:' -ForegroundColor Cyan
  Write-Host '  npm run ai:qwen -- "make the hero more premium"'
  Write-Host '  pwsh ./scripts/agent-pair.ps1 -Task "add contact form" -ReviewModel qwen'
  exit 2
}

function Invoke-Step {
  param(
    [string] $Name,
    [scriptblock] $Command
  )

  Write-Host "`n==> $Name" -ForegroundColor Cyan
  & $Command
  if ($LASTEXITCODE -ne 0) {
    throw "$Name failed with exit code $LASTEXITCODE"
  }
}

$implementPrompt = @"
You are a focused implementer agent working inside this React portfolio project.

Project root: $repoRoot

Task:
$Task

Rules:
- Edit only files under project root.
- Prefer small, cohesive changes.
- Use TypeScript-safe React.
- Keep UI modern, responsive, accessible.
- Do not claim validation passed; parent process runs validation after you finish.
- End with concise summary of changed files.
"@

$implementArgs = @(
  '--model', $ImplementModel,
  '--tools', 'read,write,edit,bash,find,grep,ls',
  '-p', $implementPrompt
)

if ($DryRun) {
  Write-Host 'Would run implementer:' -ForegroundColor Yellow
  Write-Host "pi $($implementArgs -join ' ')"
  exit 0
}

Invoke-Step "Implementer agent ($ImplementModel)" {
  & pi @implementArgs
}

if (-not $SkipValidate) {
  Invoke-Step 'Deterministic validation: npm run validate' {
    & npm run validate
  }
}

if (-not $SkipReview -and -not [string]::IsNullOrWhiteSpace($ReviewModel)) {
  $reviewPrompt = @"
You are a read-only validator agent reviewing this React portfolio project after implementation.

Original task:
$Task

Check:
- Does implementation match task?
- Any obvious TypeScript, React, CSS, responsiveness, or accessibility issues?
- Any overdone or fragile design choices?

Constraints:
- Do not edit files.
- Report PASS or FAIL first.
- If FAIL, list exact file paths and fixes needed.
"@

  $reviewArgs = @(
    '--model', $ReviewModel,
    '--tools', 'read,bash,find,grep,ls',
    '-p', $reviewPrompt
  )

  Invoke-Step "Read-only reviewer agent ($ReviewModel)" {
    & pi @reviewArgs
  }
}

Write-Host "`nAgent pair complete." -ForegroundColor Green
