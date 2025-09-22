# NexaPDF - Complete PDF Processing Suite

![NexaPDF Logo](frontend/public/logo.svg)

**NexaPDF** is a comprehensive, production-ready PDF processing web application that provides all essential PDF operations in one modern, responsive interface. Built with cutting-edge technologies and designed for both individual users and businesses.

## 🌟 Features

### Core PDF Operations

- **📄 Merge PDF** - Combine multiple PDF files with drag-and-drop reordering
- **✂️ Split PDF** - Extract specific pages or split into individual files  
- **🗜️ Compress PDF** - Reduce file size while maintaining quality
- **🔄 Convert Documents** - PDF ↔ Word, PowerPoint, Excel, Images
- **📝 Extract Text** - Extract text content from PDF documents
- **🏷️ Add Watermarks** - Text or image watermarks with customization
- **↻ Rotate Pages** - Rotate individual or all pages
- **🔒 Secure PDF** - Password protect PDF documents
- **🔓 Unlock PDF** - Remove password protection from PDFs
- **📋 Organize PDF** - Rearrange pages with visual preview

### Advanced Features

- **🖼️ Real PDF Preview** - High-quality thumbnails using PyMuPDF
- **🎯 Drag & Drop Interface** - Intuitive file handling and page arrangement
- **📱 Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **🌙 Dark/Light Mode** - Automatic system detection + manual toggle
- **🔢 Smart Usage Tracking** - Daily limits with automatic midnight reset
- **⚡ Real-time Progress** - Live upload and processing feedback
- **🌐 Multi-language Support** - English default, easily extensible
- **🛡️ Privacy-First** - No file storage, automatic cleanup after 30 minutes

## 🏗️ Architecture

### Backend - Django REST API

- **Django 4.2** with Django REST Framework
- **JWT Authentication** using SimpleJWT
- **PostgreSQL** (production) / SQLite (development)
- **Advanced PDF Processing** with PyPDF, PyMuPDF, and specialized libraries
- **Smart Usage Tracking** with daily limits and session management
- **Rate Limiting** and comprehensive security features

### Frontend - Next.js Application

- **Next.js 14** with App Router and TypeScript
- **Tailwind CSS** for styling with custom design system
- **shadcn/ui** component library for consistent UI
- **Real-time State Management** with React Context
- **PWA Support** with offline capabilities
- **Optimized Performance** with lazy loading and caching

### PDF Processing Stack

- **PyPDF** - Core PDF manipulation and merging
## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

**Windows:**
```bash
git clone <repository-url>
cd pdf-merger
./setup.bat
```

**Mac/Linux:**
```bash
git clone <repository-url>
cd pdf-merger
chmod +x setup.sh
./setup.sh
```

### Option 2: Manual Setup

**Prerequisites:**

- Node.js 18+ and npm
- Python 3.8+ and pip
- Git

**Backend Setup:**

1. **Clone and navigate**

   ```bash
   git clone <repository-url>
   cd pdf-merger/backend
   ```

2. **Create virtual environment**

   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # Mac/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

4. **Environment configuration**

   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

5. **Database setup**

   ```bash
   python manage.py makemigrations
   python manage.py migrate
   python manage.py createsuperuser  # Optional
   ```

6. **Run development server**

   ```bash
   python manage.py runserver
   ```

**Frontend Setup:**

1. **Navigate to frontend**

   ```bash
   cd ../frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment configuration**

   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your API URL
   ```

4. **Run development server**

   ```bash
   npm run dev
   ```

**Access Points:**

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api
- Django Admin: http://localhost:8000/admin

### Option 3: Cloud Deployment (Recommended)

**Frontend (GitHub Pages):**
- Automatic deployment via GitHub Actions
- Static site hosting with CDN

**Backend (Render):**
- Automatic deployment from Git
- PostgreSQL database included

## 📁 Project Structure

```
pdf-merger/
├── 📱 frontend/                    # Next.js Application
│   ├── app/                        # Next.js App Router Pages
│   │   ├── merge/                  # PDF merge with preview
│   │   ├── split/                  # PDF splitting interface
│   │   ├── compress/               # PDF compression
│   │   ├── convert/                # Document conversion hub
│   │   ├── auth/                   # Authentication pages
│   │   └── [operations]/           # Individual PDF operations
│   ├── components/                 # Reusable React Components
│   │   ├── ui/                     # shadcn/ui components
│   │   ├── file-dropzone.tsx       # Drag & drop file handling
│   │   ├── auth-provider.tsx       # Authentication context
│   │   └── usage-provider.tsx      # Usage tracking system
│   ├── lib/                        # Utility Functions
│   │   ├── api.ts                  # API communication layer
│   │   ├── download-utils.ts       # File download management
│   │   └── toast.ts                # Notification system
│   └── messages/                   # Internationalization
│       └── en.json                 # English translations
├── 🔧 backend/                     # Django REST API
│   ├── pdfapp/                     # Main Django Application
│   │   ├── auth/                   # Authentication endpoints
│   │   ├── routes/                 # PDF processing endpoints
│   │   ├── utils/                  # Helper functions
│   │   │   ├── pdf_helpers.py      # Core PDF processing
│   │   │   ├── usage_tracking.py   # Usage management
│   │   │   └── file_cleanup.py     # Temporary file cleanup
│   │   ├── models.py               # Database models
│   │   └── settings.py             # Django configuration
│   ├── requirements.txt            # Python dependencies
│   └── manage.py                   # Django management
├── ☁️ Cloud Deployment
│   ├── .github/workflows/deploy-frontend.yml  # GitHub Actions
│   ├── backend/Procfile                      # Render deployment
│   └── backend/runtime.txt                   # Python version
├── 📚 Documentation
│   ├── README.md                   # This file
│   ├── DEPLOYMENT.md               # Deployment guide
│   └── .github/copilot-instructions.md
└── 🛠️ Setup Scripts
    ├── setup.sh / setup.bat        # Automated setup
    └── cleanup.sh / cleanup.bat     # Environment cleanup
```

