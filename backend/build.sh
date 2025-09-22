#!/usr/bin/env bash
# Build script for Render deployment

echo "🚀 Starting NexaPDF Backend Build..."

# Install dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Run database migrations
echo "🗄️ Running database migrations..."
python manage.py migrate --noinput

# Collect static files (if needed)
echo "📁 Collecting static files..."
python manage.py collectstatic --noinput

# Create superuser if needed (optional)
# echo "👤 Creating superuser..."
# python manage.py shell -c "
# from django.contrib.auth import get_user_model;
# User = get_user_model();
# if not User.objects.filter(username='admin').exists():
#     User.objects.create_superuser('admin', 'admin@nexapdf.com', 'admin123');
#     print('✅ Superuser created')
# else:
#     print('ℹ️ Superuser already exists')
# "

echo "✅ Build completed successfully!"