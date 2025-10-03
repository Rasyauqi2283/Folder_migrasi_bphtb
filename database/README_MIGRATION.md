# Uploadcare Database Migration

## 📋 Overview

This migration adds missing fields to the `pat_1_bookingsspd` table to support Uploadcare integration. The backend code is already trying to store data in these fields, but they don't exist in the database yet.

## 🎯 Purpose

Add 15 new fields to store:
- **File IDs** from Uploadcare (5 fields)
- **MIME types** for file validation (5 fields)  
- **File sizes** for storage tracking (5 fields)

## 📊 Fields Being Added

### File ID Fields (VARCHAR(50))
- `akta_tanah_file_id`
- `sertifikat_tanah_file_id`
- `pelengkap_file_id`
- `pdf_dokumen_file_id`
- `file_withstempel_file_id`

### MIME Type Fields (VARCHAR(100))
- `akta_tanah_mime_type`
- `sertifikat_tanah_mime_type`
- `pelengkap_mime_type`
- `pdf_dokumen_mime_type`
- `file_withstempel_mime_type`

### File Size Fields (BIGINT)
- `akta_tanah_size`
- `sertifikat_tanah_size`
- `pelengkap_size`
- `pdf_dokumen_size`
- `file_withstempel_size`

## 🚀 How to Run Migration

### Option 1: Using Scripts (Recommended)

**Windows:**
```bash
database/run_migration.bat
```

**Linux/Mac:**
```bash
chmod +x database/run_migration.sh
./database/run_migration.sh
```

### Option 2: Manual Execution

1. **Run Migration:**
```bash
psql -h localhost -U postgres -d bappenda -f database/add_uploadcare_fields.sql
```

2. **Verify Migration:**
```bash
psql -h localhost -U postgres -d bappenda -f database/verify_uploadcare_fields.sql
```

## 🔍 Verification

After migration, you should see:
- ✅ 15 new fields added to `pat_1_bookingsspd` table
- ✅ 5 new indexes created for performance
- ✅ All fields are nullable (safe for existing data)

## 🔄 Rollback (If Needed)

If you need to rollback the migration:

```bash
psql -h localhost -U postgres -d bappenda -f database/rollback_uploadcare_fields.sql
```

**⚠️ Warning:** Rollback will permanently delete all data in the new fields!

## 📈 Performance Impact

- **Migration Time:** ~1-2 seconds
- **Storage Impact:** ~15 columns × average row count
- **Performance:** Improved with new indexes
- **Downtime:** None (fields are nullable)

## 🧪 Testing After Migration

1. **Test File Upload:**
   - Upload a PDF file
   - Check if `file_id`, `mime_type`, and `size` are stored

2. **Test Frontend Preview:**
   - Verify PDF preview works
   - Check image thumbnails display correctly

3. **Test Database Queries:**
   - Verify backend can read/write new fields
   - Check no errors in application logs

## 📝 Database Schema After Migration

```sql
-- Example of new fields in pat_1_bookingsspd table
CREATE TABLE pat_1_bookingsspd (
    -- ... existing fields ...
    akta_tanah_path VARCHAR(255),           -- ✅ Already exists
    akta_tanah_file_id VARCHAR(50),         -- 🆕 New field
    akta_tanah_mime_type VARCHAR(100),      -- 🆕 New field
    akta_tanah_size BIGINT,                 -- 🆕 New field
    -- ... other fields ...
);
```

## 🆘 Troubleshooting

### Migration Fails
- Check database connection
- Verify PostgreSQL is running
- Check user permissions
- Review error messages

### Verification Fails
- Check if fields were actually added
- Verify table name is correct
- Check database schema

### Backend Still Errors
- Restart application server
- Check backend logs
- Verify field names match exactly

## 📞 Support

If you encounter issues:
1. Check the error logs
2. Verify database connection
3. Test with a small dataset first
4. Contact system administrator

---

**Migration Status:** ✅ Ready to Execute  
**Risk Level:** 🟢 Low (fields are nullable)  
**Estimated Time:** 1-2 minutes  
**Rollback Available:** ✅ Yes
