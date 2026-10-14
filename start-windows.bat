@echo off
chcp 65001 >nul
title AI-bolat server
cd /d "%~dp0"
set "PATH=C:\Program Files\nodejs;%PATH%"
start "" http://localhost:8790
npm start
pause
