@echo off
echo ========================================
echo Uploadcare Database Migration Script
echo ========================================
echo.

echo [1/4] Checking database connection...
echo Please make sure your PostgreSQL database is running and accessible.
echo.

echo [2/4] Running migration script...
echo Executing: add_uploadcare_fields.sql
psql -h localhost -U postgres -d bappenda -f database/add_uploadcare_fields.sql

if %errorlevel% neq 0 (
    echo.
    echo ❌ Migration failed! Please check the error above.
    echo.
    pause
    exit /b 1
)

echo.
echo [3/4] Verifying migration...
echo Executing: verify_uploadcare_fields.sql
psql -h localhost -U postgres -d bappenda -f database/verify_uploadcare_fields.sql

if %errorlevel% neq 0 (
    echo.
    echo ⚠️ Verification failed, but migration might have succeeded.
    echo Please check the database manually.
    echo.
    pause
    exit /b 1
)

echo.
echo [4/4] Migration completed successfully!
echo.
echo ✅ All Uploadcare fields have been added to pat_1_bookingsspd table.
echo ✅ Backend can now store file metadata properly.
echo.
echo Next steps:
echo 1. Test file upload functionality
echo 2. Verify data is being stored correctly
echo 3. Check frontend preview is working
echo.
pause
