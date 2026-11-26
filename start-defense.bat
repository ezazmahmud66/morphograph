@echo off
setlocal

cd /d "%~dp0"

echo ========================================
echo    MORPHOGRAPH - CAPSTONE DEFENSE
echo ========================================

if not exist "backend\.venv\Scripts\python.exe" (
    echo ERROR: Backend Python environment missing.
    pause
    exit /b 1
)

if not exist "frontend\node_modules" (
    echo ERROR: Frontend dependencies missing.
    pause
    exit /b 1
)

echo Starting FastAPI Backend...
start "MorphoGraph Backend" cmd /k "cd /d ""%~dp0"" && backend\.venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000"

echo Starting React Frontend...
start "MorphoGraph Frontend" cmd /k "cd /d ""%~dp0frontend"" && npm run dev -- --host 127.0.0.1"

echo.
echo Backend:  http://127.0.0.1:8000
echo Frontend: http://localhost:5173
echo.
echo Keep both terminal windows open during defense.
echo ========================================

pause
