// catatan (belum beres pada bagian ini)
// ==== 1. Imports and Dependencies ====
import { api } from '../../design-n-script/script-backend/utils/api_utils.js';
import { photoLoading  } from '../../design-n-script/script-backend/utils/loading_utils.js';
import { initPhotoUpload } from './uploadfoto_profile.js';
import { initPasswordChange } from './passwordchange_profile.js';
import { initSignatureUpload } from './ttdverif_profile.js';

// ==== 2. Profile API Service ====
class ProfileService {
  static async getProfile(abortSignal) {
    try {
      const response = await api.get('/api/v1/auth/profile', { signal: abortSignal });
      
      // Log the response for debugging
      console.log('Raw API response:', response);
      
      // Check if response exists and has data
      if (!response) {
        throw new Error('No response from server');
      }
      
      // Handle different response structures
      let profileData;
      if (response.user) {
        // If response has user property
        profileData = response.user;
      } else if (response.data && response.data.user) {
        // If response is wrapped in data property
        profileData = response.data.user;
      } else if (response.data) {
        // If response.data is the user data directly
        profileData = response.data;
      } else {
        // If response itself is the user data
        profileData = response;
      }
      
      // Validate that we have the minimum required data
      if (!profileData || typeof profileData !== 'object') {
        throw new Error('Invalid profile data structure from server');
      }
      
      // Check for at least one identifying field
      if (!profileData.userid && !profileData.id && !profileData.nama) {
        throw new Error('Profile data missing required identification fields');
      }
      
      // Return the profile data
      return profileData;
    } catch (error) {
      console.error('ProfileService.getProfile error:', error);
      throw error;
    }
  }

  static async uploadPhoto(formData, abortSignal) {
    // JANGAN set Content-Type header untuk multipart/form-data
    // Biarkan browser set otomatis dengan boundary yang tepat
    return api.post('/api/v1/auth/profile/upload', formData, {
      signal: abortSignal
      // Remove Content-Type header to let browser set it automatically
    });
  }

  static async updatePassword({ oldPassword, newPassword }) {
    return api.post('/api/v1/auth/update-password', { oldPassword, newPassword });
  }

  static async uploadSignature(formData) {
    return api.post('/api/v1/auth/update-profile-paraf', formData);
  }
}

// ==== 3. Main Profile Controller ====
export class ProfileController {
  constructor() {
    this.initProperties();
    this.initElements();
    this.bindEvents();
    this.setupUnloadHandler();
  }

  // ==== 3.1 Initialization Methods ====
  initProperties() {
    this.profileData = null;
    this.abortController = new AbortController();
    this.divisiToHide = ['PPAT', 'PPATS', 'Wajib Pajak'];
    this.cleanupCallbacks = [];
    this.loadingIds = new Map();
    this.elements = {};
    this.isUpdating = false;
    this.isDevelopment = true;
    
    // Photo upload specific properties
    this.photoUploadState = {
      isUploading: false,
      selectedFile: null,
      previewUrl: null,
      uploadAbortController: null
    };
  }

  initElements() {
    const getElement = (id) => {
      const el = document.getElementById(id);
      if (!el) console.warn(`Element #${id} not found`);
      return el;
    };

    this.elements = {
      profileContainer: getElement('profile-container'),
      photoUploadForm: getElement('upload-form'),
      nipField: getElement('nip-field'),
      specialField: getElement('special_field'),
      specialFieldInput: getElement('special_field_input'),
      pejabat_umum: getElement('pejabat_umum_field'),
      pejabat_umum_input: getElement('pejabat_umum_input'),
      specialParafv: getElement('special_ParafValidasi'),
      profileImg: document.getElementById('profileImg'),
      profilePictureWrapper: document.querySelector('.profile-picture-wrapper'),
      pvSignatureLink: document.getElementById('pv-signature-link'),
      ttdPreview: document.getElementById('ttd-preview'),
      ttdInfo: document.getElementById('ttd-info'),
      errorDisplay: document.getElementById('profile-error-message'),
      
      // Photo upload specific elements
      photoOverlay: getElement('photo-overlay'),
      newProfilePhoto: getElement('new-profile-photo'),
      previewImage: getElement('preview-image-change'),
      previewText: getElement('preview-text'),
      savePhotoButton: getElement('save-photo-change'),
      cancelPhotoButton: getElement('cancel-photo-change'),
      uploadProgressBar: getElement('upload-progress-bar'),
      uploadErrorMessage: getElement('upload-error-message'),
      uploadSuccessMessage: getElement('upload-success-message'),
      previewContainer: getElement('preview-container'),
      previewPlaceholder: getElement('preview-placeholder')
    };

    // Hide signature button by default; it will be shown conditionally later
    const parafButton = document.getElementById('paraf-peneliti');
    if (parafButton) {
      parafButton.style.display = 'none';
    }
    if (this.elements.pvSignatureLink) {
      this.elements.pvSignatureLink.style.display = 'none';
    }
  }

