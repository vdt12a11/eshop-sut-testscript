param(
 [string]$SutRoot = $env:HW02_SUT,
 [string]$AndroidSerial = 'emulator-5556',
 [string]$Node = 'node',
 [string]$NpmCli = ''
)
$ErrorActionPreference = 'Stop'
$hw02Root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
if (-not $SutRoot) { $SutRoot = Join-Path (Split-Path $hw02Root -Parent) 'eshop-sut' }
$mobileSource = Join-Path $SutRoot 'frontend-mobile'
$mobileRuntime = Join-Path $hw02Root 'runtime/mobile-app'
New-Item -ItemType Directory -Path $mobileRuntime -Force | Out-Null
foreach ($name in @('App.js','index.js','app.json','package.json','package-lock.json')) {
 Copy-Item -LiteralPath (Join-Path $mobileSource $name) -Destination (Join-Path $mobileRuntime $name)
}
Copy-Item -LiteralPath (Join-Path $mobileSource 'assets') -Destination $mobileRuntime -Recurse -Force
Push-Location $mobileRuntime
try {
 if ($NpmCli) { & $Node $NpmCli ci --ignore-scripts --no-audit --no-fund }
 else { & npm ci --ignore-scripts --no-audit --no-fund }
 if ($LASTEXITCODE -ne 0) { throw 'npm ci failed' }
} finally { Pop-Location }
$runtimeDir = Join-Path $hw02Root 'runtime'
$expoApk = Join-Path $runtimeDir 'Expo-Go-54.0.8.apk'
if (-not (Test-Path -LiteralPath $expoApk)) {
 Invoke-WebRequest -Uri 'https://github.com/expo/expo-go-releases/releases/download/Expo-Go-54.0.8/Expo-Go-54.0.8.apk' -OutFile $expoApk
}
$uiaDir = Join-Path $runtimeDir 'uiautomator2'
New-Item -ItemType Directory -Path $uiaDir -Force | Out-Null
$uiaArchive = Join-Path $uiaDir 'server.tgz'
Invoke-WebRequest -Uri 'https://registry.npmjs.org/appium-uiautomator2-server/-/appium-uiautomator2-server-10.7.0.tgz' -OutFile $uiaArchive
& tar -xf $uiaArchive -C $uiaDir
if ($LASTEXITCODE -ne 0) { throw 'Cannot unpack UiAutomator2 server APKs' }
foreach ($apk in @($expoApk,(Join-Path $uiaDir 'package/apks/appium-uiautomator2-server-v10.7.0.apk'),(Join-Path $uiaDir 'package/apks/appium-uiautomator2-server-debug-androidTest.apk'))) {
 & adb -s $AndroidSerial install -r $apk
 if ($LASTEXITCODE -ne 0) { throw "Cannot install $apk" }
}
Write-Output 'Native test dependencies ready. Start the dedicated test emulator before running Jest.'
