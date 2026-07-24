param([int]$Port = 9335)

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "common-windows.ps1")

function Sync-ActiveThemeToVerifiedRuntime {
  param([Parameter(Mandatory = $true)][string]$RuntimeRoot)

  $sourceTheme = Join-Path $script:ActiveThemeRoot "theme.json"
  if (-not (Test-Path -LiteralPath $sourceTheme -PathType Leaf)) {
    throw "No active theme has been selected."
  }
  $theme = (Get-Content -LiteralPath $sourceTheme -Raw -Encoding UTF8) | ConvertFrom-Json -ErrorAction Stop
  $imageName = [string]$theme.image
  if (-not $imageName -or [IO.Path]::GetFileName($imageName) -cne $imageName) {
    throw "The active theme has an invalid image path."
  }
  $sourceImage = Join-Path $script:ActiveThemeRoot $imageName
  if (-not (Test-Path -LiteralPath $sourceImage -PathType Leaf)) {
    throw "The active theme image is missing."
  }

  $stateRoot = Join-Path $env:LOCALAPPDATA "CodexDreamSkin"
  $activeRoot = Join-Path $stateRoot "active-theme"
  New-Item -ItemType Directory -Force -Path $activeRoot | Out-Null
  # Publish image first and theme metadata last so an already-running watcher
  # never observes a theme.json that points to a missing image.
  Copy-Item -LiteralPath $sourceImage -Destination (Join-Path $activeRoot $imageName) -Force
  Copy-Item -LiteralPath $sourceTheme -Destination (Join-Path $activeRoot "theme.json") -Force
}

Initialize-ThemeRuntimeDirectories
$runtimeRoot = Join-Path (Split-Path $PSScriptRoot -Parent) "runtime"
$runtimeStart = Join-Path $runtimeRoot "scripts\start-dream-skin.ps1"
if (-not (Test-Path -LiteralPath $runtimeStart -PathType Leaf)) {
  throw "The verified Windows runtime is missing. Reinstall Codex Theme Creator."
}
Sync-ActiveThemeToVerifiedRuntime -RuntimeRoot $runtimeRoot
& $runtimeStart -Port $Port -RestartExisting
Write-Output "Codex theme runtime is active through a verified Windows CDP session."
