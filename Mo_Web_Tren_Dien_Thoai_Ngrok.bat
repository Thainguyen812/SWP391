@echo off
title Khoi Dong Web Cho Dien Thoai (Ngrok Tunnel)
color 0B
echo.
echo ==================================================================
echo       DANG KHOI TAO NGROK TUNNEL CHO DIEN THOAI...
echo ==================================================================
echo.
echo Yeu cau:
echo - Frontend dang chay tai http://localhost:5173
echo - Backend dang chay tai http://localhost:8080
echo.
echo Sau khi chay thanh cong, tim dong:
echo Forwarding  https://...ngrok-free.app  -^>  http://localhost:5173
echo.
echo Copy link https://...ngrok-free.app do mo tren dien thoai.
echo.

set "SCRIPT_DIR=%~dp0"
set "NGROK_PATH=%SCRIPT_DIR%ngrok\ngrok.exe"

IF NOT EXIST "%NGROK_PATH%" (
    echo Khong tim thay ngrok.exe tai: %NGROK_PATH%
    echo Vui long giai nen ngrok.zip vao thu muc ngrok.
    pause
    exit /b 1
)

"%NGROK_PATH%" http http://127.0.0.1:5173

pause
