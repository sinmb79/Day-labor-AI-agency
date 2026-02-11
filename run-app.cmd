<<<<<<< HEAD
@echo off
echo ========================================
echo DLAI Local Demo Runner
echo ========================================

echo [1/3] Installing Server Dependencies...
cd code\server
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install server dependencies.
    pause
    exit /b
)

echo [2/3] Installing Client Dependencies...
cd ..\client
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install client dependencies.
    pause
    exit /b
)

echo [3/3] Starting Services...
echo Starting Backend on Port 3001...
start "DLAI Backend" npm run dev

echo Starting Frontend on Port 5173...
cd ..\client
start "DLAI Frontend" npm run dev

echo ========================================
echo DLAI is running!
echo Frontend: http://localhost:5173
echo Backend: http://localhost:3001
echo ========================================
pause
=======
@echo off
echo ========================================
echo DLAI Local Demo Runner
echo ========================================

echo [1/3] Installing Server Dependencies...
cd code\server
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install server dependencies.
    pause
    exit /b
)

echo [2/3] Installing Client Dependencies...
cd ..\client
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install client dependencies.
    pause
    exit /b
)

echo [3/3] Starting Services...
echo Starting Backend on Port 3001...
start "DLAI Backend" npm run dev

echo Starting Frontend on Port 5173...
cd ..\client
start "DLAI Frontend" npm run dev

echo ========================================
echo DLAI is running!
echo Frontend: http://localhost:5173
echo Backend: http://localhost:3001
echo ========================================
pause
>>>>>>> 9ebe4e667fc78261a955085774a61d45f4038ddd
