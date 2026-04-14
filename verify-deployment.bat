@echo off
REM Task Management System - Pre-Deployment Verification Script (Windows)
REM Run this in Command Prompt to verify everything is ready for deployment

setlocal enabledelayedexpansion

echo.
echo ================================
echo Pre-Deployment Verification
echo ================================
echo.

REM Check 1: Backend directory exists
echo 1. Checking project structure...
if exist "Backend" (
    echo [OK] Backend directory found
) else (
    echo [ERROR] Backend directory not found
    exit /b 1
)

if exist "Frontend" (
    echo [OK] Frontend directory found
) else (
    echo [ERROR] Frontend directory not found
    exit /b 1
)

REM Check 2: Configuration files exist
echo.
echo 2. Checking configuration files...
if exist "Backend\render.yaml" (
    echo [OK] Backend\render.yaml exists
) else (
    echo [ERROR] Backend\render.yaml not found
    exit /b 1
)

if exist "Backend\server.js" (
    echo [OK] Backend\server.js exists
) else (
    echo [ERROR] Backend\server.js not found
    exit /b 1
)

if exist "Frontend\vite.config.ts" (
    echo [OK] Frontend\vite.config.ts exists
) else (
    echo [ERROR] Frontend\vite.config.ts not found
    exit /b 1
)

REM Check 3: Environment files
echo.
echo 3. Checking environment files...
if exist "Backend\.env" (
    echo [OK] Backend\.env exists
) else (
    echo [WARNING] Backend\.env not found - create from .env.example
)

if exist "Frontend\.env" (
    echo [OK] Frontend\.env exists
) else (
    echo [WARNING] Frontend\.env not found - create from .env.example
)

if exist "Frontend\.env.production" (
    echo [OK] Frontend\.env.production exists
) else (
    echo [WARNING] Frontend\.env.production not found - you'll need this for Vercel
)

REM Check 4: package.json files
echo.
echo 4. Checking package.json files...
if exist "Backend\package.json" (
    echo [OK] Backend\package.json exists
) else (
    echo [ERROR] Backend\package.json not found
    exit /b 1
)

if exist "Frontend\package.json" (
    echo [OK] Frontend\package.json exists
) else (
    echo [ERROR] Frontend\package.json not found
    exit /b 1
)

REM Check 5: Documentation
echo.
echo 5. Checking documentation...
if exist "DEPLOYMENT_GUIDE.md" (
    echo [OK] DEPLOYMENT_GUIDE.md exists
)
if exist "DEPLOYMENT_READY.md" (
    echo [OK] DEPLOYMENT_READY.md exists
)
if exist "API_ENDPOINTS.md" (
    echo [OK] API_ENDPOINTS.md exists
)
if exist "TESTING_GUIDE.md" (
    echo [OK] TESTING_GUIDE.md exists
)

REM Check 6: Git setup
echo.
echo 6. Checking git setup...
if exist ".gitignore" (
    echo [OK] .gitignore exists
) else (
    echo [WARNING] .gitignore not found
)

REM Summary
echo.
echo ================================
echo Verification Complete!
echo ================================
echo.
echo Next steps:
echo 1. Review DEPLOYMENT_READY.md
echo 2. Follow DEPLOYMENT_GUIDE.md to deploy
echo 3. Use TESTING_GUIDE.md to test endpoints
echo.
echo Key items to verify manually:
echo - [ ] Backend\.env has database URI
echo - [ ] Backend\.env has strong JWT secrets (32+ chars)
echo - [ ] Frontend\.env.production has correct API URL
echo - [ ] All .env files are in .gitignore
echo - [ ] Run 'npm run build' locally to test builds
echo.

pause
