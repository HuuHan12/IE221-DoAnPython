@echo off
title IE221 Backend (FastAPI)
echo Starting Backend API at http://127.0.0.1:8000 ...
cd /d "%~dp0"
call .\.venv\Scripts\activate.bat
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
pause
