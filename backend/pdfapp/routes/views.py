from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django.http import HttpResponse
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import time
from io import BytesIO
import zipfile

from pdfapp.utils.pdf_helpers import PDFProcessor, DocumentConverter
from pdfapp.models import ProcessingHistory
from pdfapp.utils.usage_tracking import check_usage_limit, increment_usage_count, get_usage_info


class HealthCheckView(APIView):
    """Simple health check endpoint for frontend connectivity testing"""
    permission_classes = []  # No authentication required
    
    def get(self, request):
        from django.conf import settings
        return Response({
            'status': 'healthy',
            'message': 'NexaPDF Backend API is running',
            'version': '1.0.0',
            'timestamp': time.time(),
            'debug_info': {
                'DEBUG': settings.DEBUG,
                'CORS_ALLOW_ALL_ORIGINS': getattr(settings, 'CORS_ALLOW_ALL_ORIGINS', False),
                'CORS_ALLOWED_ORIGINS': getattr(settings, 'CORS_ALLOWED_ORIGINS', []),
                'origin': request.headers.get('Origin', 'No Origin header'),
                'user_agent': request.headers.get('User-Agent', 'No User-Agent')
            }
        })

    def post(self, request):
        return Response({
            'status': 'healthy',
            'message': 'POST request received successfully',
            'data_received': bool(request.data),
            'origin': request.headers.get('Origin', 'No Origin header')
        })


@method_decorator(csrf_exempt, name='dispatch')
class BasePDFView(APIView):
    """Base class for PDF processing views"""
    permission_classes = []  # Disable authentication
    parser_classes = [MultiPartParser, FormParser]

    def check_user_limits(self, request):
        """Check if user can perform operation"""
        can_proceed, user_type, remaining = check_usage_limit(request)
        
        if not can_proceed:
            return Response({
                'error': 'Daily usage limit reached',
                'message': 'You have reached the daily limit of 10 operations for anonymous users. Please sign up for unlimited access or try again tomorrow.',
                'user_type': user_type,
                'remaining_operations': remaining,
                'suggestion': 'Create a free account to continue using NexaPDF without limits.'
            }, status=429)  # 429 Too Many Requests
        
        return None

    def log_operation(self, request, operation, filename='processed_file', file_size=0, processing_time=0, success=True):
        """Log processing operation"""
        try:
            increment_usage_count(request, operation)
        except Exception as e:
            # Don't fail the operation if logging fails
            print(f"Logging error: {e}")
            import traceback
            traceback.print_exc()
            pass

    def create_response(self, output, filename, content_type='application/pdf'):
        """Create HTTP response with file"""
        output.seek(0)  # Ensure pointer is at the beginning
        file_content = output.read()
        response = HttpResponse(file_content, content_type=content_type)
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        response['X-File-Size'] = str(len(file_content))  # Add actual file size header
        return response


class MergePDFView(BasePDFView):
    def get(self, request):
        """Test endpoint to verify merge functionality is available"""
        return Response({
            'message': 'Merge PDF endpoint is available',
            'status': 'ready',
            'requirements': 'Send POST request with files[] containing PDF files'
        })
    
    def post(self, request):
        limit_check = self.check_user_limits(request)
        if limit_check:
            return limit_check

        start_time = time.time()
        
        try:
            files = request.FILES.getlist('files')
            total_files = request.data.get('total_files')
            
            if len(files) < 2:
                return Response({'error': 'At least 2 PDF files are required'}, status=400)

            # Validate file count matches expected
            if total_files and int(total_files) != len(files):
                return Response({
                    'error': f'Expected {total_files} files, but received {len(files)}'
                }, status=400)

            # Validate file types and create ordered list
            ordered_files = []
            file_order_map = {}
            
            # Build file order map from form data
            for key, value in request.data.items():
                if key.startswith('file_order_'):
                    index = int(key.split('_')[-1])
                    file_order_map[index] = value
            
            # If we have explicit ordering, use it to sort files
            if file_order_map:
                # Create a mapping of filename to file object
                file_name_map = {file.name: file for file in files}
                
                # Order files according to the provided order
                for i in range(len(files)):
                    expected_filename = file_order_map.get(i)
                    if expected_filename and expected_filename in file_name_map:
                        ordered_files.append(file_name_map[expected_filename])
                    
                # If ordering failed, fall back to original order
                if len(ordered_files) != len(files):
                    ordered_files = files
            else:
                ordered_files = files

            # Validate file types
            for i, file in enumerate(ordered_files):
                if not file.name.lower().endswith('.pdf'):
                    return Response({
                        'error': f'File at position {i+1} ({file.name}) is not a PDF file'
                    }, status=400)

            # Process merge with ordered files
            output = PDFProcessor.merge_pdfs(ordered_files)
            output.seek(0)  # Ensure pointer is at start
            processing_time = time.time() - start_time
            
            # Log operation
            total_size = sum(file.size for file in ordered_files)
            self.log_operation(
                request, 'merge', f"merged_{len(ordered_files)}_files.pdf", 
                total_size, processing_time
            )

            return self.create_response(output, 'merged.pdf')

        except Exception as e:
            processing_time = time.time() - start_time
            error_message = str(e)
            
            # Log the full error for debugging
            import traceback
            print(f"Merge error: {error_message}")
            print(f"Traceback: {traceback.format_exc()}")
            
            self.log_operation(
                request, 'merge', 'error.pdf', 0, 
                processing_time, False, error_message
            )
            
            # Provide user-friendly error messages
            if "not a valid PDF file" in error_message:
                return Response({
                    'error': 'Invalid PDF file',
                    'message': error_message,
                    'type': 'invalid_pdf'
                }, status=400)
            elif "PDF merge failed" in error_message:
                return Response({
                    'error': 'PDF processing error',
                    'message': error_message,
                    'type': 'processing_error'
                }, status=500)
            else:
                return Response({
                    'error': 'Server error',
                    'message': f'An unexpected error occurred: {error_message}',
                    'type': 'server_error'
                }, status=500)


