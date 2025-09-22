from django.urls import path
from . import views

urlpatterns = [
    # Health check endpoint
    path('health/', views.HealthCheckView.as_view(), name='health-check'),
    
    # Basic PDF Operations
    path('merge/', views.MergePDFView.as_view(), name='merge-pdf'),
    path('split/', views.SplitPDFView.as_view(), name='split-pdf'),
    path('compress/', views.CompressPDFView.as_view(), name='compress-pdf'),
    path('convert/pdf-to-img/', views.PDFToImageView.as_view(), name='pdf-to-image'),
    path('convert/img-to-pdf/', views.ImageToPDFView.as_view(), name='image-to-pdf'),
    path('convert/docx-to-pdf/', views.DOCXToPDFView.as_view(), name='docx-to-pdf'),
    path('extract-text/', views.ExtractTextView.as_view(), name='extract-text'),
    path('watermark/', views.WatermarkView.as_view(), name='watermark'),
    path('rotate/', views.RotateView.as_view(), name='rotate'),
    path('secure/', views.SecurePDFView.as_view(), name='secure-pdf'),
    path('unlock/', views.UnlockPDFView.as_view(), name='unlock-pdf'),
    
    # Advanced Document Conversions
    path('convert/pdf-to-word/', views.PDFToWordView.as_view(), name='pdf-to-word'),
    path('convert/word-to-pdf/', views.WordToPDFView.as_view(), name='word-to-pdf'),
    path('convert/pdf-to-powerpoint/', views.PDFToPowerPointView.as_view(), name='pdf-to-powerpoint'),
    path('convert/powerpoint-to-pdf/', views.PowerPointToPDFView.as_view(), name='powerpoint-to-pdf'),
    path('convert/pdf-to-excel/', views.PDFToExcelView.as_view(), name='pdf-to-excel'),
    path('convert/excel-to-pdf/', views.ExcelToPDFView.as_view(), name='excel-to-pdf'),
    
    # PDF Organization
    path('organize/', views.OrganizePDFView.as_view(), name='organize-pdf'),
    path('preview/', views.PDFPreviewView.as_view(), name='pdf-preview'),
    
    # Support System
    path('support/contact/', views.ContactView.as_view(), name='contact'),
    path('support/ticket/', views.SupportTicketView.as_view(), name='support-ticket'),
    
    # Usage tracking
    path('usage/', views.UsageInfoView.as_view(), name='usage-info'),
]