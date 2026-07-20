$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$appRoot = Join-Path $root "desktop-app"
Set-Location $appRoot

if (-not (Test-Path "node_modules")) {
  npm install
}

npm start
