param(
  [Alias("id")]
  [Parameter(Mandatory = $true)]
  [ValidatePattern("^[A-Za-z0-9_-]{1,80}$")]
  [string]$ThemeId
)

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "common-windows.ps1")

Initialize-ThemeRuntimeDirectories
$source = Join-Path $script:ThemesRoot $ThemeId
if (-not (Test-Path -LiteralPath (Join-Path $source "theme.json") -PathType Leaf)) {
  throw "Theme not found: $ThemeId"
}
$node = Get-ThemeNodeRuntime
$stage = Join-Path $script:DataRoot (".theme-switch-" + [Guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $stage | Out-Null
try {
  Invoke-ThemeNode -NodePath $node -Arguments @($script:StageThemePath, $source, $stage)
  Invoke-ThemeNode -NodePath $node -Arguments @($script:InjectorPath, "--check-payload", "--theme-dir", $stage)
  Publish-StagedTheme -StageRoot $stage
} finally {
  if (Test-Path -LiteralPath $stage) { Remove-Item -LiteralPath $stage -Recurse -Force }
}
& (Join-Path $PSScriptRoot "start-theme-windows.ps1")
