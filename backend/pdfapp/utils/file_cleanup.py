import os
import time
import threading
from pathlib import Path
from django.conf import settings


class FileCleanupManager:
    """Manage temporary file cleanup"""
    
    def __init__(self):
        self.cleanup_thread = None
        self.running = False
    
    def start_cleanup_thread(self):
        """Start the background cleanup thread"""
        if not self.running:
            self.running = True
            self.cleanup_thread = threading.Thread(target=self._cleanup_loop, daemon=True)
            self.cleanup_thread.start()
    
    def stop_cleanup_thread(self):
        """Stop the background cleanup thread"""
        self.running = False
        if self.cleanup_thread:
            self.cleanup_thread.join()
    
    def _cleanup_loop(self):
        """Main cleanup loop that runs in background"""
        while self.running:
            try:
                self.cleanup_old_files()
                time.sleep(300)  # Check every 5 minutes
            except Exception as e:
                print(f"Error in cleanup loop: {e}")
    
    def cleanup_old_files(self):
        """Remove files older than specified time"""
        try:
            media_root = Path(settings.MEDIA_ROOT)
            temp_dir = media_root / 'temp'
            
            if not temp_dir.exists():
                return
            
            current_time = time.time()
            cleanup_time = getattr(settings, 'TEMP_FILE_CLEANUP_MINUTES', 30) * 60
            
            for file_path in temp_dir.rglob('*'):
                if file_path.is_file():
                    file_age = current_time - file_path.stat().st_mtime
                    if file_age > cleanup_time:
                        try:
                            file_path.unlink()
                            print(f"Cleaned up old file: {file_path}")
                        except OSError as e:
                            print(f"Failed to delete {file_path}: {e}")
            
            # Remove empty directories
            for dir_path in temp_dir.rglob('*'):
                if dir_path.is_dir() and not any(dir_path.iterdir()):
                    try:
                        dir_path.rmdir()
                    except OSError:
                        pass
                        
        except Exception as e:
            print(f"Error during file cleanup: {e}")
    
    @staticmethod
    def create_temp_file(suffix='', prefix='pdf_'):
        """Create a temporary file and return its path"""
        media_root = Path(settings.MEDIA_ROOT)
        temp_dir = media_root / 'temp'
        temp_dir.mkdir(parents=True, exist_ok=True)
        
        timestamp = str(int(time.time() * 1000))
        filename = f"{prefix}{timestamp}{suffix}"
        file_path = temp_dir / filename
        
        return file_path
    
    @staticmethod
    def save_uploaded_file(uploaded_file):
        """Save uploaded file to temporary location"""
        file_path = FileCleanupManager.create_temp_file(
            suffix=f"_{uploaded_file.name}",
            prefix="upload_"
        )
        
        with open(file_path, 'wb') as f:
            for chunk in uploaded_file.chunks():
                f.write(chunk)
        
        return file_path


# Global cleanup manager instance
cleanup_manager = FileCleanupManager()


def start_file_cleanup():
    """Start the file cleanup service"""
    cleanup_manager.start_cleanup_thread()


def stop_file_cleanup():
    """Stop the file cleanup service"""
    cleanup_manager.stop_cleanup_thread()