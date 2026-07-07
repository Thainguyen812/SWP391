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

d:\CodeProject\SWP391\cloudflared.exe tunnel --url http://127.0.0.1:5173

pause