  bindEvents() {
    this.loadProfile();
    this.initPhotoUploadEvents();
    this.initPasswordToggles();
  }

  initPhotoUploadEvents() {
    // Photo selection event
    if (this.elements.newProfilePhoto) {
      this.elements.newProfilePhoto.addEventListener('change', (e) => this.handlePhotoSelection(e));
    }
    
    // Save photo button event
    if (this.elements.savePhotoButton) {
      this.elements.savePhotoButton.addEventListener('click', (e) => this.handlePhotoUpload(e));
    }
    
    // Cancel photo button event
    if (this.elements.cancelPhotoButton) {
      this.elements.cancelPhotoButton.addEventListener('click', (e) => this.resetPhotoUpload());
    }
    
    // Photo overlay close events
    if (this.elements.photoOverlay) {
      this.elements.photoOverlay.addEventListener('click', (e) => {
        if (e.target === this.elements.photoOverlay) {
          this.resetPhotoUpload();
        }
      });
    }
  }

  setupUnloadHandler() {
    this.unloadHandler = this.cleanup.bind(this);
    window.addEventListener('beforeunload', this.unloadHandler);
    this.addCleanup(() => {
      window.removeEventListener('beforeunload', this.unloadHandler);
    });
  }

  // ==== 3.2 Core Profile Methods ====
  prepareRequest() {
    // Abort any existing request
    if (this.abortController) {
      this.abortController.abort();
    }
    this.abortController = new AbortController();
  }

  async checkApiAvailability() {
    try {
      // Try to make a simple request to check if API is available
      const response = await fetch('/api/v1/auth/profile', { 
        method: 'HEAD',
        signal: this.abortController.signal 
      });
      return response.ok;
    } catch (error) {
      console.warn('API availability check failed:', error);
      return false;
    }
  }

  async loadProfile() {
    try {
        this.prepareRequest();
        
        if (this.isDevelopment) {
          console.log('Loading profile data...');
        }
        
        // Check if API is available first
        const apiAvailable = await this.checkApiAvailability();
        if (!apiAvailable) {
          throw new Error('API endpoint tidak tersedia. Periksa koneksi server.');
        }
        
        this.profileData = await ProfileService.getProfile(this.abortController.signal);
        
        if (this.isDevelopment) {
          console.log('Profile data received:', this.profileData);
          this.debugProfileData();
        }
        
        this.handleProfileData();
    } catch (error) {
        if (this.isDevelopment) {
          console.error('Profile loading failed:', error);
          this.debugProfileData();
        }
        this.handleProfileError(error);
    }
  }

  // ==== 3.3 Profile Update Handler ====
  async handleProfileUpdate(updateFn) {
    if (this.isUpdating) return;
    
    this.isUpdating = true;
    
    try {
      await updateFn();
      await this.loadProfile();
    } catch (error) {
      console.error('Update error:', error);
      this.showError(error.message || 'Gagal menyimpan perubahan');
    } finally {
      this.isUpdating = false;
    }
  }

  // ==== 3.4 Utility Methods ====
  getUserDivisi() {
    // Prefer localStorage (populated after render), then fallback to profile data
    return (
      localStorage.getItem('divisi') ||
      this.profileData?.divisi ||
      this.profileData?.user?.divisi ||
      ''
    );
  }

  cleanup() {
    this.cleanupCallbacks.forEach(cb => cb());
    this.cleanupCallbacks = [];
    
    // Cleanup photo upload state
    if (this.photoUploadState.uploadAbortController) {
      this.photoUploadState.uploadAbortController.abort();
    }
  }

