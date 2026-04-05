# Module Konteks Migrasi (Bawa ke Chat Baru)

Dokumen ini adalah **module ringkas** untuk dibawa ke chat baru kapan pun, terutama saat pengerjaan di **folder server asli** (perubahan bersifat sensitif dan harus sesuai term & condition).

> Tujuan: memastikan semua perubahan penting yang sudah dibuat di workspace ini **bisa dimigrasikan** dengan aman ke folder server asli, tanpa asal update.

### Lokasi kerja di server (IIS)

Repo/stack baru biasanya diletakkan **di dalam** root aplikasi PHP yang sama dengan workspace server, misalnya:

`...\BPHTB_BOGOR_DEV_FARRAS\E-BPHTB_MIgration\`

(contoh setara: `C:\inetpub\wwwroot\BPHTB_BOGOR_DEV_FARRAS\E-BPHTB_MIgration\`). **Semua path file di dokumen ini** (`E-BPHTB_MIgration/backend/...`, dll.) mengacu pada **akar folder `E-BPHTB_MIgration`** — bukan ke seluruh `wwwroot` kecuali disebut eksplisit.

Tata letak folder, env, dan integrasi PHP↔Go↔Next: **`E-BPHTB_MIgration/SERVER_WORKSPACE_LAYOUT.md`**.

---

## 0. Apa itu folder `E-BPHTB_MIgration` (agar chat baru langsung terarah)

Folder ini adalah **satu paket migrasi E-BPHTB**: backend API (Go), frontend (Next.js), skrip/SQL database, dan dokumen operasional. Di server, folder ini sering **disalin utuh** ke dalam `wwwroot` supaya pekerjaan terpusat dan bisa dibuka sebagai workspace Cursor/VS Code di sana.

| Bagian | Isi singkat | Catatan untuk asisten |
|--------|-------------|------------------------|
| `backend/` | Service Go (`cmd/`, `internal/`), konfigurasi env, build | Endpoint REST di bawah `/api/...`; build: `go build ./...` dari folder `backend/`. |
| `frontend-next/` | Aplikasi Next.js (App Router), UI operator/PU/admin | Build/deploy sesuai setup server (Node); memanggil API backend. |
| `database/` atau skrip SQL di repo | Migrasi/schema referensi | **Schema di server bisa beda** (mis. MySQL legacy vs asumsi Postgres di kode dev): jangan anggap kolom/tabel 1:1 tanpa cek DB nyata. |
| `MEETING_RUNBOOK_CUTOVER_BJB.md` | Runbook cutover/domain/gateway | Dipakai saat rapat/go-live. |
| **File ini** `CHAT_CONTEXT_MODULE_PORTING.md` | Aturan bisnis + file kritis + prompt chat | **Baca ini dulu** di chat baru sebelum mengubah kode di server. |

**Hubungan dengan legacy:** Di `wwwroot` mungkin masih ada **PHP + MySQL** atau aplikasi lama. `E-BPHTB_MIgration` adalah **stack baru/referensi implementasi**; porting artinya menyelaraskan perilaku (lifecycle booking, gate payment, UI) dengan **DB dan deploy yang benar-benar jalan di server**, bukan menyalin buta seluruh asumsi schema dari dev jika tidak cocok.

**Kesimpulan untuk asisten:** Anggap `E-BPHTB_MIgration` sebagai **root proyek migrasi**; jangan mencampur path dengan folder legacy kecuali tugasnya memang integrasi silang. Ikuti section A–G untuk risiko dan prioritas perubahan.

---

## A. Prinsip Operasional di Server Asli (WAJIB)

- **Tidak boleh asal push/perubahan**: setiap update harus sesuai term & condition, minimal-risk, dan bisa rollback.
- **Pisahkan perubahan**:
  - **P0 (Blocker)**: bug alur booking/payment/status, endpoint rusak, data integrity.
  - **P1 (Mengganggu)**: UI membingungkan operator, error message tidak jelas.
  - **P2 (Polish)**: styling/UX minor.
- **Selalu backup sebelum cutover** (DB + storage path upload).
- **Jangan menguji gateway live** dengan data asli; gunakan **sandbox/UAT** dan isolasi environment.

---

## B. Alur FINAL Booking SSPD (SSPD-Centric) — Lifecycle Status

Tujuan: **mencegah loncatan** status dari `Terbuat` langsung ke `Draft`.

### Status wajib (urutan)

1. **Terbuat**
   - Step 1 selesai (data awal tersimpan).
2. **awaited_billing**
   - Aksi: klik **Minta Billing**.
3. **in_paid**
   - Aksi: pembayaran masuk proses sinkronisasi bank (simulasi/gateway callback).
4. **paid**
   - Payment terkonfirmasi (paid-like: `PAID/LUNAS/KURANG_BAYAR`).
5. **Draft**
   - Hanya setelah user isi data lanjutan dan klik **Simpan Perhitungan**.

### Aturan tombol UI (yang harus konsisten)

- **Minta Billing**: hanya aktif saat status `Terbuat`.
- **Simulasikan Pembayaran**: hanya aktif saat status `awaited_billing`.
- **Isi ketika telah bayar**: hanya aktif saat status **`paid`**.
- **Simpan Perhitungan**: setelah sukses -> status **`Draft`**.

---

## C. Perubahan Kode Kritis (yang perlu dipindahkan ke server asli)

### 1) Backend — Booking lifecycle & gatekeeping

**File:**
- `E-BPHTB_MIgration/backend/internal/repository/ppat.go`
- `E-BPHTB_MIgration/backend/internal/handler/ppat.go`
- `E-BPHTB_MIgration/backend/internal/repository/bank.go`

**Inti perubahan:**
- Helper transisi status forward-only: normalisasi status, ranking, dan `updateBookingStatusTx`.
- `SetBookingBilling()` memastikan status -> `awaited_billing`.
- `MockPayment()` dan `ApplyGatewayPaid()` tidak lagi membuat status loncat ke `Draft`; finalnya `paid`.
- `SavePostPaymentCalculation()`:
  - payment check lebih robust (booking/sspd/bank paid-like),
  - jika status tertinggal tapi payment valid, boleh auto-advance ke `paid`,
  - setelah simpan, transisi ke `Draft`.
  - Query `jenis_perolehan` harus sumber dari `pat_4_objek_pajak.jenis_perolehan` (bukan kolom legacy di pat_1).

### 2) Frontend — Booking Badan (PU)

**File:**
- `E-BPHTB_MIgration/frontend-next/app/(protected)/pu/booking-sspd/badan/page.tsx`

**Inti perubahan:**
- Normalisasi status `awaiting_billing` -> `awaited_billing`.
- Badge warna untuk `awaited_billing`, `in_paid`, `paid`.
- Lock section permohonan validasi + dokumen pendukung sampai status mencapai `paid`.
- Optimistic update setelah minta billing/simulasi bayar agar UI responsif.
- Tombol tambahan **Aturan Booking**: card panduan operasional (mengurangi debugging user).

---

## D. Pending Admin (User Approval/Assign) — Ketentuan

### Prinsip yang disepakati

- Halaman pending **tidak mengubah** `gender` / `special_field`.
- Pending admin hanya melakukan:
  - assign `userid`
  - assign `divisi`
  - assign `ppat_khusus` (jika PU/PPAT)
  - kirim email aktivasi (backend)

**File:**
- `E-BPHTB_MIgration/frontend-next/app/(protected)/admin/data-user/pending/page.tsx`

Catatan UI:
- Gender/special field **tidak ditampilkan sebagai dropdown** di tabel; cukup info di clickrow.

---

## E. Payment Gateway BJB — Testing Aman (2 minggu masa uji)

### Target

Uji dilakukan pada domain production `bphtb.bappenda.go.id`, tapi **wajib** pakai:
- credential **sandbox/UAT**, bukan live,
- callback endpoint sandbox terpisah,
- DB/testing environment terisolasi dari data asli.

### Checklist sandbox/UAT

- Signature verification callback aktif.
- Idempotency aktif (callback duplikat tidak double-update).
- IP allowlist callback BJB.
- Audit log callback disimpan.

---

## F. Domain dan Cutover

Domain final:
- `bphtb.bappenda.go.id`

Wajib:
- HTTPS aktif, HTTP redirect.
- Reverse proxy route frontend + `/api/*` ke backend.
- CORS whitelist domain final.

Dokumen runbook meeting:
- `E-BPHTB_MIgration/MEETING_RUNBOOK_CUTOVER_BJB.md`

---

## G. Cara Porting ke Folder Server Asli (aman)

1. **Ambil patch per fitur**, bukan copy seluruh folder sekaligus.
2. Prioritaskan porting:
   - Lifecycle booking + payment gatekeeping (backend)
   - UI tombol & aturan booking (frontend)
   - Pending admin payload (frontend)
3. Setelah porting, lakukan:
   - build backend (`go build ./...`)
   - smoke test endpoint kritis:
     - `GET /api/system/status`
     - `POST /api/ppat/request-billing`
     - `POST /api/ppat/mock-payment` (sandbox/demo)
     - `PUT /api/ppat/booking/{nobooking}/calculation`
4. Jika ada error 400/500, pastikan response message disampaikan jelas ke operator (bukan debug).

---

## H. Blok Prompt untuk Chat Baru (copy-paste)

Gunakan block ini saat mulai chat baru:

```text
Baca dulu file E-BPHTB_MIgration/CHAT_CONTEXT_MODULE_PORTING.md di workspace ini (section 0–G).
Konteks: Saya sedang migrasi E-BPHTB; folder E-BPHTB_MIgration sudah ada di server (path IIS di bawah wwwroot).
Sangat sensitif: tidak boleh asal update; patuhi term & condition, backup, dan patch per fitur.
Target ~2 minggu: hardening core flow + perbaiki UI/endpoint yang rusak.
Aturan booking lifecycle wajib: Terbuat -> awaited_billing -> in_paid -> paid -> Draft.
UI: Isi ketika telah bayar hanya aktif jika paid; Simpan Perhitungan memindah ke Draft.
Pending admin: hanya assign userid/divisi/ppat_khusus + email aktivasi (tidak mengubah gender/special_field).
Domain: bphtb.bappenda.go.id. Gateway BJB: sandbox/UAT saja, jangan uji live terhadap data asli.
Tolong lanjutkan pekerjaan dengan risiko minimal; jika schema DB server beda dari dev, sesuaikan dengan DB nyata.
```
