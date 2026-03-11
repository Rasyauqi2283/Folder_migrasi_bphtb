# Migrasi Admin: HTML → TSX + Backend Go

## Scope
Migrasi seluruh sesi Admin dari HTML/CSS/JS ke:
- **Frontend:** Next.js + TSX
- **Backend:** Go

## Daftar Halaman Admin (8 file)

| No | Path HTML | Target Route TSX |
|----|-----------|------------------|
| 1 | `Admin/admin-dashboard.html` | `/admin` |
| 2 | `Admin/Data_user/admin-datauser-pending.html` | `/admin/data-user/pending` |
| 3 | `Admin/Data_user/admin-datauser-complete.html` | `/admin/data-user/complete` |
| 4 | `Admin/referensi_user/admin-pemutakhiranppat.html` | `/admin/referensi/pemutakhiran-ppat` |
| 5 | `Admin/referensi_user/admin-datauser-pemutakhiranppat.html` | `/admin/referensi/pemutakhiran-ppat/:userid` |
| 6 | `Admin/referensi_user/admin-validasi-qr.html` | `/admin/referensi/validasi-qr` |
| 7 | `Admin/referensi_user/admin-status-ppat.html` | `/admin/referensi/status-ppat` |
| 8 | `Admin/Aplikasi/aplikasi-admin.html` | `/admin/aplikasi` |

## API Admin (saat ini di Node)

- `/api/admin/notification-warehouse/ppat-users-stats`
- `/api/admin/notification-warehouse/ppat-renewal`
- `/api/admin/notification-warehouse/ppat-users`
- `/api/admin/notification-warehouse/ppat-ltb`
- `/api/admin/notification-warehouse/peneliti-lsb`
- `/api/admin/notification-warehouse/lsb-ppat`
- `/api/admin/validation-statistics`
- `/api/admin/ktp-preview/:userId`
- `/api/admin/validate-qr/:noValidasi`
- `/api/admin/validate-qr-search`
- `/api/admin/ppat/user/:userid/diserahkan`
- `/api/admin/status-ppat/notifications`
- `/api/admin/notification-warehouse/send-ping`

## Strategi Migrasi

### Fase 1: Scaffold + Proxy
1. Go: proxy `/api/admin/*` ke Node (LEGACY_NODE_URL) agar API tetap jalan
2. Next.js: buat layout admin + halaman dashboard TSX
3. Update dashboard protected agar redirect Admin ke `/admin` (TSX) bukan HTML legacy

### Fase 2: Halaman per Halaman
4. Migrasi `admin-datauser-pending` → `/admin/data-user/pending`
5. Migrasi `admin-datauser-complete` → `/admin/data-user/complete`
6. Dan seterusnya

### Fase 3: Backend Go
7. Implementasi handler Go untuk tiap endpoint admin (gantikan proxy Node)
8. Hapus dependency ke Node untuk admin

## Status Saat Ini

- [x] Go: proxy `/api/admin/*` dan `/api/users/*` ke Node (`LEGACY_NODE_URL`)
- [x] Admin layout TSX + sidebar navigasi
- [x] Admin dashboard TSX (`/admin`) — ringkasan dari API
- [x] Data User Pending TSX — tabel, pagination, assign UserID & divisi, Preview KTP
- [x] Data User Complete TSX — tabel, pagination
- [x] Pemutakhiran PPAT — daftar dari ppat-renewal API + link legacy
- [x] Pemutakhiran PPAT by userid — route `/admin/referensi/pemutakhiran-ppat/[userid]`
- [x] Status PPAT — daftar dari ppat-users API + link legacy
- [x] Validasi QR — form cek nomor validasi + link legacy
- [x] Aplikasi — grid link ke semua modul admin
- [ ] Implementasi handler Go untuk API admin (gantikan proxy Node)