  addCleanup(callback) {
    this.cleanupCallbacks.push(callback);
  }

  showError(message) {
    if (this.elements.errorDisplay) {
      this.elements.errorDisplay.textContent = message;
      this.elements.errorDisplay.style.display = 'block';
    }
  }

  hideError() {
    if (this.elements.errorDisplay) {
      this.elements.errorDisplay.textContent = '';
      this.elements.errorDisplay.style.display = 'none';
    }
  }

  // ==== 3.5 Loading Management ====
  // Note: Profile loading no longer shows loading indicator
  // Loading is only shown during photo uploads
  
  hideLoading(loadingId) {
    if (loadingId && this.loadingIds.has(loadingId)) {
      photoLoading.hide(loadingId);
      photoLoading.destroy(loadingId);
      this.loadingIds.delete(loadingId);
    }
  }

  // ==== 3.6 Profile Rendering ====
  handleProfileData() {
    if (this.isDevelopment) {
      console.log('Processing profile data:', this.profileData);
      console.log('Profile data type:', typeof this.profileData);
      console.log('Profile data keys:', Object.keys(this.profileData || {}));
    }
    
    // Ensure we have valid data before proceeding
    if (!this.profileData) {
      console.error('No profile data available');
      this.showError('Tidak ada data profil yang tersedia');
      return;
    }
    
    // Try to render the profile
    try {
      this.renderProfile();
      this.initSubModules();
    } catch (error) {
      console.error('Error in handleProfileData:', error);
      this.showError('Gagal memproses data profil: ' + error.message);
    }
  }

  ensureProfileDataCompleteness() {
    // Ensure all required fields have at least default values
    const defaultValues = {
      userid: 'N/A',
      nama: 'N/A',
      divisi: 'N/A',
      email: 'N/A',
      telepon: 'N/A',
      username: 'N/A',
      password: '••••••••',
      nip: 'N/A',
      special_field: 'N/A',
      special_parafv: 'N/A',
      pejabat_umum: 'N/A',
      fotoprofil: null,
      tanda_tangan_path: null
    };

    // Fill in missing fields with defaults
    Object.keys(defaultValues).forEach(key => {
      if (this.profileData[key] === undefined || this.profileData[key] === null) {
        this.profileData[key] = defaultValues[key];
        if (this.isDevelopment) {
          console.log(`Set default value for ${key}:`, defaultValues[key]);
        }
      }
    });

    return this.profileData;
  }

  renderProfile() {
    try {
      if (!this.profileData) {
        this.showError('Data profil tidak tersedia');
        return;
      }
      
      // Ensure all required fields have values
      this.ensureProfileDataCompleteness();
      
      if (!this.validateProfileData(this.profileData)) {
        this.showError('Data profil tidak valid atau tidak lengkap');
        return;
      }

      const userData = this.profileData;
      const cacheBuster = `?t=${new Date().getTime()}`;

      // Persist basic identifiers so other modules can reliably read them
      try {
        if (userData.divisi) localStorage.setItem('divisi', userData.divisi);
        if (userData.userid) localStorage.setItem('userid', userData.userid);
      } catch (_) {
        // Ignore storage errors (e.g., private mode)
      }
      
      // Update all profile sections
      this.handleDivisiSpecificFields(userData);
      this.updateUserDataFields(userData);
      this.updateProfilePhoto(userData, cacheBuster);
      this.handleSignature(userData, cacheBuster);
      
      // Hide any previous errors
      this.hideError();
      
      if (this.isDevelopment) {
        console.log('Profile rendered successfully');
      }
    } catch (error) {
      console.error('Error rendering profile:', error);
      this.showError('Gagal menampilkan profil: ' + error.message);
    }
  }

