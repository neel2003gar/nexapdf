@echo off
echo 🔍 NexaPDF Deployment Configuration Verification
echo ==============================================

REM Check if we're in the right directory
if not exist "README.md" (
    echo ❌ Error: Please run this script from the project root directory
    exit /b 1
)
if not exist "frontend" (
    echo ❌ Error: Frontend directory not found
    exit /b 1
)
if not exist "backend" (
    echo ❌ Error: Backend directory not found
    exit /b 1
)

echo.
echo ✅ FRONTEND VERIFICATION
echo ------------------------

REM Check Next.js configuration
findstr /c:"basePath: '/nexapdf'" frontend\next.config.mjs >nul
if %errorlevel%==0 (
    echo ✅ Next.js basePath configured for GitHub Pages
) else (
    echo ❌ Next.js basePath not configured correctly
)

findstr /c:"output: 'export'" frontend\next.config.mjs >nul
if %errorlevel%==0 (
    echo ✅ Next.js static export enabled
) else (
    echo ❌ Next.js static export not enabled
)

REM Check API URL configuration
findstr /c:"nexapdf-backend.onrender.com" frontend\lib\api.ts >nul
if %errorlevel%==0 (
    echo ✅ API URL points to production backend
) else (
    echo ❌ API URL not configured for production
)

REM Check package.json
if exist "frontend\package.json" (
    echo ✅ Frontend package.json exists
    findstr /c:"""next"":" frontend\package.json >nul
    if %errorlevel%==0 (
        echo ✅ Next.js dependency found
    )
) else (
    echo ❌ Frontend package.json missing
)

echo.
echo ✅ BACKEND VERIFICATION
echo -----------------------

REM Check Python runtime
if exist "backend\runtime.txt" (
    echo ✅ Python runtime exists
    type backend\runtime.txt
) else (
    echo ❌ Python runtime.txt missing
)

REM Check requirements
if exist "backend\requirements.txt" (
    echo ✅ Requirements.txt exists
    findstr /c:"Django" backend\requirements.txt >nul
    if %errorlevel%==0 (
        echo ✅ Django dependency found
    )
    findstr /c:"gunicorn" backend\requirements.txt >nul
    if %errorlevel%==0 (
        echo ✅ Gunicorn server found
    )
) else (
    echo ❌ Requirements.txt missing
)

REM Check Procfile
if exist "backend\Procfile" (
    echo ✅ Procfile exists for Render deployment
) else (
    echo ❌ Procfile missing
)

REM Check build script
if exist "backend\build.sh" (
    echo ✅ Build script exists
) else (
    echo ❌ Build script missing
)

REM Check CORS configuration
findstr /c:"neel2003gar.github.io" backend\pdfapp\settings.py >nul
if %errorlevel%==0 (
    echo ✅ CORS configured for GitHub Pages
) else (
    echo ❌ CORS not configured for GitHub Pages
)

echo.
echo ✅ GITHUB ACTIONS VERIFICATION
echo -------------------------------

REM Check workflow file
if exist ".github\workflows\deploy-frontend.yml" (
    echo ✅ GitHub Actions workflow exists
) else (
    echo ❌ GitHub Actions workflow missing
)

echo.
echo 🌐 DEPLOYMENT URLS
echo ------------------
echo Frontend: https://neel2003gar.github.io/nexapdf/
echo Backend:  https://nexapdf-backend.onrender.com/
echo API:      https://nexapdf-backend.onrender.com/api/

echo.
echo 📋 NEXT STEPS FOR DEPLOYMENT
echo -----------------------------
echo 1. Push to GitHub: git add . && git commit -m "Final deployment config" && git push
echo 2. Check GitHub Actions: https://github.com/neel2003gar/nexapdf/actions
echo 3. Set up Render backend environment variables:
echo    - SECRET_KEY (generate a new one)
echo    - DATABASE_URL (provided by Render PostgreSQL)
echo    - EMAIL_HOST_USER ^& EMAIL_HOST_PASSWORD (if using email)
echo 4. Run migrations on Render: python manage.py migrate

echo.
echo ✅ Configuration verification complete!
pause