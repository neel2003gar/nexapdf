# Deployment Guide

This guide covers deploying the NexaPDF application to various platforms.

## 🚀 Quick Deploy Options

### Option 1: Vercel (Frontend) + Railway (Backend)

**Frontend on Vercel:**
1. Connect your GitHub repository to Vercel  
2. Set environment variables:
   - `NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app/api`
3. Deploy automatically

**Backend on Railway:**
1. Create new project on Railway
2. Connect GitHub repository (backend folder)
3. Set environment variables:
   - `SECRET_KEY=your-production-secret-key`
   - `DEBUG=False`
   - `ALLOWED_HOSTS=your-backend-url.railway.app`
   - `CORS_ALLOWED_ORIGINS=https://your-frontend-url.vercel.app`
4. Railway will auto-deploy

### Option 2: Render (Full Stack)

**Backend on Render:**
1. Create new Web Service
2. Connect GitHub repository
3. Settings:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn pdfapp.wsgi:application`
   - Environment: Python 3.11
4. Environment Variables:
   ```
   SECRET_KEY=your-production-secret-key
   DEBUG=False  
   ALLOWED_HOSTS=your-service.onrender.com
   DATABASE_URL=postgresql://... (auto-generated)
   ```

**Frontend on Render:**
1. Create new Static Site
2. Build Command: `npm install && npm run build`
3. Publish Directory: `out` or `.next`
4. Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
   ```

### Option 3: Self-hosted Deployment

**Note**: Docker files have been removed. For self-hosting, use:
- Manual Python/Django setup for backend
- Static file serving for frontend
- See manual setup instructions in README.md

**Manual Docker:**
```bash
# Build backend
cd backend
docker build -t pdf-backend .

# Build frontend  
cd ../frontend
docker build -t pdf-frontend .

# Run containers
docker run -d -p 8000:8000 pdf-backend
docker run -d -p 3000:3000 pdf-frontend
```

## 🔧 Environment Configuration

### Backend Environment Variables

**Required:**
- `SECRET_KEY` - Django secret key (generate new for production)
- `DEBUG` - Set to `False` for production
- `ALLOWED_HOSTS` - Your domain name
- `DATABASE_URL` - PostgreSQL connection string

**Optional:**
- `CORS_ALLOWED_ORIGINS` - Frontend URL
- `EMAIL_HOST` - SMTP server for password reset
- `EMAIL_HOST_USER` - SMTP username
- `EMAIL_HOST_PASSWORD` - SMTP password
- `DAILY_OPERATION_LIMIT` - Default: 10
- `FILE_UPLOAD_MAX_MEMORY_SIZE` - Default: 52428800 (50MB)

### Frontend Environment Variables

**Required:**
- `NEXT_PUBLIC_API_URL` - Backend API URL

## 🗄️ Database Setup

### PostgreSQL (Production)

**Railway:**
- Automatically provisions PostgreSQL
- Sets `DATABASE_URL` environment variable

**Render:**
- Add PostgreSQL service
- Copy connection string to `DATABASE_URL`

**Manual Setup:**
```sql
CREATE DATABASE pdfmerger;
CREATE USER pdfuser WITH ENCRYPTED PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE pdfmerger TO pdfuser;
```

### SQLite (Development)
- Default configuration
- File: `backend/db.sqlite3`
- No additional setup required

## 🔐 Security Checklist

### Production Security

- [ ] Generate strong `SECRET_KEY`
- [ ] Set `DEBUG=False`
- [ ] Configure proper `ALLOWED_HOSTS`
- [ ] Use HTTPS (SSL certificate)
- [ ] Set secure CORS origins
- [ ] Configure rate limiting
- [ ] Set up file upload limits
- [ ] Enable automatic file cleanup
- [ ] Use environment variables for secrets
- [ ] Regular security updates

### SSL/HTTPS Setup

**Automatic (Recommended):**
- Vercel: Automatic HTTPS
- Railway: Automatic HTTPS  
- Render: Automatic HTTPS

**Manual:**
- Use Let's Encrypt certificates
- Configure reverse proxy (Nginx)
- Update CORS and ALLOWED_HOSTS

## 📊 Monitoring & Maintenance

### Error Tracking
- Django logs to console (captured by hosting platforms)
- Add Sentry for error tracking:
  ```bash
  pip install sentry-sdk
  # Configure in settings.py
  ```

### Performance Monitoring
- Database query optimization
- File upload/processing monitoring
- Memory usage tracking
- Response time monitoring

### Maintenance Tasks
- Regular dependency updates
- Database backups (if using PostgreSQL)
- Log rotation
- File cleanup verification
- Security patches

## 🚦 Health Checks

### Backend Health Check
Create endpoint for monitoring:
```python
# In views.py
def health_check(request):
    return JsonResponse({"status": "healthy"})
```

### Frontend Monitoring
- Vercel Analytics (automatic)
- Custom monitoring with external services

## 📈 Scaling Considerations

### Horizontal Scaling
- Use Redis for session storage
- Implement file processing queues (Celery)
- Load balancer for multiple instances
- CDN for static files

### Vertical Scaling
- Increase memory limits
- Optimize PDF processing
- Database query optimization
- Caching implementation

## 🔄 CI/CD Pipeline

### GitHub Actions Example

**.github/workflows/deploy.yml:**
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway
        run: railway up --service backend
        
  deploy-frontend:  
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        run: vercel --prod
```

## 🐛 Troubleshooting

### Common Deployment Issues

**Backend not starting:**
- Check Python version compatibility
- Verify all dependencies installed
- Check environment variables
- Review application logs

**Frontend build failures:**
- Node.js version compatibility
- Clear build cache
- Check environment variables
- Verify API endpoints

**Database connection errors:**
- Verify DATABASE_URL format
- Check database service status
- Confirm network connectivity
- Review authentication credentials

**File upload/processing issues:**
- Check file size limits
- Verify PDF library installation
- Review temporary file permissions
- Check available disk space

### Performance Issues
- Monitor memory usage during PDF processing
- Implement file processing queues
- Optimize database queries
- Add caching layers

## 📞 Support

For deployment issues:
1. Check application logs
2. Verify environment configuration
3. Test API endpoints
4. Review hosting platform documentation
5. Create GitHub issue with deployment details