class SplitPDFView(BasePDFView):
    def post(self, request):
        limit_check = self.check_user_limits(request)
        if limit_check:
            return limit_check

        start_time = time.time()
        
        try:
            pdf_file = request.FILES.get('file')
            split_type = request.data.get('split_type', 'each')  # 'each', 'pages', 'range'
            split_value = request.data.get('split_value')

            if not pdf_file:
                return Response({'error': 'PDF file is required'}, status=400)

            if not pdf_file.name.lower().endswith('.pdf'):
                return Response({'error': 'Only PDF files are allowed'}, status=400)

            # Process split
            outputs = PDFProcessor.split_pdf(pdf_file, split_type, split_value)
            processing_time = time.time() - start_time

            if len(outputs) == 1:
                # Single output file
                outputs[0].seek(0)  # Reset pointer before creating response
                self.log_operation(
                    request, 'split', pdf_file.name, 
                    pdf_file.size, processing_time
                )
                # increment_daily_count(request.user)  # Disabled
                return self.create_response(outputs[0], f'split_{pdf_file.name}')
            
            else:
                # Multiple output files - create zip
                zip_buffer = BytesIO()
                with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
                    for i, output in enumerate(outputs):
                        output.seek(0)  # Reset pointer before reading
                        zip_file.writestr(f'page_{i+1}.pdf', output.read())
                
                zip_buffer.seek(0)
                
                self.log_operation(
                    request, 'split', pdf_file.name, 
                    pdf_file.size, processing_time
                )
                # increment_daily_count(request.user)  # Disabled
                
                return self.create_response(
                    zip_buffer, 
                    f'split_{pdf_file.name}.zip', 
                    'application/zip'
                )

        except Exception as e:
            processing_time = time.time() - start_time
            self.log_operation(
                request, 'split', pdf_file.name if pdf_file else 'error.pdf', 
                pdf_file.size if pdf_file else 0, processing_time, False, str(e)
            )
            return Response({'error': str(e)}, status=500)


class CompressPDFView(BasePDFView):
    def post(self, request):
        limit_check = self.check_user_limits(request)
        if limit_check:
            return limit_check

        start_time = time.time()
        
        try:
            pdf_file = request.FILES.get('file')
            quality = request.data.get('quality', 'medium')  # 'low', 'medium', 'high'

            if not pdf_file:
                return Response({'error': 'PDF file is required'}, status=400)

            if not pdf_file.name.lower().endswith('.pdf'):
                return Response({'error': 'Only PDF files are allowed'}, status=400)

            # Process compression
            output = PDFProcessor.compress_pdf(pdf_file, quality)
            output.seek(0)  # Ensure pointer is at start
            processing_time = time.time() - start_time

            self.log_operation(
                request, 'compress', pdf_file.name, 
                pdf_file.size, processing_time
            )
            # increment_daily_count(request.user)  # Disabled

            return self.create_response(output, f'compressed_{pdf_file.name}')

        except Exception as e:
            processing_time = time.time() - start_time
            self.log_operation(
                request, 'compress', pdf_file.name if pdf_file else 'error.pdf', 
                pdf_file.size if pdf_file else 0, processing_time, False, str(e)
            )
            return Response({'error': str(e)}, status=500)


