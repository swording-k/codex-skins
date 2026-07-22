param([int]$Port = 9341)

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "common-windows.ps1")

Initialize-ThemeRuntimeDirectories
if (-not (Test-Path -LiteralPath (Join-Path $script:ActiveThemeRoot "theme.json") -PathType Leaf)) {
  throw "No active theme has been selected."
}
$node = Get-ThemeNodeRuntime
$codex = Start-ChatGPTWithCdp -Port $Port
Start-ThemeInjector -Port $Port -NodePath $node -CodexExecutable $codex | Out-Null
Start-Sleep -Milliseconds 250
Invoke-ThemeNode -NodePath $node -Arguments @(
  $script:InjectorPath, "--verify", "--port", "$Port", "--theme-dir", $script:ActiveThemeRoot, "--timeout-ms", "20000"
)
Write-Output "Codex theme runtime is active on 127.0.0.1:$Port."
