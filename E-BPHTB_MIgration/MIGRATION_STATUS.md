# Status Migrasi E-BPHTB

Dokumen ini mencatat **role mana yang sudah migrasi penuh (TSX, tanpa legacy)** dan mana yang masih mengandalkan legacy (`html_folder`), serta persentase progres yang sedang dikerjakan.

---

## Ringkasan Cepat

| Metrik | Nilai |
|--------|--------|
| **Role dengan dashboard migrasi penuh** | 1 dari 11 (Administrator) |
| **Role yang masih pakai legacy** | 10 (CS, PPAT, PPATS, Notaris, LTB, LSB, Peneliti, Peneliti Validasi, BANK, Wajib Pajak) |
| **Fitur global migrasi** | Login, Daftar, Lupa/Ubah kata sandi, Validasi QR, Profile, Lengkapi Profil |
| **Perkiraan progres keseluruhan** | ~25–30% (by fitur + role) |

---

## Daftar Role & Status Migrasi

### 1. Administrator ✅ **Dashboard & fitur admin: MIGRASI PENUH**

| Aspek | Status | Keterangan |
|-------|--------|------------|
| Dashboard | ✅ TSX | `/admin` – GreetingCard, statistik, link ke submenu |
| Data User (pending) | ✅ TSX | Verifikasi & assign userid |
| Data User (complete) | ✅ TSX | Tabel + overlay edit per verse (Karyawan/PU) |
| Referensi: Pemutakhiran PPAT | ✅ TSX | List + detail `[userid]` |
| Referensi: Status PPAT | ✅ TSX | Daftar PPAT/PPATS |
| Referensi: Validasi QR | ✅ TSX | Cari validasi QR |
| Aplikasi (menu) | ✅ TSX | Halaman aplikasi dengan link |
| Group User (submenu) | ⚠️ Sidebar ada | Users Group, Group Users, Group Privilege – halaman TSX belum ada (redirect/placeholder) |
| Legacy link opsional | Beberapa halaman | Tombol "Buka legacy" ke `html_folder/Admin/...` untuk referensi |

**Kesimpulan:** Satu-satunya role yang **tidak bergantung legacy** untuk alur utama (login → dashboard → fitur). Semua fitur admin inti sudah TSX.

---

### 2. Customer Service ❌ **Belum migrasi**

| Aspek | Status | Keterangan |
|-------|--------|------------|
| Dashboard | ❌ Legacy | `html_folder/CS/cs-dashboard.html` |
| Fitur spesifik CS | ❌ Legacy | Semua di dalam dashboard legacy |

**Redirect saat ini:** Setelah login / dari profile & lengkapi-profil → `.../html_folder/CS/cs-dashboard.html`.

---

### 3. PPAT ❌ **Belum migrasi**

| Aspek | Status | Keterangan |
|-------|--------|------------|
| Dashboard | ❌ Legacy | `html_folder/PPAT/ppat-dashboard.html` |
| Fitur spesifik PPAT | ❌ Legacy | Semua di dalam dashboard legacy |

**Redirect saat ini:** `.../html_folder/PPAT/ppat-dashboard.html`.

---

### 4. PPATS ❌ **Belum migrasi**

| Aspek | Status | Keterangan |
|-------|--------|------------|
| Dashboard | ❌ Legacy | Sama dengan PPAT: `html_folder/PPAT/ppat-dashboard.html` |
| Fitur spesifik PPATS | ❌ Legacy | Semua di dalam dashboard legacy |

**Redirect saat ini:** Sama seperti PPAT.

---

### 5. Notaris ❌ **Belum migrasi**

| Aspek | Status | Keterangan |
|-------|--------|------------|
| Dashboard | ❌ Legacy | Digabung dengan PPAT: `html_folder/PPAT/ppat-dashboard.html` |
| Fitur spesifik Notaris | ❌ Legacy | Semua di dalam dashboard legacy |

**Redirect saat ini:** Sama seperti PPAT/PPATS.

---

### 6. LTB ❌ **Belum migrasi**

| Aspek | Status | Keterangan |
|-------|--------|------------|
| Dashboard | ❌ Legacy | `html_folder/LTB/ltb-dashboard.html` |
| Fitur spesifik LTB | ❌ Legacy | Semua di dalam dashboard legacy |

**Redirect saat ini:** `.../html_folder/LTB/ltb-dashboard.html`.

---

### 7. LSB ❌ **Belum migrasi**

| Aspek | Status | Keterangan |
|-------|--------|------------|
| Dashboard | ❌ Legacy | `html_folder/LSB/lsb-dashboard.html` |
| Fitur spesifik LSB | ❌ Legacy | Semua di dalam dashboard legacy |

**Redirect saat ini:** `.../html_folder/LSB/lsb-dashboard.html`.

---

### 8. Peneliti ❌ **Belum migrasi**

