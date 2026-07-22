$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "common-windows.ps1")

Initialize-ThemeRuntimeDirectories
$state = Read-ThemeRuntimeState
$port = if ($state -and $state.port) { [int]$state.port } else { 9341 }
$node = Get-ThemeNodeRuntime
Stop-RecordedThemeInjector
if (Test-ThemeCdp -Port $port) {
  Invoke-ThemeNode -NodePath $node -Arguments @(
    $script:InjectorPath, "--remove", "--port", "$port", "--theme-dir", $script:ActiveThemeRoot, "--timeout-ms", "8000"
  )
}
if (Test-Path -LiteralPath $script:StatePath -PathType Leaf) {
  Remove-Item -LiteralPath $script:StatePath -Force
}
Write-Output "Codex default appearance restored. Saved themes were kept."
