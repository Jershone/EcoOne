$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
if (-not (Get-Command node -ErrorAction SilentlyContinue) -or -not (Get-Command npm -ErrorAction SilentlyContinue)) {
  Write-Host "EcoOne needs Node.js 22 or newer. Install it from https://nodejs.org/" -ForegroundColor Yellow
  exit 1
}
$major = [int](node -p "process.versions.node.split('.')[0]")
if ($major -lt 22) { throw "EcoOne needs Node.js 22 or newer." }
if (-not (Test-Path "node_modules\ws")) {
  Write-Host "Installing EcoOne dependencies..." -ForegroundColor Cyan
  npm install --no-audit --no-fund
  if ($LASTEXITCODE -ne 0) { throw "Dependency installation failed." }
}
Write-Host "Starting EcoOne private server..." -ForegroundColor Cyan
npm start