class PDFToImageView(BasePDFView):
    def post(self, request):
        limit_check = self.check_user_limits(request)
        if limit_check:
            return limit_check

        start_time = time.time()
        
        try:
            pdf_file = request.FILES.get('file')
            image_format = request.data.get('format', 'PNG').upper()
            dpi = int(request.data.get('dpi', 200))

            if not pdf_file:
                return Response({'error': 'PDF file is required'}, status=400)

            if not pdf_file.name.lower().endswith('.pdf'):
                return Response({'error': 'Only PDF files are allowed'}, status=400)

            if image_format not in ['PNG', 'JPG', 'JPEG']:
                return Response({'error': 'Supported formats: PNG, JPG'}, status=400)

            # Process conversion
            output = PDFProcessor.pdf_to_images(pdf_file, image_format, dpi)
            processing_time = time.time() - start_time

            self.log_operation(
                request, 'pdf_to_img', pdf_file.name, 
                pdf_file.size, processing_time
            )
            # increment_daily_count(request.user)  # Disabled

            return self.create_response(
                output, 
                f'{pdf_file.name.rsplit(".", 1)[0]}_images.zip', 
                'application/zip'
            )

        except Exception as e:
            processing_time = time.time() - start_time
            self.log_operation(
                request, 'pdf_to_img', pdf_file.name if pdf_file else 'error.pdf', 
                pdf_file.size if pdf_file else 0, processing_time, False, str(e)
            )
            return Response({'error': str(e)}, status=500)


class ImageToPDFView(BasePDFView):
    def post(self, request):
        limit_check = self.check_user_limits(request)
        if limit_check:
            return limit_check

        start_time = time.time()
        
        try:
            image_files = request.FILES.getlist('files')
            
            if not image_files:
                return Response({'error': 'At least one image file is required'}, status=400)

            # Get rotation data if provided (JSON string with rotations for each image)
            rotations_data = request.data.get('rotations', '[]')
            try:
                import json
                rotations = json.loads(rotations_data) if rotations_data else []
            except:
                rotations = []

            # Validate image files
            allowed_formats = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff']
            for img_file in image_files:
                if not any(img_file.name.lower().endswith(fmt) for fmt in allowed_formats):
                    return Response({'error': 'Only image files are allowed'}, status=400)

            # Process conversion with rotations
            output = PDFProcessor.images_to_pdf(image_files, rotations)
            output.seek(0)  # Ensure pointer is at start
            processing_time = time.time() - start_time

            total_size = sum(img.size for img in image_files)
            self.log_operation(
                request, 'img_to_pdf', f'{len(image_files)}_images.pdf', 
                total_size, processing_time
            )
            # increment_daily_count(request.user)  # Disabled

            return self.create_response(output, 'images_to_pdf.pdf')

        except Exception as e:
            processing_time = time.time() - start_time
            self.log_operation(
                request, 'img_to_pdf', 'error.pdf', 0, 
                processing_time, False, str(e)
            )
            return Response({'error': str(e)}, status=500)


class DOCXToPDFView(BasePDFView):
    def post(self, request):
        limit_check = self.check_user_limits(request)
        if limit_check:
            return limit_check

        start_time = time.time()
        
        try:
            docx_file = request.FILES.get('file')

            if not docx_file:
                return Response({'error': 'DOCX file is required'}, status=400)

            if not docx_file.name.lower().endswith('.docx'):
                return Response({'error': 'Only DOCX files are allowed'}, status=400)

            # Process conversion
            output = DocumentConverter.docx_to_pdf(docx_file)
            output.seek(0)  # Ensure pointer is at start
            processing_time = time.time() - start_time

            self.log_operation(
                request, 'docx_to_pdf', docx_file.name, 
                docx_file.size, processing_time
            )
            # increment_daily_count(request.user)  # Disabled

            return self.create_response(
                output, 
                f'{docx_file.name.rsplit(".", 1)[0]}.pdf'
            )

        except Exception as e:
            processing_time = time.time() - start_time
            self.log_operation(
                request, 'docx_to_pdf', docx_file.name if docx_file else 'error.docx', 
                docx_file.size if docx_file else 0, processing_time, False, str(e)
            )
            return Response({'error': str(e)}, status=500)


class ExtractTextView(BasePDFView):
    def post(self, request):
        limit_check = self.check_user_limits(request)
        if limit_check:
            return limit_check

        start_time = time.time()
        pdf_file = None
        
        try:
            pdf_file = request.FILES.get('file')

            if not pdf_file:
                return Response({'error': 'PDF file is required'}, status=400)

            if not pdf_file.name.lower().endswith('.pdf'):
                return Response({'error': 'Only PDF files are allowed'}, status=400)

            # Extract text
            text_content = PDFProcessor.extract_text(pdf_file)
            processing_time = time.time() - start_time

            self.log_operation(
                request, 'extract_text', pdf_file.name, 
                pdf_file.size, processing_time
            )
            # increment_daily_count(request.user)  # Disabled

            # Return as JSON for frontend processing
            return Response({
                'text': text_content,
                'filename': f'{pdf_file.name.rsplit(".", 1)[0]}.txt',
                'processing_time': processing_time
            })

        except Exception as e:
            processing_time = time.time() - start_time
            self.log_operation(
                request, 'extract_text', pdf_file.name if pdf_file else 'error.pdf', 
                pdf_file.size if pdf_file else 0, processing_time, False
            )
            return Response({'error': str(e)}, status=500)


