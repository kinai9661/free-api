@echo off
REM API Airforce Gateway - Deployment Script for Windows
REM This script deploys the Worker and Web UI to Cloudflare

echo ==========================================
echo API Airforce Gateway - Deployment Script
echo ==========================================
echo.

REM Check if wrangler is installed
where wrangler >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Wrangler CLI is not installed.
    echo Please install it with: npm install -g wrangler
    exit /b 1
)

echo [OK] Wrangler CLI found
echo.

REM Check if user is logged in
echo Checking Cloudflare authentication...
wrangler whoami >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Not logged in to Cloudflare.
    echo Please login with: wrangler login
    exit /b 1
)

echo [OK] Logged in to Cloudflare
echo.

REM Deploy Worker
echo ==========================================
echo Deploying Worker...
echo ==========================================
call wrangler deploy

if %errorlevel% neq 0 (
    echo [ERROR] Worker deployment failed
    exit /b 1
)

echo.
echo [OK] Worker deployed successfully
echo.

REM Deploy Web UI to R2
echo ==========================================
echo Deploying Web UI to R2...
echo ==========================================

echo Uploading index.html...
call wrangler r2 object put api-airforce-gateway/web-ui/index.html --file=web-ui/index.html

echo Uploading CSS...
call wrangler r2 object put api-airforce-gateway/web-ui/css/styles.css --file=web-ui/css/styles.css

echo Uploading JavaScript files...
call wrangler r2 object put api-airforce-gateway/web-ui/js/app.js --file=web-ui/js/app.js
call wrangler r2 object put api-airforce-gateway/web-ui/js/pages/dashboard.js --file=web-ui/js/pages/dashboard.js
call wrangler r2 object put api-airforce-gateway/web-ui/js/pages/apikeys.js --file=web-ui/js/pages/apikeys.js
call wrangler r2 object put api-airforce-gateway/web-ui/js/pages/monitoring.js --file=web-ui/js/pages/monitoring.js
call wrangler r2 object put api-airforce-gateway/web-ui/js/pages/logs.js --file=web-ui/js/pages/logs.js
call wrangler r2 object put api-airforce-gateway/web-ui/js/pages/settings.js --file=web-ui/js/pages/settings.js

echo.
echo [OK] Web UI deployed successfully
echo.

REM Set up secrets (if not already set)
echo ==========================================
echo Setting up secrets...
echo ==========================================

echo Checking for API_AIRFORCE_KEY...
call wrangler secret list | findstr "API_AIRFORCE_KEY" >nul
if %errorlevel% neq 0 (
    echo Please enter your api.airforce API key:
    set /p API_KEY="> "
    echo %API_KEY% | wrangler secret put API_AIRFORCE_KEY
    echo [OK] API_AIRFORCE_KEY set
) else (
    echo [OK] API_AIRFORCE_KEY already set
)

echo.
echo Checking for ADMIN_API_KEY...
call wrangler secret list | findstr "ADMIN_API_KEY" >nul
if %errorlevel% neq 0 (
    echo Please enter your admin API key (or press Enter to generate one):
    set /p ADMIN_KEY="> "
    if "%ADMIN_KEY%"=="" (
        set ADMIN_KEY=sk-%RANDOM%%RANDOM%%RANDOM%%RANDOM%%RANDOM%%RANDOM%
    )
    echo %ADMIN_KEY% | wrangler secret put ADMIN_API_KEY
    echo [OK] ADMIN_API_KEY set
    echo.
    echo [IMPORTANT] Save your admin API key: %ADMIN_KEY%
) else (
    echo [OK] ADMIN_API_KEY already set
)

echo.
echo ==========================================
echo Deployment completed successfully!
echo ==========================================
echo.
echo Your API Gateway is now live!
echo.
echo Next steps:
echo 1. Visit your Worker URL to access the Web UI
echo 2. Login with your admin API key
echo 3. Create API keys for your applications
echo.

pause
