from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from pdfapp.models import UserProfile, ProcessingHistory


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'date_joined')
        read_only_fields = ('id', 'date_joined')


class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password_confirm', 'first_name', 'last_name')

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match.")
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        UserProfile.objects.create(user=user)
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials.')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled.')
            attrs['user'] = user
        else:
            raise serializers.ValidationError('Must provide username and password.')
        
        return attrs


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    operations_remaining = serializers.SerializerMethodField()
    recent_operations = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = ('user', 'daily_operations_count', 'operations_remaining', 'recent_operations')

    def get_operations_remaining(self, obj):
        from django.conf import settings
        obj.reset_daily_count_if_needed()
        return settings.DAILY_OPERATION_LIMIT - obj.daily_operations_count

    def get_recent_operations(self, obj):
        recent = ProcessingHistory.objects.filter(user=obj.user)[:5]
        return ProcessingHistorySerializer(recent, many=True).data


class ProcessingHistorySerializer(serializers.ModelSerializer):
    operation_display = serializers.CharField(source='get_operation_display', read_only=True)

    class Meta:
        model = ProcessingHistory
        fields = ('id', 'operation', 'operation_display', 'filename', 'file_size', 
                 'processing_time', 'created_at', 'success', 'error_message')


class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("No user found with this email address.")
        return value