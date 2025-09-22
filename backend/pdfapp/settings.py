from pathlib import Path
from decouple import config
from datetime import timedelta
import os

# Import dj_database_url only if available (for production)
try:
    import dj_database_url
    HAS_DJ_DATABASE_URL = True
except ImportError:
    HAS_DJ_DATABASE_URL = False

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config('SECRET_KEY', default='django-insecure-your-secret-key-here')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config('DEBUG', default=False, cast=bool)  # Default to False for security

# ALLOWED_HOSTS configuration
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='nexapdf-backend.onrender.com,nexapdf.onrender.com', cast=lambda v: [s.strip() for s in v.split(',')])

# Also allow Render's internal hosts
ALLOWED_HOSTS.extend(['127.0.0.1', 'localhost', '0.0.0.0'])

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'pdfapp',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# Add WhiteNoise middleware only in production
if not DEBUG:
    MIDDLEWARE.insert(2, 'whitenoise.middleware.WhiteNoiseMiddleware')

ROOT_URLCONF = 'pdfapp.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'pdfapp.wsgi.application'

# Database
# Database configuration - PostgreSQL for production, SQLite for development
if config('DATABASE_URL', default=None) and HAS_DJ_DATABASE_URL:
    DATABASES = {
        'default': dj_database_url.parse(config('DATABASE_URL'))
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# REST Framework configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20
}

# JWT Configuration
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': False,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUDIENCE': None,
    'ISSUER': None,
    'JWK_URL': None,
    'LEEWAY': 0,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'USER_AUTHENTICATION_RULE': 'rest_framework_simplejwt.authentication.default_user_authentication_rule',
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
    'JTI_CLAIM': 'jti',
    'SLIDING_TOKEN_REFRESH_EXP_CLAIM': 'refresh_exp',
    'SLIDING_TOKEN_LIFETIME': timedelta(minutes=5),
    'SLIDING_TOKEN_REFRESH_LIFETIME': timedelta(days=1),
}

# CORS Configuration for Production and Development
CORS_ALLOWED_ORIGINS = [
    "https://neel2003gar.github.io",  # GitHub Pages frontend (production)
    "https://nexapdf-backend.onrender.com",  # Backend self-reference
    # Development origins (comment out for production)
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    # Mobile development access
    "http://192.168.5.22:3000",
    "http://192.168.5.22:8000",
]

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_ALL_ORIGINS = config('CORS_ALLOW_ALL', default=False, cast=bool)  # Can be enabled for debugging
CORS_ALLOWED_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]
CORS_ALLOWED_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

# Session settings for cross-origin requests
SESSION_COOKIE_SAMESITE = 'None' if not DEBUG else 'Lax'  # None required for cross-origin in production
SESSION_COOKIE_SECURE = not DEBUG  # True in production (HTTPS), False in development
SESSION_COOKIE_HTTPONLY = False  # Allow JavaScript access for frontend
SESSION_SAVE_EVERY_REQUEST = True
SESSION_COOKIE_AGE = 86400  # 24 hours
SESSION_EXPIRE_AT_BROWSER_CLOSE = False
SESSION_COOKIE_AGE = 86400 * 7  # 7 days
SESSION_COOKIE_DOMAIN = None  # Use default domain
SESSION_COOKIE_PATH = '/'

# File upload settings
FILE_UPLOAD_MAX_MEMORY_SIZE = 52428800  # 50MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 52428800  # 50MB

# Rate limiting settings
RATELIMIT_VIEW = 'pdfapp.utils.ratelimit.ratelimited'

# Temporary files cleanup
TEMP_FILE_CLEANUP_MINUTES = 30

# Usage limits
DAILY_OPERATION_LIMIT = 10

# Email settings for support system
EMAIL_BACKEND = config('EMAIL_BACKEND', default='django.core.mail.backends.console.EmailBackend')
EMAIL_HOST = config('EMAIL_HOST', default='smtp.gmail.com')
EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
EMAIL_USE_TLS = config('EMAIL_USE_TLS', default=True, cast=bool)
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')
DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL', default='noreply@nexapdf.com')

# Support system settings
SUPPORT_EMAIL = config('SUPPORT_EMAIL', default='neel2003gar@gmail.com')
SUPPORT_RESPONSE_TIME_HOURS = 48

# Static and Media files already configured above

# Production-specific settings
if not DEBUG:
    # WhiteNoise static files storage for production
    STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
    
    # CORS settings for production - inherit from main settings but ensure GitHub Pages
    CORS_ALLOWED_ORIGINS = [
        "https://neel2003gar.github.io",  # GitHub Pages frontend
        "http://localhost:3000",  # Keep for local testing
        "http://127.0.0.1:3000",
    ]
    
    # Security settings for production
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True