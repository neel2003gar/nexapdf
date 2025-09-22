"""
Usage tracking utilities for NexaPDF
Handles both anonymous and authenticated users
"""
from django.conf import settings
from django.contrib.auth.models import AnonymousUser as DjangoAnonymousUser
from pdfapp.models import AnonymousUser, UserProfile
import uuid


def get_client_ip(request):
    """Get client IP address from request"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def get_or_create_session_id(request):
    """Get or create session ID for anonymous tracking"""
    if not request.session.session_key:
        request.session.create()
    return request.session.session_key


def check_usage_limit(request):
    """
    Check if user can perform operation
    Returns: (can_proceed: bool, user_type: str, remaining_operations: int)
    """
    if request.user.is_authenticated:
        # Authenticated users have unlimited access
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        return True, 'authenticated', -1  # -1 means unlimited
    
    else:
        # Anonymous user - track by session + IP
        session_id = get_or_create_session_id(request)
        ip_address = get_client_ip(request)
        
        anonymous_user, created = AnonymousUser.objects.get_or_create(
            session_id=session_id,
            defaults={
                'ip_address': ip_address,
                'operations_count': 0
            }
        )
        
        can_proceed = anonymous_user.can_perform_operation()
        remaining = max(0, 10 - anonymous_user.operations_count)
        
        return can_proceed, 'anonymous', remaining


def increment_usage_count(request, operation_type):
    """
    Increment usage count for user
    """
    if request.user.is_authenticated:
        # For authenticated users, track in UserProfile
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        profile.increment_daily_count()
        
        # Log in processing history
        from pdfapp.models import ProcessingHistory
        ProcessingHistory.objects.create(
            user=request.user,
            operation=operation_type,
            filename='processed_file',
            file_size=0,
            processing_time=0,
            success=True
        )
        
    else:
        # For anonymous users, increment count
        session_id = get_or_create_session_id(request)
        ip_address = get_client_ip(request)
        
        anonymous_user, created = AnonymousUser.objects.get_or_create(
            session_id=session_id,
            defaults={
                'ip_address': ip_address,
                'operations_count': 0
            }
        )
        
        anonymous_user.increment_count()


def get_usage_info(request):
    """
    Get current usage information for user
    Returns dict with usage stats
    """
    if request.user.is_authenticated:
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        return {
            'user_type': 'authenticated',
            'username': request.user.username,
            'operations_today': profile.daily_operations_count,
            'total_operations': profile.total_files_processed,
            'is_unlimited': True,
            'remaining_operations': -1
        }
    else:
        session_id = get_or_create_session_id(request)
        ip_address = get_client_ip(request)
        
        anonymous_user, created = AnonymousUser.objects.get_or_create(
            session_id=session_id,
            defaults={
                'ip_address': ip_address,
                'operations_count': 0
            }
        )
        
        return {
            'user_type': 'anonymous',
            'username': None,
            'operations_used': anonymous_user.operations_count,
            'operations_limit': 10,
            'is_unlimited': False,
            'remaining_operations': max(0, 10 - anonymous_user.operations_count)
        }