class WatermarkView(BasePDFView):
    def post(self, request):
        limit_check = self.check_user_limits(request)
        if limit_check:
            return limit_check

        start_time = time.time()
        
        try:
            pdf_file = request.FILES.get('file')
            watermark_type = request.data.get('type', 'text')  # 'text' or 'image'
            position = request.data.get('position', 'center')
            opacity = float(request.data.get('opacity', 0.3))
            x_offset = int(request.data.get('x_offset', 0))
            y_offset = int(request.data.get('y_offset', 0))

            if not pdf_file:
                return Response({'error': 'PDF file is required'}, status=400)

            if not pdf_file.name.lower().endswith('.pdf'):
                return Response({'error': 'Only PDF files are allowed'}, status=400)

            if watermark_type == 'text':
                # Text watermark parameters
                watermark_text = request.data.get('text', 'WATERMARK')
                font_size = int(request.data.get('font_size', 36))
                color = request.data.get('color', 'gray')
                rotation = int(request.data.get('rotation', 0))
                
                output = PDFProcessor.add_watermark(
                    pdf_file, watermark_text, position, opacity, 
                    font_size, color, rotation, x_offset, y_offset
                )
            elif watermark_type == 'image':
                # Image watermark parameters
                image_file = request.FILES.get('watermark_image')
                if not image_file:
                    return Response({'error': 'Watermark image file is required'}, status=400)
                
                scale = float(request.data.get('scale', 1.0))
                
                output = PDFProcessor.add_image_watermark(
                    pdf_file, image_file, position, opacity, 
                    scale, x_offset, y_offset
                )
            else:
                return Response({'error': 'Invalid watermark type. Use "text" or "image"'}, status=400)
            output.seek(0)  # Ensure pointer is at start
            processing_time = time.time() - start_time

            self.log_operation(
                request, 'watermark', pdf_file.name, 
                pdf_file.size, processing_time
            )
            # increment_daily_count(request.user)  # Disabled

            return self.create_response(output, f'watermarked_{pdf_file.name}')

        except Exception as e:
            processing_time = time.time() - start_time
            self.log_operation(
                request, 'watermark', pdf_file.name if pdf_file else 'error.pdf', 
                pdf_file.size if pdf_file else 0, processing_time, False, str(e)
            )
            return Response({'error': str(e)}, status=500)


class RotateView(BasePDFView):
    def post(self, request):
        limit_check = self.check_user_limits(request)
        if limit_check:
            return limit_check

        start_time = time.time()
        
        try:
            pdf_file = request.FILES.get('file')
            
            if not pdf_file:
                return Response({'error': 'PDF file is required'}, status=400)

            if not pdf_file.name.lower().endswith('.pdf'):
                return Response({'error': 'Only PDF files are allowed'}, status=400)

            # Handle both old format (pages/angle) and new format (rotations)
            import json
            from pypdf import PdfReader
            
            rotations = {}
            
            # Check for new format first (rotations JSON)
            rotations_data = request.data.get('rotations')
            if rotations_data:
                rotations = json.loads(rotations_data)
                # Convert string keys to integers
                rotations = {int(k): v for k, v in rotations.items()}
            else:
                # Handle old format (pages string and angle)
                pages_str = request.data.get('pages', 'all')
                angle = int(request.data.get('angle', 90))
                
                # Get total page count from PDF
                pdf_file.seek(0)
                reader = PdfReader(pdf_file)
                total_pages = len(reader.pages)
                pdf_file.seek(0)  # Reset for later use
                
                if pages_str == 'all':
                    # Apply rotation to all pages
                    rotations = {i: angle for i in range(1, total_pages + 1)}
                else:
                    # Parse specific pages (e.g., "1,3,5" or "1-5")
                    page_numbers = []
                    for part in pages_str.split(','):
                        part = part.strip()
                        if '-' in part:
                            # Handle range like "1-5"
                            start, end = part.split('-', 1)
                            start, end = int(start.strip()), int(end.strip())
                            page_numbers.extend(range(start, end + 1))
                        else:
                            # Handle single page
                            page_numbers.append(int(part))
                    
                    # Apply rotation to specified pages
                    rotations = {page: angle for page in page_numbers if 1 <= page <= total_pages}

            # Rotate pages
            output = PDFProcessor.rotate_pages(pdf_file, rotations)
            output.seek(0)  # Ensure pointer is at start
            processing_time = time.time() - start_time

            self.log_operation(
                request, 'rotate', pdf_file.name, 
                pdf_file.size, processing_time
            )
            # increment_daily_count(request.user)  # Disabled

            return self.create_response(output, f'rotated_{pdf_file.name}')

        except Exception as e:
            processing_time = time.time() - start_time
            self.log_operation(
                request, 'rotate', pdf_file.name if pdf_file else 'error.pdf', 
                pdf_file.size if pdf_file else 0, processing_time, False, str(e)
            )
            return Response({'error': str(e)}, status=500)


