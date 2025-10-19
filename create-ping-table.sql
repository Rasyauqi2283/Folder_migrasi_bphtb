-- Create ping_notifications table
CREATE TABLE IF NOT EXISTS ping_notifications (
    id SERIAL PRIMARY KEY,
    nobooking VARCHAR(50) NOT NULL,
    no_registrasi VARCHAR(50) NOT NULL,
    target_divisions JSON NOT NULL,
    status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'acknowledged', 'expired')),
    created_at TIMESTAMP DEFAULT NOW(),
    acknowledged_at TIMESTAMP NULL,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ping_notifications_nobooking ON ping_notifications(nobooking);
CREATE INDEX IF NOT EXISTS idx_ping_notifications_status ON ping_notifications(status);
CREATE INDEX IF NOT EXISTS idx_ping_notifications_created_at ON ping_notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_ping_notifications_target_divisions ON ping_notifications USING GIN(target_divisions);

-- Insert test data
INSERT INTO ping_notifications (nobooking, no_registrasi, target_divisions, status) 
VALUES 
    ('TEST001', '2025O001', '["ltb", "bank"]', 'sent'),
    ('TEST002', '2025O002', '["ltb", "bank"]', 'sent')
ON CONFLICT DO NOTHING;

-- Show the table structure
\d ping_notifications;

-- Show sample data
SELECT * FROM ping_notifications ORDER BY created_at DESC LIMIT 5;
