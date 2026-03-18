# Cursor: Izinkan AI Mengedit File di Project Ini

Jika AI (Agent) mengembalikan **"Blocked by permissions configuration"** saat mengedit file:

1. **Buka Cursor Settings**  
   - `File` → `Preferences` → `Cursor Settings`  
   - atau `Ctrl+,` lalu cari "Cursor".

2. **Cek pengaturan edit**  
   - Di **Features** atau **General**, pastikan opsi yang membatasi lokasi edit (path allowlist/blocklist) **tidak** memblokir folder project ini (`Folder-Farras_bappenda_TA`).
   - Jika ada **"Allow AI to edit files"** atau **"Restrict edits to..."**, pastikan project ini termasuk yang diizinkan.

3. **Buka workspace dari folder project**  
   - Buka Cursor dengan **File → Open Folder** ke `Folder-Farras_bappenda_TA` (bukan subfolder saja), agar AI dianggap bekerja di root project dan tidak kena batasan path.

4. **Rule project (opsional)**  
   - Jika Anda memakai **.cursor/rules** atau **.cursorrules**, pastikan tidak ada rule yang melarang edit di `backend/`, `frontend-next/`, atau path lain yang perlu diubah oleh AI.

Setelah itu, coba lagi perintah edit dari AI; seharusnya bisa "bebas berkarya" di seluruh folder project.
