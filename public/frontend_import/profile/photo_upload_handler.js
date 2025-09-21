// Photo Upload Handler - Additional functionality for profile photo upload
export class PhotoUploadHandler {
  constructor() {
    this.initElements();
    this.bindEvents();
  }

  initElements() {
    // Get the change photo button (usually near the profile picture)
    this.changePhotoBtn = document.querySelector('.gfot, .change-photo-btn, [data-action="change-photo"]');
    
    // Get photo overlay elements
    this.photoOverlay = document.getElementById('photo-overlay');
    this.photoOverlayContent = document.querySelector('.photo-overlay-content');
    
    // Get form elements
    this.uploadForm = document.getElementById('upload-form');
    this.fileInput = document.getElementById('new-profile-photo');
    
    // Get preview elements
    this.previewContainer = document.getElementById('preview-container');
    this.previewPlaceholder = document.getElementById('preview-placeholder');
    this.previewImage = document.getElementById('preview-image-change');
    this.previewText = document.getElementById('preview-text');
    
    // Get button elements
    this.saveButton = document.getElementById('save-photo-change');
    this.cancelButton = document.getElementById('cancel-photo-change');
    
    // Get message elements
    this.errorMessage = document.getElementById('upload-error-message');
    this.successMessage = document.getElementById('upload-success-message');
    
    // Get progress elements
    this.progressBar = document.getElementById('upload-progress-bar');
    this.progressText = document.getElementById('progress-text');
  }

  bindEvents() {
    // Bind change photo button click
    if (this.changePhotoBtn) {
      this.changePhotoBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.showPhotoOverlay();
      });
    }

    // Bind file input change
    if (this.fileInput) {
      this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
    }

    // Bind save button click
    if (this.saveButton) {
      this.saveButton.addEventListener('click', (e) => this.handleSaveClick(e));
    }

    // Bind cancel button click
    if (this.cancelButton) {
      this.cancelButton.addEventListener('click', (e) => this.handleCancelClick(e));
    }

    // Bind overlay click to close
    if (this.photoOverlay) {
      this.photoOverlay.addEventListener('click', (e) => {
        if (e.target === this.photoOverlay) {
          this.hidePhotoOverlay();
        }
      });
    }

    // Bind escape key to close overlay
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.photoOverlay && this.photoOverlay.style.display !== 'none') {
        this.hidePhotoOverlay();
      }
    });
  }

  showPhotoOverlay() {
    if (this.photoOverlay) {
      this.photoOverlay.style.display = 'flex';
      this.photoOverlay.classList.add('show');
      
      // Reset form state
      this.resetForm();
      
      // Focus on file input for accessibility
      if (this.fileInput) {
        this.fileInput.focus();
      }
    }
  }

  hidePhotoOverlay() {
    if (this.photoOverlay) {
      this.photoOverlay.classList.remove('show');
      this.photoOverlay.style.display = 'none';
      
      // Reset form state
      this.resetForm();
    }
  }

  handleFileSelect(event) {
    const file = event.target.files[0];
    
    if (!file) {
      this.resetPreview();
      return;
    }

    // Validate file
    if (!this.validateFile(file)) {
      event.target.value = '';
      return;
    }

    // Show preview
    this.showPreview(file);
    
    // Enable save button
    if (this.saveButton) {
      this.saveButton.disabled = false;
    }
  }

  validateFile(file) {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      this.showError('Format file tidak didukung. Gunakan JPG, JPEG, atau PNG.');
      return false;
    }

    // Check file size (2MB max - sesuai dengan backend multer config)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      this.showError('Ukuran file terlalu besar. Maksimal 2MB.');
      return false;
    }

    return true;
  }

  showPreview(file) {
    if (!this.previewImage || !this.previewText) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewImage.src = e.target.result;
      this.previewImage.style.display = 'block';
      
      if (this.previewPlaceholder) {
        this.previewPlaceholder.style.display = 'none';
      }
      
      this.previewText.textContent = file.name;
    };
    
    reader.onerror = () => {
      this.showError('Gagal memuat preview gambar');
      this.resetPreview();
    };
    
    reader.readAsDataURL(file);
  }

  resetPreview() {
    if (this.previewImage) {
      this.previewImage.src = '';
      this.previewImage.style.display = 'none';
    }
    
    if (this.previewText) {
      this.previewText.textContent = 'Tidak ada gambar terpilih';
    }
    
    if (this.previewPlaceholder) {
      this.previewPlaceholder.style.display = 'block';
    }
  }

  resetForm() {
    // Reset file input
    if (this.fileInput) {
      this.fileInput.value = '';
    }
    
    // Reset preview
    this.resetPreview();
    
    // Disable save button
    if (this.saveButton) {
      this.saveButton.disabled = true;
    }
    
    // Hide messages
    this.hideMessages();
    
    // Reset progress
    this.resetProgress();
  }

  handleSaveClick(event) {
    event.preventDefault();
    
    if (!this.fileInput || !this.fileInput.files[0]) {
      this.showError('Pilih file foto terlebih dahulu');
      return;
    }
    
    // Trigger form submission
    if (this.uploadForm) {
      this.uploadForm.dispatchEvent(new Event('submit', { bubbles: true }));
    }
  }

  handleCancelClick(event) {
    event.preventDefault();
    this.hidePhotoOverlay();
  }

  showError(message) {
    if (this.errorMessage) {
      this.errorMessage.textContent = message;
      this.errorMessage.style.display = 'block';
      this.errorMessage.classList.add('show');
      
      setTimeout(() => {
        this.errorMessage.classList.remove('show');
        this.errorMessage.style.display = 'none';
      }, 5000);
    }
  }

  showSuccess(message) {
    if (this.successMessage) {
      this.successMessage.textContent = message;
      this.successMessage.style.display = 'block';
      this.successMessage.classList.add('show');
      
      setTimeout(() => {
        this.successMessage.classList.remove('show');
        this.successMessage.style.display = 'none';
      }, 3000);
    }
  }

  hideMessages() {
    if (this.errorMessage) {
      this.errorMessage.style.display = 'none';
      this.errorMessage.classList.remove('show');
    }
    if (this.successMessage) {
      this.successMessage.style.display = 'none';
      this.successMessage.classList.remove('show');
    }
  }

  showProgress(percent) {
    if (this.progressBar) {
      this.progressBar.style.width = `${percent}%`;
      
      if (this.progressText) {
        this.progressText.textContent = percent === 100 ? 'Menyelesaikan...' : `${percent}%`;
      }
    }
  }

  resetProgress() {
    if (this.progressBar) {
      this.progressBar.style.width = '0%';
    }
    if (this.progressText) {
      this.progressText.textContent = '';
    }
  }

  // Public method to show overlay from external code
  openPhotoUpload() {
    this.showPhotoOverlay();
  }

  // Public method to close overlay from external code
  closePhotoUpload() {
    this.hidePhotoOverlay();
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Check if we're on a profile page
  if (document.getElementById('photo-overlay')) {
    window.photoUploadHandler = new PhotoUploadHandler();
  }
});
