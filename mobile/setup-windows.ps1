$ErrorActionPreference = "Stop"

Write-Host "Tripownia Android - konfiguracja Windows" -ForegroundColor Cyan

function Require-Command($name, $help) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    Write-Host "Brak: $name" -ForegroundColor Red
    Write-Host $help -ForegroundColor Yellow
    exit 1
  }
}

Require-Command "node" "Zainstaluj Node.js LTS, uruchom ponownie PowerShell i odpal skrypt jeszcze raz."
Require-Command "npm" "Node.js jest niekompletny - npm nie jest dostepny."
Require-Command "java" "Zainstaluj Android Studio z JDK albo JDK 21, potem uruchom skrypt ponownie."

Write-Host "Node: $(node -v)"
Write-Host "npm:  $(npm -v)"
Write-Host "Java:" 
java -version

Push-Location $PSScriptRoot
try {
  Write-Host "Instaluję zależności mobilne..." -ForegroundColor Cyan
  npm install

  if (-not (Test-Path "android")) {
    Write-Host "Generuję projekt Android..." -ForegroundColor Cyan
    npx cap add android
  } else {
    Write-Host "Projekt Android już istnieje - pomijam cap add." -ForegroundColor DarkGray
  }

  Write-Host "Synchronizuję Capacitor..." -ForegroundColor Cyan
  npx cap sync android

  Write-Host "Buduję debug APK..." -ForegroundColor Cyan
  if (Test-Path ".\android\gradlew.bat") {
    & .\android\gradlew.bat -p android assembleDebug
  } else {
    Write-Host "Nie znaleziono android\gradlew.bat" -ForegroundColor Red
    exit 1
  }

  $apk = Join-Path $PSScriptRoot "android\app\build\outputs\apk\debug\app-debug.apk"
  if (Test-Path $apk) {
    Write-Host "Gotowe. APK:" -ForegroundColor Green
    Write-Host $apk -ForegroundColor Green
  }

  $studioCandidates = @(
    "$env:ProgramFiles\Android\Android Studio\bin\studio64.exe",
    "$env:LOCALAPPDATA\Programs\Android Studio\bin\studio64.exe"
  )
  $studio = $studioCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1

  if ($studio) {
    Write-Host "Otwieram Android Studio..." -ForegroundColor Cyan
    Start-Process $studio (Join-Path $PSScriptRoot "android")
  } else {
    Write-Host "APK jest zbudowane. Android Studio nie zostało znalezione automatycznie." -ForegroundColor Yellow
    Write-Host "Otwórz ręcznie folder: $PSScriptRoot\android" -ForegroundColor Yellow
  }
}
finally {
  Pop-Location
}
