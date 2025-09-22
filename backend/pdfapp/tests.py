from django.test import TestCase
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from pdfapp.models import UserProfile, ProcessingHistory


class UserProfileTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )

    def test_profile_creation(self):
        """Test that UserProfile is created automatically"""
        profile = UserProfile.objects.create(user=self.user)
        self.assertEqual(profile.daily_operations_count, 0)
        self.assertTrue(profile.can_perform_operation())

    def test_daily_limit(self):
        """Test daily operation limit"""
        profile = UserProfile.objects.create(user=self.user)
        
        # Should be able to perform operations initially
        self.assertTrue(profile.can_perform_operation())
        
        # Simulate reaching daily limit
        from django.conf import settings
        profile.daily_operations_count = settings.DAILY_OPERATION_LIMIT
        profile.save()
        
        self.assertFalse(profile.can_perform_operation())


class AuthTestCase(APITestCase):
    def test_signup(self):
        """Test user signup"""
        url = reverse('signup')
        data = {
            'username': 'newuser',
            'email': 'new@example.com',
            'password': 'newpass123',
            'password_confirm': 'newpass123',
            'first_name': 'New',
            'last_name': 'User'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('tokens', response.data)
        self.assertIn('user', response.data)

    def test_login(self):
        """Test user login"""
        # Create user first
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        url = reverse('login')
        data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('tokens', response.data)


class PDFProcessingTestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)

    def test_merge_pdf_authentication_required(self):
        """Test that PDF operations require authentication"""
        self.client.force_authenticate(user=None)
        url = reverse('merge-pdf')
        response = self.client.post(url, {})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)