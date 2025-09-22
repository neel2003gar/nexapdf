from functools import wraps
from django.http import JsonResponse
from django.core.cache import cache
from django.conf import settings
import time


def rate_limit(max_requests=10, window_seconds=86400, key_func=None):
    """
    Rate limiting decorator
    max_requests: Maximum number of requests allowed
    window_seconds: Time window in seconds (default: 24 hours)
    key_func: Function to generate cache key (default: uses user ID)
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            # Generate cache key
            if key_func:
                cache_key = key_func(request)
            else:
                if hasattr(request, 'user') and request.user.is_authenticated:
                    cache_key = f"rate_limit:{request.user.id}"
                else:
                    cache_key = f"rate_limit:{request.META.get('REMOTE_ADDR', 'unknown')}"
            
            # Get current request count
            current_requests = cache.get(cache_key, 0)
            
            if current_requests >= max_requests:
                return JsonResponse({
                    'error': 'Rate limit exceeded',
                    'detail': f'Maximum {max_requests} requests allowed per day'
                }, status=429)
            
            # Increment request count
            cache.set(cache_key, current_requests + 1, window_seconds)
            
            return view_func(request, *args, **kwargs)
        
        return wrapper
    return decorator


def check_daily_limit(user):
    """Check if user has exceeded daily operation limit"""
    if not user.is_authenticated:
        return False
    
    profile = getattr(user, 'userprofile', None)
    if not profile:
        from pdfapp.models import UserProfile
        profile = UserProfile.objects.create(user=user)
    
    return profile.can_perform_operation()


def increment_daily_count(user):
    """Increment user's daily operation count"""
    if not user.is_authenticated:
        return
    
    profile = getattr(user, 'userprofile', None)
    if not profile:
        from pdfapp.models import UserProfile
        profile = UserProfile.objects.create(user=user)
    
    profile.increment_daily_count()


def ratelimited(request):
    """Default rate limit exceeded response"""
    return JsonResponse({
        'error': 'Rate limit exceeded',
        'detail': 'Too many requests. Please try again later.'
    }, status=429)