# Rekomendasi: Posisi index.js

## Lebih baik: **index.js di dalam E-BPHTB_root_utama, di LUAR folder backend**

```
E-BPHTB_root_utama/
├── index.js          ← entry point (orchestrator)
├── db.js             ← koneksi DB (dipakai index + backend)
├── database_monitoring.js
├── backend/          ← API, routes, services, config
└── public/           ← static frontend (HTML, CSS, JS, uploads)
```

### Alasan

1. **index.js = orchestrator, bukan murni "backend"**  
   Ia membuat Express app, memasang route dari `backend`, dan menyajikan static dari `public`. Kalau dimasukkan ke dalam `backend`, makna folder backend jadi kabur (campur antara logika API dan "server entry").

2. **Pemisahan peran jelas**
   - **backend/** = logika bisnis, route, service, config.
   - **Satu file di root E-BPHTB_root_utama** = bootstrap aplikasi (index.js).

3. **Umum di proyek Node/Express**  
   Satu entry point di "root app" yang meng-import dari `./backend` dan menyajikan `./public`.

4. **Kalau index.js dimasukkan ke dalam backend**
   - Folder "backend" berisi sekaligus entry server dan API → kurang rapi.
   - Path ke `public` jadi seperti `../public` dari dalam backend → sama saja, tapi konsep "root aplikasi" hilang.

### Kesimpulan

**Tempatkan index.js (dan db.js, database_monitoring.js) di dalam E-BPHTB_root_utama, sejajar dengan folder `backend` dan `public`.**  
Jalankan dari root repo: `node E-BPHTB_root_utama/index.js` atau dari dalam folder: `cd E-BPHTB_root_utama && node index.js`.
