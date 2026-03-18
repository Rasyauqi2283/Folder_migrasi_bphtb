# Cara Aplikasikan Logo Raspro (Logo + Rasya Production + O Animasi) ke Folder Lain

Agar tampilan logo sama di project lain (folder lain di laptop yang sama atau di laptop lain): **gambar logo + teks "Rasya Production" dengan huruf O yang dianimasikan**.

---

## 1. File yang harus ada

### Aset (public)

Copy ke folder **`public/`** project tujuan:

| File | Asal (rasya-production) | Keterangan |
|------|-------------------------|------------|
| `Logo_sebenarnya.png` | `rasya-production/frontend/public/Logo_sebenarnya.png` | Gambar logo utama |
| `Animate_O.svg` | `rasya-production/frontend/public/Animate_O.svg` | SVG untuk huruf O animasi |

**Path tujuan:**  
`[project-anda]/public/Logo_sebenarnya.png`  
`[project-anda]/public/Animate_O.svg`

*(Di project E-BPHTB Migration, aset Raspro diletakkan di `public/asset/`; komponen `RasproLogo` dan `AnimatedO` memakai path `/asset/Logo_sebenarnya.png` dan `/asset/Animate_O.svg`.)*

### Komponen React (Next.js)

Copy kedua file ini ke folder **`components/`** project tujuan:

| File | Asal |
|------|------|
| `AnimatedO.tsx` | `rasya-production/frontend/components/AnimatedO.tsx` |
| `RasproLogo.tsx` | `rasya-production/frontend/components/RasproLogo.tsx` |

**Path tujuan:**  
`[project-anda]/components/AnimatedO.tsx`  
`[project-anda]/components/RasproLogo.tsx`

Pastikan import di `RasproLogo.tsx` mengarah ke lokasi `AnimatedO` di project Anda, misalnya:

```ts
import AnimatedO from "@/components/AnimatedO";
```

(Sesuaikan alias `@/` jika di project lain berbeda, mis. `@/components` → `../components` atau path relatif.)

---

## 2. Ketergantungan

- **Next.js** dengan **React** (sudah dipakai di rasya-production).
- **next/image** untuk `RasproLogo` (komponen `Image` dari `next/image`).
- **next/link** untuk opsi link internal di `RasproLogo`.

### Tailwind CSS — warna Raspro

Komponen memakai class: `text-rasya-accent`, `text-rasya-dark`, `text-white`, `text-base`, `text-xl`, `text-2xl`.

Jika di project tujuan **belum** ada warna `rasya`, tambahkan di **`tailwind.config.js`** atau **`tailwind.config.ts`**:

```js
// Di dalam theme.extend.colors
colors: {
  rasya: {
    dark: "#0f0f12",
    accent: "#eab308",
    // opsional: surface, border, muted, dll.
  },
}
```

Atau di **`globals.css`** (jika pakai CSS variables):

```css
:root {
  --rasya-dark: #0f0f12;
  --rasya-accent: #eab308;
}
```

Lalu di Tailwind extend:

```js
colors: {
  "rasya-dark": "var(--rasya-dark)",
  "rasya-accent": "var(--rasya-accent)",
}
```

---

## 3. Cara pakai di halaman

Import dan render:

```tsx
import RasproLogo from "@/components/RasproLogo";

// Logo saja (ukuran sedang, tema gelap)
<RasproLogo />

// Ukuran: sm (kecil), md (standar), lg (besar)
<RasproLogo size="sm" />
<RasproLogo size="md" />
<RasproLogo size="lg" />

// Tema: dark (teks putih), light (teks gelap)
<RasproLogo theme="dark" />
<RasproLogo theme="light" />

// Sebagai link ke beranda
<RasproLogo asLink />

// Sebagai link ke raspro.online (mis. di footer)
<RasproLogo asLink hrefExternal />

// Contoh di header
<header>
  <a href="/">
    <RasproLogo size="md" theme="dark" />
  </a>
</header>

// Contoh di footer
<footer>
  <a href="https://raspro.online" target="_blank" rel="noopener noreferrer">
    <RasproLogo size="sm" theme="light" asLink hrefExternal />
  </a>
</footer>
```

---

## 4. Ringkasan langkah (aplikasi ke folder lain)

1. Copy **`Logo_sebenarnya.png`** dan **`Animate_O.svg`** ke **`public/`** project tujuan.
2. Copy **`AnimatedO.tsx`** dan **`RasproLogo.tsx`** ke **`components/`** project tujuan.
3. Pastikan import path `AnimatedO` di `RasproLogo.tsx` benar (mis. `@/components/AnimatedO`).
4. Tambah warna **`rasya-accent`** dan **`rasya-dark`** di Tailwind/CSS jika belum ada.
5. Di halaman mana pun yang ingin tampil logo Raspro, import **`RasproLogo`** dan gunakan dengan **`size`** / **`theme`** / **`asLink`** / **`hrefExternal`** sesuai kebutuhan.

Dengan ini, logo yang diaplikasikan akan konsisten: **gambar logo + "Rasya Production" dengan huruf O yang dianimasikan**.
