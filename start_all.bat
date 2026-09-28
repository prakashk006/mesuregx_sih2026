@echo off
title MEASUREGX - Unified Stack Starter
echo ========================================================
echo   MEASUREGX - Legal Metrology Unified Platform
echo ========================================================
echo Starting 1. Unified Node.js API + Verification Engine (Port 5000)...
start "MEASUREGX Backend" cmd /k "cd backend && npm start"

echo Starting 2. React / Vite Web Frontend (Port 5173)...
start "MEASUREGX Web Frontend" cmd /k "cd frontend && npm run dev"

echo ========================================================
echo MEASUREGX services launched in background!
echo Web Portal: http://localhost:5173
echo Unified Node.js API: http://localhost:5000/api
echo ========================================================
pause