class SecurePDFView(BasePDFView):
    def post(self, request):
        limit_check = self.check_user_limits(request)
        if limit_check:
            return limit_check

        start_time = time.time()
        
        try:
            pdf_file = request.FILES.get('file')
            # Accept both 'user_password' and 'password' for compatibility
            user_password = request.data.get('user_password') or request.data.get('password')
            owner_password = request.data.get('owner_password')

            if not pdf_file:
                return Response({'error': 'PDF file is required'}, status=400)

            if not pdf_file.name.lower().endswith('.pdf'):
                return Response({'error': 'Only PDF files are allowed'}, status=400)

            if not user_password:
                return Response({'error': 'Password is required'}, status=400)

            # Secure PDF
            output = PDFProcessor.secure_pdf(pdf_file, user_password, owner_password)
            output.seek(0)  # Ensure pointer is at start
            processing_time = time.time() - start_time

            self.log_operation(
                request, 'secure', pdf_file.name, 
                pdf_file.size, processing_time
            )
            # increment_daily_count(request.user)  # Disabled

            return self.create_response(output, f'secured_{pdf_file.name}')

        except Exception as e:
            processing_time = time.time() - start_time
            self.log_operation(
                request, 'secure', pdf_file.name if pdf_file else 'error.pdf', 
                pdf_file.size if pdf_file else 0, processing_time, False, str(e)
            )
            return Response({'error': str(e)}, status=500)


class UnlockPDFView(BasePDFView):
    def post(self, request):
        limit_check = self.check_user_limits(request)
        if limit_check:
            return limit_check

        start_time = time.time()
        
        try:
            pdf_file = request.FILES.get('file')
            password = request.data.get('password')

            if not pdf_file:
                return Response({'error': 'PDF file is required'}, status=400)

            if not pdf_file.name.lower().endswith('.pdf'):
                return Response({'error': 'Only PDF files are allowed'}, status=400)

            if not password:
                return Response({'error': 'Password is required'}, status=400)

            # Unlock PDF
            output = PDFProcessor.unlock_pdf(pdf_file, password)
            output.seek(0)  # Ensure pointer is at start
            processing_time = time.time() - start_time

            self.log_operation(
                request, 'unlock', pdf_file.name, 
                pdf_file.size, processing_time
            )
            # increment_daily_count(request.user)  # Disabled

            return self.create_response(output, f'unlocked_{pdf_file.name}')

        except ValueError as e:
            processing_time = time.time() - start_time
            self.log_operation(
                request, 'unlock', pdf_file.name, 
                pdf_file.size, processing_time, False, str(e)
            )
            return Response({'error': str(e)}, status=400)

        except Exception as e:
            processing_time = time.time() - start_time
            self.log_operation(
                request, 'unlock', pdf_file.name if pdf_file else 'error.pdf', 
                pdf_file.size if pdf_file else 0, processing_time, False, str(e)
            )
            return Response({'error': str(e)}, status=500)


# Advanced Document Conversion Views
class PDFToWordView(BasePDFView):
    def post(self, request):
        limit_check = self.check_user_limits(request)
        if limit_check:
            return limit_check
        
        start_time = time.time()
        pdf_file = None
        
        try:
            pdf_file = request.FILES.get('pdf')
            if not pdf_file:
                return Response({'error': 'No PDF file provided'}, status=400)
            
            if not pdf_file.name.lower().endswith('.pdf'):
                return Response({'error': 'File must be a PDF'}, status=400)
            
            # Convert PDF to DOCX
            output = DocumentConverter.pdf_to_docx(pdf_file)
            
            processing_time = time.time() - start_time
            self.log_operation(
                request, 'pdf_to_word', pdf_file.name, 
                pdf_file.size, processing_time, True
            )
            
            filename = pdf_file.name.rsplit('.', 1)[0] + '.docx'
            return self.create_response(
                output, filename, 
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            )
            
        except ValueError as e:
            processing_time = time.time() - start_time
            self.log_operation(
                request, 'pdf_to_word', pdf_file.name if pdf_file else 'error.pdf', 
                pdf_file.size if pdf_file else 0, processing_time, False, str(e)
            )
            return Response({'error': str(e)}, status=400)
            
        except Exception as e:
            processing_time = time.time() - start_time
            self.log_operation(
                request, 'pdf_to_word', pdf_file.name if pdf_file else 'error.pdf', 
                pdf_file.size if pdf_file else 0, processing_time, False, str(e)
            )
            return Response({'error': str(e)}, status=500)


