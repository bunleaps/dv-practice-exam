@echo off
REM Simple Python HTTP Server for Exam Quiz
REM Make sure Python is installed

cd /d "%~dp0"
echo.
echo ========================================
echo   Starting Exam Practice Quiz Server
echo ========================================
echo.
echo Opening browser to: http://localhost:3000
echo.

python -m http.server 3000

pause
