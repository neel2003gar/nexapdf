# PDF Processing Web Application

A comprehensive, full-stack PDF processing web application similar to iLovePDF with modern UI/UX and robust backend.

## 🚀 Project Overview

This is a production-ready PDF processing application that allows users to:
- **Merge** multiple PDFs into one document
- **Split** PDFs by pages or ranges
- **Compress** PDFs to reduce file size
- **Convert** between PDF, images, and DOCX formats
- **Extract text** from PDF documents
- **Add watermarks** (text or image)
- **Rotate pages** and reorder content
- **Secure PDFs** with password protection
- **Unlock** password-protected PDFs

## 🛠 Tech Stack

### Frontend
- **Next.js 14** (App Router) with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **next-themes** for dark/light mode
- **next-intl** for internationalization
- **React Hook Form** + Zod validation
- **Axios** for API communication

### Backend
- **Django 4.2** + Django REST Framework
- **JWT Authentication** with SimpleJWT
- **PostgreSQL** (production) / SQLite (development)
- **CORS** headers for cross-origin requests
- **Rate limiting** and usage quotas

### PDF Processing
- **pypdf** - Core PDF manipulation
- **pdf2image** - PDF to image conversion
- **img2pdf** - Image to PDF conversion
- **reportlab** - PDF generation and watermarks
- **pdfplumber** - Advanced text extraction
- **python-docx** - DOCX document processing

## 📁 Project Structure

```
pdf-merger/
├── backend/                 # Django REST API
│   ├── pdfapp/             # Main Django application
│   │   ├── auth/           # Authentication endpoints
│   │   ├── routes/         # PDF processing endpoints
│   │   ├── utils/          # Helper functions and utilities
│   │   └── models.py       # Database models
│   ├── requirements.txt    # Python dependencies
│   ├── manage.py          # Django management script
│   └── Dockerfile         # Docker configuration
├── frontend/               # Next.js application
│   ├── app/               # Next.js App Router pages
│   ├── components/        # Reusable UI components
│   ├── lib/              # Utility functions
│   ├── messages/         # Internationalization files
│   ├── package.json      # Node.js dependencies
│   └── Dockerfile        # Docker configuration
├── docker-compose.yml     # Development environment
├── docker-compose.prod.yml # Production environment
├── setup.sh / setup.bat   # Automated setup scripts
├── README.md              # Comprehensive documentation
└── DEPLOYMENT.md          # Deployment guide
```

## ✨ Key Features

### User Experience
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Dark/Light Mode** - System preference detection + manual toggle
- **Drag & Drop Upload** - Intuitive file selection
- **Progress Tracking** - Real-time processing feedback
- **Multi-language** - English default, extensible i18n system

### Security & Performance
- **JWT Authentication** - Secure token-based auth
- **Rate Limiting** - 10 operations/day for free users
- **File Size Limits** - 50MB maximum upload
- **Auto Cleanup** - Temporary files deleted after 30 minutes
- **Input Validation** - Comprehensive file type and size checking

### Developer Experience
- **TypeScript** - Full type safety
- **Component Library** - Reusable shadcn/ui components
- **API Documentation** - RESTful endpoints with clear schemas
- **Docker Support** - Containerized development and deployment
- **Automated Setup** - One-command environment setup

## 🚀 Quick Start

### Automated Setup (Recommended)

**Windows:**
```bash
./setup.bat
```

**Mac/Linux:**
```bash
chmod +x setup.sh
./setup.sh
```

### Manual Setup

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py runserver
```

**Frontend:**
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

**Access Points:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api
- Django Admin: http://localhost:8000/admin

## 🐳 Docker Deployment

**Development:**
```bash
docker-compose up -d
```

**Production:**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🌐 Deployment Options

### 1. Vercel + Railway (Recommended)
- **Frontend**: Deploy to Vercel (automatic from GitHub)
- **Backend**: Deploy to Railway (PostgreSQL included)
- **Setup Time**: ~5 minutes
- **Cost**: Free tier available

### 2. Render (Full Stack)
- **Frontend**: Static site deployment
- **Backend**: Web service with PostgreSQL
- **Setup Time**: ~10 minutes
- **Cost**: Free tier available

### 3. Docker (Self-hosted)
- **Platform**: Any VPS or cloud provider
- **Database**: PostgreSQL container
- **Setup Time**: ~15 minutes
- **Cost**: VPS pricing varies

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## 📊 API Endpoints

### Authentication
- `POST /api/auth/signup/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `GET /api/auth/me/` - Get user profile

### PDF Operations
- `POST /api/pdf/merge/` - Merge PDFs
- `POST /api/pdf/split/` - Split PDF
- `POST /api/pdf/compress/` - Compress PDF
- `POST /api/pdf/convert/pdf-to-img/` - PDF to images
- `POST /api/pdf/convert/img-to-pdf/` - Images to PDF
- `POST /api/pdf/convert/docx-to-pdf/` - DOCX to PDF
- `POST /api/pdf/extract-text/` - Extract text
- `POST /api/pdf/watermark/` - Add watermark
- `POST /api/pdf/rotate/` - Rotate pages
- `POST /api/pdf/secure/` - Password protect
- `POST /api/pdf/unlock/` - Remove password

## 🔧 Configuration

### Environment Variables

**Backend (.env):**
```env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3
DAILY_OPERATION_LIMIT=10
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## 🧪 Testing

**Backend Tests:**
```bash
cd backend
python manage.py test
```

**Frontend Tests:**
```bash
cd frontend
npm run test
```

## 📱 Mobile Support

- Fully responsive design
- Touch-optimized interface  
- PWA capabilities
- Offline-ready architecture

## 🌍 Internationalization

Current: English (en)
Expandable: Add translations in `frontend/messages/{locale}.json`

## 🔐 Security Features

- JWT token authentication
- CORS protection
- Rate limiting
- File type validation
- Size restrictions
- Automatic cleanup
- SQL injection prevention
- XSS protection

## 📈 Performance Optimizations

- Lazy loading components
- Image optimization
- API response caching
- Database query optimization
- File processing in background
- CDN-ready static files

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/name`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push to branch (`git push origin feature/name`)
5. Open Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🆘 Support

- 📖 [Full Documentation](README.md)
- 🚀 [Deployment Guide](DEPLOYMENT.md)
- 🐛 [Issue Tracker](../../issues)
- 💬 [Discussions](../../discussions)