class WordToPDFView(BasePDFView):
    def post(self, request):
        limit_check = self.check_user_limits(request)
        if limit_check:
            return limit_check
        
        start_time = time.time()
        docx_file = None
        
        try:
            docx_file = request.FILES.get('docx')
            if not docx_file:
                return Response({'error': 'No DOCX file provided'}, status=400)
            
            if not docx_file.name.lower().endswith('.docx'):
                return Response({'error': 'File must be a DOCX document'}, status=400)
            
            # Convert DOCX to PDF
            output = DocumentConverter.docx_to_pdf(docx_file)
            
            processing_time = time.time() - start_time
            self.log_operation(
                request, 'word_to_pdf', docx_file.name, 
                docx_file.size, processing_time, True
            )
            
            filename = docx_file.name.rsplit('.', 1)[0] + '.pdf'
            return self.create_response(output, filename)
            
        except ValueError as e:
            processing_time = time.time() - start_time
            self.log_operation(
                request, 'word_to_pdf', docx_file.name if docx_file else 'error.docx', 
                docx_file.size if docx_file else 0, processing_time, False, str(e)
            )
            return Response({'error': str(e)}, status=400)
            
        except Exception as e:
            processing_time = time.time() - start_time
            self.log_operation(
                request, 'word_to_pdf', docx_file.name if docx_file else 'error.docx', 
                docx_file.size if docx_file else 0, processing_time, False, str(e)
            )
            return Response({'error': str(e)}, status=500)


class PDFToPowerPointView(BasePDFView):
    def post(self, request):
        limit_check = self.check_user_limits(request)
        if limit_check:
            return limit_check
        
        start_time = time.time()
        pdf_file = None
        
        try:
            pdf_file = request.FILES.get('pdf')
            if not pdf_file:
                return Response({'error': 'No PDF file provided'}, status=400)
            
            if not pdf_file.name.lower().endswith('.pdf'):
                return Response({'error': 'File must be a PDF'}, status=400)
            
            # Convert PDF to PPTX
            output = DocumentConverter.pdf_to_pptx(pdf_file)
            
            processing_time = time.time() - start_time
            self.log_operation(
                request, 'pdf_to_powerpoint', pdf_file.name, 
                pdf_file.size, processing_time, True
            )
            
            filename = pdf_file.name.rsplit('.', 1)[0] + '.pptx'
            return self.create_response(
                output, filename, 
                'application/vnd.openxmlformats-officedocument.presentationml.presentation'
            )
            
        except ValueError as e:
            processing_time = time.time() - start_time
            self.log_operation(
                request, 'pdf_to_powerpoint', pdf_file.name if pdf_file else 'error.pdf', 
                pdf_file.size if pdf_file else 0, processing_time, False, str(e)
            )
            return Response({'error': str(e)}, status=400)
            
        except Exception as e:
            processing_time = time.time() - start_time
            self.log_operation(
                request, 'pdf_to_powerpoint', pdf_file.name if pdf_file else 'error.pdf', 
                pdf_file.size if pdf_file else 0, processing_time, False, str(e)
            )
            return Response({'error': str(e)}, status=500)


class PowerPointToPDFView(BasePDFView):
    def post(self, request):
        limit_check = self.check_user_limits(request)
        if limit_check:
            return limit_check
        
        start_time = time.time()
        pptx_file = None
        
        try:
            pptx_file = request.FILES.get('pptx')
            if not pptx_file:
                return Response({'error': 'No PowerPoint file provided'}, status=400)
            
            if not pptx_file.name.lower().endswith('.pptx'):
                return Response({'error': 'File must be a PPTX presentation'}, status=400)
            
            # Convert PPTX to PDF
            output = DocumentConverter.pptx_to_pdf(pptx_file)
            
            processing_time = time.time() - start_time
            self.log_operation(
                request, 'powerpoint_to_pdf', pptx_file.name, 
                pptx_file.size, processing_time, True
            )
            
            filename = pptx_file.name.rsplit('.', 1)[0] + '.pdf'
            return self.create_response(output, filename)
            
        except ValueError as e:
            processing_time = time.time() - start_time
            self.log_operation(
                request, 'powerpoint_to_pdf', pptx_file.name if pptx_file else 'error.pptx', 
                pptx_file.size if pptx_file else 0, processing_time, False, str(e)
            )
            return Response({'error': str(e)}, status=400)
            
        except Exception as e:
            processing_time = time.time() - start_time
            self.log_operation(
                request, 'powerpoint_to_pdf', pptx_file.name if pptx_file else 'error.pptx', 
                pptx_file.size if pptx_file else 0, processing_time, False, str(e)
            )
            return Response({'error': str(e)}, status=500)


