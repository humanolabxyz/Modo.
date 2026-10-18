@echo off
cd /d "%~dp0"
node "%~dp0scripts\open-local.mjs"
if errorlevel 1 pause
