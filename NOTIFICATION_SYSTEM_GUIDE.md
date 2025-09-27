# 🔔 Sistem Notifikasi Berbasis Divisi

## 📋 Overview

Sistem notifikasi telah dimodifikasi untuk membedakan antara divisi admin (dengan panel) dan divisi lain (hanya poller). Ini memberikan kontrol yang lebih baik atas pengalaman notifikasi berdasarkan peran pengguna.

## 🎯 Divisi dan Behavior

### 1. **Admin Divisi** (Panel + UI + Poller)
- **Divisi:** `Administrator`, `admin`, `A`
- **Features:**
  - ✅ Notification Panel (persistent sidebar)
  - ✅ UI Cards (pop-up notifications)
  - ✅ Long Polling
  - ✅ History tracking
  - ✅ Full notification management

### 2. **Poller-Only Divisi** (UI + Poller, No Panel)
- **Divisi:** `LTB`, `BANK`, `Peneliti`, `Peneliti Validasi`, `LSB`
- **Features:**
  - ❌ Notification Panel (disabled)
  - ✅ UI Cards (pop-up notifications)
  - ✅ Long Polling
  - ❌ History tracking
  - ✅ Basic notification display

### 3. **Other Divisi** (Default Behavior)
- **Divisi:** `PPAT`, `PPATS`, `Customer Service`, `CS`, `Wajib Pajak`, `WP`
- **Features:**
  - ❌ Notification Panel (disabled)
  - ✅ UI Cards (pop-up notifications)
  - ✅ Long Polling
  - ❌ History tracking
  - ✅ Default notification behavior

## 🔧 Implementation

### File Structure
```
public/script-backend/
├── notification-config.js      # Konfigurasi divisi dan behavior
├── notification-setup.js       # Main initialization logic
├── notification-panel.js       # Panel untuk admin
├── notification-ui.js          # UI cards untuk semua
└── notification-poller.js      # Long polling untuk semua
```

### Key Functions

#### `notification-config.js`
```javascript
// Check if divisi is admin
isAdminDivisi(divisi)

// Check if divisi is poller-only
isPollerOnlyDivisi(divisi)

// Get complete behavior config
getNotificationBehavior(divisi)

// Log setup for debugging
logNotificationSetup(divisi, userId)
```

#### `notification-setup.js`
```javascript
// Initialize notifications with auto-detection
initNotifications()

// Initialize with manual panel control
initNotifications({ createPanel: true/false })
```

## 📊 Behavior Matrix

| Divisi | Panel | UI Cards | Poller | History | Description |
|--------|-------|----------|--------|---------|-------------|
| Administrator | ✅ | ✅ | ✅ | ✅ | Full system |
| LTB | ❌ | ✅ | ✅ | ❌ | Poller only |
| BANK | ❌ | ✅ | ✅ | ❌ | Poller only |
| Peneliti | ❌ | ✅ | ✅ | ❌ | Poller only |
| Peneliti Validasi | ❌ | ✅ | ✅ | ❌ | Poller only |
| LSB | ❌ | ✅ | ✅ | ❌ | Poller only |
| PPAT | ❌ | ✅ | ✅ | ❌ | Default |
| Other | ❌ | ✅ | ✅ | ❌ | Default |

## 🚀 Usage Examples

### Basic Usage (Auto-detection)
```javascript
import { initNotifications } from '/script-backend/notification-setup.js';

// Automatically detects divisi and sets appropriate behavior
initNotifications();
```

### Manual Control
```javascript
import { initNotifications } from '/script-backend/notification-setup.js';

// Force panel for any divisi
initNotifications({ createPanel: true });

// Disable panel for any divisi
initNotifications({ createPanel: false });
```

### Check Divisi Behavior
```javascript
import { isAdminDivisi, isPollerOnlyDivisi, getNotificationBehavior } from '/script-backend/notification-config.js';

const divisi = 'LTB';
console.log('Is admin:', isAdminDivisi(divisi)); // false
console.log('Is poller-only:', isPollerOnlyDivisi(divisi)); // true
console.log('Behavior:', getNotificationBehavior(divisi));
```

## 🔍 Debugging

### Console Logs
Sistem akan menampilkan log berikut di console:

```javascript
🔔 Notification Setup for LTB (123): {
  type: 'poller-only',
  hasPanel: false,
  hasUI: true,
  hasPoller: true,
  description: 'UI notifications + poller only (no panel)'
}
ℹ️ Notification panel disabled for non-admin divisi
🔔 Poller-only notification: UI card only
```

### Manual Testing
```javascript
// Check current user's notification setup
console.log(window.notificationBootstrap);

// Check if panel exists
console.log(!!window.notificationPanel);

// Check if UI exists
console.log(!!window.notificationUI);
```

## 📝 Migration Notes

### Existing Code
Kode yang sudah ada tidak perlu diubah karena:
- `initNotifications()` tetap berfungsi dengan auto-detection
- Behavior default tetap sama untuk divisi yang tidak dikonfigurasi
- Backward compatibility terjaga

### New Features
- Auto-detection berdasarkan divisi
- Configurable behavior per divisi
- Enhanced logging untuk debugging
- Modular configuration system

## 🛠️ Configuration

### Adding New Divisi
Edit `notification-config.js`:

```javascript
export const NOTIFICATION_CONFIG = {
    ADMIN_DIVISI: ['Administrator', 'admin', 'A', 'NEW_ADMIN'],
    POLLER_ONLY_DIVISI: ['LTB', 'BANK', 'Peneliti', 'NEW_POLLER'],
    OTHER_DIVISI: ['PPAT', 'PPATS', 'NEW_OTHER']
};
```

### Custom Behavior
```javascript
// Override behavior for specific page
initNotifications({ 
    createPanel: true,  // Force panel
    panelOptions: { width: '400px' },
    historyLimit: 100
});
```

## 🔒 Security Considerations

- Panel hanya tersedia untuk admin divisi
- Poller tetap berfungsi untuk semua divisi
- UI cards tetap aman untuk semua divisi
- Session validation tetap berlaku

## 📈 Performance Impact

- **Admin:** Slight increase due to panel + history
- **Poller-only:** No change (panel disabled)
- **Other:** No change (default behavior)
- **Overall:** Minimal impact, better UX for admin

## 🎉 Benefits

1. **Better UX for Admin:** Full notification management
2. **Simplified for Workers:** Focus on essential notifications
3. **Configurable:** Easy to modify per divisi
4. **Backward Compatible:** Existing code works unchanged
5. **Debuggable:** Enhanced logging and monitoring
