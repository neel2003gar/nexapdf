from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
import uuid


class AnonymousUser(models.Model):
    """Track anonymous users by session/IP for usage limits"""
    session_id = models.CharField(max_length=100, unique=True)
    ip_address = models.GenericIPAddressField()
    operations_count = models.IntegerField(default=0)
    last_operation_date = models.DateField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)
    last_used = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['session_id', 'ip_address']
    
    def __str__(self):
        return f"Anonymous {self.session_id[:8]} ({self.ip_address})"
    
    def reset_daily_count_if_needed(self):
        """Reset daily operations count if it's a new day"""
        today = timezone.now().date()
        if self.last_operation_date != today:
            self.operations_count = 0
            self.last_operation_date = today
            self.save()
    
    def can_perform_operation(self):
        """Check if anonymous user can perform another operation"""
        self.reset_daily_count_if_needed()
        return self.operations_count < 10  # Increased daily limit to 10
    
    def increment_count(self):
        """Increment operations count for anonymous user"""
        self.reset_daily_count_if_needed()
        self.operations_count += 1
        self.save()


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    daily_operations_count = models.IntegerField(default=0)
    total_files_processed = models.IntegerField(default=0)
    last_operation_date = models.DateField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_premium = models.BooleanField(default=False)  # For future premium features

    def __str__(self):
        return f"{self.user.username} - Profile"

    def reset_daily_count_if_needed(self):
        """Reset daily operations count if it's a new day"""
        today = timezone.now().date()
        if self.last_operation_date != today:
            self.daily_operations_count = 0
            self.last_operation_date = today
            self.save()

    def can_perform_operation(self):
        """Check if user can perform another operation - unlimited for registered users"""
        # Registered users have unlimited operations (free tier)
        return True

    def increment_daily_count(self):
        """Increment daily operations count"""
        self.reset_daily_count_if_needed()
        self.daily_operations_count += 1
        self.total_files_processed += 1
        self.save()


class ProcessingHistory(models.Model):
    OPERATION_CHOICES = [
        ('merge', 'Merge PDF'),
        ('split', 'Split PDF'),
        ('compress', 'Compress PDF'),
        ('pdf_to_img', 'PDF to Image'),
        ('img_to_pdf', 'Image to PDF'),
        ('docx_to_pdf', 'DOCX to PDF'),
        ('extract_text', 'Extract Text'),
        ('watermark', 'Add Watermark'),
        ('rotate', 'Rotate Pages'),
        ('secure', 'Secure PDF'),
        ('unlock', 'Unlock PDF'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    operation = models.CharField(max_length=20, choices=OPERATION_CHOICES)
    filename = models.CharField(max_length=255)
    file_size = models.BigIntegerField()  # Size in bytes
    processing_time = models.FloatField()  # Time in seconds
    created_at = models.DateTimeField(auto_now_add=True)
    success = models.BooleanField(default=True)
    error_message = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = "Processing histories"

    def __str__(self):
        return f"{self.user.username} - {self.get_operation_display()} - {self.filename}"


class SupportTicket(models.Model):
    CATEGORY_CHOICES = [
        ('general', 'General Questions'),
        ('technical', 'Technical Issues'),
        ('feature', 'Feature Requests'),
        ('billing', 'Billing & Account'),
        ('bug', 'Bug Report'),
    ]
    
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    # Contact Information
    name = models.CharField(max_length=100)
    email = models.EmailField()
    
    # Ticket Details
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    subject = models.CharField(max_length=200)
    message = models.TextField()
    
    # Metadata
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Optional user association
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Admin notes
    admin_notes = models.TextField(blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Support Ticket'
        verbose_name_plural = 'Support Tickets'
    
    def __str__(self):
        return f"#{self.id} {self.subject} - {self.name}"
    
    def save(self, *args, **kwargs):
        if self.status == 'resolved' and not self.resolved_at:
            self.resolved_at = timezone.now()
        super().save(*args, **kwargs)


class ContactMessage(models.Model):
    """Simple contact form submissions without ticket system"""
    name = models.CharField(max_length=100)
    email = models.EmailField()
    subject = models.CharField(max_length=200)
    message = models.TextField()
    category = models.CharField(max_length=20, choices=SupportTicket.CATEGORY_CHOICES, default='general')
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Contact Message'
        verbose_name_plural = 'Contact Messages'
    
    def __str__(self):
        return f"{self.subject} - {self.name} ({self.email})"