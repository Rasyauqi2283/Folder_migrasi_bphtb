# Public (Frontend) — Struktur Path

Dokumen ini memetakan path halaman frontend agar konsisten dan mudah dipindah ke Next.js/TSX.

## Route ramah (tanpa .html, via backend)

| Path   | File yang dilayani        | Keterangan        |
|--------|----------------------------|-------------------|
| `/`    | halaman_awal.html         | Landing           |
| `/login` | login.html              | Masuk              |
| `/daftar` | registrasi.html        | Registrasi (alias: /register, /registrasi) |

## Halaman utama (langsung di bawah `public/`)

| URL (relatif ke base) | File                    |
|------------------------|-------------------------|
| /halaman_awal.html     | halaman_awal.html       |
| /login.html            | login.html              |
| /registrasi.html       | registrasi.html         |
| /verifikasi-otp.html  | verifikasi-otp.html     |
| /lupa-katasandi.html   | lupa-katasandi.html     |
| /ubah-katasandi.html   | ubah-katasandi.html     |
| /public-validasi-qr.html | public-validasi-qr.html |
| /profile.html          | profile.html            |
| /profile-completetask.html | profile-completetask.html |
| /user_data.html        | user_data.html          |
| /wp-dashboard.html     | wp-dashboard.html       |
| /viewer/native-pdf.html| viewer/native-pdf.html  |

## Halaman per divisi (`html_folder/`)

- **Admin:** `html_folder/Admin/` (admin-dashboard, Data_user, referensi_user, Aplikasi)
- **PPAT:** `html_folder/PPAT/` (ppat-dashboard, ppatk-dashboard, BOOKING-SSPD, Monitoring_SSPD, LAPORAN-PPAT)
- **LTB:** `html_folder/LTB/` (ltb-dashboard, TerimaBerkas-SSPD)
- **LSB:** `html_folder/LSB/` (lsb-dashboard, Pelayanan_Penyerahan-SSPD)
- **Bank:** `html_folder/Bank/` (bank-dashboard, Hasil_Transaksi)
- **Peneliti:** `html_folder/Peneliti/` (peneliti-dashboard, Verifikasi_sspd, ParafKasie-sspd)
- **ParafP:** `html_folder/ParafP/` (penelitiValidasi-dashboard, Monitoring, Sinkronisasi_validasi, Verifikasi_SSPD)
- **FAQ:** `html_folder/FAQ/` (faq_page.html)
- **CS:** `html_folder/CS/` (cs-dashboard.html)

## Aset & script

- **CSS/JS desain:** `design-n-script/design_css/`, `design-n-script/script-backend/`, `design-n-script/script_frontback_java/`
- **Aset global:** `asset/`

## Pembersihan

File contoh/test yang telah dihapus: `contoh_noval.html`, `cobacontoh.html`, `cobacontoh1.html`, `test_photo_upload.html`. Jangan tambah lagi halaman contoh di root `public/`; gunakan folder terpisah atau app Next.js untuk percobaan.
