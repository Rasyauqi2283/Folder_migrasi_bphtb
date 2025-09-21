import { photoLoading } from '../../script-backend/utils/loading_utils.js';

let previewUrl = null;
let grayscaleUrl = null;

const toggleSignatureCards = (visible) => {
  const cards = document.querySelectorAll('.signature-card');
  cards.forEach(card => { if (card) card.style.display = visible ? '' : 'none'; });
};

export const initSignatureUpload = () => {
  const userDivisi = localStorage.getItem('divisi') || sessionStorage.getItem('divisi') || '';
  // Divisi yang boleh mengunggah paraf melalui profil
  const allowedDivisi = ['Peneliti', 'Peneliti Validasi', 'PPAT', 'PPATS'];
  
  if (allowedDivisi.includes(userDivisi)) {
    const btn = document.getElementById('paraf-peneliti');
    if (btn) btn.style.display = 'block';
    setupSignatureModal();
  }
};

const setupSignatureModal = () => {
  const overlay = document.getElementById('signature-overlay');
  const btn = document.getElementById('paraf-peneliti');
  const fileInput = document.getElementById('parafImage');
  const form = document.getElementById('parafForm');
  const cancelBtn = document.getElementById('cancel-signature-upload');
  const confirmBtn = document.getElementById('confirm-signature-upload');

  if (btn) {
  btn.onclick = () => {
    resetSignatureForm();
      if (overlay) overlay.style.display = 'block';
      const backdrop = document.getElementById('overlay-backdrop');
      if (backdrop) backdrop.style.display = 'block';

      // If existing signature present, preload and hide file picker
      const existingPath = localStorage.getItem('signature_path');
      const preview = document.getElementById('parafPreview');
      const canvas = document.getElementById('grayscalePreview');
      const fileField = document.getElementById('parafImage');
      const fileLabel = document.querySelector('label[for="parafImage"]');
      const resetBtn = document.getElementById('reset-signature');
      const uploadedContainer = document.querySelector('.signature-preview-uploaded');
      const uploadedImg = uploadedContainer?.querySelector('img');

      if (existingPath && preview && canvas) {
        toggleSignatureCards(true);
        preview.src = `${existingPath}?t=${Date.now()}`;
        preview.style.display = 'block';
        // Draw grayscale from existing image to keep 1:1 center
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const size = Math.max(img.width, img.height);
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, size, size);
          const x = Math.floor((size - img.width) / 2);
          const y = Math.floor((size - img.height) / 2);
          ctx.filter = 'grayscale(100%)';
          ctx.drawImage(img, x, y);
          canvas.style.display = 'block';
        };
        img.src = `${existingPath}?t=${Date.now()}`;

        if (fileField) fileField.parentElement.style.display = 'none';
        if (fileLabel) fileLabel.style.display = 'none';
        if (resetBtn) resetBtn.style.display = 'inline-block';
        if (uploadedImg) {
          uploadedImg.src = `${existingPath}?t=${Date.now()}`;
          if (uploadedContainer) uploadedContainer.style.display = 'block';
        }
      } else {
        toggleSignatureCards(false);
        if (fileField) fileField.parentElement.style.display = '';
        if (fileLabel) fileLabel.style.display = '';
        if (uploadedContainer) uploadedContainer.style.display = 'none';
      }
    };
  }
  
  if (cancelBtn) {
    cancelBtn.onclick = () => {
    resetSignatureForm();
      if (overlay) overlay.style.display = 'none';
      const backdrop = document.getElementById('overlay-backdrop');
      if (backdrop) backdrop.style.display = 'none';
    };
  }
  
  if (fileInput) fileInput.addEventListener('change', handleSignaturePreview);
  if (form) form.addEventListener('submit', handleSignatureUpload);
  if (confirmBtn) confirmBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
  });

  // Reset (delete) signature handler
  const resetBtn = document.getElementById('reset-signature');
  if (resetBtn) {
    resetBtn.style.display = 'none';
    resetBtn.addEventListener('click', async () => {
      try {
        const res = await fetch('/api/auth/update-profile-paraf', { method: 'DELETE', credentials: 'include' });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data.success === false) throw new Error(data.message || 'Gagal reset');

        // Clear previews and show picker again
        const preview = document.getElementById('parafPreview');
        const canvas = document.getElementById('grayscalePreview');
        const fileField = document.getElementById('parafImage');
        const fileLabel = document.querySelector('label[for="parafImage"]');
        const uploadedContainer = document.querySelector('.signature-preview-uploaded');
        const uploadedImg = uploadedContainer?.querySelector('img');
        if (preview) { preview.src = ''; preview.style.display = 'none'; }
        if (canvas) { const ctx = canvas.getContext('2d'); ctx?.clearRect(0,0,canvas.width,canvas.height); canvas.style.display = 'none'; }
        if (fileField) { fileField.value = ''; fileField.parentElement.style.display = ''; }
        if (fileLabel) fileLabel.style.display = '';
        if (uploadedImg) uploadedImg.src = '';
        if (uploadedContainer) uploadedContainer.style.display = 'none';
        toggleSignatureCards(false);
        localStorage.removeItem('signature_path');
        showSuccessMessage('Tanda tangan direset');
      } catch (err) {
        showErrorMessage(err.message || 'Gagal reset tanda tangan');
      }
    });
  }
};

