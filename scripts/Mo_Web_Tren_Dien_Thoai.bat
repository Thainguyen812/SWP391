@echo off
title Khoi Dong Web Cho Dien Thoai (Cloudflare Tunnel)
color 0A
echo.
echo ==================================================================
echo       DANG KHOI TAO DUONG HAM KET NOI TOI DIEN THOAI...
echo ==================================================================
echo.
echo Vui long doi khoang 3-5 giay de he thong tao link ngau nhien...
echo.
echo ------------------------------------------------------------------
echo DONG QUAN TRONG NHAT CAN TIM BEN DUOI:
echo "Your quick Tunnel has been created! Visit it at: https://..."
echo ------------------------------------------------------------------
echo.
echo Bat dau tao duong ham...
echo.

set "SCRIPT_DIR=%~dp0"
set "CLOUDFLARED_PATH=%SCRIPT_DIR%cloudflared.exe"

IF NOT EXIST "%CLOUDFLARED_PATH%" (
    echo.
    echo Dang tai cong cu Cloudflare ^(chi phai tai lan dau tien tren may nay^)...
    powershell -Command "Invoke-WebRequest -Uri https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe -OutFile '%CLOUDFLARED_PATH%'"
    echo Tai xong! Bat dau tao duong ham...
)

"%CLOUDFLARED_PATH%" tunnel --url http://127.0.0.1:5173

pause
