# Rancangan Migrasi Penuh: Node.js → Next.js + Golang

Dokumen ini memetakan langkah migrasi agar step tertinjau dengan baik dan benar. Target: frontend di **Next.js** (E-BPHTB_MIgration/frontend-next), backend di **Golang** (E-BPHTB_MIgration/backend), dengan backend Node.js lama (E-BPHTB_root_utama) tetap berjalan selama transisi.

---

## 1. Fase dan Prinsip

| Fase | Isi | Kriteria selesai |
|------|-----|-------------------|
| **A. Frontend** | Next.js di E-BPHTB_MIgration/frontend-next | Route utama (/, /login, /daftar) TSX; script root pakai path E-BPHTB_MIgration |
| **B. Backend Go (10 step)** | Migrasi index.js ke Go bertahap | Tiap step deployable; step 10 = proxy sisa ke Node |
| **C. Cutover** | Arahkan frontend ke backend Go; nonaktifkan Node | Health & auth & satu domain utama jalan di Go |

Prinsip: **satu step selesai dan tertest sebelum step berikutnya**.

---

## 2. Frontend (sudah berjalan)

- **Lokasi:** `E-BPHTB_MIgration/frontend-next/`
- **Jalankan dari root:** `npm run install:next` lalu `npm run dev:next` (arah ke E-BPHTB_MIgration/frontend-next).
- **Lanjutan:** Migrasi halaman HTML lain dari E-BPHTB_root_utama/public ke route/TSX di frontend-next (lihat docs/MIGRASI_HTML_KE_TSX.md).

---

## 3. Backend Go — 10 Step Bertahap

Backend Go ditempatkan di **E-BPHTB_MIgration/backend/** (atau E-BPHTB_MIgration/backend-go). Setiap step menambah kemampuan tanpa memutus yang sudah ada.

| Step | Isi | Endpoint / perilaku | Verifikasi |
|------|-----|----------------------|------------|
| **1** | Init modul Go, config env, server HTTP, health | GET /health, GET /api/config | Curl 200 + JSON |
| **2** | CORS, middleware log, recovery | Same + CORS header, log request | Browser + log |
| **3** | Koneksi DB (PostgreSQL), pool, health DB | GET /health cek DB | Health gagal jika DB mati |
| **4** | Auth: login (validasi user + password) | POST /api/v1/auth/login | Login sukses/gagal sesuai DB |
| **5** | Auth: register + verify-otp (alur minimal) | POST register, POST verify-otp | Registrasi + verifikasi jalan |
| **6** | Session/token (JWT atau cookie), profile read | GET /api/v1/auth/profile (terproteksi) | Profile hanya jika auth |
| **7** | PPAT: list booking, detail booking (read-only) | GET /api/ppat/load-all-booking, GET /api/ppat/booking/:id | Data konsisten dengan Node |
| **8** | Admin: subset (user pending, stats) | GET /api/users/pending, GET /api/admin/... (pilihan) | Response sama kontrak dengan Node |
| **9** | Proxy ke Node untuk route yang belum pindah | GET/POST ke E-BPHTB_root_utama untuk path yang tidak di-handle Go | Satu port Go, sisa di Node |
| **10** | Graceful shutdown, port fallback (opsional), dokumentasi run | SIGINT/SIGTERM tutup listener + pool | Restart bersih, no EADDRINUSE |

Setelah step 10, daftar endpoint yang sudah “pindah” ke Go didokumentasikan di docs/API.md (bagian Go) sehingga tim bisa memindahkan sisa route per domain (PPAT tulis, notifikasi, BSRE, dll.) tanpa mengubah rencana 10 step di atas.

---

## 4. Konfigurasi dan Port

- **Backend Node (legacy):** PORT=3000 (atau fallback 3001/3002), entry E-BPHTB_root_utama/index.js.
- **Backend Go:** Port terpisah, mis. 3005 (env `GO_PORT` atau `BACKEND_GO_PORT`), agar bisa jalan berdampingan.
- **Frontend Next:** Port 3000, env `NEXT_PUBLIC_API_BASE_URL` mengarah ke backend yang dipakai (Node atau Go). Saat cutover, ubah ke URL backend Go.

---

## 5. Checklist Tinjauan

- [ ] docs/API.md dan docs/DATABASE.md jadi acuan kontrak API dan skema DB untuk Go.
- [ ] Setiap step backend Go punya tes manual (curl/Postman) atau tes otomatis (go test) untuk endpoint baru.
- [ ] Env (DB, secret, port) tidak di-commit; contoh di .env.example.
- [ ] README di E-BPHTB_MIgration menjelaskan cara jalankan frontend-next dan (setelah ada) backend Go.

---

## 6. Referensi

- **API existing:** docs/API.md  
- **Database:** docs/DATABASE.md  
- **Transisi harian:** docs/TRANSISI_NEXT_10_HARI.md  
- **HTML → TSX:** docs/MIGRASI_HTML_KE_TSX.md  
