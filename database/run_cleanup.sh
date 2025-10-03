#!/bin/bash

echo "========================================"
echo "CLEANUP DATA BOOKING - HAPUS SEMUA KECUALI YANG SUDAH SELESAI"
echo "========================================"
echo

echo "[1/3] Running backup script..."
psql -h localhost -U postgres -d railway -f backup_before_cleanup.sql
if [ $? -ne 0 ]; then
    echo "❌ Backup failed!"
    exit 1
fi
echo "✅ Backup completed successfully"
echo

echo "[2/3] Running cleanup script..."
psql -h localhost -U postgres -d railway -f cleanup_booking_data.sql
if [ $? -ne 0 ]; then
    echo "❌ Cleanup failed!"
    exit 1
fi
echo "✅ Cleanup completed successfully"
echo

echo "[3/3] Verification..."
psql -h localhost -U postgres -d railway -c "SELECT COUNT(*) as remaining_records FROM pat_1_bookingsspd;"
echo

echo "========================================"
echo "CLEANUP COMPLETED!"
echo "========================================"
echo
echo "Backup tables created:"
echo "- pat_1_bookingsspd_backup_20251003"
echo "- pat_1_bookingsspd_keep_20251003"
echo "- pat_1_bookingsspd_delete_20251003"
echo
