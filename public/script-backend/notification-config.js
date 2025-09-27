// frontend/js/notification-config.js
// Konfigurasi notifikasi berdasarkan divisi

export const NOTIFICATION_CONFIG = {
    // Divisi yang memiliki notification panel (admin)
    ADMIN_DIVISI: ['Administrator', 'admin', 'A'],
    
    // Divisi yang hanya menggunakan poller (tidak ada panel)
    POLLER_ONLY_DIVISI: ['LTB', 'BANK', 'Peneliti', 'Peneliti Validasi', 'LSB'],
    
    // Divisi lain yang menggunakan behavior default
    OTHER_DIVISI: ['PPAT', 'PPATS', 'Customer Service', 'CS', 'Wajib Pajak', 'WP']
};

// Function to determine if divisi should have notification panel
export function isAdminDivisi(divisi) {
    return NOTIFICATION_CONFIG.ADMIN_DIVISI.includes(divisi);
}

// Function to determine if divisi should only use poller (no panel)
export function isPollerOnlyDivisi(divisi) {
    return NOTIFICATION_CONFIG.POLLER_ONLY_DIVISI.includes(divisi);
}

// Function to get notification behavior for divisi
export function getNotificationBehavior(divisi) {
    if (isAdminDivisi(divisi)) {
        return {
            type: 'admin',
            hasPanel: true,
            hasUI: true,
            hasPoller: true,
            description: 'Full notification system with panel'
        };
    } else if (isPollerOnlyDivisi(divisi)) {
        return {
            type: 'poller-only',
            hasPanel: false,
            hasUI: true,
            hasPoller: true,
            description: 'UI notifications + poller only (no panel)'
        };
    } else {
        return {
            type: 'default',
            hasPanel: false,
            hasUI: true,
            hasPoller: true,
            description: 'Default notification behavior'
        };
    }
}

// Function to log notification setup for debugging
export function logNotificationSetup(divisi, userId) {
    const behavior = getNotificationBehavior(divisi);
    console.log(`🔔 Notification Setup for ${divisi} (${userId}):`, behavior);
    return behavior;
}

export default {
    NOTIFICATION_CONFIG,
    isAdminDivisi,
    isPollerOnlyDivisi,
    getNotificationBehavior,
    logNotificationSetup
};