| Aspek | Status | Keterangan |
|-------|--------|------------|
| Dashboard | ❌ Legacy | `html_folder/Peneliti/peneliti-dashboard.html` |
| Fitur spesifik Peneliti | ❌ Legacy | Semua di dalam dashboard legacy |

**Redirect saat ini:** `.../html_folder/Peneliti/peneliti-dashboard.html`.

---

### 9. Peneliti Validasi ❌ **Belum migrasi**

| Aspek | Status | Keterangan |
|-------|--------|------------|
| Dashboard | ❌ Legacy | `html_folder/ParafP/penelitiValidasi-dashboard.html` |
| Fitur spesifik PV | ❌ Legacy | Semua di dalam dashboard legacy |
| Link di Profile (migrasi) | ⚠️ Legacy | "Kelola TTE & QR (PV)" → `html_folder/ParafP/Sinkronisasi_BSRE/autentikasi_bsre.html` |

**Redirect saat ini:** `.../html_folder/ParafP/penelitiValidasi-dashboard.html`.

---

### 10. BANK ❌ **Belum migrasi**

| Aspek | Status | Keterangan |
|-------|--------|------------|
| Dashboard | ❌ Legacy | `html_folder/Bank/bank-dashboard.html` |
| Fitur spesifik BANK | ❌ Legacy | Semua di dalam dashboard legacy |

**Redirect saat ini:** `.../html_folder/Bank/bank-dashboard.html`.

---

### 11. Wajib Pajak ❌ **Belum migrasi**

| Aspek | Status | Keterangan |
|-------|--------|------------|
| Dashboard | ❌ Legacy | `html_folder/WP/wp-dashboard.html` |
| Fitur spesifik WP | ❌ Legacy | Semua di dalam dashboard legacy |

**Redirect saat ini:** `.../html_folder/WP/wp-dashboard.html`.

---

## Fitur Global (Umum untuk Semua / Tanpa Role)

Fitur di bawah ini **sudah migrasi penuh (TSX + backend Go)** dan tidak bergantung pada halaman HTML legacy untuk alur utama.

| Fitur | Route / Lokasi | Backend |
|-------|-----------------|---------|
| Landing | `/` | - |
| Login | `/login` | ✅ |
| Daftar (registrasi) | `/daftar` | ✅ |
| Verifikasi OTP | `/verifikasi-otp` | ✅ |
| Lupa kata sandi | `/lupa-katasandi` | ✅ |
| Ubah kata sandi | `/ubah-katasandi` | ✅ |
| Validasi QR (public) | `/validasi-qr` | ⚠️ Pakai env / legacy API jika belum ada di backend migrasi |
| Profile | `/profile` | ✅ |
| Lengkapi Profil | `/lengkapi-profil` | ✅ |
| Dashboard (gateway) | `/dashboard` | - (hanya redirect ke `/admin` atau legacy per divisi) |

---

## Backend (Go) – Endpoint Migrasi

- Auth: login, register, verify-otp, reset-password, profile (GET/PUT), complete-profile, upload foto/paraf, update-password, logout.
- User: pending, complete, generate-userid, assign-userid, dll.
- Admin: notification-warehouse (PPAT stats/renewal), validate-qr-search, validation-statistics, ktp-preview, dll.

Endpoint lengkap ada di `backend/cmd/server/main.go`.

---

## Perkiraan Persentase Progres

- **By role (dashboard + fitur utama):**  
  - 1 role penuh (Administrator) → **~9%** (1/11).  
  - 10 role masih legacy → **~91%** belum migrasi per role.

- **By fitur global:**  
  - Auth, registrasi, lupa/ubah sandi, profile, lengkapi profil, validasi QR (public) → **~100%** untuk fitur global yang sudah dipindah.  
  - Dashboard & fitur per role (kecuali Admin) → **~0%** (masih legacy).

- **Gambaran keseluruhan:**  
  - Jika bobot: 40% fitur global + 60% dashboard/fitur per role → kira-kira **25–30%** total migrasi (karena fitur global sudah selesai, tapi hampir semua role belum punya dashboard TSX).

---

## Langkah Berikut (Rekomendasi)

1. **Prioritas per role:** Pilih role berikutnya yang akan dipindah penuh ke TSX (mis. Wajib Pajak atau Customer Service), lalu buat dashboard + fitur utamanya di Next.js.
2. **Group User (Admin):** Buat halaman TSX untuk Users Group, Group Users, Group Privilege jika menu sudah ada di sidebar.
3. **Peneliti Validasi – TTE/BSRE:** Migrasi halaman `autentikasi_bsre.html` ke TSX jika ingin semua link dari profile tanpa legacy.
4. **Validasi QR (public):** Pastikan backend migrasi punya endpoint `GET /api/public/validate-qr/:noValidasi` atau set `NEXT_PUBLIC_VALIDATE_QR_API_URL` ke backend yang melayani.

---

*Terakhir diperbarui: mengacu pada struktur proyek dan referensi `html_folder` di frontend-next (login, dashboard, profile, lengkapi-profil).*
