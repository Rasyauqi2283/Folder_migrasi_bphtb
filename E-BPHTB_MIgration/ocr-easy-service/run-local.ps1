# Jalankan EasyOCR tanpa Docker
# Gunakan jika Docker tidak tersedia

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if (-not (Test-Path ".venv")) {
    Write-Host " membuat venv..."
    python -m venv .venv
}
& .\.venv\Scripts\Activate.ps1
pip install -q -r requirements.txt
Write-Host " EasyOCR listening on http://localhost:8010"
uvicorn app:app --host 0.0.0.0 --port 8010
