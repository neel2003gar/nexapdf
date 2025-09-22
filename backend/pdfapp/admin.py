from django.contrib import admin
from .models import UserProfile, ProcessingHistory, SupportTicket, ContactMessage


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'daily_operations_count', 'last_operation_date', 'created_at')
    list_filter = ('last_operation_date', 'created_at')
    search_fields = ('user__username', 'user__email')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(ProcessingHistory)
class ProcessingHistoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'operation', 'filename', 'file_size', 'processing_time', 'success', 'created_at')
    list_filter = ('operation', 'success', 'created_at')
    search_fields = ('user__username', 'filename')
    readonly_fields = ('created_at',)
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')


@admin.register(SupportTicket)
class SupportTicketAdmin(admin.ModelAdmin):
    list_display = ('id', 'subject', 'name', 'email', 'category', 'status', 'priority', 'created_at')
    list_filter = ('status', 'category', 'priority', 'created_at')
    search_fields = ('subject', 'name', 'email', 'message')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Contact Information', {
            'fields': ('name', 'email')
        }),
        ('Ticket Details', {
            'fields': ('category', 'subject', 'message')
        }),
        ('Status & Priority', {
            'fields': ('status', 'priority')
        }),
        ('Admin Notes', {
            'fields': ('admin_notes', 'user')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'resolved_at'),
            'classes': ('collapse',)
        })
    )
    
    actions = ['mark_as_resolved', 'mark_as_in_progress']
    
    def mark_as_resolved(self, request, queryset):
        queryset.update(status='resolved')
        self.message_user(request, f'{queryset.count()} tickets marked as resolved.')
    mark_as_resolved.short_description = 'Mark selected tickets as resolved'
    
    def mark_as_in_progress(self, request, queryset):
        queryset.update(status='in_progress')
        self.message_user(request, f'{queryset.count()} tickets marked as in progress.')
    mark_as_in_progress.short_description = 'Mark selected tickets as in progress'


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('subject', 'name', 'email', 'category', 'created_at', 'is_read')
    list_filter = ('category', 'is_read', 'created_at')
    search_fields = ('subject', 'name', 'email', 'message')
    readonly_fields = ('created_at',)
    
    fieldsets = (
        ('Contact Information', {
            'fields': ('name', 'email')
        }),
        ('Message Details', {
            'fields': ('category', 'subject', 'message')
        }),
        ('Status', {
            'fields': ('is_read', 'created_at')
        })
    )
    
    actions = ['mark_as_read', 'mark_as_unread']
    
    def mark_as_read(self, request, queryset):
        queryset.update(is_read=True)
        self.message_user(request, f'{queryset.count()} messages marked as read.')
    mark_as_read.short_description = 'Mark selected messages as read'
    
    def mark_as_unread(self, request, queryset):
        queryset.update(is_read=False)
        self.message_user(request, f'{queryset.count()} messages marked as unread.')
    mark_as_unread.short_description = 'Mark selected messages as unread'