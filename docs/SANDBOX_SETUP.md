# Sandbox E-BPHTB — Localhost + Backend & Database Lokal

Layanan dijalankan **di belakang layar (bukan production)**:
- Backend dan frontend di **localhost** (port 3000 default, atau 3600 untuk sandbox)
- Database PostgreSQL **lokal** (bukan Railway production)
- Data bisa ditarik dari Railway ke lokal untuk pengembangan/uji coba

---

## Mode lokal (tanpa third party)

Untuk **pengembangan lokal fokus internal** (tanpa Railway, tanpa SendGrid):

1. **Set mode lokal** di `.env` (root repo):
   - `LOCAL_DEV=1` **atau** `NODE_ENV=development`
   - Aplikasi akan mengabaikan `DATABASE_URL` (Railway), `VITE_API_URI` / `CORS_ORIGINS` (URL Railway), dan memakai **hanya** konfigurasi lokal.

2. **Gunakan .env dari contoh**:
   ```bash
   cp .env.example .env
   ```
   Isi minimal: `PG_PASSWORD`, `SESSION_SECRET`. Opsional: `PG_HOST`, `PG_PORT`, `PG_DATABASE`, `PG_USER` (default: localhost, 5432, bappenda, postgres).

3. **Jangan set** untuk development lokal:
   - `DATABASE_URL` (biarkan kosong agar pakai PG_* ke PostgreSQL lokal)
   - `VITE_API_URI` / `API_URL` / `CORS_ORIGINS` ke URL Railway (akan di-override jadi localhost)

4. **Database**: PostgreSQL lokal dengan database `bappenda`. Email: tanpa `SENDGRID_API_KEY` dan tanpa `EMAIL_USER`/`EMAIL_PASS` akan **no-op** (tidak kirim, tidak error).

5. **Jalankan**: `npm run dev` dari root repo. Server listen di **http://localhost:3000** (atau `PORT` di .env). API_URL dan CORS dipaksa localhost.

6. **Opsional jalankan frontend Next paralel** (fase migrasi bertahap):
   - Install: `npm run install:next`
   - Run: `npm run dev:next`
   - Akses: **http://localhost:3000**
   - Next akan memanggil backend legacy ke `NEXT_PUBLIC_API_BASE_URL` (default `http://localhost:3000`)

---

## 1. Persyaratan

- **Node.js** (sesuai versi proyek)
- **PostgreSQL** terpasang di mesin lokal (port 5432 default)
- **Railway CLI** (opsional, hanya untuk dump database dari Railway)

---

## 2. Konfigurasi environment sandbox

1. Salin contoh env sandbox:
   ```bash
   cp .env.sandbox.example .env.sandbox
   ```

2. Edit `.env.sandbox`:
   - **PORT=3600** — sudah benar untuk sandbox
   - **PG_HOST=localhost**, **PG_PORT=5432**, **PG_DATABASE=bappenda**
   - **PG_USER** dan **PG_PASSWORD** — sesuaikan dengan PostgreSQL lokal
   - **SESSION_SECRET** — ganti dengan string rahasia untuk development
   - **Jangan set DATABASE_URL** — agar koneksi memakai PG_* (database lokal)

---

## 3. Database lokal

### 3.1 Buat database

```bash
createdb bappenda
```

Atau lewat `psql`:

```sql
CREATE DATABASE bappenda;
```

### 3.2 Tarik data dari Railway ke lokal

**Opsi A — Dump dari Railway (DATABASE_URL dari dashboard Railway)**

1. Di [Railway Dashboard](https://railway.app) → proyek E-BPHTB → variabel **DATABASE_URL** (connection string PostgreSQL).

2. Dari mesin lokal (pasang `pg_dump` jika belum):
   ```bash
   # Ganti <DATABASE_URL_RAILWAY> dengan connection string dari Railway
   pg_dump "<DATABASE_URL_RAILWAY>" --no-owner --no-acl > railway_dump.sql
   ```

3. Restore ke database lokal:
   ```bash
   psql -h localhost -U postgres -d bappenda -f railway_dump.sql
   ```

**Opsi B — Menggunakan dump yang sudah ada di repo**

Jika ada file dump (mis. `bappenda_dump_clean.sql`):

```bash
psql -h localhost -U postgres -d bappenda -f bappenda_dump_clean.sql
```

### 3.3 Migrasi (kolom verse, dll.)

Setelah restore, jalankan migrasi agar skema sesuai aplikasi:

```bash
psql -h localhost -U postgres -d bappenda -f database/migrations/002_add_verse_to_a_2_verified_users.sql
psql -h localhost -U postgres -d bappenda -f database/migrations/003_add_verse_and_registration_fields_to_a_1.sql
```

---

## 4. Menjalankan backend di sandbox

Pastikan `.env.sandbox` sudah ada dan database `bappenda` siap.

```bash
# Dari root repo; env di-load dari .env.sandbox (via db.js) dan PORT=3600
npm run sandbox
```

Atau langsung dengan flag:

```bash
node E-BPHTB_root_utama/index.js --sandbox
```

Server akan listen di **http://localhost:3600**. Di log akan muncul:

- `🚀 Server running on port 3600`
- `📦 SANDBOX mode: backend + DB lokal (bukan production Railway)`

---

## 5. Akses aplikasi sandbox

- **Home / login:** http://localhost:3600  
- **Login:** http://localhost:3600/login.html  
- **Registrasi:** http://localhost:3600/registrasi.html (atau dengan `?verse=wp`, `?verse=karyawan`, `?verse=pu`)

Backend dan frontend sama-origin (localhost:3600), sehingga panggilan `/api/...` otomatis ke backend yang sama. Endpoint `/api/config` mengembalikan `apiUrl` sesuai **API_URL** di `.env.sandbox` (default http://localhost:3600).

---

## 6. Ringkasan perbedaan Sandbox vs Production

| Aspek        | Production (Railway)     | Sandbox (localhost)     |
|-------------|--------------------------|--------------------------|
| URL         | https://bphtb-bappenda.up.railway.app | http://localhost:3600   |
| Port        | Ditentukan Railway       | 3600                     |
| Database    | PostgreSQL Railway       | PostgreSQL lokal         |
| Env file    | `.env` / Railway vars    | `.env.sandbox`           |
| Cara jalankan | `npm start` / deploy   | `npm run sandbox`        |

---

## 7. Troubleshooting

- **Koneksi database gagal:** Pastikan PostgreSQL jalan, `PG_HOST`, `PG_PORT`, `PG_USER`, `PG_PASSWORD`, `PG_DATABASE` di `.env.sandbox` benar, dan **DATABASE_URL** tidak diset (agar tidak mengoverride ke Railway).
- **Port 3600 sudah dipakai:** Ganti **PORT** di `.env.sandbox` (mis. 3601) lalu jalankan lagi `npm run sandbox`.
- **Session/redirect salah:** Pastikan **BASE_URL** dan **FRONTEND_URL** di `.env.sandbox` adalah `http://localhost:3600` (atau port yang Anda pakai).
