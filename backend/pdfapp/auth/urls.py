from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('signup/', views.SignupView.as_view(), name='signup'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('guest-reset/', views.GuestSessionResetView.as_view(), name='guest-session-reset'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('me/', views.CurrentUserView.as_view(), name='current-user'),
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('history/', views.ProcessingHistoryView.as_view(), name='processing-history'),
    path('reset-password/', views.PasswordResetView.as_view(), name='password-reset'),
]