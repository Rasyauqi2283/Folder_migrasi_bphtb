@echo off
REM Generate migrasi_to_neon.sql dari database lokal bappenda (schema only).
REM Syarat: PostgreSQL bin di PATH (pg_dump); akses ke DB bappenda.
REM Jika pakai password: set PGPASSWORD=sandi_anda sebelum jalankan.

set DBNAME=bappenda
set DBUSER=postgres
set OUTFILE=%~dp0migrasi_to_neon.sql

echo Export schema dari %DBNAME% ke %OUTFILE% ...
pg_dump -U %DBUSER% -d %DBNAME% --schema-only --no-owner --no-privileges -f "%OUTFILE%"
if errorlevel 1 (
  echo pg_dump gagal. Cek: pg_dump di PATH, DB %DBNAME% jalan.
  exit /b 1
)
echo Selesai: %OUTFILE%
echo Langkah berikut: psql NEON_CONNECTION_STRING -f "%OUTFILE%"
