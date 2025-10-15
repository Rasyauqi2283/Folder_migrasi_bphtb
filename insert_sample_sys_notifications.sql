-- Insert sample data ke sys_notifications untuk testing
INSERT INTO sys_notifications (
    id, 
    recipient_id, 
    recipient_divisi, 
    title, 
    message, 
    booking_id, 
    is_read, 
    created_at, 
    expires_at
) VALUES 
-- Sample notifications untuk PAT09
(1, 'PAT09', 'PPATK', 'Booking Siap Dicek', 'Booking 20011-2025-000009 telah siap untuk diverifikasi', 1, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 minutes'),
(2, 'PAT09', 'PPATK', 'Booking Diolah', 'Booking 20011-2025-000010 sedang diproses', 2, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 minutes'),
(3, 'PAT09', 'PPATK', 'Booking Pending', 'Booking 20011-2025-000011 menunggu antrian', 3, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 minutes'),

-- Sample notifications untuk P01 (Peneliti)
(4, 'P01', 'PENELITI', 'Paraf Kasie Tersedia', 'Dokumen siap untuk diparaf', 4, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 minutes'),
(5, 'P01', 'PENELITI', 'Verifikasi Selesai', 'Verifikasi dokumen telah selesai', 5, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 minutes'),

-- Sample notifications untuk BANK01
(6, 'BANK01', 'BANK', 'Transaksi Perlu Dicek', 'Transaksi baru perlu diverifikasi', 6, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 minutes'),
(7, 'BANK01', 'BANK', 'Pembayaran Dikonfirmasi', 'Pembayaran telah dikonfirmasi', 7, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 minutes')

ON CONFLICT (id) DO NOTHING;

-- Update sequence untuk sys_notifications
SELECT setval('sys_notifications_id_seq', (SELECT MAX(id) FROM sys_notifications));

-- Show inserted data
SELECT 
    n.id,
    n.recipient_id,
    n.recipient_divisi,
    n.title,
    n.message,
    n.booking_id,
    n.is_read,
    n.created_at
FROM sys_notifications n
ORDER BY n.created_at DESC;
