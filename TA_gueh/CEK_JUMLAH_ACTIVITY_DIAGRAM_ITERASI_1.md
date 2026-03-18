# CEK JUMLAH ACTIVITY DIAGRAM ITERASI 1

## PERBANDINGAN ANTARA FILE

### **File 1: `No Nama Activity Diagram Deskripsi.md`**
**Total: 42 Activity Diagram**

Daftar lengkap:
1. Login dan Register
2. Create Booking
3. Add Manual Signature
4. Upload Document
5. PPAT Delete Document
6. PPAT View Document (Uploaded)
7. PPAT View Generated PDF SSPD
8. PPAT View Generated PDF Permohonan Validasi
9. PPAT Fill Form Permohonan Validasi
10. PPAT Send to LTB
11. LTB Receive from PPAT
12. LTB Generate No. Registrasi
13. LTB Validate Document
14. LTB Accept
15. LTB Reject
16. Peneliti Receive from LTB
17. Peneliti View Document
18. Peneliti Verify Document
19. Peneliti Add Manual Signature
20. Peneliti Verifikasi
21. Peneliti Persetujuan Paraf
22. Peneliti Pemilihan
23. Peneliti Send to Clear to Paraf
24. Peneliti Reject
25. Generate No. Validasi
26. Peneliti Paraf Receive
27. Peneliti Paraf View Document
28. Peneliti Paraf Give Paraf
29. Peneliti Paraf Send to Validasi
30. Peneliti Paraf Reject
31. Peneliti Validasi Receive
32. Peneliti Validasi View Document
33. Peneliti Validasi Final Validation
34. Peneliti Validasi Manual Signature
35. Peneliti Validasi View QR Code
36. Peneliti Validasi Send to LSB
37. Peneliti Validasi Reject
38. LSB Receive from Peneliti Validasi
39. LSB Manual Handover
40. LSB Update Status
41. Admin Monitor Process
42. Admin Send Ping Notifications

---

### **File 2: `Tabel_Lampiran_Iterasi_1_LENGKAP.md`**
**Total: 42 Activity Diagram**

**Catatan penting:**
- File ini sudah diupdate setelah split Activity_14
- **Peneliti umum dibagi menjadi 3 Activity Diagram terpisah:**
  - No 17: Peneliti Receive from LTB (Activity_14_Peneliti_Receive_from_LTB.xml)
  - No 19: Peneliti Verify Document (Activity_14A_Peneliti_Verify_Document.xml) - **BARU**
  - No 20: Peneliti Add Manual Signature (Activity_14B_Peneliti_Add_Manual_Signature.xml) - **BARU**

**4 Activity Diagram dijelaskan di Bab Hasil & Pembahasan:**
- No 2: Create Booking
- No 3: Generate No. Booking
- No 5: Upload Document
- No 11: PPAT Send to LTB

---

## PERBANDINGAN DETAIL

### **Perbedaan yang Ditemukan:**

| No | `No Nama Activity Diagram Deskripsi.md` | `Tabel_Lampiran_Iterasi_1_LENGKAP.md` | Status |
|----|----------------------------------------|---------------------------------------|--------|
| 3 | Add Manual Signature | Add Manual Signature | ✅ Sama |
| - | - | **Generate No. Booking** (No 3) | ⚠️ **TIDAK ADA di file pertama** |
| 4 | Upload Document | Upload Document | ✅ Sama |
| 16 | Peneliti Receive from LTB | Peneliti Receive from LTB (No 17) | ✅ Sama |
| 17 | Peneliti View Document | Peneliti View Document (No 18) | ✅ Sama |
| 18 | Peneliti Verify Document | Peneliti Verify Document (No 19) | ✅ Sama |
| 19 | Peneliti Add Manual Signature | Peneliti Add Manual Signature (No 20) | ✅ Sama |

---

## KESIMPULAN

### **Jumlah Activity Diagram:**

1. **File `No Nama Activity Diagram Deskripsi.md`:** **42 Activity Diagram**
   - Tidak ada "Generate No. Booking" sebagai Activity Diagram terpisah
   - Peneliti sudah terpisah menjadi 3 diagram (Receive, Verify, Add Manual Signature)

2. **File `Tabel_Lampiran_Iterasi_1_LENGKAP.md`:** **42 Activity Diagram**
   - Ada "Generate No. Booking" sebagai Activity Diagram terpisah (No 3)
   - Peneliti sudah terpisah menjadi 3 diagram (Receive, Verify, Add Manual Signature)

### **Perbedaan Utama:**

**File `No Nama Activity Diagram Deskripsi.md` TIDAK memiliki:**
- "Generate No. Booking" sebagai Activity Diagram terpisah

**File `Tabel_Lampiran_Iterasi_1_LENGKAP.md` MEMILIKI:**
- "Generate No. Booking" sebagai Activity Diagram terpisah (No 3)

### **Rekomendasi:**

1. **Jika "Generate No. Booking" adalah Activity Diagram terpisah:**
   - File `No Nama Activity Diagram Deskripsi.md` perlu ditambahkan
   - Total menjadi **43 Activity Diagram**

2. **Jika "Generate No. Booking" BUKAN Activity Diagram terpisah:**
   - File `Tabel_Lampiran_Iterasi_1_LENGKAP.md` perlu dikoreksi
   - Total tetap **42 Activity Diagram**

3. **Verifikasi:**
   - Cek apakah ada file XML untuk "Generate No. Booking" di folder `DIAGRAMS/Iterasi_Diagrams/Iterasi_1/Activity_Diagrams/`
   - Cek apakah "Generate No. Booking" dijelaskan sebagai Activity Diagram di Bab Hasil & Pembahasan

---

## PERTANYAAN UNTUK VERIFIKASI

1. Apakah "Generate No. Booking" adalah Activity Diagram terpisah atau hanya proses otomatis di dalam "Create Booking"?
2. Apakah ada file XML `Activity_XX_Generate_No_Booking.xml` di folder Activity Diagrams?
3. Apakah "Generate No. Booking" dijelaskan sebagai Activity Diagram di Bab Hasil & Pembahasan?

---

**Status:** ⚠️ **PERLU KONFIRMASI** - Ada perbedaan antara 2 file mengenai "Generate No. Booking"
