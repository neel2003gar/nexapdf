from rest_framework import serializers
from .models import SupportTicket, ContactMessage

class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = [
            'id', 'name', 'email', 'subject', 'message', 
            'category', 'created_at', 'is_read'
        ]
        read_only_fields = ['id', 'created_at', 'is_read']
    
    def validate_email(self, value):
        """Validate email format"""
        if not value or '@' not in value:
            raise serializers.ValidationError("Please provide a valid email address.")
        return value
    
    def validate_message(self, value):
        """Validate message length"""
        if len(value.strip()) < 10:
            raise serializers.ValidationError("Message must be at least 10 characters long.")
        return value.strip()

class SupportTicketSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    
    class Meta:
        model = SupportTicket
        fields = [
            'id', 'name', 'email', 'category', 'category_display',
            'subject', 'message', 'status', 'status_display',
            'priority', 'priority_display', 'created_at', 'updated_at',
            'resolved_at', 'admin_notes'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'resolved_at',
            'status', 'priority', 'admin_notes', 'status_display',
            'category_display', 'priority_display'
        ]
    
    def validate_email(self, value):
        """Validate email format"""
        if not value or '@' not in value:
            raise serializers.ValidationError("Please provide a valid email address.")
        return value
    
    def validate_message(self, value):
        """Validate message length"""
        if len(value.strip()) < 10:
            raise serializers.ValidationError("Message must be at least 10 characters long.")
        return value.strip()