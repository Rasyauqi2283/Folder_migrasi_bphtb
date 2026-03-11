# OCR KTP - Analisis Dataset Uji dan Mekanisme Krusile

Dokumen ini merangkum analisis 5 gambar KTP uji dan mekanisme OCR baru agar lebih tahan terhadap gambar miring, blur ringan, crop parsial, dan noise latar.

## 1) Baseline 5 gambar uji

- `contoh_ktp.jpeg`
  - Kondisi: relatif bersih, kontras cukup, layout jelas.
  - Risiko: rendah.
- `contoh_ktp2.jpg`
  - Kondisi: pola latar kuat (moire), teks tebal.
  - Risiko: substitusi karakter (`0/O`, `8/B`) pada NIK/alamat.
- `contoh_ktp3.jpg`
  - Kondisi: kontras rendah dan sisi kiri terpotong.
  - Risiko: label field hilang, parser berbasis label melemah.
- `contoh_ktp4.jpg`
  - Kondisi: artefak scan horizontal + watermark.
  - Risiko: segmentasi teks buruk, NIK/alamat rawan salah.
- `contoh_ktp5.jpeg`
  - Kondisi: perspektif miring + noise tepi gelap.
  - Risiko: field panjang pecah, RT/RW dan alamat tidak stabil.

## 2) Mekanisme OCR yang diterapkan

- **Quality-aware routing**
  - Hitung metrik cepat per gambar: brightness, contrast, sharpness.
  - Jika `hard case`, pipeline otomatis memperluas variasi preprocessing.
- **Preprocess ensemble**
  - Metode: `raw`, `rotate_only`, `otsu`, `adaptive`, `grayscale`, `deblur`.
  - Rotasi dasar: `±1.5`.
  - Hard case: rotasi tambahan sampai `±5`.
- **Multi PSM**
  - Tesseract `--psm 6`, `4`, `11` per varian.
- **Consensus per field**
  - Tidak lagi memilih satu hasil global.
  - Voting berbobot per field (`NIK`, `nama`, `alamat`, `rtRw`, dll).
- **Normalisasi OCR numeric**
  - Koreksi karakter numerik kontekstual: `O/D/Q->0`, `I/L/|->1`, `B->8`, `S->5`, `Z->2`, `G->6`.
- **ROI recovery**
  - Jika field kritikal masih hilang, OCR ulang pada crop area teks kiri + area NIK.
- **Decision policy 3-level**
  - `success`: kualitas memadai dan field inti stabil.
  - `needs_review`: OCR berhasil, namun butuh koreksi manual user.
  - `reject`: kualitas sangat buruk, field inti gagal terbaca.

## 3) Kriteria keputusan saat runtime

- **Reject** jika:
  - `accuracy < 35` dan `NIK tidak valid` dan `extractedFields < 4`.
- **Needs review** jika salah satu:
  - `accuracy < 65`, atau
  - `NIK tidak valid`, atau
  - `extractedFields < 6`.
- Selain itu: **Success**.

## 4) Benchmark command

Command untuk evaluasi batch folder uji KTP:

```bash
cd E-BPHTB_MIgration/backend
go run ./cmd/ocr-benchmark ../../E-BPHTB_MIgration/uji_gambar_ktp
```

Jika argumen folder tidak diisi, command menggunakan default `../../uji_gambar_ktp`.

Output:
- Per gambar: accuracy, extracted fields, NIK valid/tidak, field kritikal terisi/tidak, decision.
- Ringkasan: rata-rata akurasi, NIK valid rate, critical fields complete rate, needs review rate, reject rate.

## 5) Target metrik iterasi tuning

- NIK valid rate: naik konsisten pada dataset uji.
- Critical fields lengkap (`nama`, `alamat`, `jenisKelamin`, `rtRw`): naik.
- Reject rate: turun.
- Needs review: tetap ada sebagai safety net, tetapi menurun seiring tuning.
- Latensi: tetap usable pada jalur registrasi (pantau p95 di log server).

