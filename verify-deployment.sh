#!/bin/bash

echo "🔍 NexaPDF Deployment Configuration Verification"
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "README.md" ] || [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo ""
echo "✅ FRONTEND VERIFICATION"
echo "------------------------"

# Check Next.js configuration
if grep -q "basePath: '/nexapdf'" frontend/next.config.mjs; then
    echo "✅ Next.js basePath configured for GitHub Pages"
else
    echo "❌ Next.js basePath not configured correctly"
fi

if grep -q "output: 'export'" frontend/next.config.mjs; then
    echo "✅ Next.js static export enabled"
else
    echo "❌ Next.js static export not enabled"
fi

# Check API URL configuration
if grep -q "nexapdf-backend.onrender.com" frontend/lib/api.ts; then
    echo "✅ API URL points to production backend"
else
    echo "❌ API URL not configured for production"
fi

# Check package.json
if [ -f "frontend/package.json" ]; then
    echo "✅ Frontend package.json exists"
    if grep -q '"next":' frontend/package.json; then
        echo "✅ Next.js dependency found"
    fi
else
    echo "❌ Frontend package.json missing"
fi

echo ""
echo "✅ BACKEND VERIFICATION"
echo "-----------------------"

# Check Python runtime
if [ -f "backend/runtime.txt" ]; then
    python_version=$(cat backend/runtime.txt)
    echo "✅ Python runtime: $python_version"
else
    echo "❌ Python runtime.txt missing"
fi

# Check requirements
if [ -f "backend/requirements.txt" ]; then
    echo "✅ Requirements.txt exists"
    if grep -q "Django" backend/requirements.txt; then
        echo "✅ Django dependency found"
    fi
    if grep -q "gunicorn" backend/requirements.txt; then
        echo "✅ Gunicorn server found"
    fi
else
    echo "❌ Requirements.txt missing"
fi

# Check Procfile
if [ -f "backend/Procfile" ]; then
    echo "✅ Procfile exists for Render deployment"
else
    echo "❌ Procfile missing"
fi

# Check build script
if [ -f "backend/build.sh" ]; then
    echo "✅ Build script exists"
    if [ -x "backend/build.sh" ]; then
        echo "✅ Build script is executable"
    else
        echo "⚠️ Build script not executable (run: chmod +x backend/build.sh)"
    fi
else
    echo "❌ Build script missing"
fi

# Check CORS configuration
if grep -q "neel2003gar.github.io" backend/pdfapp/settings.py; then
    echo "✅ CORS configured for GitHub Pages"
else
    echo "❌ CORS not configured for GitHub Pages"
fi

echo ""
echo "✅ GITHUB ACTIONS VERIFICATION"
echo "-------------------------------"

# Check workflow file
if [ -f ".github/workflows/deploy-frontend.yml" ]; then
    echo "✅ GitHub Actions workflow exists"
    if grep -q "nexapdf-backend.onrender.com" .github/workflows/deploy-frontend.yml; then
        echo "✅ Workflow uses production API URL"
    fi
else
    echo "❌ GitHub Actions workflow missing"
fi

echo ""
echo "🌐 DEPLOYMENT URLS"
echo "------------------"
echo "Frontend: https://neel2003gar.github.io/nexapdf/"
echo "Backend:  https://nexapdf-backend.onrender.com/"
echo "API:      https://nexapdf-backend.onrender.com/api/"

echo ""
echo "📋 NEXT STEPS FOR DEPLOYMENT"
echo "-----------------------------"
echo "1. Push to GitHub: 'git add . && git commit -m \"Final deployment config\" && git push'"
echo "2. Check GitHub Actions: https://github.com/neel2003gar/nexapdf/actions"
echo "3. Set up Render backend environment variables:"
echo "   - SECRET_KEY (generate a new one)"
echo "   - DATABASE_URL (provided by Render PostgreSQL)"
echo "   - EMAIL_HOST_USER & EMAIL_HOST_PASSWORD (if using email)"
echo "4. Run migrations on Render: 'python manage.py migrate'"

echo ""
echo "✅ Configuration verification complete!"