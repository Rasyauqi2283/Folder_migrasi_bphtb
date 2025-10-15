-- Create notifications table for PPATK system
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    userid VARCHAR(50) NOT NULL,
    nobooking VARCHAR(50),
    title VARCHAR(255) NOT NULL,
    message TEXT,
    type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_userid ON notifications(userid);
CREATE INDEX IF NOT EXISTS idx_notifications_nobooking ON notifications(nobooking);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_notifications_updated_at 
    BEFORE UPDATE ON notifications 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing
INSERT INTO notifications (userid, nobooking, title, message, type, is_read) VALUES
('PAT09', '20011-2025-000009', 'Booking Siap Dicek', 'Booking 20011-2025-000009 telah siap untuk diverifikasi', 'success', false),
('PAT09', '20011-2025-000010', 'Booking Diolah', 'Booking 20011-2025-000010 sedang diproses', 'info', false),
('P01', '20011-2025-000011', 'Paraf Kasie Tersedia', 'Dokumen siap untuk diparaf', 'warning', false)
ON CONFLICT DO NOTHING;

-- Show table structure
\d notifications;
