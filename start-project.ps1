# ============================================================================
# HOUSE AI - Windows PowerShell Multi-Service Startup Script
# Checks MongoDB connectivity and launches Python ML, Express Backend, and Vite Frontend
# ============================================================================

$ErrorActionPreference = "Continue"
$RootDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  HOUSE AI - INDIA-WIDE AI REAL ESTATE PRICE PREDICTION PLATFORM" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan

# 1. Check MongoDB connectivity on 127.0.0.1:27017
Write-Host "`n[1/4] Checking MongoDB connection on 127.0.0.1:27017..." -ForegroundColor Yellow
$tcpClient = New-Object System.Net.Sockets.TcpClient
try {
    $asyncResult = $tcpClient.BeginConnect("127.0.0.1", 27017, $null, $null)
    $wait = $asyncResult.AsyncWaitHandle.WaitOne(2500, $false)
    if ($wait -and $tcpClient.Connected) {
        Write-Host "      [OK] MongoDB is accepting connections on 127.0.0.1:27017." -ForegroundColor Green
        $tcpClient.Close()
    } else {
        Write-Host "      [WARNING] MongoDB is not reachable on 127.0.0.1:27017." -ForegroundColor Red
        Write-Host "      Please start MongoDB Community Server (net start MongoDB) or configure MONGO_URI in backend/.env." -ForegroundColor Red
    }
} catch {
    Write-Host "      [WARNING] Could not verify MongoDB on 127.0.0.1:27017: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Start Python Flask ML Microservice (Port 8000)
$MlDir = Join-Path $RootDir "ml-model"
$VenvPython = Join-Path $MlDir "venv\Scripts\python.exe"
$ModelFile = Join-Path $MlDir "models\best_house_price_model.joblib"

if (-not (Test-Path $ModelFile)) {
    Write-Host "`n[ML Setup] Model artifact not found. Running initial training (train.py)..." -ForegroundColor Yellow
    Push-Location $MlDir
    & $VenvPython train.py
    Pop-Location
}

Write-Host "`n[2/4] Launching Python Flask ML Service on http://127.0.0.1:8000 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$MlDir'; .\venv\Scripts\Activate.ps1; python app.py"

# 3. Start Node.js + Express Backend (Port 5000)
$BackendDir = Join-Path $RootDir "backend"
Write-Host "[3/4] Launching Node.js + Express Backend on http://localhost:5000 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$BackendDir'; npm run dev"

# 4. Start React + Vite Frontend (Port 5173)
$FrontendDir = Join-Path $RootDir "frontend"
Write-Host "[4/4] Launching React + Vite Frontend on http://localhost:5173 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$FrontendDir'; npm run dev"

Write-Host "`n================================================================" -ForegroundColor Green
Write-Host "  All three HOUSE AI service windows have been launched:" -ForegroundColor Green
Write-Host "  - Frontend UI  : http://localhost:5173" -ForegroundColor White
Write-Host "  - Backend API  : http://localhost:5000/api/health" -ForegroundColor White
Write-Host "  - Python ML API: http://127.0.0.1:8000/info" -ForegroundColor White
Write-Host "================================================================" -ForegroundColor Green