class PDFToExcelView(BasePDFView):
    def post(self, request):
        limit_check = self.check_user_limits(request)
        if limit_check:
            return limit_check
        
        start_time = time.time()
        pdf_file = None
        
        try:
            pdf_file = request.FILES.get('pdf')
            if not pdf_file:
                return Response({'error': 'No PDF file provided'}, status=400)
            
            if not pdf_file.name.lower().endswith('.pdf'):
                return Response({'error': 'File must be a PDF'}, status=400)
            
            # Convert PDF to Excel
            output = DocumentConverter.pdf_to_excel(pdf_file)
            
            processing_time = time.time() - start_time
            self.log_operation(
                request, 'pdf_to_excel', pdf_file.name, 
                pdf_file.size, processing_time, True
            )
            
            filename = pdf_file.name.rsplit('.', 1)[0] + '.xlsx'
            return self.create_response(
                output, filename, 
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
            
        except ValueError as e:
            processing_time = time.time() - start_time
            self.log_operation(
                request, 'pdf_to_excel', pdf_file.name if pdf_file else 'error.pdf', 
                pdf_file.size if pdf_file else 0, processing_time, False, str(e)
            )
            return Response({'error': str(e)}, status=400)
            
        except Exception as e:
            processing_time = time.time() - start_time
            self.log_operation(
                request, 'pdf_to_excel', pdf_file.name if pdf_file else 'error.pdf', 
                pdf_file.size if pdf_file else 0, processing_time, False, str(e)
            )
            return Response({'error': str(e)}, status=500)


class ExcelToPDFView(BasePDFView):
    def post(self, request):
        limit_check = self.check_user_limits(request)
        if limit_check:
            return limit_check
        
        start_time = time.time()
        excel_file = None
        
        try:
            excel_file = request.FILES.get('excel')
            if not excel_file:
                return Response({'error': 'No Excel file provided'}, status=400)
            
            if not excel_file.name.lower().endswith(('.xlsx', '.xls')):
                return Response({'error': 'File must be an Excel document (.xlsx or .xls)'}, status=400)
            
            # Convert Excel to PDF
            output = DocumentConverter.excel_to_pdf(excel_file)
            
            processing_time = time.time() - start_time
            self.log_operation(
                request, 'excel_to_pdf', excel_file.name, 
                excel_file.size, processing_time, True
            )
            
            filename = excel_file.name.rsplit('.', 1)[0] + '.pdf'
            return self.create_response(output, filename)
            
        except ValueError as e:
            processing_time = time.time() - start_time
            self.log_operation(
                request, 'excel_to_pdf', excel_file.name if excel_file else 'error.xlsx', 
                excel_file.size if excel_file else 0, processing_time, False, str(e)
            )
            return Response({'error': str(e)}, status=400)
            
        except Exception as e:
            processing_time = time.time() - start_time
            self.log_operation(
                request, 'excel_to_pdf', excel_file.name if excel_file else 'error.xlsx', 
                excel_file.size if excel_file else 0, processing_time, False, str(e)
            )
            return Response({'error': str(e)}, status=500)


class OrganizePDFView(BasePDFView):
    def post(self, request):
        limit_check = self.check_user_limits(request)
        if limit_check:
            return limit_check
        
        start_time = time.time()
        pdf_file = None
        
        try:
            pdf_file = request.FILES.get('pdf')
            operation = request.POST.get('operation', 'auto')
            
            if not pdf_file:
                return Response({'error': 'No PDF file provided'}, status=400)
            
            if not pdf_file.name.lower().endswith('.pdf'):
                return Response({'error': 'File must be a PDF'}, status=400)
            
            # Import the PDFOrganizer class
            from pdfapp.utils.pdf_helpers import PDFOrganizer
            
            # Get page order for manual reordering
            page_order = None
            if operation == 'manual':
                page_order_str = request.data.get('page_order')
                if page_order_str:
                    import json
                    try:
                        page_order = json.loads(page_order_str)
                    except json.JSONDecodeError:
                        return Response({'error': 'Invalid page order format'}, status=400)
                else:
                    return Response({'error': 'Page order required for manual operation'}, status=400)
            
            # Organize PDF
            output = PDFOrganizer.organize_pdf(pdf_file, operation, page_order)
            
            processing_time = time.time() - start_time
            self.log_operation(
                request, f'organize_{operation}', pdf_file.name, 
                pdf_file.size, processing_time, True
            )
            
            filename = f'organized_{pdf_file.name}'
            return self.create_response(output, filename)
            
        except ValueError as e:
            processing_time = time.time() - start_time
            self.log_operation(
                request, 'organize', pdf_file.name if pdf_file else 'error.pdf', 
                pdf_file.size if pdf_file else 0, processing_time, False, str(e)
            )
            return Response({'error': str(e)}, status=400)
            
        except Exception as e:
            processing_time = time.time() - start_time
            self.log_operation(
                request, 'organize', pdf_file.name if pdf_file else 'error.pdf', 
                pdf_file.size if pdf_file else 0, processing_time, False, str(e)
            )
            return Response({'error': str(e)}, status=500)


class PDFPreviewView(BasePDFView):
    def post(self, request):
        start_time = time.time()
        pdf_file = None
        
        try:
            pdf_file = request.FILES.get('pdf')
            if not pdf_file:
                return Response({'error': 'No PDF file provided'}, status=400)
            
            if not pdf_file.name.lower().endswith('.pdf'):
                return Response({'error': 'File must be a PDF'}, status=400)
            
            # Generate preview images for all pages
            preview_urls = PDFProcessor.generate_preview_images(pdf_file)
            
            processing_time = time.time() - start_time
            # Preview operations should NOT count against usage limits
            # self.log_operation(request, 'preview', pdf_file.name, pdf_file.size, processing_time, True)
            
            return Response({
                'pages': preview_urls,
                'total_pages': len(preview_urls)
            })
            
        except Exception as e:
            processing_time = time.time() - start_time
            # Preview errors should NOT count against usage limits
            # self.log_operation(request, 'preview', pdf_file.name if pdf_file else 'error.pdf', pdf_file.size if pdf_file else 0, processing_time, False, str(e))
            return Response({'error': str(e)}, status=500)


# Support System Views
from pdfapp.models import ContactMessage, SupportTicket
from pdfapp.serializers import ContactMessageSerializer, SupportTicketSerializer
from django.core.mail import send_mail
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class ContactView(APIView):
    """Handle contact form submissions"""
    permission_classes = []
    
    def post(self, request):
        try:
            serializer = ContactMessageSerializer(data=request.data)
            if serializer.is_valid():
                contact_message = serializer.save()
                
                # Send notification email to admin
                try:
                    self.send_notification_email(contact_message)
                except Exception as e:
                    logger.error(f"Failed to send notification email: {str(e)}")
                    # Don't fail the request if email fails
                
                return Response({
                    'message': 'Your message has been received. We will respond within 48 hours.',
                    'ticket_id': contact_message.id
                }, status=status.HTTP_201_CREATED)
            else:
                return Response({
                    'error': 'Please check your input',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f"Contact form error: {str(e)}")
            return Response({
                'error': 'An error occurred while processing your request. Please try again.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def send_notification_email(self, contact_message):
        """Send notification email to admin"""
        subject = f"NexaPDF Support - {contact_message.subject}"
        
        # Get category display name
        category_map = {
            'general': 'General Questions',
            'technical': 'Technical Issues', 
            'feature': 'Feature Requests',
            'billing': 'Billing & Account'
        }
        category_display = category_map.get(contact_message.category, contact_message.category.title())
        
        message = f"""🔔 New Contact Form Submission - NexaPDF

📋 CONTACT DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: {contact_message.name}
Email: {contact_message.email}
Category: {category_display}  
Subject: {contact_message.subject}

📝 MESSAGE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{contact_message.message}

⏰ SUBMISSION INFO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Submitted: {contact_message.created_at}
Ticket ID: #{contact_message.id}
Platform: NexaPDF Support System

---
Reply directly to this email to respond to the user.
        """
        
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@nexapdf.com')
        to_email = 'neel2003gar@gmail.com'
        
        send_mail(
            subject=subject,
            message=message,
            from_email=from_email,
            recipient_list=[to_email],
            fail_silently=False,
        )

class SupportTicketView(APIView):
    """Handle support ticket creation and management"""
    permission_classes = []
    
    def post(self, request):
        """Create a new support ticket"""
        try:
            serializer = SupportTicketSerializer(data=request.data)
            if serializer.is_valid():
                # Determine priority based on category
                priority = 'medium'
                if request.data.get('category') == 'bug':
                    priority = 'high'
                elif request.data.get('category') == 'technical':
                    priority = 'high'
                
                ticket = serializer.save(priority=priority)
                
                # Send notification email
                try:
                    self.send_ticket_notification(ticket)
                except Exception as e:
                    logger.error(f"Failed to send ticket notification: {str(e)}")
                
                return Response({
                    'message': 'Support ticket created successfully. We will respond within 48 hours.',
                    'ticket_id': ticket.id,
                    'priority': ticket.priority
                }, status=status.HTTP_201_CREATED)
            else:
                return Response({
                    'error': 'Please check your input',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f"Support ticket error: {str(e)}")
            return Response({
                'error': 'An error occurred while creating your ticket. Please try again.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def send_ticket_notification(self, ticket):
        """Send notification email for new support ticket"""
        subject = f"NexaPDF Support Ticket #{ticket.id} - {ticket.subject}"
        
        # Get category display name  
        category_map = {
            'general': 'General Questions',
            'technical': 'Technical Issues',
            'feature': 'Feature Requests', 
            'billing': 'Billing & Account'
        }
        category_display = category_map.get(ticket.category, ticket.category.title())
        
        message = f"""🎫 New Support Ticket - NexaPDF

📋 TICKET DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Ticket ID: #{ticket.id}
Name: {ticket.name}
Email: {ticket.email}
Category: {category_display}
Priority: {ticket.get_priority_display()}
Subject: {ticket.subject}

📝 MESSAGE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{ticket.message}

⏰ TICKET INFO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Created: {ticket.created_at}
Status: {ticket.get_status_display()}
Priority: {ticket.get_priority_display()}
Platform: NexaPDF Support System

---
Reply directly to this email to respond to the user.
        """
        
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@nexapdf.com')
        to_email = 'neel2003gar@gmail.com'
        
        send_mail(
            subject=subject,
            message=message,
            from_email=from_email,
            recipient_list=[to_email],
            fail_silently=False,
        )


class UsageInfoView(APIView):
    """Get current usage information for user"""
    permission_classes = []
    
    def get(self, request):
        """Get usage statistics"""
        try:
            usage_info = get_usage_info(request)
            return Response(usage_info, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'error': 'Unable to get usage information',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



