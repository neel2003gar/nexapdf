from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def api_root(request):
    return JsonResponse({
        'message': 'NexaPDF API is running!',
        'version': '1.0.0',
        'status': 'healthy',
        'endpoints': {
            'auth': '/api/auth/',
            'pdf': '/api/pdf/',
            'admin': '/admin/'
        }
    })

@csrf_exempt
def health_check(request):
    return JsonResponse({
        'status': 'healthy',
        'message': 'Backend is running'
    })

urlpatterns = [
    path('', api_root, name='api-root'),
    path('api/', api_root, name='api-root'),
    path('health/', health_check, name='health-check'),
    path('api/health/', health_check, name='api-health-check'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('pdfapp.auth.urls')),
    path('api/pdf/', include('pdfapp.routes.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)