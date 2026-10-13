$ErrorActionPreference = 'Stop'
$taskToolRoot = Join-Path $PSScriptRoot '../testing/.tmp/tools'
$taskCli = Join-Path $taskToolRoot 'flyway-13.10.0/flyway.cmd'
New-Item -ItemType Directory -Force -Path $taskToolRoot | Out-Null
if (-not (Test-Path -LiteralPath $taskCli)) {
    $taskArchive = Join-Path $taskToolRoot 'flyway-cli.zip'
    & curl.exe -L --fail --connect-timeout 20 --max-time 300 -o $taskArchive 'https://download.red-gate.com/maven/release/com/redgate/flyway/flyway-commandline/13.10.0/flyway-commandline-13.10.0-windows-x64.zip'
    if ($LASTEXITCODE -ne 0) { throw 'Flyway download failed' }
    Expand-Archive -LiteralPath $taskArchive -DestinationPath $taskToolRoot -Force
}
& $taskCli -v
if ($LASTEXITCODE -ne 0) { throw 'Flyway CLI could not start' }
