// Storage Manager - Unified interface for multiple storage providers
import { uploadToRailway, getFileInfo as getRailwayFileInfo } from './railway_storage.js';
import { uploadToUploadcare, getFileInfo as getUploadcareFileInfo } from './uploadcare_storage.js';

// Storage configuration
const STORAGE_CONFIG = {
  default: 'railway', // Default storage provider
  providers: {
    railway: {
      name: 'Railway Storage',
      upload: uploadToRailway,
      getInfo: getRailwayFileInfo,
      enabled: true
    },
    uploadcare: {
      name: 'Uploadcare CDN',
      upload: uploadToUploadcare,
      getInfo: getUploadcareFileInfo,
      enabled: false // Disabled by default
    },
    gdrive: {
      name: 'Google Drive',
      upload: null, // To be implemented
      getInfo: null, // To be implemented
      enabled: false // To be implemented
    }
  }
};

console.log('🌐 [STORAGE-MANAGER] Initializing unified storage manager...');
console.log('🌐 [STORAGE-MANAGER] Available providers:', Object.keys(STORAGE_CONFIG.providers));
console.log('🌐 [STORAGE-MANAGER] Default provider:', STORAGE_CONFIG.default);

/**
 * Upload file to specified storage provider
 * @param {Object} file - File object
 * @param {Object} options - Upload options
 * @param {string} provider - Storage provider (railway, uploadcare, gdrive)
 * @returns {Promise<Object>} Upload result
 */
export async function uploadToStorage(file, options = {}, provider = null) {
  try {
    const storageProvider = provider || STORAGE_CONFIG.default;
    const providerConfig = STORAGE_CONFIG.providers[storageProvider];
    
    if (!providerConfig || !providerConfig.enabled) {
      throw new Error(`Storage provider '${storageProvider}' is not available or enabled`);
    }
    
    console.log(`📤 [STORAGE-MANAGER] Uploading to ${providerConfig.name}...`);
    
    const result = await providerConfig.upload(file, options);
    
    // Add storage provider info to result
    if (result.success) {
      result.storageProvider = storageProvider;
      result.storageName = providerConfig.name;
    }
    
    return result;
  } catch (error) {
    console.error(`❌ [STORAGE-MANAGER] Upload failed:`, error);
    return {
      success: false,
      error: error.message,
      storageProvider: provider || STORAGE_CONFIG.default,
      details: error
    };
  }
}

/**
 * Get file info from specified storage provider
 * @param {string} fileId - File identifier (path, URL, or ID)
 * @param {string} provider - Storage provider
 * @returns {Promise<Object>} File info result
 */
export async function getFileInfoFromStorage(fileId, provider = null) {
  try {
    const storageProvider = provider || STORAGE_CONFIG.default;
    const providerConfig = STORAGE_CONFIG.providers[storageProvider];
    
    if (!providerConfig || !providerConfig.enabled) {
      throw new Error(`Storage provider '${storageProvider}' is not available or enabled`);
    }
    
    console.log(`🔍 [STORAGE-MANAGER] Getting file info from ${providerConfig.name}...`);
    
    const result = await providerConfig.getInfo(fileId);
    
    // Add storage provider info to result
    if (result.success) {
      result.storageProvider = storageProvider;
      result.storageName = providerConfig.name;
    }
    
    return result;
  } catch (error) {
    console.error(`❌ [STORAGE-MANAGER] Get file info failed:`, error);
    return {
      success: false,
      error: error.message,
      storageProvider: provider || STORAGE_CONFIG.default,
      details: error
    };
  }
}

/**
 * Get available storage providers
 * @returns {Object} Available providers
 */
export function getAvailableProviders() {
  return Object.entries(STORAGE_CONFIG.providers)
    .filter(([_, config]) => config.enabled)
    .reduce((acc, [key, config]) => {
      acc[key] = {
        name: config.name,
        enabled: config.enabled
      };
      return acc;
    }, {});
}

/**
 * Set default storage provider
 * @param {string} provider - Provider name
 */
export function setDefaultProvider(provider) {
  if (STORAGE_CONFIG.providers[provider] && STORAGE_CONFIG.providers[provider].enabled) {
    STORAGE_CONFIG.default = provider;
    console.log(`🔧 [STORAGE-MANAGER] Default provider changed to: ${provider}`);
  } else {
    throw new Error(`Provider '${provider}' is not available or enabled`);
  }
}

/**
 * Enable/disable storage provider
 * @param {string} provider - Provider name
 * @param {boolean} enabled - Enable/disable status
 */
export function setProviderEnabled(provider, enabled) {
  if (STORAGE_CONFIG.providers[provider]) {
    STORAGE_CONFIG.providers[provider].enabled = enabled;
    console.log(`🔧 [STORAGE-MANAGER] Provider '${provider}' ${enabled ? 'enabled' : 'disabled'}`);
  } else {
    throw new Error(`Provider '${provider}' not found`);
  }
}

/**
 * Get storage configuration
 * @returns {Object} Storage configuration
 */
export function getStorageConfig() {
  return {
    default: STORAGE_CONFIG.default,
    providers: getAvailableProviders()
  };
}

export default {
  uploadToStorage,
  getFileInfoFromStorage,
  getAvailableProviders,
  setDefaultProvider,
  setProviderEnabled,
  getStorageConfig
};