  validateProfileData(userData) {
    if (!userData) {
      console.error('No user data provided');
      return false;
    }
    
    // Log the data structure for debugging
    if (this.isDevelopment) {
      console.log('Validating profile data:', userData);
    }
    
    // Check for basic required fields with fallbacks
    const mandatoryFields = ['userid', 'nama', 'divisi', 'email'];
    const missingFields = [];
    
    for (const field of mandatoryFields) {
      if (userData[field] === undefined || userData[field] === null || userData[field] === '') {
        missingFields.push(field);
      }
    }
    
    // If we have missing mandatory fields, try to provide fallbacks
    if (missingFields.length > 0) {
      console.warn('Missing mandatory fields:', missingFields);
      
      // Try to provide fallbacks for some fields
      if (!userData.userid && userData.id) {
        userData.userid = userData.id;
        console.log('Using id as userid fallback');
      }
      
      if (!userData.nama && userData.name) {
        userData.nama = userData.name;
        console.log('Using name as nama fallback');
      }
      
      // Check again after fallbacks
      const stillMissing = mandatoryFields.filter(field => 
        userData[field] === undefined || userData[field] === null || userData[field] === ''
      );
      
      if (stillMissing.length > 0) {
        console.error('Still missing required fields after fallbacks:', stillMissing);
        return false;
      }
    }

    // Handle divisi-specific requirements more gracefully
    const divisi = userData.divisi;
    if (divisi) {
      const divisiRequirements = {
        'PPAT': ['special_field', 'pejabat_umum'],
        'PPATS': ['special_field', 'pejabat_umum'],
        'Peneliti Validasi': ['special_parafv']
      };

      const requiredFields = divisiRequirements[divisi] || [];
      for (const field of requiredFields) {
        if (userData[field] === null || userData[field] === undefined) {
          console.warn(`Missing required field for ${divisi}: ${field}, providing default`);
          // Provide default values instead of failing
          if (field === 'special_field') {
            userData[field] = 'N/A';
          } else if (field === 'special_parafv') {
            userData[field] = 'N/A';
          } else if (field === 'pejabat_umum') {
            userData[field] = 'N/A';
          }
        }
      }
    }

    // Ensure all required fields have at least empty string values
    mandatoryFields.forEach(field => {
      if (userData[field] === undefined || userData[field] === null) {
        userData[field] = '';
      }
    });

    return true;
  }

  handleDivisiSpecificFields(user) {
    const userDivisi = user.divisi;
    if (!userDivisi) return;

    // NIP Field
    if (this.elements.nipField && this.divisiToHide.includes(userDivisi)) {
      this.elements.nipField.style.display = "none";
    }
    
    // Special Field
    if (this.elements.specialField) {
      const shouldShowSpecialField = ['PPAT', 'PPATS'].includes(userDivisi);
      this.elements.specialField.style.display = shouldShowSpecialField ? "block" : "none";
      if (shouldShowSpecialField) {
        this.elements.specialFieldInput.value = user.special_field || user.special_field_name || '';
      }
    }
    // Pejabat Umum Field
    if (this.elements.pejabat_umum) {
      const shouldShowPejabatUmumField = ['PPAT', 'PPATS'].includes(userDivisi);
      this.elements.pejabat_umum.style.display = shouldShowPejabatUmumField ? "block" : "none";
      if (shouldShowPejabatUmumField) {
        this.elements.pejabat_umum_input.value = user.pejabat_umum || user.pejabat_umum_name || '';
      }
    }
    
    // Special Paraf Validasi
    if (this.elements.specialParafv) {
      const isPV = userDivisi === 'Peneliti Validasi';
      this.elements.specialParafv.style.display = isPV ? "block" : "none";
      if (isPV) {
        document.getElementById('special_parafv').value = user.special_parafv || '';
      }
    }

    // PV: sembunyikan tombol Paraf Khusus (overlay upload) dan tampilkan link ke autentikasi_bsre.html
    const parafButton = document.getElementById('paraf-peneliti');
    if (parafButton) {
      parafButton.style.display = (userDivisi === 'Peneliti Validasi') ? 'none' : 'block';
    }
    if (this.elements.pvSignatureLink) {
      this.elements.pvSignatureLink.style.display = (userDivisi === 'Peneliti Validasi') ? 'inline-block' : 'none';
    }
  }

