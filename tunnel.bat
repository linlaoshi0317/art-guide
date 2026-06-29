@echo off
cd /d "C:\Users\蔺先生\Documents\提升孩子作品审美的技能skill\ios-art-guide-prototype"
echo ============================================
echo   正在启动公网隧道...
echo   按 Ctrl+C 可以停止
echo ============================================
echo.
:loop
ssh -o StrictHostKeyChecking=no -o ServerAliveInterval=30 -R 80:localhost:8787 serveo.net 2> tunnel-url.txt
echo 隧道断开，5秒后重连...
timeout /t 5 >nul
goto loop
