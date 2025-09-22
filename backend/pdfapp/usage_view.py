
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response

class UsageInfoView(APIView):
    """Get current usage information for user"""
    permission_classes = []
    
    def get(self, request):
        """Get usage statistics"""
        try:
            from pdfapp.utils.usage_tracking import get_usage_info, get_or_create_session_id, get_client_ip
            
            # Get session info for debugging
            session_id = get_or_create_session_id(request)
            ip_address = get_client_ip(request)
            
            usage_info = get_usage_info(request)
            
            # Add debug info
            usage_info['debug'] = {
                'session_id': session_id,
                'ip_address': ip_address,
                'has_session_key': bool(request.session.session_key),
                'is_authenticated': request.user.is_authenticated
            }
            
            return Response(usage_info, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'error': 'Unable to get usage information',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)