@echo off
title IE221 - Launch Fullstack Project
cd /d "%~dp0"
echo Launching Backend and Frontend...
start "IE221 Backend" cmd /c "run_backend.bat"
start "IE221 Frontend" cmd /c "run_frontend.bat"
echo Done. You can access:
echo   - Web App:      http://localhost:5173
echo   - Swagger Docs: http://localhost:8000/docs
