$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

$sdkDir = Join-Path $env:LOCALAPPDATA 'Android\Sdk'
if ($env:ANDROID_SDK_ROOT -match '^[A-Za-z]:\\') { $sdkDir = $env:ANDROID_SDK_ROOT }
if ($env:ANDROID_HOME -match '^[A-Za-z]:\\') { $sdkDir = $env:ANDROID_HOME }

$adb = Join-Path $sdkDir 'platform-tools\adb.exe'
$emulator = Join-Path $sdkDir 'emulator\emulator.exe'
$avdName = 'Medium_Phone_API_36.1'

if (!(Test-Path $adb)) {
  Write-Error "adb not found: $adb"
}

if (!(Test-Path $emulator)) {
  Write-Error "emulator not found: $emulator"
}

Write-Host '[1/5] Cleaning stale emulator processes...'
Get-Process -Name 'emulator' -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process -Name 'qemu-system-x86_64' -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host '[2/5] Resetting adb server...'
& $adb kill-server | Out-Null
& $adb start-server | Out-Null

Write-Host "[3/5] Starting emulator $avdName (cold boot)..."
Start-Process -FilePath $emulator -ArgumentList @("@$avdName", '-no-snapshot-load', '-no-snapshot-save', '-netdelay', 'none', '-netspeed', 'full') | Out-Null

Write-Host '[4/5] Waiting for emulator to become online...'
$emuId = $null
for ($i = 0; $i -lt 180; $i++) {
  $deviceLines = (& $adb devices) | Select-String -Pattern '^emulator-\d+\s+device$'
  if ($deviceLines) {
    $emuId = ($deviceLines[0].ToString() -split '\s+')[0]
    break
  }
  Start-Sleep -Seconds 1
}

if (-not $emuId) {
  Write-Error 'Emulator did not become available within 180s.'
}

Write-Host "Found device: $emuId"
Write-Host 'Waiting for Android boot completion...'

$bootOk = $false
for ($i = 0; $i -lt 180; $i++) {
  $boot = (& $adb -s $emuId shell getprop sys.boot_completed 2>$null).Trim()
  if ($boot -eq '1') {
    $bootOk = $true
    break
  }
  Start-Sleep -Seconds 2
}

if (-not $bootOk) {
  Write-Error 'Android boot not completed within timeout.'
}

Write-Host '[5/5] Boot complete. Launching Expo on Android...'
& npm run android
exit $LASTEXITCODE
