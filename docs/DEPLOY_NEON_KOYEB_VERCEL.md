# Deploy: Neon → Koyeb → Vercel

Panduan singkat setup database (Neon), backend (Koyeb), lalu frontend (Vercel).

---

## 1. Neon (Database PostgreSQL)

### 1.1 Buat / pakai project

- Buka [console.neon.tech](https://console.neon.tech), login.
- Project **bphtbbappenda** sudah ada; pilih branch **production**.

### 1.2 Ambil connection string

- Di dashboard: **Connection string** (atau **Dashboard** → **Connection details**).
- Pilih **Pooled connection** (lebih cocok untuk serverless/cloud).
- Format umum Neon:
  ```text
  postgresql://[user]:[password]@[host]/[dbname]?sslmode=require
  ```
- **Copy** connection string (jangan di-commit ke git).

### 1.3 Opsi: nama database

- Default Neon biasanya database **neondb**.
- Jika kamu pakai nama lain (mis. **bappenda**), pastikan connection string memakai nama itu, atau buat database **bappenda** di Neon SQL Editor:
  ```sql
  CREATE DATABASE bappenda;
  ```
  Lalu gunakan connection string yang mengarah ke `.../bappenda?sslmode=require`.

### 1.4 Jalankan migrasi (schema) ke Neon

- Setelah punya connection string, set env lokal:
  ```bash
  export DATABASE_URL="postgresql://..."
  ```
- Dari **root repo** (atau sesuaikan path):
  ```bash
  psql "$DATABASE_URL" -f E-BPHTB_MIgration/database/migrations/015_add_wp_badan_fields.sql
  ```
- Jalankan juga migrasi lain yang belum jalan (001–014) jika ada, supaya tabel `a_1_unverified_users`, `a_2_verified_users`, dll. ada di Neon.

### 1.5 Simpan untuk Koyeb

- Connection string ini nanti dipakai di **Koyeb** sebagai env **DATABASE_URL** (langkah 2).

---

## 2. Koyeb (Backend Go)

### 2.1 Repo & build

- **Repository**: repo Git kamu (GitHub/GitLab).
- **Branch**: branch yang dipakai deploy (mis. `main`).
- **Build**: pilih **Dockerfile**.
- **Dockerfile location**: `E-BPHTB_MIgration/backend/Dockerfile`.
- **Root directory / Build context**: set ke **`E-BPHTB_MIgration/backend`** agar context build = isi folder backend (wajib agar `COPY . .` di Dockerfile benar).

Jika platform hanya bisa build dari repo root, pakai Dockerfile alternatif di root repo (lihat bagian bawah dokumen).

### 2.2 Port

- Backend Go mendengarkan **PORT** (atau **GO_PORT** / **BACKEND_GO_PORT**). Koyeb biasanya set **PORT** (mis. 8000); tidak perlu override kecuali ingin ganti.

### 2.3 Environment variables (Koyeb)

Di **Koyeb → Service → Variables** (atau Secrets), set:

| Variable          | Nilai / sumber | Wajib |
|------------------|----------------|--------|
| `DATABASE_URL`   | Connection string dari Neon (1.2) | Ya |
| `API_URL`        | URL publik backend setelah deploy, mis. `https://<nama-service>.koyeb.app` | Ya (untuk redirect/link) |
| `CORS_ORIGINS`   | Domain frontend Vercel, mis. `https://xxx.vercel.app` atau `https://custom-domain.com` (bisa beberapa, pisah koma) | Ya (agar frontend bisa panggil API) |
| `NODE_ENV`       | `production` | Opsional |
| `PORT`           | Biasanya Koyeb set otomatis; isi hanya jika override | Opsional |

**Contoh CORS_ORIGINS:**

```text
https://bphtb-app.vercel.app,https://custom-domain.com
```

Setelah Vercel deploy, ganti `xxx.vercel.app` dengan domain asli frontend.

### 2.4 Path & health check

- **Path**: backend expose semua route di root (mis. `/api/v1/auth/login`, `/health`). Tidak perlu **Path** khusus.
- **Health check**: gunakan **GET** `https://<backend-url>/health`. Jika response JSON `"database":"connected"`, backend dan Neon sudah terhubung.

### 2.5 Storage / file (opsional)

- Upload file (KTP, NIB, foto profil, dll.) saat ini pakai **local disk** (`TEMP_UPLOADS_DIR`, `PROFILE_PHOTO_DIR`, dll.). Di Koyeb instance bisa hilang saat restart.
- Untuk production tahan lama, nanti bisa pakai **object storage** (S3/Spaces) dan set env seperti `TEMP_UPLOADS_DIR` ke path atau bucket; untuk awal deploy bisa dibiarkan default dulu.

---

## 3. Vercel (Frontend Next.js)

Lakukan **setelah** backend Koyeb sudah jalan dan kamu punya URL publik (mis. `https://xxx.koyeb.app`).

### 3.1 Import project

- [vercel.com](https://vercel.com) → Import repo (Next.js di folder `E-BPHTB_MIgration/frontend-next`).
- **Root Directory** (wajib): `E-BPHTB_MIgration/frontend-next`.  
  Jika dikosongkan, Vercel build dari root repo → **"No framework detected"** → 404 di semua route. Di **Project Settings → General → Root Directory** isi `E-BPHTB_MIgration/frontend-next`, lalu **Redeploy**.
- **Framework Preset** (wajib): Di **Settings → General → Build & Development Settings**, set **Framework Preset** ke **Next.js**. Kalau tetap "Other" atau auto, build bisa sukses tapi Vercel tidak menjalankan runtime Next.js → halaman kosong/404. Set ke Next.js, simpan, lalu **Redeploy**.

### 3.2 Environment variables (Vercel)

| Variable | Nilai | Catatan |
|----------|--------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | `https://<backend-url-koyeb>` | URL backend (tanpa trailing slash). Dipakai rewrite `/api/*` dan proxy. |
| `NEXT_PUBLIC_LEGACY_BASE_URL` | (opsional) | Bisa sama dengan `NEXT_PUBLIC_API_BASE_URL` jika tidak pakai legacy terpisah. |

**Contoh:**

```text
NEXT_PUBLIC_API_BASE_URL=https://bphtb-backend-xxx.koyeb.app
```

### 3.3 Deploy

- Deploy; lalu tes login/register dari frontend Vercel ke backend Koyeb.
- Pastikan **CORS_ORIGINS** di Koyeb sudah berisi domain Vercel (mis. `https://xxx.vercel.app`).

---

## Ringkasan urutan

1. **Neon**: Copy connection string → jalankan migrasi → simpan untuk Koyeb.
2. **Koyeb**: Deploy backend (Dockerfile) → set `DATABASE_URL`, `API_URL`, `CORS_ORIGINS` → cek `/health`.
3. **Vercel**: Set `NEXT_PUBLIC_API_BASE_URL` ke URL Koyeb → deploy frontend → tes dari browser.

---

## Troubleshooting

- **Database tidak connect**: Cek `DATABASE_URL` (Neon) di Koyeb; pastikan `sslmode=require` dan tidak ada typo.
- **CORS error di browser**: Tambah domain Vercel (dan custom domain) ke `CORS_ORIGINS` di Koyeb, tanpa trailing slash.
- **404 / API tidak ketemu**: Pastikan `NEXT_PUBLIC_API_BASE_URL` di Vercel = URL Koyeb yang benar dan rewrite Next.js ke `/api/*` mengarah ke URL itu (lihat `next.config.mjs`).
- **404 di semua halaman / "No framework detected" / build sukses tapi halaman tidak muncul**: (1) **Root Directory** harus **`E-BPHTB_MIgration/frontend-next`**. (2) **Framework Preset** harus **Next.js** (Settings → General → Build & Development Settings). Tanpa ini, Vercel tidak menjalankan runtime Next.js. (3) Di repo sudah ada `vercel.json` di folder frontend-next dengan `"framework": "nextjs"` agar deteksi jelas. Simpan setelan lalu **Redeploy**.

---

## Alternatif: Build dari repo root (Koyeb tanpa Root directory)

Jika Koyeb tidak punya opsi "Root directory" dan context selalu repo root, buat file **`Dockerfile.backend`** di **root repo** dengan isi:

```dockerfile
FROM golang:1.23-alpine AS builder
WORKDIR /app
COPY E-BPHTB_MIgration/backend /app/backend
WORKDIR /app/backend
RUN go mod download
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /server ./cmd/server

FROM alpine:3.19
RUN apk --no-cache add ca-certificates tzdata
WORKDIR /app
COPY --from=builder /server .
ENV PORT=3005
EXPOSE 3005
CMD ["./server"]
```

Lalu di Koyeb set **Dockerfile location** ke `Dockerfile.backend` (di root). Build context = root repo.
