@echo off
REM Script to switch MongoDB Statistics Docker container between development and production modes

SET MODE=%1

IF "%MODE%"=="dev" GOTO dev
IF "%MODE%"=="development" GOTO dev
IF "%MODE%"=="prod" GOTO prod
IF "%MODE%"=="production" GOTO prod

echo Error: Please specify mode (dev/development or prod/production)
echo Usage: docker-mode.bat dev^|prod
GOTO end

:dev
echo Switching to Development Mode...
echo services: > docker-compose.yml
echo   mongodb-statistics: >> docker-compose.yml
echo     build: >> docker-compose.yml
echo       context: . >> docker-compose.yml
echo       dockerfile: Dockerfile >> docker-compose.yml
echo       target: development >> docker-compose.yml
echo     ports: >> docker-compose.yml
echo       - "3000:3000" >> docker-compose.yml
echo     restart: unless-stopped >> docker-compose.yml
echo     environment: >> docker-compose.yml
echo       - NODE_ENV=development >> docker-compose.yml
echo     volumes: >> docker-compose.yml
echo       - .:/app >> docker-compose.yml
echo       - /app/node_modules >> docker-compose.yml
echo       - /app/.next >> docker-compose.yml
echo     command: npm run dev >> docker-compose.yml
echo Configuration updated for development mode
GOTO instructions

:prod
echo Switching to Production Mode...
echo services: > docker-compose.yml
echo   mongodb-statistics: >> docker-compose.yml
echo     build: >> docker-compose.yml
echo       context: . >> docker-compose.yml
echo       dockerfile: Dockerfile >> docker-compose.yml
echo       target: production >> docker-compose.yml
echo     ports: >> docker-compose.yml
echo       - "3000:3000" >> docker-compose.yml
echo     restart: unless-stopped >> docker-compose.yml
echo     environment: >> docker-compose.yml
echo       - NODE_ENV=production >> docker-compose.yml
echo       - NEXT_TELEMETRY_DISABLED=1 >> docker-compose.yml
echo     healthcheck: >> docker-compose.yml
echo       test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000"] >> docker-compose.yml
echo       interval: 30s >> docker-compose.yml
echo       timeout: 10s >> docker-compose.yml
echo       retries: 3 >> docker-compose.yml
echo       start_period: 10s >> docker-compose.yml
echo Configuration updated for production mode
GOTO instructions

:instructions
echo.
echo To apply changes, run:
echo docker-compose down
echo docker-compose up -d

:end 