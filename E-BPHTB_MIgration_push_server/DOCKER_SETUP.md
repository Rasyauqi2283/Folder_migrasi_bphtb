# Panduan Setup Docker untuk EasyOCR

## 1. Instalasi Docker Desktop (Windows)

1. **Download Docker Desktop**
   - https://www.docker.com/products/docker-desktop/
   - Pilih **Docker Desktop for Windows**

2. **Instal**
   - Jalankan installer
   - Centang **Use WSL 2 instead of Hyper-V** (lebih stabil di Windows 10/11)
   - Restart jika diminta

3. **Verifikasi instalasi**
   Buka PowerShell atau Command Prompt:
   ```powershell
   docker --version
   docker compose version
   ```
   Jika muncul versi (misal `Docker version 24.x`, `Docker Compose version v2.x`), instalasi berhasil.

4. **Jalankan Docker Desktop**
   - Buka aplikasi Docker Desktop dari Start Menu
   - Tunggu sampai status **Running** (ikon hijau di tray)

---

## 2. Menjalankan EasyOCR

Dari folder `E-BPHTB_MIgration`:

```powershell
# Build dan jalankan service EasyOCR
docker compose up -d easyocr

# Cek status container
docker compose ps

# Cek log (untuk debug)
docker compose logs -f easyocr
```

**Catatan:** Build pertama memakan waktu 3–5 menit (download model EasyOCR). Container baru siap saat healthcheck sukses (bisa 2–3 menit).

Cek kesehatan:
```powershell
curl http://localhost:8010/health
# atau di browser: http://localhost:8010/health
```

---

## 3. Jika `docker` tidak dikenali

**Kemungkinan penyebab:**
- Docker Desktop belum terpasang
- Docker Desktop belum dijalankan
- Path `docker` belum ada di PATH

**Solusi:**
1. Install Docker Desktop seperti di langkah 1
2. Jalankan Docker Desktop hingga status **Running**
3. Tutup dan buka kembali terminal/PowerShell
4. Jika masih gagal, tambahkan manual ke PATH:
   - Windows: `C:\Program Files\Docker\Docker\resources\bin`

---

## 4. Alternatif: Jalankan tanpa Docker

Jika Docker tidak bisa dipakai, jalankan service EasyOCR langsung dengan Python:

```powershell
cd E-BPHTB_MIgration\ocr-easy-service
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8010
```

Setelah itu backend Go akan memakai EasyOCR di `http://localhost:8010` seperti biasa.

---

## 5. Langkah Setelah EasyOCR Selesai Terinstal

Jika `docker compose up -d easyocr` sudah selesai (build dan container running):

1. **Cek status container**
   ```powershell
   docker compose ps
   ```
   Pastikan `ebphtb-easyocr` berstatus `running` (healthy setelah ~2–3 menit).

2. **Cek kesehatan EasyOCR**
   ```powershell
   curl http://localhost:8010/health
   ```
   Atau buka di browser: http://localhost:8010/health  
   Harus mengembalikan `{"status":"ok"}`.

3. **Jalankan backend Go + frontend**
   ```powershell
   # Terminal 1: backend Go
   cd E-BPHTB_MIgration\backend
   go run ./cmd/server

   # Terminal 2: frontend Next.js
   cd E-BPHTB_MIgration\frontend-next
   npm run dev
   ```

4. **Uji upload KTP**
   - Buka http://localhost:3000/daftar
   - Upload foto KTP (contoh: `uji_gambar_ktp/contoh_ktp3.jpg` atau `contoh_ktp4.jpg`)
   - Backend akan memakai EasyOCR primary; jika gagal akan fallback ke Tesseract.
   - **Catatan:** Request pertama ke EasyOCR (setelah container nyala) bisa 15–60 detik (cold start, loading model). Timeout default backend 60 detik; jika perlu, set `EASYOCR_TIMEOUT_MS=90000` di `.env`.

---

## 6. Troubleshooting

| Masalah | Solusi |
|--------|--------|
| `docker: command not found` | Install Docker Desktop dan pastikan sudah berjalan |
| `failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine` | Docker Desktop belum jalan atau daemon belum siap. Buka Docker Desktop dari Start Menu, tunggu sampai status **Running** (ikon hijau), lalu coba lagi. Setelah sleep/hibernate, Docker kadang berhenti. |
| Port 8010 sudah dipakai | Ganti port di `docker-compose.yml` dan `.env` (`EASYOCR_URL`) |
| `BrokenPipeError` saat download torch (~915 MB) | Koneksi putus saat unduh; pastikan jaringan stabil lalu coba lagi: `docker compose build --no-cache easyocr` |
| Build gagal / timeout | Pastikan koneksi internet stabil; model EasyOCR cukup besar; Dockerfile sudah pakai `pip --timeout 600 --retries 5` |
| Container crash setelah start | Cek `docker compose logs easyocr`; mungkin RAM kurang (usahakan ≥4GB untuk container) |
