$ErrorActionPreference = "Stop"
$RootDir = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$MlDir = Join-Path $RootDir "ml-model"
$BackendDir = Join-Path $RootDir "backend"
$FrontendDir = Join-Path $RootDir "frontend"

$mlProc = $null
$backendProc = $null
$frontendProc = $null
$backendOut = Join-Path $env:TEMP "house_ai_backend_out.log"
$backendErr = Join-Path $env:TEMP "house_ai_backend_err.log"

function Stop-PortProcesses([int[]]$ports) {
    foreach ($p in $ports) {
        $conns = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue
        foreach ($c in $conns) {
            if ($c.OwningProcess -gt 4) {
                Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue
            }
        }
    }
}

try {
    Write-Host "[Step 0] Ensuring clean ports (8000, 5000, 5173)..."
    Stop-PortProcesses @(8000, 5000, 5173)
    Start-Sleep -Seconds 1

    Write-Host "[Step 1] Starting Python Flask ML Service on 127.0.0.1:8000..."
    $VenvPy = Join-Path $MlDir "venv\Scripts\python.exe"
    $mlProc = Start-Process -FilePath $VenvPy -ArgumentList "app.py" -WorkingDirectory $MlDir -PassThru -WindowStyle Hidden
    Start-Sleep -Seconds 3

    Write-Host "[Step 2] Starting Node.js Express Backend on 127.0.0.1:5000..."
    if (Test-Path $backendOut) { Remove-Item $backendOut -Force }
    if (Test-Path $backendErr) { Remove-Item $backendErr -Force }
    $backendProc = Start-Process -FilePath "node" -ArgumentList "server.js" -WorkingDirectory $BackendDir -RedirectStandardOutput $backendOut -RedirectStandardError $backendErr -PassThru -WindowStyle Hidden

    $ready = $false
    for ($i = 0; $i -lt 45; $i++) {
        Start-Sleep -Seconds 2
        if ($backendProc.HasExited) {
            Write-Host "--- BACKEND STDOUT ---"
            if (Test-Path $backendOut) { Get-Content $backendOut }
            Write-Host "--- BACKEND STDERR ---"
            if (Test-Path $backendErr) { Get-Content $backendErr }
            throw "Backend process exited unexpectedly with code $($backendProc.ExitCode)"
        }
        try {
            $hRes = Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/health" -TimeoutSec 3
            if ($hRes.success -and $hRes.mongodb.connected) {
                $ready = $true
                Write-Host "[PASS] Express Backend & MongoDB Ready (Mode: $($hRes.mongodb.mode), DB: $($hRes.mongodb.database))"
                break
            }
        } catch {
            # Waiting
        }
    }

    if (-not $ready) {
        Write-Host "--- BACKEND STDOUT ---"
        if (Test-Path $backendOut) { Get-Content $backendOut }
        Write-Host "--- BACKEND STDERR ---"
        if (Test-Path $backendErr) { Get-Content $backendErr }
        throw "Express Backend or MongoDB did not become ready within timeout."
    }

    Write-Host "[Step 3] Starting Vite React Frontend on 127.0.0.1:5173..."
    $ViteCli = Join-Path $FrontendDir "node_modules\vite\bin\vite.js"
    $frontendProc = Start-Process -FilePath "node" -ArgumentList "`"$ViteCli`" --port 5173" -WorkingDirectory $FrontendDir -PassThru -WindowStyle Hidden
    Start-Sleep -Seconds 3

    Write-Host "[Step 4] Probing Frontend HTTP response on http://localhost:5173 ..."
    $feRes = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -TimeoutSec 5
    Write-Host "[PASS] Frontend HTTP Probe Status: $($feRes.StatusCode) (Contains HOUSE AI root HTML)"

    Write-Host "[Step 5] Running End-to-End Integration Test Suite (scripts/test-e2e.js)..."
    & node (Join-Path $RootDir "scripts\test-e2e.js")
    if ($LASTEXITCODE -ne 0) {
        throw "End-to-End test suite exited with code $LASTEXITCODE"
    }
} finally {
    if ($frontendProc -and -not $frontendProc.HasExited) { Stop-Process -Id $frontendProc.Id -Force -ErrorAction SilentlyContinue }
    if ($backendProc -and -not $backendProc.HasExited) { Stop-Process -Id $backendProc.Id -Force -ErrorAction SilentlyContinue }
    if ($mlProc -and -not $mlProc.HasExited) { Stop-Process -Id $mlProc.Id -Force -ErrorAction SilentlyContinue }
    Stop-PortProcesses @(8000, 5000, 5173)
}
