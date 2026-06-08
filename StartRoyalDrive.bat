@echo off
echo Starting RoyalDrive Mobility...
start /min cmd /c "cd /d C:\Users\wilso\Documents\royaldrive\backend && pocketbase serve --http=0.0.0.0:8090"
timeout /t 3
start /min cmd /c "cd /d C:\Users\wilso\Documents\royaldrive\frontend && npm run start -- --hostname 0.0.0.0 --port 3000"
timeout /t 8
start "" "C:\Users\wilso\Documents\royaldrive\dist\RoyalDrive Mobility 1.0.0.exe"
exit
