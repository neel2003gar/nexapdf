from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.conf import settings
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from .serializers import (
    SignupSerializer, LoginSerializer, UserProfileSerializer, 
    PasswordResetSerializer
)
from pdfapp.models import UserProfile, ProcessingHistory


class SignupView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = SignupSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
            },
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)


class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
            },
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        })


class LogoutView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh_token")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            
            # Clear Django session data (for guest users who then logged in)
            if hasattr(request, 'session'):
                request.session.flush()  # This deletes the session data and regenerates the key
            
            return Response({'message': 'Successfully logged out'}, status=status.HTTP_200_OK)
        except Exception:
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)


class GuestSessionResetView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def post(self, request):
        """Reset guest user session data"""
        try:
            # Clear Django session data for guest users
            if hasattr(request, 'session'):
                request.session.flush()  # This deletes the session data and regenerates the key
            
            return Response({'message': 'Guest session reset successfully'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': 'Failed to reset session'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CurrentUserView(generics.RetrieveAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        profile, created = UserProfile.objects.get_or_create(user=user)
        
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'date_joined': user.date_joined,
            'profile': {
                'daily_operations_count': profile.daily_operations_count,
                'last_operation_date': profile.last_operation_date,
                'total_files_processed': profile.total_files_processed,
            }
        })


class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        return profile


class ProcessingHistoryView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ProcessingHistory.objects.filter(user=self.request.user).order_by('-created_at')
    
    def get_serializer_class(self):
        from .serializers import ProcessingHistorySerializer
        return ProcessingHistorySerializer


class PasswordResetView(generics.GenericAPIView):
    serializer_class = PasswordResetSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        user = User.objects.get(email=email)
        
        # Generate password reset token
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        # In a real application, you would send an email here
        # For now, we'll just return a success message
        
        # Use production frontend URL for password reset
        frontend_url = "https://neel2003gar.github.io/nexapdf" if not settings.DEBUG else "http://localhost:3000"
        reset_url = f"{frontend_url}/auth/reset-password/{uid}/{token}/"
        
        try:
            # This is a placeholder - in production, use a proper email service
            # send_mail(
            #     'Password Reset',
            #     f'Click here to reset your password: {reset_url}',
            #     settings.DEFAULT_FROM_EMAIL,
            #     [email],
            #     fail_silently=False,
            # )
            pass
        except Exception as e:
            return Response(
                {'error': 'Failed to send reset email'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        return Response({
            'message': 'Password reset email sent',
            'reset_url': reset_url  # Remove this in production
        })