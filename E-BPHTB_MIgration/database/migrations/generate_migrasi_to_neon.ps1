# Generate migrasi_to_neon.sql dari database lokal bappenda (38 tabel, schema only).
# Jalankan dari folder repo root atau dari folder migrations (lihat $OutFile).
# Syarat: PostgreSQL client (pg_dump) ada di PATH; akses ke DB bappenda.

$ErrorActionPreference = "Stop"
$dbName = "bappenda"
$dbUser = "postgres"
# Jika pakai password, set env sebelum jalankan: $env:PGPASSWORD = "sandi_anda"
$OutFile = Join-Path $PSScriptRoot "migrasi_to_neon.sql"

Write-Host "Export schema-only dari database '$dbName' ke $OutFile ..."
& pg_dump -U $dbUser -d $dbName --schema-only --no-owner --no-privileges -f $OutFile
if ($LASTEXITCODE -ne 0) { throw "pg_dump gagal (exit $LASTEXITCODE). Cek: pg_dump di PATH, DB '$dbName' jalan, user '$dbUser'." }
Write-Host "Selesai. File: $OutFile"
Write-Host "Langkah berikut: hubungkan ke Neon (psql <NEON_CONNECTION_STRING>), lalu jalankan: \i $OutFile"
Write-Host "Atau dari PowerShell: Get-Content $OutFile | psql <NEON_CONNECTION_STRING>"
