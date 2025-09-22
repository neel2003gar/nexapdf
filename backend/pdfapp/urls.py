from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

def api_root(request):
    return JsonResponse({
        'message': 'NexaPDF API is running!',
        'version': '1.0.0',
        'endpoints': {
            'auth': '/api/auth/',
            'pdf': '/api/pdf/',
            'admin': '/admin/'
        }
    })

urlpatterns = [
    path('', api_root, name='api-root'),
    path('api/', api_root, name='api-root'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('pdfapp.auth.urls')),
    path('api/pdf/', include('pdfapp.routes.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)