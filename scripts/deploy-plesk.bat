@echo off
REM 🚀 Batch Script for Plesk Deployment
REM این اسکریپت برای deployment ساده به سرور ویندوزی پلسک

setlocal enabledelayedexpansion

REM تنظیم رنگ‌ها
set "GREEN=[92m"
set "RED=[91m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "NC=[0m"

REM پارامترهای پیش‌فرض
set "VERSION_TYPE=patch"
set "SKIP_BUILD=false"

REM پردازش آرگومان‌ها
:parse_args
if "%~1"=="" goto :start_deployment
if "%~1"=="--version-type" (
    set "VERSION_TYPE=%~2"
    shift
    shift
    goto :parse_args
)
if "%~1"=="--skip-build" (
    set "SKIP_BUILD=true"
    shift
    goto :parse_args
)
if "%~1"=="--help" (
    goto :show_help
)
shift
goto :parse_args

:show_help
echo %GREEN%🚀 Plesk Deployment Script%NC%
echo.
echo Usage: deploy-plesk.bat [options]
echo.
echo Options:
echo   --version-type TYPE    Version type (patch/minor/major) [default: patch]
echo   --skip-build          Skip the build process
echo   --help                Show this help message
echo.
echo Examples:
echo   deploy-plesk.bat
echo   deploy-plesk.bat --version-type minor
echo   deploy-plesk.bat --skip-build
goto :eof

:start_deployment
echo %GREEN%🚀 Starting Plesk Deployment%NC%
echo %GREEN%============================%NC%
echo.

REM بررسی پیش‌نیازها
echo %BLUE%🔍 Checking prerequisites...%NC%

REM بررسی Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo %RED%❌ Node.js not found. Please install Node.js%NC%
    exit /b 1
)
echo %GREEN%✅ Node.js found%NC%

REM بررسی npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo %RED%❌ npm not found%NC%
    exit /b 1
)
echo %GREEN%✅ npm found%NC%

REM آپدیت version
echo.
echo %BLUE%🔄 Updating version (%VERSION_TYPE%)...%NC%
call npm run version:%VERSION_TYPE%
if errorlevel 1 (
    echo %RED%❌ Failed to update version%NC%
    exit /b 1
)

REM خواندن version جدید
for /f "tokens=2 delims=:" %%a in ('findstr "version" version.json') do (
    set "NEW_VERSION=%%a"
    set "NEW_VERSION=!NEW_VERSION: =!"
    set "NEW_VERSION=!NEW_VERSION:"=!"
    set "NEW_VERSION=!NEW_VERSION:,=!"
)
echo %GREEN%✅ Version updated to: %NEW_VERSION%%NC%

REM Build (اگر skip نشده باشد)
if "%SKIP_BUILD%"=="false" (
    echo.
    echo %BLUE%🏗️ Building application...%NC%
    
    echo %YELLOW%📦 Installing dependencies...%NC%
    call npm ci
    if errorlevel 1 (
        echo %RED%❌ Failed to install dependencies%NC%
        exit /b 1
    )
    
    echo %YELLOW%🔨 Building for production...%NC%
    call npm run build:production
    if errorlevel 1 (
        echo %RED%❌ Build failed%NC%
        exit /b 1
    )
    
    echo %GREEN%✅ Build completed successfully%NC%
) else (
    echo %YELLOW%⏭️ Skipping build process%NC%
)

REM ایجاد فایل‌های پیکربندی
echo.
echo %BLUE%📝 Creating configuration files...%NC%

REM ایجاد web.config
(
echo ^<?xml version="1.0" encoding="UTF-8"?^>
echo ^<configuration^>
echo   ^<system.webServer^>
echo     ^<rewrite^>
echo       ^<rules^>
echo         ^<rule name="React Routes" stopProcessing="true"^>
echo           ^<match url=".*" /^>
echo           ^<conditions logicalGrouping="MatchAll"^>
echo             ^<add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" /^>
echo             ^<add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" /^>
echo           ^</conditions^>
echo           ^<action type="Rewrite" url="/" /^>
echo         ^</rule^>
echo       ^</rules^>
echo     ^</rewrite^>
echo     ^<staticContent^>
echo       ^<mimeMap fileExtension=".json" mimeType="application/json" /^>
echo       ^<mimeMap fileExtension=".woff" mimeType="application/font-woff" /^>
echo       ^<mimeMap fileExtension=".woff2" mimeType="application/font-woff2" /^>
echo     ^</staticContent^>
echo   ^</system.webServer^>
echo ^</configuration^>
) > dist\web.config

REM ایجاد .htaccess
(
echo RewriteEngine On
echo RewriteBase /
echo.
echo # Handle client-side routing
echo RewriteCond %%{REQUEST_FILENAME} !-f
echo RewriteCond %%{REQUEST_FILENAME} !-d
echo RewriteRule . /index.html [L]
echo.
echo # Enable compression
echo ^<IfModule mod_deflate.c^>
echo   AddOutputFilterByType DEFLATE text/plain
echo   AddOutputFilterByType DEFLATE text/html
echo   AddOutputFilterByType DEFLATE text/css
echo   AddOutputFilterByType DEFLATE application/javascript
echo   AddOutputFilterByType DEFLATE application/json
echo ^</IfModule^>
) > dist\.htaccess

echo %GREEN%✅ Configuration files created%NC%

REM ایجاد اطلاعات deployment
echo.
echo %BLUE%📋 Creating deployment info...%NC%

echo %NEW_VERSION% > dist\version.txt
echo %DATE% %TIME% > dist\build-date.txt

REM ایجاد deployment-info.json
(
echo {
echo   "version": "%NEW_VERSION%",
echo   "buildDate": "%DATE% %TIME%",
echo   "platform": "windows-plesk",
echo   "versionType": "%VERSION_TYPE%"
echo }
) > dist\deployment-info.json

echo %GREEN%✅ Deployment info created%NC%

REM نمایش خلاصه
echo.
echo %GREEN%🎉 Deployment Summary%NC%
echo %GREEN%===================%NC%
echo %BLUE%Version: %NEW_VERSION%%NC%
echo %BLUE%Type: %VERSION_TYPE%%NC%
echo %BLUE%Date: %DATE% %TIME%%NC%
echo %BLUE%Platform: Windows Plesk%NC%
echo.
echo %YELLOW%📁 Files are ready in 'dist' folder for upload to Plesk%NC%
echo %YELLOW%   Upload contents of 'dist' folder to your httpdocs directory%NC%
echo.
echo %GREEN%✅ Deployment preparation completed successfully!%NC%

pause
goto :eof