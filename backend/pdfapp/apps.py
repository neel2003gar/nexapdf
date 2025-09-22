from django.apps import AppConfig


class PdfappConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'pdfapp'

    def ready(self):
        # Start file cleanup service
        from pdfapp.utils.file_cleanup import start_file_cleanup
        start_file_cleanup()