## 🔧 Configuration

### Backend Environment Variables (.env)

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DAILY_OPERATION_LIMIT=10
TEMP_FILE_CLEANUP_MINUTES=30
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend Environment Variables (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## 📝 API Documentation

### Authentication Endpoints

- `POST /api/auth/signup/` - Create new user account
- `POST /api/auth/login/` - User login (returns JWT tokens)
- `POST /api/auth/logout/` - User logout (blacklist refresh token)
- `GET /api/auth/me/` - Get current user profile
- `POST /api/auth/reset-password/` - Request password reset

### PDF Processing Endpoints

- `POST /api/pdf/merge/` - Merge multiple PDFs
- `POST /api/pdf/split/` - Split PDF into multiple files
- `POST /api/pdf/compress/` - Compress PDF file size
- `POST /api/pdf/convert/pdf-to-img/` - Convert PDF to images
- `POST /api/pdf/convert/img-to-pdf/` - Convert images to PDF
- `POST /api/pdf/convert/docx-to-pdf/` - Convert DOCX to PDF
- `POST /api/pdf/extract-text/` - Extract text from PDF
- `POST /api/pdf/watermark/` - Add watermark to PDF
- `POST /api/pdf/rotate/` - Rotate PDF pages
- `POST /api/pdf/secure/` - Add password to PDF
- `POST /api/pdf/unlock/` - Remove password from PDF
- `POST /api/pdf/preview/` - Generate PDF previews (no quota consumption)

### Usage Tracking

- `GET /api/pdf/usage/` - Get current usage statistics

## 🎨 Key Features Deep Dive

### 1. Advanced PDF Preview System

- **Real PDF Thumbnails** using PyMuPDF backend processing
- **Drag & Drop Reordering** for merge and organize operations
- **Page-level Management** with individual page controls
- **High-Quality Rendering** with proper aspect ratios
- **No Quota Consumption** for preview generation

### 2. Smart Usage Management

- **Anonymous Users**: 10 operations per day (resets at midnight)
- **Registered Users**: Unlimited operations
- **Daily Reset System** with automatic cleanup
- **Session-based Tracking** with IP and browser session
- **Real-time Usage Display** with progress indicators

### 3. Security & Privacy

- **Client-side Processing**: Files processed securely on server
- **Temporary File Cleanup**: Automatic deletion after 30 minutes
- **No Data Storage**: Files are not permanently stored
- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Protection against abuse
- **File Size Limits**: Maximum 50MB per upload

## 🌐 Deployment Options

### 1. Vercel + Railway (Recommended)

- **Frontend**: Deploy to Vercel (automatic GitHub integration)
- **Backend**: Deploy to Railway with PostgreSQL
- **Setup Time**: ~5 minutes
- **Cost**: Free tier available

### 2. Render (Full Stack)

- **Frontend**: Static site deployment
- **Backend**: Web service with PostgreSQL
- **Setup Time**: ~10 minutes
- **Cost**: Free tier available

### 3. Docker Deployment (Self-hosted)

- **Platform**: Any VPS or cloud provider
- **Database**: PostgreSQL container
- **Setup Time**: ~15 minutes

**Production deployment:**

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Production Environment Variables

```env
SECRET_KEY=your-production-secret-key
DEBUG=False
ALLOWED_HOSTS=your-domain.com
DATABASE_URL=postgresql://user:password@host:port/dbname
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
```

## 🧪 Testing

### Backend Tests

```bash
cd backend
python manage.py test
```

### Frontend Tests

```bash
cd frontend
npm run test
```

## 🌍 Internationalization

Current support:

- English (default)
- Ready for additional language translations

To add a new language:

1. Create `messages/{locale}.json` file
2. Add translations for all UI strings
3. Update `next.config.js` locales array

## 📱 Mobile Support

- Fully responsive design
- Touch-friendly interface
- Optimized for mobile browsers
- Progressive Web App (PWA) ready

## � Monitoring & Analytics

The application includes:

- Processing history tracking
- User activity monitoring
- Error logging
- Performance metrics
- Daily usage limits enforcement

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🐛 Troubleshooting

### Common Issues

**Backend not starting:**

- Check Python version (3.8+)
- Ensure virtual environment is activated
- Verify all dependencies are installed

**Frontend build errors:**

- Check Node.js version (18+)
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check environment variables

**PDF processing errors:**

- Ensure all PDF libraries are installed
- Check file size limits
- Verify file format support

**Database errors:**

- Run migrations: `python manage.py migrate`
- Check database permissions
- Verify database URL in production

## � License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue in the GitHub repository
- Check the documentation
- Review the troubleshooting section

## 🎯 Roadmap

### Upcoming Features

- **Batch Processing**: Process multiple files simultaneously
- **API Access**: RESTful API for developers
- **Premium Features**: Advanced operations and higher limits
- **Mobile App**: Native iOS and Android applications
- **Cloud Storage**: Integration with Google Drive, Dropbox
- **Advanced OCR**: Multi-language text recognition

---

**Built with ❤️ using Django, Next.js, and modern web technologies**

*NexaPDF - Making PDF processing simple, fast, and accessible to everyone.*

- [ ] Add more PDF operations (OCR, form filling)
- [ ] Premium features and pricing tiers
- [ ] Batch processing capabilities
- [ ] API rate limiting improvements
- [ ] Advanced user dashboard
- [ ] Mobile app development