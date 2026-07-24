$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "common-windows.ps1")

Initialize-ThemeRuntimeDirectories
$runtimeRoot = Join-Path (Split-Path $PSScriptRoot -Parent) "runtime"
$runtimeRestore = Join-Path $runtimeRoot "scripts\restore-dream-skin.ps1"
if (-not (Test-Path -LiteralPath $runtimeRestore -PathType Leaf)) {
  throw "The verified Windows runtime is missing. Reinstall Codex Theme Creator."
}
& $runtimeRestore -NoRelaunch
Write-Output "Codex default appearance restored. Saved themes were kept."