const handleSignaturePreview = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Bersihkan URL sebelumnya
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  if (grayscaleUrl) URL.revokeObjectURL(grayscaleUrl);

  const preview = document.getElementById('parafPreview');
  const canvas = document.getElementById('grayscalePreview');
  const ctx = canvas.getContext('2d');

  toggleSignatureCards(true);

  // Validasi file
  if (!validateSignatureFile(file)) {
    e.target.value = '';
    return;
  }

  // Preview original centered in square 1:1 box (CSS handles scaling)
  previewUrl = URL.createObjectURL(file);
  preview.src = previewUrl;
  preview.style.display = 'block';

  // Create grayscale preview
  const img = new Image();
  img.onload = () => {
    // Create 1:1 canvas, center the signature inside
    const size = Math.max(img.width, img.height);
    canvas.width = size;
    canvas.height = size;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    const x = Math.floor((size - img.width) / 2);
    const y = Math.floor((size - img.height) / 2);
    ctx.filter = 'grayscale(100%)';
    ctx.drawImage(img, x, y);
    canvas.style.display = 'block';
  };
  grayscaleUrl = URL.createObjectURL(file);
  img.src = grayscaleUrl;
};

const handleSignatureUpload = async (e) => {
  e.preventDefault();
  const fileInput = document.getElementById('parafImage');
  const overlay = document.getElementById('signature-overlay');
  
  if (!fileInput.files[0]) {
    showErrorMessage('Pilih file terlebih dahulu!');
    return;
  }

  // Tidak ada batasan rasio/ukuran; gambar dipusatkan dalam kanvas 1:1 saat preview

  const loadingId = photoLoading.create(overlay);

  try {
    photoLoading.show(loadingId);
    
    const formData = new FormData();
    formData.append('signature', fileInput.files[0]);

    const response = await fetch('/api/auth/update-profile-paraf', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Upload Failed');
    
    if (result.success) {
      showSuccessMessage(result.message);
      if (result.data.path) {
        updateSignaturePreview(result.data.path);
      }
      resetSignatureForm();
      if (overlay) overlay.style.display = 'none';
      const backdrop = document.getElementById('overlay-backdrop');
      if (backdrop) backdrop.style.display = 'none';
    }
  } catch (error) {
    console.error('Upload error:', error);
    showErrorMessage(`Gagal mengupload: ${error.message}`);
  } finally {
    photoLoading.hide(loadingId);
    setTimeout(() => photoLoading.destroy(loadingId), 500);
  }
};

const validateSignatureFile = (file) => {
  const errorElement = document.getElementById('signature-error-message');
  errorElement.textContent = '';
  errorElement.style.display = 'none';

  if (!file) {
    showErrorMessage('Pilih file terlebih dahulu!');
    return false;
  }

  // Validasi tipe file
  // Backend memproses menjadi JPEG, terima PNG/JPEG/WebP dari frontend
  const validTypes = ['image/png', 'image/jpeg', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    showErrorMessage('Hanya format PNG, JPEG, atau SVG yang diperbolehkan');
    return false;
  }

  // Validasi ukuran file
  // Hilangkan batas ukuran di sisi frontend (server tetap memproses)

  return true;
};

const validateSignatureDimensions = (file) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const isValid = img.width <= 800 && img.height <= 300 && img.width / img.height > 2;
      URL.revokeObjectURL(img.src);
      resolve(isValid);
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      resolve(false);
    };
    img.src = URL.createObjectURL(file);
  });
};

const updateSignaturePreview = (path) => {
  const timestamp = new Date().getTime();
  // Update persistent storage so next load pre-fills
  try { localStorage.setItem('signature_path', path); } catch (_) {}
  
  // Update profile page preview if it exists
  const ttdImg = document.getElementById('ttd-preview');
  if (ttdImg) {
    ttdImg.src = `${path}?t=${timestamp}`;
  }

  // Update overlay preview if still open
  const overlayImg = document.getElementById('parafPreview');
  if (overlayImg) {
    // Hard-refresh via timestamp in query to bypass browser cache
    overlayImg.src = `${path}?t=${timestamp}`;
    overlayImg.style.display = 'block';
  }
  // Update big uploaded preview container in overlay
  const uploadedContainer = document.querySelector('.signature-preview-uploaded');
  const uploadedImg = uploadedContainer?.querySelector('img');
  if (uploadedImg) {
    uploadedImg.src = `${path}?t=${timestamp}`;
    if (uploadedContainer) uploadedContainer.style.display = 'block';
  }
  const canvas = document.getElementById('grayscalePreview');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      const size = Math.max(img.width, img.height);
      canvas.width = size;
      canvas.height = size;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);
      const x = Math.floor((size - img.width) / 2);
      const y = Math.floor((size - img.height) / 2);
      ctx.filter = 'grayscale(100%)';
      ctx.drawImage(img, x, y);
      canvas.style.display = 'block';
    };
    img.src = `${path}?t=${timestamp}`;
  }
};

const resetSignatureForm = () => {
  document.getElementById('parafForm').reset();
  document.getElementById('parafPreview').style.display = 'none';
  document.getElementById('grayscalePreview').style.display = 'none';
  document.getElementById('signature-error-message').style.display = 'none';
  
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  if (grayscaleUrl) URL.revokeObjectURL(grayscaleUrl);
  previewUrl = null;
  grayscaleUrl = null;
};

const showErrorMessage = (message) => {
  const errorElement = document.getElementById('signature-error-message');
  errorElement.textContent = message;
  errorElement.style.display = 'block';
  errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
};

const showSuccessMessage = (message) => {
  const successElement = document.getElementById('signature-success-message');
  successElement.textContent = message;
  successElement.style.display = 'block';
  
  setTimeout(() => {
    successElement.style.display = 'none';
  }, 3000);
};