  updateUserDataFields(user) {
    // Update basic fields with fallbacks
    this.updateField('.userid', user.userid || user.id || 'N/A');
    this.updateField('.nama', user.nama || user.name || 'N/A');
    this.updateField('.divisi', user.divisi || 'N/A');
    this.updateField('#email', user.email || 'N/A');
    this.updateField('#telepon', user.telepon || user.phone || 'N/A');
    this.updateField('#username', user.username || user.user_name || 'N/A');
    this.updateField('#password', user.password || '••••••••');
    this.updateField('#nip', user.nip || 'N/A');
    
    // Update special fields with fallbacks
    this.updateField('#special_field_input', user.special_field || user.special_field_name || 'N/A');
    this.updateField('#pejabat_umum_input', user.pejabat_umum || user.pejabat_umum_name || 'N/A');
    this.updateField('#special_parafv', user.special_parafv || user.special_parafv_name || 'N/A');
    
    // Log what fields were updated for debugging
    if (this.isDevelopment) {
      console.log('Updated user fields:', {
        userid: user.userid || user.id,
        nama: user.nama || user.name,
        divisi: user.divisi,
        email: user.email,
        telepon: user.telepon || user.phone,
        username: user.username || user.user_name,
        nip: user.nip,
        special_field: user.special_field || user.special_field_name,
        special_parafv: user.special_parafv || user.special_parafv_name,
        pejabat_umum: user.pejabat_umum || user.pejabat_umum_name
      });
    }
  }

  updateField(selector, value) {
    const elements = document.querySelectorAll(selector);
    if (!elements.length) return;
    const displayValue = value || 'Tidak tersedia';
    
    elements.forEach(element => {
      if (element.value !== undefined) element.value = displayValue;
      if (element.textContent !== undefined) element.textContent = displayValue;
    });
  }

  updateProfilePhoto(user, cacheBuster) {
    const defaultPhoto = '/default-foto-profile.png';
    let fotoProfilUrl = defaultPhoto;
    
    if (user.fotoprofil) {
      try {
        const cleanPath = user.fotoprofil.replace(/\\/g, '/');
        // Add cache buster to force image refresh
        const timestamp = cacheBuster || `?t=${new Date().getTime()}`;
        fotoProfilUrl = `${decodeURIComponent(cleanPath)}${timestamp}`;
      } catch (e) {
        console.error('Error processing photo URL:', e);
      }
    }
    
    document.querySelectorAll('.fotoprofil').forEach(img => {
      img.src = fotoProfilUrl;
      img.onerror = () => {
        if (img.src !== defaultPhoto) {
          img.src = defaultPhoto;
        }
      };
    });
  }

  handleSignature(user, cacheBuster) {
    if (!this.elements.ttdPreview || !this.elements.ttdInfo) return;
  
    if (user.tanda_tangan_path) {
      this.elements.ttdPreview.src = `${user.tanda_tangan_path}${cacheBuster}`;
      this.elements.ttdPreview.style.display = 'block';
      this.elements.ttdPreview.onerror = () => {
        // Jika gagal load, sembunyikan preview tanpa fallback default
        this.elements.ttdPreview.src = '';
        this.elements.ttdPreview.style.display = 'none';
      };
      this.elements.ttdInfo.textContent = `Tipe: ${user.tanda_tangan_mime || 'image/jpeg'}`;
      // Store for overlay usage
      try {
        localStorage.setItem('signature_path', user.tanda_tangan_path);
        localStorage.setItem('has_signature', 'true');
      } catch (_) {}
    } else {
      this.elements.ttdPreview.src = '';
      this.elements.ttdPreview.style.display = 'none';
      this.elements.ttdInfo.textContent = 'Tanda tangan belum diunggah';
      try { 
        localStorage.removeItem('signature_path');
        localStorage.setItem('has_signature', 'false');
      } catch (_) {}
    }
  }

  // ==== 3.7 Submodules Initialization ====
  initSubModules() {
    const modules = [
      { 
        name: 'Password Change', 
        init: () => initPasswordChange(),
        shouldLoad: true
      },
      { 
        name: 'Signature Upload', 
        init: () => initSignatureUpload(),
        // Jangan load modul upload signature untuk Peneliti Validasi (mereka pakai halaman BSRE)
        shouldLoad: this.shouldLoadSignatureModule()
      }
    ];

    modules.forEach(module => {
      if (!module.shouldLoad) return;
      
      try {
        module.init();
      } catch (err) {
        console.error(`${module.name} initialization failed:`, err);
        this.showError(`${module.name} feature unavailable`);
      }
    });
  }

