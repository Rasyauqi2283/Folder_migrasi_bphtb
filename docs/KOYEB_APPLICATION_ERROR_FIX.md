# Atasi "Application Error" di Koyeb (Backend Go)

Jika Anda mendapat **Application Error** saat mengakses production backend, misalnya:
- `https://bphtb-backend-rasyaproduction.koyeb.app/api/health`
- Browser/Koyeb Edge: "working", tapi response: **application error**

Gunakan checklist di bawah untuk mengecek dan memperbaiki.

---

## 1. Cek URL health check

- Backend Go melayani **dua path** untuk health:
  - **`/health`** → `https://bphtb-backend-rasyaproduction.koyeb.app/health`
  - **`/api/health`** → `https://bphtb-backend-rasyaproduction.koyeb.app/api/health`
- Pastikan Anda memanggil salah satu URL di atas (GET). Jika sebelumnya memakai path lain (mis. `/api/v1/health`), ganti ke `/health` atau `/api/health`.

---

## 2. Port harus 8000

Koyeb mem-forward traffic ke **port 8000** di dalam container. Aplikasi **harus** listen di port tersebut.

- **Sudah di backend:** `config.Load()` memakai env `PORT` (Koyeb set otomatis) dengan default **8000**.
- Di **Koyeb Service → Settings**: pastikan **Port** = **8000** (biasanya sudah benar).
- Di **Dockerfile** sudah ada `ENV PORT=8000` dan `EXPOSE 8000`; tidak perlu diubah selama Koyeb tidak override.

---

## 3. Build & run di Koyeb

- **Build command** (jika pakai "Docker"):  
  Build context = **root repo**, Dockerfile path = **`E-BPHTB_MIgration/backend/Dockerfile`** (sesuai struktur Anda).
- **Run command:** Cukup jalankan binary, mis. `./server` (Dockerfile sudah pakai `CMD ["./server"]`).
- **Root directory / working directory:**  
  Jika Koyeb memakai **GitHub deploy** (bukan pure Dockerfile), pastikan **Root directory** mengarah ke folder yang berisi `go.mod` / Dockerfile (mis. `E-BPHTB_MIgration/backend` atau root repo sesuai Dockerfile).

---

## 4. Environment variables (penting)

Aplikasi tidak crash jika DB gagal; ia tetap jalan dan menulis `"database": "not_configured"` atau `"database_error"` di response `/health`. Jadi **application error** biasanya bukan karena DB kosong, tapi karena:

- **PORT** — Biarkan Koyeb yang set (biasanya 8000). Jangan override ke port lain.
- **DATABASE_URL** — Wajib jika butuh fitur yang pakai DB (auth, users, bank, dll.). Format:  
  `postgres://user:password@host:port/dbname?sslmode=require`  
  (Neon/Railway biasanya pakai `?sslmode=require`).
- **CORS_ORIGINS** — Untuk frontend production, set ke URL frontend Anda, mis.  
  `https://bphtbbappenda.vercel.app`  
  (pisahkan beberapa origin dengan koma jika perlu).

Pastikan tidak ada typo di nama env (mis. `DATABSE_URL`) dan value tidak terpotong (terutama connection string).

---

## 5. Cek log di Koyeb

- Masuk **Koyeb Dashboard** → pilih **Service** backend → **Logs** (atau **Deployments** → pilih deployment terakhir → **Logs**).
- Cari:
  - **Panic / fatal error** → penyebab crash.
  - **`[DB] WARNING: failed to connect`** → DB tidak bisa konek (cek `DATABASE_URL` dan jaringan/whitelist).
  - **`Backend Go listening on :8000`** → aplikasi sudah jalan; kalau tetap "application error", kemungkinan di routing Koyeb (port/public path).

---

## 6. Cek deployment & routing Koyeb

- **Deployment status:** Pastikan status **Running** (bukan Failed/Crashed).
- **Port mapping:** Service → Settings → **Port** = 8000; **Protocol** = HTTP.
- **Public path (jika pakai):** Jika Anda set path prefix (mis. `/api`) di Koyeb, URL jadi `.../api/health` atau `.../api/api/health`. Sesuaikan panggilan health check atau setting path di Koyeb agar cocok dengan backend (backend tidak butuh prefix path).

---

## 7. Tes lokal (mirip production)

Di mesin Anda:

```bash
cd E-BPHTB_MIgration/backend
PORT=8000 go run ./cmd/server
```

Lalu buka:

- `http://localhost:8000/health`
- `http://localhost:8000/api/health`

Keduanya harus mengembalikan JSON dengan `"status": "healthy"`. Jika lokal OK tapi Koyeb tetap error, masalah di environment/build/deploy Koyeb (env, port, atau log seperti di atas).

---

## 8. Ringkasan checklist

| Cek | Yang dilakukan |
|-----|-----------------|
| URL | Panggil `GET /health` atau `GET /api/health` (bukan path lain). |
| Port | Aplikasi listen di `PORT` (default 8000); di Koyeb Service port = 8000. |
| Build | Dockerfile path & context benar; build sukses tanpa error. |
| Env | `DATABASE_URL` (jika pakai DB) dan `CORS_ORIGINS` (jika pakai frontend) benar. |
| Log | Baca log Koyeb untuk panic / DB error / "listening on :8000". |
| Deployment | Status Running; tidak ada crash loop. |

Setelah penyesuaian, coba lagi:

- `https://bphtb-backend-rasyaproduction.koyeb.app/health`  
- `https://bphtb-backend-rasyaproduction.koyeb.app/api/health`  

Response sukses berbentuk JSON, misalnya:

```json
{
  "status": "healthy",
  "environment": "production",
  "service": "ebphtb-backend-go",
  "database": "connected"
}
```

Jika masih "application error", kirimkan **cuplikan log Koyeb** (beberapa baris terakhir saat request health) supaya bisa dilacak lebih lanjut.
