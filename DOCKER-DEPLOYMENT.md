# 🐳 Docker Deployment Guide for Render

## Quick Setup Instructions

### 1. Deploy to Render with Docker

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Create New Web Service**:
   - **Repository**: `neel2003gar/nexapdf` 
   - **Branch**: `main`
   - **Runtime**: **Docker** (not Python!)
   - **Root Directory**: `backend`
   - **Docker Build Context**: `backend`

### 2. Render Configuration

**Basic Settings:**
```
Name: nexapdf-backend
Runtime: Docker
Region: Oregon (US West)
Branch: main
Root Directory: backend
```

**Docker Settings:**
```
Dockerfile Path: Dockerfile
Docker Build Context: backend
Docker Command: (leave empty - uses CMD from Dockerfile)
```

**Environment Variables:**
```
SECRET_KEY=<generate-new-key>
DEBUG=False
ALLOWED_HOSTS=nexapdf-backend.onrender.com
CORS_ALLOWED_ORIGINS=https://neel2003gar.github.io
DATABASE_URL=<provided-by-render-postgresql>
DAILY_OPERATION_LIMIT=10
PORT=<auto-provided-by-render>
```

### 3. Add PostgreSQL Database

1. **In the same service form**:
   - Scroll to "Add Database"
   - Select **PostgreSQL**
   - Database Name: `nexapdf_db`
   - This auto-adds `DATABASE_URL` env var

### 4. Optional: Add Redis (for future caching)

1. **After service creation**:
   - Add Redis addon from Render dashboard
   - This adds `REDIS_URL` env var automatically

## Advantages of Docker Deployment

### ✅ Benefits:
- **Consistent Environment**: Same image runs locally and in production
- **Better Dependency Management**: All system deps included in image
- **Faster Deployments**: No need to install packages on each deploy
- **Health Checks**: Built-in Docker health monitoring
- **Easier Debugging**: Can run identical container locally
- **Version Control**: Docker images are versioned and cacheable

### 🔧 Features Included:
- **Multi-stage builds** for optimal image size
- **Non-root user** for security
- **Health checks** for monitoring
- **Automatic migrations** on startup
- **Static file collection**
- **Database wait logic** for reliable startup
- **Production-ready gunicorn** configuration

## Local Development with Docker

### Run Locally:
```bash
# Build and run with docker-compose
docker-compose -f docker-compose.dev.yml up --build

# Or run just backend
cd backend
docker build -t nexapdf-backend .
docker run -p 8000:8000 -e DEBUG=True nexapdf-backend
```

### Access Points:
- **Backend**: http://localhost:8000
- **API**: http://localhost:8000/api/
- **Health**: http://localhost:8000/health/
- **Admin**: http://localhost:8000/admin/

## Production Environment Variables

Generate a new secret key:
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

**Required Variables:**
```env
SECRET_KEY=<your-generated-key>
DEBUG=False
ALLOWED_HOSTS=nexapdf-backend.onrender.com
CORS_ALLOWED_ORIGINS=https://neel2003gar.github.io
DATABASE_URL=<auto-provided-by-render>
DAILY_OPERATION_LIMIT=10
```

**Optional Variables:**
```env
DJANGO_SUPERUSER_USERNAME=admin
DJANGO_SUPERUSER_EMAIL=admin@nexapdf.com
DJANGO_SUPERUSER_PASSWORD=<secure-password>
EMAIL_HOST_USER=<your-email>
EMAIL_HOST_PASSWORD=<app-password>
```

## Deployment Commands

```bash
# Commit Docker files
git add backend/Dockerfile backend/.dockerignore backend/docker-entrypoint.sh docker-compose.dev.yml
git commit -m "Add Docker configuration for Render deployment"
git push origin main
```

## Troubleshooting

### Common Issues:
1. **Port binding**: Render provides `PORT` env var - Dockerfile handles this
2. **Database connection**: Entrypoint script waits for DB before starting
3. **Static files**: Collected automatically during container startup
4. **Health checks**: Available at `/health/` endpoint

### Debug Locally:
```bash
# Check container logs
docker logs <container-id>

# Access container shell
docker exec -it <container-id> bash

# Test health endpoint
curl http://localhost:8000/health/
```

## Next Steps After Deployment

1. **Verify deployment** at your Render service URL
2. **Test all endpoints**: `/api/`, `/health/`, `/admin/`
3. **Configure frontend** to use new Docker backend URL
4. **Monitor performance** via Render dashboard
5. **Set up monitoring** and alerting if needed

Docker deployment should be much more reliable than the previous Python build!