  shouldLoadSignatureModule() {
    const userDivisi = this.getUserDivisi();
    // Allow Peneliti, PPAT, PPATS; PV tidak karena diarahkan ke halaman BSRE
    return ['Peneliti', 'PPAT', 'PPATS'].includes(userDivisi);
  }

  // ==== 3.8 Enhanced Photo Upload Handling ====
  handlePhotoSelection(event) {
    const file = event.target.files[0];
    
    if (!file) {
      this.resetPhotoPreview();
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      this.showPhotoError('Format file tidak didukung. Gunakan JPG, JPEG, atau PNG.');
      event.target.value = '';
      return;
    }

    // Validate file size (2MB max - sesuai dengan backend multer config)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      this.showPhotoError('Ukuran file terlalu besar. Maksimal 2MB.');
      event.target.value = '';
      return;
    }

    // Store selected file
    this.photoUploadState.selectedFile = file;
    
    // Show preview
    this.displayPhotoPreview(file);
    
    // Enable save button
    if (this.elements.savePhotoButton) {
      this.elements.savePhotoButton.disabled = false;
    }
  }

  displayPhotoPreview(file) {
    if (!this.elements.previewImage || !this.elements.previewText) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.photoUploadState.previewUrl = e.target.result;
      this.elements.previewImage.src = e.target.result;
      this.elements.previewImage.style.display = 'block';
      
      if (this.elements.previewPlaceholder) {
        this.elements.previewPlaceholder.style.display = 'none';
      }
      
      this.elements.previewText.textContent = file.name;
    };
    
    reader.onerror = () => {
      this.showPhotoError('Gagal memuat preview gambar');
      this.resetPhotoPreview();
    };
    
    reader.readAsDataURL(file);
  }

  resetPhotoPreview() {
    if (this.elements.previewImage) {
      this.elements.previewImage.src = '';
      this.elements.previewImage.style.display = 'none';
    }
    
    if (this.elements.previewText) {
      this.elements.previewText.textContent = 'Tidak ada gambar terpilih';
    }
    
    if (this.elements.previewPlaceholder) {
      this.elements.previewPlaceholder.style.display = 'block';
    }
    
    if (this.elements.savePhotoButton) {
      this.elements.savePhotoButton.disabled = true;
    }
    
    this.photoUploadState.selectedFile = null;
    this.photoUploadState.previewUrl = null;
  }

  async handlePhotoUpload(event) {
    event.preventDefault();
    
    if (!this.photoUploadState.selectedFile) {
      this.showPhotoError('Pilih file foto terlebih dahulu');
      return;
    }
    
    if (this.photoUploadState.isUploading) {
      return; // Prevent multiple uploads
    }
    
    this.photoUploadState.isUploading = true;
    this.photoUploadState.uploadAbortController = new AbortController();
    
    const loadingId = this.showPhotoLoading();
    
    try {
      // Create FormData dengan field name yang sesuai dengan backend
      const formData = new FormData();
      
      // Backend mengharapkan field name 'fotoprofil' (sesuai dengan index.js)
      formData.append('fotoprofil', this.photoUploadState.selectedFile);
      
      // Log untuk debugging
      if (this.isDevelopment) {
        console.log('Uploading file:', this.photoUploadState.selectedFile);
        console.log('FormData entries:');
        for (let [key, value] of formData.entries()) {
          console.log(`${key}:`, value);
        }
      }
      
      // Upload photo menggunakan endpoint yang benar sesuai backend
      const response = await fetch('/api/v1/auth/profile/upload', {
        method: 'POST',
        body: formData,
        signal: this.photoUploadState.uploadAbortController.signal,
        credentials: 'include', // Include cookies untuk session
        // JANGAN set Content-Type header - biarkan browser set otomatis dengan boundary
      });
      
      if (this.isDevelopment) {
        console.log('Upload response status:', response.status);
        console.log('Upload response headers:', Object.fromEntries(response.headers.entries()));
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (this.isDevelopment) {
          console.error('Upload failed with status:', response.status);
          console.error('Error response:', errorData);
        }
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (this.isDevelopment) {
        console.log('Upload response:', result);
      }
      
      // Backend hanya mengirim message, tidak ada path dalam response
      // Kita perlu refresh profile data untuk mendapatkan foto yang baru
      if (result.message && result.message.includes('berhasil')) {
        // Refresh profile data untuk mendapatkan foto yang baru
        await this.loadProfile();
        
        this.showPhotoSuccess('Foto profil berhasil diupdate');
        this.resetPhotoUpload();
      } else {
        throw new Error('Upload gagal: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Photo upload error:', error);
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
        this.showPhotoError(error.message || 'Gagal mengupload foto');
      }
    } finally {
      this.hidePhotoLoading(loadingId);
      this.photoUploadState.isUploading = false;
      this.photoUploadState.uploadAbortController = null;
    }
  }

  resetPhotoUpload() {
    // Abort any ongoing upload
    if (this.photoUploadState.uploadAbortController) {
      this.photoUploadState.uploadAbortController.abort();
      this.photoUploadState.uploadAbortController = null;
    }
    
    // Reset file input
    if (this.elements.newProfilePhoto) {
      this.elements.newProfilePhoto.value = '';
    }
    
    // Reset preview
    this.resetPhotoPreview();
    
    // Hide overlay
    if (this.elements.photoOverlay) {
      this.elements.photoOverlay.style.display = 'none';
    }
    
    // Reset progress
    this.updatePhotoProgress(0);
    
    // Hide messages
    this.hidePhotoMessages();
  }

  showPhotoLoading() {
    if (!this.elements.photoOverlay) return null;
    
    const loadingId = photoLoading.create(this.elements.photoOverlay);
    this.loadingIds.set(loadingId, { element: this.elements.photoOverlay });
    photoLoading.show(loadingId);
    return loadingId;
  }

  hidePhotoLoading(loadingId) {
    if (loadingId && this.loadingIds.has(loadingId)) {
      photoLoading.hide(loadingId);
      photoLoading.destroy(loadingId);
      this.loadingIds.delete(loadingId);
    }
  }

  updatePhotoProgress(percent) {
    if (this.elements.uploadProgressBar) {
      this.elements.uploadProgressBar.style.width = `${percent}%`;
      this.elements.uploadProgressBar.textContent = percent === 100 ? 'Menyelesaikan...' : `${percent}%`;
      
      if (percent >= 100) {
        setTimeout(() => {
          this.elements.uploadProgressBar.style.width = '0%';
          this.elements.uploadProgressBar.textContent = '';
        }, 1000);
      }
    }
  }

  showPhotoError(message) {
    if (this.elements.uploadErrorMessage) {
      this.elements.uploadErrorMessage.textContent = message;
      this.elements.uploadErrorMessage.style.display = 'block';
      setTimeout(() => {
        this.elements.uploadErrorMessage.style.display = 'none';
      }, 5000);
    } else {
      this.showError(message);
    }
  }

  showPhotoSuccess(message) {
    if (this.elements.uploadSuccessMessage) {
      this.elements.uploadSuccessMessage.textContent = message;
      this.elements.uploadSuccessMessage.style.display = 'block';
      setTimeout(() => {
        this.elements.uploadSuccessMessage.style.display = 'none';
      }, 3000);
    } else {
      console.log('Success:', message);
    }
  }

  hidePhotoMessages() {
    if (this.elements.uploadErrorMessage) {
      this.elements.uploadErrorMessage.style.display = 'none';
    }
    if (this.elements.uploadSuccessMessage) {
      this.elements.uploadSuccessMessage.style.display = 'none';
    }
  }

  showSuccess(message) {
    // Implement success message display logic
    console.log('Success:', message);
    // You can add a success notification here
    if (this.elements.errorDisplay) {
      this.elements.errorDisplay.textContent = message;
      this.elements.errorDisplay.style.display = 'block';
      this.elements.errorDisplay.style.color = 'green';
      setTimeout(() => {
        this.hideError();
      }, 3000);
    }
  }

  // ==== 3.9 Enhanced Error Handling ====
  handleProfileError(error) {
    // Define error message mappings
    const ERROR_MESSAGES = {
        default: 'Gagal memuat data profil',
        AbortError: { user: null, log: 'Request aborted' },
        network: 'Tidak ada respon dari server. Periksa koneksi internet Anda.',
        invalidData: 'Data profil tidak valid dari server',
        apiUnavailable: 'API endpoint tidak tersedia. Periksa koneksi server.',
        http: {
        401: 'Sesi telah berakhir. Silakan login kembali.',
        403: 'Anda tidak memiliki izin untuk mengakses profil ini',
        404: 'Profil tidak ditemukan',
        500: 'Terjadi kesalahan server',
        502: 'Server tidak tersedia',
        503: 'Layanan sedang tidak tersedia',
        504: 'Gateway timeout'
        }
    };

    // Handle AbortError immediately
    if (error.name === 'AbortError') {
        console.warn('Profile loading aborted:', error);
        return;
    }

    // Determine the error type and message
    let userMessage = ERROR_MESSAGES.default;
    let shouldRedirect = false;
    let logDetails = error.message || 'Unknown error';

    if (error.message?.includes('API endpoint tidak tersedia')) {
        userMessage = ERROR_MESSAGES.apiUnavailable;
        logDetails = 'API endpoint unavailable';
    } else if (error.response) {
        // HTTP Error responses
        const status = error.response.status;
        userMessage = ERROR_MESSAGES.http[status] || ERROR_MESSAGES.default;
        logDetails = `HTTP Error ${status}: ${error.response.data?.message || ''}`;
        shouldRedirect = status === 401;
    } else if (error.request) {
        // Network errors (no response received)
        userMessage = ERROR_MESSAGES.network;
        logDetails = 'No response received';
    } else if (error.message?.includes('Invalid profile data')) {
        // Custom service errors
        userMessage = ERROR_MESSAGES.invalidData;
    } else if (error.message?.includes('No response from server')) {
        userMessage = ERROR_MESSAGES.network;
        logDetails = 'No response from server';
    }

    // Enhanced error logging
    this.logError(error, logDetails);

    // Show error to user if message exists
    if (userMessage) {
        this.showError(userMessage);
    }

    // Handle critical actions (like redirects)
    if (shouldRedirect) {
        this.safeRedirectToLogin();
    }
  }

  // ==== Helper Methods ====
  logError(error, details) {
    if (this.isDevelopment) {
        console.groupCollapsed('[Profile] Error Details');
        console.error('Message:', details);
        console.error('Full Error:', error);
        if (error.response) {
        console.log('Response Data:', error.response.data);
        console.log('Status:', error.response.status);
        }
        console.groupEnd();
    } else {
        // In production, you might want to send this to an error tracking service
        console.error('[Profile Error]', details);
    }
  }

  debugProfileData() {
    if (!this.isDevelopment) return;
    
    console.group('[Profile] Debug Information');
    console.log('Profile Data:', this.profileData);
    console.log('Profile Data Type:', typeof this.profileData);
    console.log('Profile Data Keys:', Object.keys(this.profileData || {}));
    console.log('Elements:', this.elements);
    console.log('Current State:', {
      isUpdating: this.isUpdating,
      abortController: !!this.abortController,
      profileContainer: !!this.elements.profileContainer,
      photoUploadState: this.photoUploadState
    });
    console.groupEnd();
  }

  safeRedirectToLogin() {
    // Clear any pending operations
    this.abortController?.abort();
    
    // Use a more robust redirect approach
    try {
        const redirectPath = encodeURIComponent(window.location.pathname + window.location.search);
        setTimeout(() => {
        window.location.replace(`/login?redirect=${redirectPath}`);
        }, 2000);
    } catch (e) {
        console.error('Redirect failed:', e);
        window.location.replace('/login');
    }
  }

  // ==== 3.10 Password Toggle Functionality ====
  initPasswordToggles() {
    const toggleSelectors = [
      '#toggle-password',
      '#toggle-old-password', 
      '#toggle-new-password',
      '#toggle-confirm-password'
    ];

    toggleSelectors.forEach(selector => {
      const toggleBtn = document.querySelector(selector);
      if (toggleBtn) {
        toggleBtn.addEventListener('click', (e) => {
          e.preventDefault();
          const input = toggleBtn.previousElementSibling;
          if (input && input.type === 'password') {
            input.type = 'text';
            toggleBtn.textContent = '🙈';
          } else if (input && input.type === 'text') {
            input.type = 'password';
            toggleBtn.textContent = '👁️';
        }
        });
      }
    });
  }
}

// ==== 4. Initialization ====
document.addEventListener('DOMContentLoaded', () => {
  new ProfileController();
});