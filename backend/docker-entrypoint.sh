#!/bin/bash

# Docker entrypoint script for NexaPDF Backend
# This script runs before the main application starts

set -e

echo "🚀 Starting NexaPDF Backend..."

# Wait for database to be ready (if using PostgreSQL)
if [ "$DATABASE_URL" ]; then
    echo "⏳ Waiting for database connection..."
    python << END
import sys
import time
import psycopg2
from urllib.parse import urlparse

def wait_for_db():
    db_url = "$DATABASE_URL"
    if not db_url:
        return
    
    result = urlparse(db_url)
    
    max_attempts = 30
    attempt = 0
    
    while attempt < max_attempts:
        try:
            conn = psycopg2.connect(
                database=result.path[1:],
                user=result.username,
                password=result.password,
                host=result.hostname,
                port=result.port,
            )
            conn.close()
            print("✅ Database connection successful!")
            return
        except psycopg2.OperationalError:
            attempt += 1
            print(f"⏳ Database not ready, attempt {attempt}/{max_attempts}")
            time.sleep(2)
    
    print("❌ Database connection failed after all attempts")
    sys.exit(1)

wait_for_db()
END
fi

# Run database migrations
echo "🗄️ Running database migrations..."
python manage.py migrate --noinput

# Collect static files
echo "📁 Collecting static files..."
python manage.py collectstatic --noinput --clear

# Create superuser if specified
if [ "$DJANGO_SUPERUSER_USERNAME" ] && [ "$DJANGO_SUPERUSER_EMAIL" ] && [ "$DJANGO_SUPERUSER_PASSWORD" ]; then
    echo "👤 Creating superuser..."
    python manage.py shell << END
from django.contrib.auth.models import User
if not User.objects.filter(username='$DJANGO_SUPERUSER_USERNAME').exists():
    User.objects.create_superuser('$DJANGO_SUPERUSER_USERNAME', '$DJANGO_SUPERUSER_EMAIL', '$DJANGO_SUPERUSER_PASSWORD')
    print('✅ Superuser created successfully')
else:
    print('ℹ️ Superuser already exists')
END
fi

echo "✅ Initialization complete!"

# Execute the main command
exec "$@"