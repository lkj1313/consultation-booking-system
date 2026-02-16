param(
  [ValidateSet("up", "down", "logs", "status")]
  [string]$Action = "up"
)

$ErrorActionPreference = "Stop"
$ComposeFile = "infra/compose/docker-compose.dev.yml"

function Test-DockerCli {
  return [bool](Get-Command docker -ErrorAction SilentlyContinue)
}

function Test-DockerEngine {
  $previous = $ErrorActionPreference
  try {
    $ErrorActionPreference = "Continue"
    docker info 1>$null 2>$null
    return $LASTEXITCODE -eq 0
  } finally {
    $ErrorActionPreference = $previous
  }
}

function Start-DockerDesktopIfNeeded {
  if (Test-DockerEngine) {
    return
  }

  $candidates = @(
    "$Env:ProgramFiles\Docker\Docker\Docker Desktop.exe",
    "$Env:LocalAppData\Docker\Docker Desktop.exe"
  )

  $desktopExe = $candidates | Where-Object { Test-Path $_ } | Select-Object -First 1
  if (-not $desktopExe) {
    throw "Docker Engine is not running and Docker Desktop executable was not found."
  }

  Write-Host "Starting Docker Desktop..."
  Start-Process -FilePath $desktopExe | Out-Null

  $maxAttempts = 45
  for ($i = 1; $i -le $maxAttempts; $i++) {
    Start-Sleep -Seconds 2
    if (Test-DockerEngine) {
      Write-Host "Docker Engine is ready."
      return
    }
  }

  throw "Docker Engine did not become ready in time. Open Docker Desktop and retry."
}

function Ensure-DockerReady {
  if (Test-DockerEngine) {
    return
  }

  Start-DockerDesktopIfNeeded

  if (-not (Test-DockerEngine)) {
    throw "Cannot access Docker Engine. If you see 'Access is denied', run this terminal as Administrator or add your Windows user to the 'docker-users' group and sign out/in."
  }
}

if (-not (Test-DockerCli)) {
  throw "Docker CLI is not installed or not available in PATH."
}

if ($Action -eq "up") {
  Ensure-DockerReady
  docker compose -f $ComposeFile up -d
  docker compose -f $ComposeFile ps
  exit $LASTEXITCODE
}

if ($Action -eq "down") {
  Ensure-DockerReady
  docker compose -f $ComposeFile down
  exit $LASTEXITCODE
}

if ($Action -eq "logs") {
  Ensure-DockerReady
  docker compose -f $ComposeFile logs -f postgres
  exit $LASTEXITCODE
}

if ($Action -eq "status") {
  Ensure-DockerReady
  docker compose -f $ComposeFile ps
  exit $LASTEXITCODE
}
