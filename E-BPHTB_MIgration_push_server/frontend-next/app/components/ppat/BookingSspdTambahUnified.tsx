"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { getBackendBaseUrl } from "../../../lib/api";
import BillingShareCard from "../BillingShareCard";

export type BookingSspdEntity = "badan" | "perorangan";

export type BookingSspdTambahUnifiedProps = {
  /** Default jenis wajib pajak (radio). URL `?wajib=badan|perorangan` overrides when present. */
  defaultEntity: BookingSspdEntity;
  /** Daftar booking setelah sukses / batal */
  listPath: string;
};

const today = new Date();
const pad = (n: number, len = 2) => String(n).padStart(len, "0");
const defaultTanggal = `${pad(today.getDate())}-${pad(today.getMonth() + 1)}-${today.getFullYear()}`;

// NPOPTKP default (minimal nasional) mengacu UU No. 1 Tahun 2022 (HKPD).
// - Umum: 80.000.000
// - Waris & Hibah Wasiat (keluarga sedarah lurus 1 derajat / suami-istri): 300.000.000
// - Kode historis tertentu di aplikasi lama: 28=40jt, 29=49jt, 34=bebas (0)
const NPOPTKP_DEFAULT = 80_000_000;
const NPOPTKP_MAP: Record<string, number> = {
// --- EXISTING (01-15) ---
"01": 80_000_000, "02": 80_000_000, "03": 80_000_000, "04": 300_000_000, 
"05": 300_000_000, "06": 80_000_000, "07": 80_000_000, "08": 80_000_000, 
"09": 80_000_000, "10": 80_000_000, "11": 80_000_000, "12": 80_000_000, 
"13": 80_000_000, "14": 80_000_000, "15": 80_000_000,

// --- GAP 16-20 (Pemberian Hak Baru & Spesifik) ---
"16": 80_000_000, // 16 - Pemberian Hak Milik (Peningkatan dari HGB)
"17": 80_000_000, // 17 - Pemberian HGB di atas Tanah Negara
"18": 80_000_000, // 18 - Pemberian HGU (Hak Guna Usaha)
"19": 80_000_000, // 19 - Pemberian Hak Pakai
"20": 80_000_000, // 20 - Pemberian Hak Pengelolaan (HPL)

// --- EXISTING (21-35) ---
"21": 80_000_000, "22": 80_000_000, "23": 80_000_000, "24": 300_000_000, 
"25": 80_000_000, "26": 80_000_000, "27": 80_000_000, 
"28": 40_000_000, // Historis Sesuai Mentor
"29": 49_000_000, // Historis Sesuai Mentor
"30": 80_000_000, "31": 80_000_000, "32": 80_000_000, "33": 80_000_000, 
"34": 0,          // Bebas Sesuai Mentor
"35": 80_000_000,

// --- GAP 36-40 (Kasus Khusus & Transisi) ---
"36": 80_000_000, // 36 - Konversi Hak Lama (Girik/Tanah Adat)
"37": 80_000_000, // 37 - Eksekusi Hak Tanggungan (Lelang Bank)
"38": 80_000_000, // 38 - Pelepasan Hak untuk Kepentingan Umum (Ganti Rugi)
"39": 80_000_000, // 39 - Tukar Menukar Aset Daerah (Ruislag)
"40": 80_000_000, // 40 - Perolehan Hak karena Penataan Ruang/Konsolidasi
};

function normalizeJenisPerolehanCode(raw: string | null | undefined): string {
  const s = String(raw ?? "").trim();
  if (s.length >= 2 && /^\d{2}/.test(s)) return s.slice(0, 2);
  return s;
}

function npoptkpFromJenisPerolehan(raw: string | null | undefined): number {
  const k = normalizeJenisPerolehanCode(raw);
  if (!k) return 0;
  return NPOPTKP_MAP[k] ?? NPOPTKP_DEFAULT;
}

/** 40 Kecamatan di Kabupaten Bogor (sumber: denah_kabupatenbogor.md) */
const KECAMATAN_OBJEK_LIST = [
  "Babakan Madang", "Bojonggede", "Caringin", "Cariu", "Ciampea", "Ciawi", "Cibinong", "Cibungbulang",
  "Cigombong", "Cigudeg", "Cijeruk", "Cileungsi", "Ciomas", "Cisarua", "Ciseeng", "Citeureup",
  "Dramaga", "Gunung Putri", "Gunung Sindur", "Jasinga", "Jonggol", "Kemang", "Klapanunggal",
  "Leuwiliang", "Leuwisadeng", "Megamendung", "Nanggung", "Pamijahan", "Parung Panjang", "Parung",
  "Ranca Bungur", "Rumpin", "Sukajaya", "Sukamakmur", "Sukaraja", "Tajur Halang", "Tamansari",
  "Tanjungsari", "Tenjo", "Tenjolaya",
];

/** Kelurahan/Desa per Kecamatan. label = tampilan di UI (Kel./Desa), value = yang disimpan ke DB (tanpa prefix) */
type KelurahanOption = { label: string; value: string };

const KECAMATAN_KELURAHAN: Record<string, KelurahanOption[]> = {
  "Cibinong": [
    "Cibinong", "Cirimekar", "Ciriung", "Harapan Jaya", "Karadenan", "Nanggewer", "Nanggewer Mekar",
    "Pabuaran", "Pabuaran Mekar", "Pakansari", "Pondok Rajeg", "Sukahati", "Tengah",
  ].map((n) => ({ label: `Kel. ${n}`, value: n })),
  "Gunung Putri": [
    "Bojong Kulur", "Bojong Nangka", "Ciangsana", "Cicadas", "Cikeas Udik", "Gunung Putri",
    "Karanggan", "Nagrak", "Putri Tunggal", "Tlajung Udik", "Wanaherang",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Bojonggede": [
    { label: "Kel. Pabuaran", value: "Pabuaran" },
    { label: "Desa Bojong Baru", value: "Bojong Baru" },
    { label: "Desa Bojonggede", value: "Bojonggede" },
    { label: "Desa Cimanggis", value: "Cimanggis" },
    { label: "Desa Kedung Waringin", value: "Kedung Waringin" },
    { label: "Desa Ragajaya", value: "Ragajaya" },
    { label: "Desa Rawa Panjang", value: "Rawa Panjang" },
    { label: "Desa Susukan", value: "Susukan" },
    { label: "Desa Waringin Jaya", value: "Waringin Jaya" },
  ],
  "Cileungsi": [
    "Cileungsi", "Cileungsi Kidul", "Cipenjo", "Dayeuh", "Gandoang", "Jatisari", "Limus Nunggal",
    "Mampir", "Mekarsari", "Pasir Angin", "Setu Sari", "Sodong",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Babakan Madang": [
    "Babakan Madang", "Bojong Koneng", "Cijayanti", "Cipambuan", "Citaringgul", "Kadumangu",
    "Karang Tengah", "Sentul", "Sumur Batu",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Ciawi": [
    "Banjar Wangi", "Banjar Waru", "Bendungan", "Bitung Sari", "Bojong Murni", "Ciawi", "Cibedug",
    "Cileungsi", "Citapen", "Jambu Luwuk", "Pandansari", "Ratujaya", "Teluk Pinang",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Citeureup": [
    { label: "Kel. Citeureup", value: "Citeureup" },
    { label: "Kel. Puspanegara", value: "Puspanegara" },
    { label: "Desa Karang Asem Timur", value: "Karang Asem Timur" },
    { label: "Desa Gunungsari", value: "Gunungsari" },
    { label: "Desa Hambalang", value: "Hambalang" },
    { label: "Desa Leuwinutug", value: "Leuwinutug" },
    { label: "Desa Pasir Mukti", value: "Pasir Mukti" },
    { label: "Desa Puspasari", value: "Puspasari" },
    { label: "Desa Sanja", value: "Sanja" },
    { label: "Desa Sukahati", value: "Sukahati" },
    { label: "Desa Tajur", value: "Tajur" },
    { label: "Desa Tangkil", value: "Tangkil" },
    { label: "Desa Tarikolot", value: "Tarikolot" },
    { label: "Desa Lulut", value: "Lulut" },
  ],
  "Ciomas": [
    { label: "Kel. Padasuka", value: "Padasuka" },
    { label: "Desa Ciomas", value: "Ciomas" },
    { label: "Desa Ciomas Rahayu", value: "Ciomas Rahayu" },
    { label: "Desa Kota Batu", value: "Kota Batu" },
    { label: "Desa Laladon", value: "Laladon" },
    { label: "Desa Mekarjaya", value: "Mekarjaya" },
    { label: "Desa Pagelaran", value: "Pagelaran" },
    { label: "Desa Parakan", value: "Parakan" },
    { label: "Desa Sukaharja", value: "Sukaharja" },
    { label: "Desa Sukamakmur", value: "Sukamakmur" },
    { label: "Desa Sirnagalih", value: "Sirnagalih" },
  ],
  "Parung": [
    "Bojong Indah", "Bojong Sempu", "Cogreg", "Iwul", "Jabon Mekar", "Pamasari / Pemagarsari",
    "Parung", "Waru", "Warujaya",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Cisarua": [
    { label: "Kel. Cisarua", value: "Cisarua" },
    { label: "Desa Batulayang", value: "Batulayang" },
    { label: "Desa Cibeureum", value: "Cibeureum" },
    { label: "Desa Cilember", value: "Cilember" },
    { label: "Desa Citeko", value: "Citeko" },
    { label: "Desa Jogjogan", value: "Jogjogan" },
    { label: "Desa Kopo", value: "Kopo" },
    { label: "Desa Leuwimalang", value: "Leuwimalang" },
    { label: "Desa Tugu Selatan", value: "Tugu Selatan" },
    { label: "Desa Tugu Utara", value: "Tugu Utara" },
  ],
  // Kecamatan 11–40 (denah_kabupatenbogor.md)
  "Megamendung": [
    "Gadog", "Sukakarya", "Sukamahi", "Sukamaju", "Sukamanah", "Megamendung", "Sukagalih", "Sukaresmi",
    "Cipayung Girang", "Cipayung Datar", "Sukamulya", "Kuta",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Caringin": [
    "Caringin", "Cinagara", "Muara Jaya", "Pasir Muncang", "Ciherang Pondok", "Ciderum", "Ciengang",
    "Tangkil", "Cimande", "Cimande Hilir", "Lemah Duhur", "Pancawati",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Dramaga": [
    "Babakan", "Ciherang", "Dramaga", "Neglasari", "Petir", "Purwasari", "Sukadamai", "Sukawening", "Sinarsari",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Tamansari": [
    "Pasireurih", "Sirnagalih", "Sukajadi", "Sukajaya", "Sukaluyu", "Sukamantri", "Sukaresmi", "Tamansari",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Ciampea": [
    "Benteng", "Bojong Jengkol", "Bojong Rangkas", "Ciampea", "Ciampea Udik", "Cibadak", "Cibanteng", "Cibuntu",
    "Cicadas", "Cihideung Ilir", "Cihideung Udik", "Cinangka", "Tegal Waru",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Ciseeng": [
    "Babakan", "Cibeuteung Muara", "Cibeuteung Udik", "Cibentang", "Ciseeng", "Karihkil", "Kuripan",
    "Parigi Mekar", "Putat Nutug", "Sanja",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Gunung Sindur": [
    "Cibadung", "Cidokom", "Curug", "Gunungsindur", "Jampang", "Pabuaran", "Padurenan", "Pengasinan", "Rawakalong",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Parung Panjang": [
    "Cibunar", "Cikuda", "Dago", "Gintung Cilejet", "Gorowong", "Jagabita", "Jagabaya", "Kabasiran",
    "Lumpang", "Parungpanjang", "Pingku",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Kemang": [
    "Atang Senjaya", "Bojong", "Jampang", "Kemang", "Pabuaran", "Parakan Jaya", "Pondok Udik", "Semplak Barat", "Tegal",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Ranca Bungur": [
    "Bantarjaya", "Bantarsari", "Candali", "Mekarsari", "Pasirgaok", "Rancabungur", "Cimulang",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Leuwiliang": [
    "Barengkok", "Cibeber I", "Cibeber II", "Karacak", "Karyasari", "Leuwiliang", "Leuwimekar", "Pabuarasari", "Puraseda", "Karehkel",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Leuwisadeng": [
    "Babakan Sadeng", "Kalong I", "Kalong II", "Leuwisadeng", "Sadeng", "Sadengkolot", "Sibanteng", "Wangun Jaya",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Pamijahan": [
    "Ciasihan", "Ciasmara", "Cibening", "Cibitung Kulon", "Cibitung Wetan", "Cibunian", "Cimayang",
    "Gunung Bunder I", "Gunung Bunder II", "Gunung Menyan", "Pamijahan", "Pasir Badak", "Pasir Reungit", "Purwabakti", "Tukuh Jaya",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Tenjolaya": [
    "Cibitung Tengah", "Cinangneng", "Gunung Mulya", "Situ Daun", "Tapos I", "Tapos II", "Tenjolaya",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Jasinga": [
    "Bagoang", "Barengkok", "Cikopomayak", "Curug", "Jasinga", "Jugala Jaya", "Kalongsawah", "Koleang",
    "Neglasari", "Pamagersari", "Pangaur", "Pangradin", "Sipak", "Setu", "Tegal Wangi", "Wirajaya",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Cigudeg": [
    "Argapura", "Bangunjaya", "Batu Jajar", "Bunar", "Cigudeg", "Cintamanik", "Mekarjaya", "Rengasjajar",
    "Sukamaju", "Sukaraksa", "Sukamulya", "Tegallega", "Wargajaya", "Banyuresmi", "Banyuwangi",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Sukajaya": [
    "Cileuksa", "Cisarua", "Harkatjaya", "Kiarapandak", "Kiarasari", "Pasir Madang", "Sipayung",
    "Sukajaya", "Sukamulya", "Uranjaya", "Jaya Raharja",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Nanggung": [
    "Bantarkaret", "Batu Tulis", "Cisarua", "Curug Bitung", "Hambaro", "Kalong Liud", "Malasari",
    "Nanggung", "Pangkal Jaya", "Parakan Muncang", "Sukaluyu",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Rumpin": [
    "Cipinang", "Cibodas", "Gobang", "Kampung Sawah", "Kertajaya", "Leuwibatu", "Mekar Sari", "Rabak",
    "Rumpin", "Sukamulya", "Sukasari", "Taman Sari", "Cidokom", "Mekar Jaya",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Klapanunggal": [
    "Bojong", "Cikahuripan", "Klapanunggal", "Leuwikaret", "Ligarmukti", "Lulut", "Nambo", "Bantar Jati", "Kembang Kuning",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Jonggol": [
    "Balekambang", "Bendungan", "Cibodas", "Jonggol", "Singajaya", "Sirnagalih", "Sukagalih", "Sukajaya",
    "Sukamanah", "Sukamaju", "Sukasirna", "Weninggalih", "Sukamulya", "Singasari",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Cariu": [
    "Babakan Raden", "Bantar Kuning", "Cariu", "Cibatutiga", "Cikutamahi", "Karya Mekar", "Kuta Mekar", "Mekarwangi", "Sukajadi", "Tegal Panjang",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Sukamakmur": [
    "Cibadak", "Pabuaran", "Sirnajaya", "Sukadamai", "Sukaharja", "Sukamakmur", "Sukamulya", "Sukawangi", "Wargajaya", "Sirnamulya",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Tanjungsari": [
    "Antajaya", "Buanajaya", "Cibadak", "Pasir Tanjung", "Selawangi", "Sirnarasa", "Sirnasari", "Sukarasa", "Tanjungrasa", "Tanjungsari",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Sukaraja": [
    "Cadas Ngampar", "Cibanon", "Cikeas", "Cilebut Barat", "Cilebut Timur", "Ciluar", "Cimandala",
    "Nagrak", "Pasir Jambu", "Pasir Laja", "Sukaraja", "Sukatani", "Gunung Geulis",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Tajur Halang": [
    "Citayam", "Kalisuren", "Sasak Panjang", "Sukmajaya", "Tajurhalang", "Tonjong", "Nanggerang",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Cigombong": [
    "Ciadeg", "Ciburayut", "Ciburuy", "Cigombong", "Cipelang", "Pasirjaya", "Srogol", "Tugujaya", "Watesjaya",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Tenjo": [
    "Batok", "Bojong", "Cilaku", "Ciomas", "Singabangsa", "Singasari", "Tenjo", "Babakan",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Cibungbulang": [
    "Cemplang", "Ciaruteun Ilir", "Ciaruteun Udik", "Cibatok I", "Cibatok II", "Cibungbulang",
    "Cimanggu I", "Cimanggu II", "Dukuh", "Galuga", "Girimulya", "Leuweung Kolot", "Situ Ilir", "Situ Udik", "Sukamaju",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
  "Cijeruk": [
    "Cibalung", "Cijeruk", "Cipicung", "Palasari", "Sukaharja", "Tajur Halang", "Tanjungsari", "Warung Menteng", "Cipelang",
  ].map((n) => ({ label: `Desa ${n}`, value: n })),
};

const JENIS_PEROLEHAN = [
  { value: "", label: "-- Pilih Jenis Perolehan Hak --" },
  { value: "01", label: "01 - Jual Beli" },
  { value: "02", label: "02 - Tukar Menukar" },
  { value: "03", label: "03 - Hibah" },
  { value: "04", label: "04 - Hibah Wasiat" },
  { value: "05", label: "05 - Waris" },
  { value: "06", label: "06 - Pemasukan dalam Perseroan / Badan Hukum" },
  { value: "07", label: "07 - Pemisahan Hak yang Mengakibatkan Peralihan" },
  { value: "08", label: "08 - Penunjukan Pembeli dalam Lelang" },
  { value: "09", label: "09 - Pelaksanaan Putusan Hakim" },
  { value: "10", label: "10 - Penggabungan Usaha" },
  { value: "11", label: "11 - Peleburan Usaha" },
  { value: "12", label: "12 - Pemekaran Usaha" },
  { value: "13", label: "13 - Hadiah" },
  { value: "14", label: "14 - Perolehan Rumah Bersubsidi" },
  { value: "15", label: "15 - Perolehan Rumah Subsidi SE-26/2009" },
  { value: "21", label: "21 - Pemberian Hak Baru (Pelepasan Hak)" },
  { value: "22", label: "22 - Pemberian Hak Baru (di luar Pelepasan Hak)" },
  { value: "23", label: "23 - Jual Beli di bawah 2011" },
  { value: "24", label: "24 - Waris di bawah tahun 2011" },
  { value: "25", label: "25 - Perumahan Bersubsidi di bawah 2011" },
  { value: "26", label: "26 - Perumahan Bersubsidi 50 juta" },
  { value: "27", label: "27 - Jual Beli 1997–2001 September" },
  { value: "28", label: "28 - NPOPTKP 40 juta" },
  { value: "29", label: "29 - NPOPTKP 49 juta" },
  { value: "30", label: "30 - Hibah di bawah tahun 2011" },
  { value: "31", label: "31 - Pemenang Lelang di bawah tahun 2011" },
  { value: "32", label: "32 - Subsidi Rumah Sederhana Sehat" },
  { value: "33", label: "33 - Jual Beli 2001 Oktober s.d. 2005" },
  { value: "34", label: "34 - Bebas berdasarkan UU No. 28 Tahun 2009" },
  { value: "35", label: "35 - Perjanjian Pengikatan Jual Beli" },
];

type CreatePayload = {
  jenis_wajib_pajak: string;
  noppbb: string;
  namawajibpajak: string;
  alamatwajibpajak: string;
  namapemilikobjekpajak: string;
  alamatpemilikobjekpajak: string;
  tanggal: string;
  tahunajb: string;
  kabupatenkotawp: string;
  kecamatanwp: string;
  kelurahandesawp: string;
  rtrwwp: string;
  npwpwp: string;
  kodeposwp: string;
  kabupatenkotaop: string;
  kecamatanop: string;
  kelurahandesaop: string;
  rtrwop: string;
  npwpop: string;
  kodeposop: string;
  trackstatus: string;
  nilaiPerolehanObjekPajakTidakKenaPajak?: number;
  bphtb_yangtelah_dibayar?: number;
  hargatransaksi?: string;
  letaktanahdanbangunan?: string;
  rt_rwobjekpajak?: string;
  kecamatanlp?: string;
  kelurahandesalp?: string;
  status_kepemilikan?: string;
  jenisPerolehan?: string;
  keterangan?: string;
  nomor_sertifikat?: string;
  tanggal_perolehan?: string;
  tanggal_pembayaran?: string;
  luas_tanah?: number;
  njop_tanah?: number;
  luas_bangunan?: number;
  njop_bangunan?: number;
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid var(--border_color)",
  fontSize: 14,
  marginTop: 4,
};
const labelStyle: React.CSSProperties = { display: "block", marginBottom: 4, fontWeight: 600, fontSize: 14 };
const sectionStyle: React.CSSProperties = { marginBottom: 24 };
const rowStyle: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 };
const judulStyle: React.CSSProperties = { margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "var(--color_font_main)", borderBottom: "2px solid var(--accent)", paddingBottom: 8 };
const hintStyle: React.CSSProperties = { fontSize: 12, color: "var(--color_font_main_muted)", marginTop: 4 };

function buildNopPbb(d: string[]): string {
  return `${(d[0] ?? "").padStart(2, "0")}.${(d[1] ?? "").padStart(2, "0")}.${(d[2] ?? "").padStart(3, "0")}.${(d[3] ?? "").padStart(3, "0")}.${(d[4] ?? "").padStart(3, "0")}.${(d[5] ?? "").padStart(4, "0")}.${(d[6] ?? "").padStart(1, "0")}`;
}

function buildNpwp(d: string[]): string {
  return `${(d[0] ?? "").padStart(2, "0")}.${(d[1] ?? "").padStart(3, "0")}.${(d[2] ?? "").padStart(3, "0")}.${(d[3] ?? "")}-${(d[4] ?? "").padStart(3, "0")}.${(d[5] ?? "").padStart(3, "0")}`;
}

/** Format angka ke Rupiah Indonesia (titik sebagai pemisah ribuan) */
function formatRupiah(n: number | undefined | null): string {
  if (n == null || isNaN(n)) return "";
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/** Parse string tampilan rupiah ke angka */
function parseRupiah(s: string): number {
  const raw = (s || "").replace(/\./g, "").replace(/\D/g, "");
  return raw === "" ? 0 : parseInt(raw, 10);
}

/** Luas: titik sebagai ribuan, koma sebagai desimal (contoh 1.234,5) atau angka sederhana */
function parseDecimalInput(s: string): number {
  const t = (s || "").trim().replace(/\s/g, "");
  if (!t) return NaN;
  const hasComma = t.includes(",");
  const hasDot = t.includes(".");
  if (hasComma && hasDot) {
    return parseFloat(t.replace(/\./g, "").replace(",", "."));
  }
  if (hasComma) {
    return parseFloat(t.replace(/\./g, "").replace(",", "."));
  }
  if (hasDot) {
    const parts = t.split(".");
    if (parts.length === 2 && parts[1].length <= 2) {
      return parseFloat(t);
    }
    return parseFloat(t.replace(/\./g, ""));
  }
  const n = parseFloat(t);
  return Number.isFinite(n) ? n : NaN;
}

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

/** Pecah NOP PBB terformat ke 7 segmen input */
function parseNopToDigits(raw: string): string[] {
  const d = (raw || "").replace(/\D/g, "");
  const lens = [2, 2, 3, 3, 3, 4, 1] as const;
  const out: string[] = Array(7).fill("");
  let pos = 0;
  for (let i = 0; i < lens.length; i++) {
    out[i] = d.slice(pos, pos + lens[i]);
    pos += lens[i];
  }
  return out;
}

/** Pecah NPWP terformat ke 6 segmen input */
function parseNpwpToDigits(raw: string): string[] {
  const d = (raw || "").replace(/\D/g, "");
  const lens = [2, 3, 3, 1, 3, 3] as const;
  const out: string[] = Array(6).fill("");
  let pos = 0;
  for (let i = 0; i < lens.length; i++) {
    out[i] = d.slice(pos, pos + lens[i]);
    pos += lens[i];
  }
  return out;
}

/** Nilai status_kepemilikan di DB → value `<select>` form */
function statusDbToForm(s: string | undefined): string {
  const v = (s || "").trim();
  if (v === "Milik Pribadi" || v === "milik_pribadi") return "milik_pribadi";
  if (v === "Milik Bersama" || v === "milik_bersama") return "milik_bersama";
  if (v === "Sewa" || v === "sewa") return "sewa";
  if (v === "Hak Guna Bangunan" || v === "hgb") return "hgb";
  return "milik_pribadi";
}

interface CallbackHistoryRow {
  id: string;
  nobooking: string;
  noppbb: string;
  namawajibpajak: string;
  label: string;
}

function normalizeEntityFromQuery(raw: string | null | undefined): BookingSspdEntity | null {
  const t = (raw || "").trim().toLowerCase();
  if (t === "badan" || t === "badan_usaha" || t === "bu") return "badan";
  if (t === "perorangan" || t === "per" || t === "pribadi") return "perorangan";
  return null;
}

/** Dynamic validation (tanpa Zod — dependency tidak ada di project). */
function validateIdentityForEntity(
  entity: BookingSspdEntity,
  npwpwpFromDigits: string,
  npwpopFromDigits: string,
  nikWp: string,
  nikOp: string
): string | null {
  if (entity === "badan") {
    const a = npwpwpFromDigits.replace(/\D/g, "");
    const b = npwpopFromDigits.replace(/\D/g, "");
    if (a.length < 15) return "NPWP Wajib Pajak wajib diisi lengkap (minimal 15 digit).";
    if (b.length < 15) return "NPWP Pemilik Objek wajib diisi lengkap (minimal 15 digit).";
    return null;
  }
  const wp = (nikWp || "").replace(/\D/g, "");
  const op = (nikOp || "").replace(/\D/g, "");
  if (wp.length !== 16) return "NIK Wajib Pajak wajib 16 digit.";
  if (op.length !== 16) return "NIK Pemilik Objek wajib 16 digit.";
  return null;
}

export default function BookingSspdTambahUnified({ defaultEntity, listPath }: BookingSspdTambahUnifiedProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openObjek, setOpenObjek] = useState(true);

  const [tanggal, setTanggal] = useState(defaultTanggal);
  const [nobookingValue, setNobookingValue] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [lockObjekAfterBilling, setLockObjekAfterBilling] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [nopDigits, setNopDigits] = useState<string[]>(Array(7).fill(""));
  const [npwpWpDigits, setNpwpWpDigits] = useState<string[]>(Array(6).fill(""));
  const [npwpOpDigits, setNpwpOpDigits] = useState<string[]>(Array(6).fill(""));
  const [jenisPerolehan, setJenisPerolehan] = useState("");

  const nopRefs = useRef<(HTMLInputElement | null)[]>([]);
  const npwpWpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const npwpOpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [kecamatanSearch, setKecamatanSearch] = useState("");
  const [kecamatanDropdownOpen, setKecamatanDropdownOpen] = useState(false);
  const [kelurahanDropdownOpen, setKelurahanDropdownOpen] = useState(false);
  const kecamatanDropdownRef = useRef<HTMLDivElement>(null);
  const kelurahanDropdownRef = useRef<HTMLDivElement>(null);
  const callbackDropdownRef = useRef<HTMLDivElement>(null);
  /** Setelah lookup NIK/NPWP sukses, NOP tidak menimpa nama WP (subjek). */
  const wpSubjekAutofillDoneRef = useRef(false);
  const nopLookupAbortRef = useRef<AbortController | null>(null);
  const wpLookupAbortRef = useRef<AbortController | null>(null);

  const [callbackOpen, setCallbackOpen] = useState(false);
  const [callbackSearch, setCallbackSearch] = useState("");
  const debouncedCallbackSearch = useDebouncedValue(callbackSearch, 350);
  const [callbackItems, setCallbackItems] = useState<CallbackHistoryRow[]>([]);
  const [callbackListLoading, setCallbackListLoading] = useState(false);
  const [callbackApplyLoading, setCallbackApplyLoading] = useState(false);
  const [callbackNotice, setCallbackNotice] = useState<string | null>(null);
  const [nopLookupLoading, setNopLookupLoading] = useState(false);
  const [nopLookupNotice, setNopLookupNotice] = useState<string | null>(null);
  const [entityKind, setEntityKind] = useState<BookingSspdEntity>(defaultEntity);
  const [wpIdentityInput, setWpIdentityInput] = useState("");
  const [wpLookupLoading, setWpLookupLoading] = useState(false);
  const [wpToast, setWpToast] = useState<string | null>(null);
  const [wpTeleponHint, setWpTeleponHint] = useState<string | null>(null);

  const [form, setForm] = useState<Record<string, string | number | undefined>>({
    namawajibpajak: "",
    alamatwajibpajak: "",
    namapemilikobjekpajak: "",
    alamatpemilikobjekpajak: "",
    tahunajb: String(today.getFullYear()),
    kabupatenkotawp: "",
    kecamatanwp: "",
    kelurahandesawp: "",
    rtrwwp: "",
    kodeposwp: "",
    kabupatenkotaop: "Kabupaten Bogor",
    kecamatanop: "",
    kelurahandesaop: "",
    rtrwop: "",
    kodeposop: "",
    hargatransaksi: "",
    letaktanahdanbangunan: "",
    rt_rwobjekpajak: "",
    kecamatanlp: "",
    kelurahandesalp: "",
    status_kepemilikan: "milik_pribadi",
    jenisPerolehan: "",
    keterangan: "",
    nomor_sertifikat: "",
    npwpwp: "",
    npwpop: "",
    luas_tanah: "",
    luas_bangunan: "",
    njop_tanah: "",
    njop_bangunan: "",
    nilaiPerolehanObjekPajakTidakKenaPajak: "",
  });

  const [billingModal, setBillingModal] = useState<null | { billing_id: string; amount: number; expires_at: string }>(null);

  const updateForm = useCallback((key: string, value: string | number | undefined) => {
    setForm((prev) => {
      const next: Record<string, string | number | undefined> = { ...prev, [key]: value };
      if (key === "kecamatanop") next.kelurahandesaop = "";
      if (key === "jenisPerolehan") {
        // Pastikan NPOPTKP ikut berubah setiap kali jenis perolehan berubah (mencegah nilai stale).
        const v = typeof value === "string" ? value : String(value ?? "");
        next.nilaiPerolehanObjekPajakTidakKenaPajak = String(npoptkpFromJenisPerolehan(v));
      }
      return next;
    });
    setError(null);
  }, []);

  const fetchLookupNop = useCallback(async () => {
    wpLookupAbortRef.current?.abort();
    const noppbb = buildNopPbb(nopDigits);
    const clean = noppbb.replace(/\D/g, "");
    if (!clean || clean.length < 10 || /^0+$/.test(clean)) {
      setNopLookupNotice(null);
      return;
    }
    nopLookupAbortRef.current?.abort();
    const ac = new AbortController();
    nopLookupAbortRef.current = ac;
    setNopLookupLoading(true);
    setNopLookupNotice(null);
    setError(null);
    try {
      const base = getBackendBaseUrl();
      const url = `${base ? base : ""}/api/ppat/pbb/lookup-nop?nop=${encodeURIComponent(noppbb)}`;
      const res = await fetch(url, { credentials: "include", signal: ac.signal });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.success || !json?.data) {
        const msg = typeof json?.message === "string" ? json.message : "NOP tidak ditemukan atau gagal mengambil data.";
        setNopLookupNotice(null);
        setError(msg);
        return;
      }
      const d = json.data as Record<string, unknown>;
      const str = (k: string) => (d[k] != null && String(d[k]).trim() !== "" ? String(d[k]).trim() : undefined);
      const num = (k: string): number | undefined => {
        const v = d[k];
        if (typeof v === "number" && !Number.isNaN(v)) return v;
        if (typeof v === "string" && v.trim() !== "") return parseFloat(v.replace(/\./g, "").replace(",", "."));
        return undefined;
      };
      const skipNamaWp = wpSubjekAutofillDoneRef.current;
      // Jika layanan lookup mengembalikan luas/NJOP, kita isi agar pratinjau tagihan tidak bernilai 0.
      const nx = (v: unknown): string | undefined => {
        if (v == null) return undefined;
        if (typeof v === "number" && !Number.isNaN(v)) return String(Math.round(v));
        const n = parseRupiah(String(v));
        return n >= 0 ? String(n) : undefined;
      };
      const nLuas = (v: unknown): string | undefined => {
        if (v == null) return undefined;
        if (typeof v === "number" && !Number.isNaN(v)) return String(v);
        const t = String(v).trim();
        return t ? t : undefined;
      };
      setForm((prev) => ({
        ...prev,
        namawajibpajak: skipNamaWp ? prev.namawajibpajak : (str("namawajibpajak") ?? prev.namawajibpajak),
        letaktanahdanbangunan: str("alamat_objek") ?? prev.letaktanahdanbangunan,
        luas_tanah: nLuas(d["luas_tanah"]) ?? prev.luas_tanah,
        njop_tanah: nx(d["njop_tanah"]) ?? prev.njop_tanah,
        luas_bangunan: nLuas(d["luas_bangunan"]) ?? prev.luas_bangunan,
        njop_bangunan: nx(d["njop_bangunan"]) ?? prev.njop_bangunan,
      }));
      const src = str("source") ?? "internal_db";
      setNopLookupNotice(
        skipNamaWp
          ? `Data objek pajak dimuat (sumber: ${src}). Nama WP tidak diubah karena sudah diisi dari NIK/NPWP.`
          : `Referensi objek pajak dimuat (sumber: ${src}). Silakan sesuaikan jika ada perbedaan dengan dokumen.`
      );
      window.setTimeout(() => setNopLookupNotice(null), 8000);
    } catch (e: unknown) {
      const aborted = typeof e === "object" && e !== null && "name" in e && (e as { name: string }).name === "AbortError";
      if (aborted) return;
      setError("Gagal menghubungi layanan pencarian NOP.");
    } finally {
      if (nopLookupAbortRef.current === ac) {
        setNopLookupLoading(false);
      }
    }
  }, [nopDigits]);

  const fetchWPData = useCallback(async () => {
    const raw = wpIdentityInput.trim();
    const digits = raw.replace(/\D/g, "");
    if (!raw) {
      setWpToast(null);
      return;
    }
    if (entityKind === "perorangan" && digits.length !== 16) {
      setWpToast("NIK harus 16 digit.");
      window.setTimeout(() => setWpToast(null), 5000);
      return;
    }
    if (entityKind === "badan" && digits.length < 15) {
      setWpToast("NPWP minimal 15 digit.");
      window.setTimeout(() => setWpToast(null), 5000);
      return;
    }

    nopLookupAbortRef.current?.abort();
    wpLookupAbortRef.current?.abort();
    const ac = new AbortController();
    wpLookupAbortRef.current = ac;

    setWpLookupLoading(true);
    setWpToast(null);
    setWpTeleponHint(null);
    setError(null);
    try {
      const base = getBackendBaseUrl();
      const kind = entityKind === "perorangan" ? "nik" : "npwp";
      const q = new URLSearchParams({
        identity_number: raw,
        identity_kind: kind,
      });
      const url = `${base ? base : ""}/api/user/lookup?${q.toString()}`;
      const res = await fetch(url, { credentials: "include", signal: ac.signal });
      const json = await res.json().catch(() => ({}));
      if (!json?.success || !json?.data) {
        const msg = typeof json?.message === "string" ? json.message : "Data belum terdaftar, silakan isi manual";
        setWpToast(msg);
        window.setTimeout(() => setWpToast(null), 6000);
        return;
      }
      const d = json.data as Record<string, unknown>;
      const str = (k: string) => (d[k] != null && String(d[k]).trim() !== "" ? String(d[k]).trim() : undefined);
      wpSubjekAutofillDoneRef.current = true;

      const alamatL = str("alamat_lengkap");
      const alamatParts = [str("kelurahan"), str("kecamatan"), str("kabupaten_kota")].filter(Boolean).join(", ");
      const npwpRaw = str("npwp_badan");
      if (npwpRaw && entityKind === "badan") {
        setNpwpWpDigits(parseNpwpToDigits(npwpRaw));
      }

      setForm((prev) => ({
        ...prev,
        namawajibpajak: str("nama") ?? prev.namawajibpajak,
        alamatwajibpajak: alamatL || (alamatParts ? alamatParts : prev.alamatwajibpajak),
        kabupatenkotawp: str("kabupaten_kota") ?? prev.kabupatenkotawp,
        kecamatanwp: str("kecamatan") ?? prev.kecamatanwp,
        kelurahandesawp: str("kelurahan") ?? prev.kelurahandesawp,
        rtrwwp: str("rtrw") ?? prev.rtrwwp,
        ...(entityKind === "perorangan" ? { npwpwp: digits.slice(0, 16) } : {}),
      }));

      const tel = str("telepon");
      setWpTeleponHint(tel ? `Telepon terdaftar: ${tel} (salin ke keterangan jika diperlukan)` : null);
    } catch (e: unknown) {
      const aborted = typeof e === "object" && e !== null && "name" in e && (e as { name: string }).name === "AbortError";
      if (aborted) return;
      setWpToast("Gagal menghubungi layanan pencarian data WP.");
      window.setTimeout(() => setWpToast(null), 6000);
    } finally {
      if (wpLookupAbortRef.current === ac) {
        setWpLookupLoading(false);
      }
    }
  }, [wpIdentityInput, entityKind]);

  const filteredKecamatan = KECAMATAN_OBJEK_LIST.filter((k) =>
    k.toLowerCase().includes((kecamatanSearch || "").toLowerCase().trim())
  );
  const kelurahanOptions: KelurahanOption[] = (form.kecamatanop && KECAMATAN_KELURAHAN[form.kecamatanop]) || [];
  const hasKelurahanData = kelurahanOptions.length > 0;
  const selectedKelurahanLabel = hasKelurahanData && form.kelurahandesaop
    ? (kelurahanOptions.find((o) => o.value === form.kelurahandesaop)?.label ?? form.kelurahandesaop)
    : "";

  useEffect(() => {
    const editFlag = (searchParams?.get("edit") || "").trim();
    if (editFlag === "1" || editFlag.toLowerCase() === "true") return;
    const q = normalizeEntityFromQuery(searchParams?.get("wajib"));
    if (q) setEntityKind(q);
  }, [searchParams]);

  const handleEntityKindChange = useCallback((next: BookingSspdEntity) => {
    if (next === entityKind) return;
    setEntityKind(next);
    setWpIdentityInput("");
    setWpTeleponHint(null);
    setWpToast(null);
    setNpwpWpDigits(Array(6).fill(""));
    setNpwpOpDigits(Array(6).fill(""));
    setForm((prev) => ({ ...prev, npwpwp: "", npwpop: "" }));
    setError(null);
  }, [entityKind]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      const target = e.target as Node;
      if (kecamatanDropdownRef.current && !kecamatanDropdownRef.current.contains(target)) setKecamatanDropdownOpen(false);
      if (kelurahanDropdownRef.current && !kelurahanDropdownRef.current.contains(target)) setKelurahanDropdownOpen(false);
      if (callbackDropdownRef.current && !callbackDropdownRef.current.contains(target)) setCallbackOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  // Edit mode: prefill by nobooking from URL (?edit=1&nobooking=XXX)
  useEffect(() => {
    const editFlag = (searchParams?.get("edit") || "").trim();
    const nb = (searchParams?.get("nobooking") || "").trim();
    if (!nb || (editFlag !== "1" && editFlag.toLowerCase() !== "true")) return;
    let cancelled = false;
    (async () => {
      setIsEditMode(true);
      setEditLoading(true);
      setError(null);
      try {
        const base = getBackendBaseUrl();
        const urlBook = `${base ? base : ""}/api/ppat/booking/${encodeURIComponent(nb)}`;
        const res = await fetch(urlBook, { credentials: "include" });
        const json = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok || !json?.success || !json?.data) {
          setError(typeof json?.message === "string" ? json.message : "Gagal memuat detail booking.");
          return;
        }
        let d = json.data as Record<string, unknown>;
        const str = (rec: Record<string, unknown>, k: string) => (rec[k] != null ? String(rec[k]) : "");
        const num = (rec: Record<string, unknown>, k: string) => {
          const v = rec[k];
          if (typeof v === "number" && !Number.isNaN(v)) return v;
          if (typeof v === "string" && v.trim() !== "") return parseFloat(v.replace(/\./g, "").replace(",", "."));
          return undefined;
        };

        const jwpRaw = str(d, "jenis_wajib_pajak");
        const isPerorangan = jwpRaw.toLowerCase().includes("perorangan");
        if (!isPerorangan) {
          const urlCb = base
            ? `${base}/api/ppat/booking/${encodeURIComponent(nb)}/callback`
            : `/api/ppat/booking/${encodeURIComponent(nb)}/callback`;
          const resCb = await fetch(urlCb, { credentials: "include" });
          const jCb = await resCb.json().catch(() => ({}));
          if (resCb.ok && jCb?.success && jCb?.data && typeof jCb.data === "object") {
            d = { ...d, ...(jCb.data as Record<string, unknown>) };
          }
        }

        const jwpRaw2 = str(d, "jenis_wajib_pajak");
        const isPer2 = jwpRaw2.toLowerCase().includes("perorangan");
        setEntityKind(isPer2 ? "perorangan" : "badan");
        const paymentStatus = str(d, "payment_status").trim().toUpperCase();
        const sspdPaymentStatus = str(d, "sspd_pembayaran_status").trim().toUpperCase();
        const hasBillingId = str(d, "billing_id").trim() !== "";
        const calcDone = Boolean(d.is_calculation_completed);
        const paidByStatus = paymentStatus === "PAID" || paymentStatus === "KURANG_BAYAR";
        const paidBySspd = sspdPaymentStatus === "LUNAS" || sspdPaymentStatus === "KURANG_BAYAR" || sspdPaymentStatus === "SUDAH_BAYAR" || sspdPaymentStatus === "PAID";
        setLockObjekAfterBilling(hasBillingId || paidByStatus || paidBySspd || calcDone);

        setNobookingValue(nb);
        setNopDigits(parseNopToDigits(str(d, "nop")));
        if (isPer2) {
          setNpwpWpDigits(Array(6).fill(""));
          setNpwpOpDigits(Array(6).fill(""));
        } else {
          setNpwpWpDigits(parseNpwpToDigits(str(d, "npwpwp")));
          setNpwpOpDigits(parseNpwpToDigits(str(d, "npwpop")));
        }

        const jp = str(d, "jenisPerolehan") || str(d, "jenis_perolehan");
        setJenisPerolehan(jp);

        const luasTStr = num(d, "luas_tanah") != null ? String(num(d, "luas_tanah")) : "";
        const luasBStr = num(d, "luas_bangunan") != null ? String(num(d, "luas_bangunan")) : "";
        const njopTStr =
          d.njop_tanah != null && d.njop_tanah !== ""
            ? String(typeof d.njop_tanah === "number" ? Math.round(d.njop_tanah) : parseRupiah(String(d.njop_tanah)))
            : "";
        const njopBStr =
          d.njop_bangunan != null && d.njop_bangunan !== ""
            ? String(typeof d.njop_bangunan === "number" ? Math.round(d.njop_bangunan) : parseRupiah(String(d.njop_bangunan)))
            : "";
        const npRaw = d.nilaiPerolehanObjekPajakTidakKenaPajak;
        let npoptkpStr = "";
        if (npRaw != null && String(npRaw).trim() !== "") {
          const n = typeof npRaw === "number" ? Math.round(npRaw) : parseRupiah(String(npRaw));
          npoptkpStr = n >= 0 ? String(n) : "";
        }
        if (!npoptkpStr && jp) {
          npoptkpStr = String(npoptkpFromJenisPerolehan(jp));
        }

        const htRaw = d.hargatransaksi ?? d.harga_transaksi;
        let hargaStr = "";
        if (htRaw != null && String(htRaw).trim() !== "") {
          const n = typeof htRaw === "number" ? htRaw : parseRupiah(String(htRaw));
          hargaStr = n > 0 ? String(n) : "";
        }

        const first = (rec: Record<string, unknown>, keys: string[]) => {
          for (const k of keys) {
            const v = rec[k];
            if (v != null && String(v).trim() !== "") return String(v);
          }
          return "";
        };

        setForm((prev) => ({
          ...prev,
          namawajibpajak: str(d, "nama_wajib_pajak") || prev.namawajibpajak,
          alamatwajibpajak: str(d, "alamat_wajib_pajak") || prev.alamatwajibpajak,
          namapemilikobjekpajak: str(d, "atas_nama") || prev.namapemilikobjekpajak,
          alamatpemilikobjekpajak: first(d, ["alamatpemilikobjekpajak", "alamat_pemilik_objek_pajak", "alamatpemilikop", "alamat_pemilik_objek"]) || prev.alamatpemilikobjekpajak,
          npwpwp: isPer2 ? (str(d, "npwpwp") || prev.npwpwp) : prev.npwpwp,
          npwpop: isPer2 ? (str(d, "npwpop") || prev.npwpop) : prev.npwpop,
          tahunajb: str(d, "tahunajb") || prev.tahunajb,
          kabupatenkotawp: first(d, ["kabupatenkotawp", "kabupaten_kota", "kabupaten_kota_wp"]) || prev.kabupatenkotawp,
          kecamatanwp: first(d, ["kecamatanwp", "kecamatan", "kecamatan_wp"]) || prev.kecamatanwp,
          kelurahandesawp: first(d, ["kelurahandesawp", "kelurahan", "kelurahan_wp"]) || prev.kelurahandesawp,
          rtrwwp: first(d, ["rtrwwp", "rt_rwwp", "rtrw_wp"]) || prev.rtrwwp,
          kodeposwp: str(d, "kodeposwp") || prev.kodeposwp,
          kabupatenkotaop: str(d, "kabupatenkotaop") || prev.kabupatenkotaop,
          kecamatanop: first(d, ["kecamatanop", "kecamatanopj", "kecamatanop_objek"]) || prev.kecamatanop,
          kelurahandesaop: first(d, ["kelurahandesaop", "kelurahanop", "kelurahanop_objek"]) || prev.kelurahandesaop,
          rtrwop: first(d, ["rtrwop", "rt_rwop", "rtrw_op"]) || prev.rtrwop,
          kodeposop: first(d, ["kodeposop", "kode_pos_op"]) || prev.kodeposop,
          letaktanahdanbangunan: str(d, "Alamatop") || str(d, "letaktanahdanbangunan") || prev.letaktanahdanbangunan,
          rt_rwobjekpajak: first(d, ["rt_rwobjekpajak", "rt_rw_objek_pajak"]) || prev.rt_rwobjekpajak,
          status_kepemilikan: first(d, ["status_kepemilikan", "statusKepemilikan"]) || prev.status_kepemilikan,
          nomor_sertifikat: first(d, ["nomor_sertifikat", "nomorsertifikat"]) || prev.nomor_sertifikat,
          kelurahandesalp: first(d, ["kelurahandesalp", "kelurahan_desa_lp"]) || prev.kelurahandesalp,
          kecamatanlp: first(d, ["kecamatanlp", "kecamatan_lp"]) || prev.kecamatanlp,
          keterangan: str(d, "keterangan") || prev.keterangan,
          hargatransaksi: hargaStr || (prev.hargatransaksi as string),
          jenisPerolehan: jp || (prev.jenisPerolehan as string),
          luas_tanah: luasTStr || (prev.luas_tanah as string),
          luas_bangunan: luasBStr || (prev.luas_bangunan as string),
          njop_tanah: njopTStr || (prev.njop_tanah as string),
          njop_bangunan: njopBStr || (prev.njop_bangunan as string),
          nilaiPerolehanObjekPajakTidakKenaPajak: npoptkpStr || (prev.nilaiPerolehanObjekPajakTidakKenaPajak as string),
          bphtb_yangtelah_dibayar: num(d, "bphtb_yangtelah_dibayar") ?? prev.bphtb_yangtelah_dibayar,
        }));
      } catch {
        if (!cancelled) setError("Gagal memuat detail booking.");
      } finally {
        if (!cancelled) setEditLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  const objekFieldsLocked = isEditMode && lockObjekAfterBilling;

  useEffect(() => {
    if (!callbackOpen) return;
    let cancelled = false;
    (async () => {
      setCallbackListLoading(true);
      try {
        const base = getBackendBaseUrl();
        const url = `${base ? base : ""}/api/ppat/booking/history?limit=30&q=${encodeURIComponent(debouncedCallbackSearch)}`;
        const res = await fetch(url, { credentials: "include" });
        const json = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (json?.success && Array.isArray(json.data)) {
          setCallbackItems(json.data as CallbackHistoryRow[]);
        } else {
          setCallbackItems([]);
        }
      } catch {
        if (!cancelled) setCallbackItems([]);
      } finally {
        if (!cancelled) setCallbackListLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [callbackOpen, debouncedCallbackSearch]);

  const applyCallbackFromData = useCallback((d: Record<string, unknown>) => {
    const str = (k: string) => (d[k] != null ? String(d[k]) : "");

    const jwpCb = str("jenis_wajib_pajak");
    const isPerCb = jwpCb.toLowerCase().includes("perorangan");
    setEntityKind(isPerCb ? "perorangan" : "badan");

    setNopDigits(parseNopToDigits(str("noppbb")));
    if (isPerCb) {
      setNpwpWpDigits(Array(6).fill(""));
      setNpwpOpDigits(Array(6).fill(""));
    } else {
      setNpwpWpDigits(parseNpwpToDigits(str("npwpwp")));
      setNpwpOpDigits(parseNpwpToDigits(str("npwpop")));
    }

    const jp = str("jenisPerolehan");
    setJenisPerolehan(jp);

    const hargaRaw = d.hargatransaksi;
    let hargaStr = "";
    if (hargaRaw != null && String(hargaRaw).trim() !== "") {
      const n = typeof hargaRaw === "number" ? hargaRaw : parseRupiah(String(hargaRaw));
      hargaStr = n > 0 ? String(n) : "";
    }

    const nx = (v: unknown): string => {
      if (v == null) return "";
      if (typeof v === "number" && !Number.isNaN(v)) return String(Math.round(v));
      const n = parseRupiah(String(v));
      return n > 0 ? String(n) : "";
    };
    const nLuas = (v: unknown): string => {
      if (v == null) return "";
      if (typeof v === "number" && !Number.isNaN(v)) return String(v);
      const t = String(v).trim();
      return t;
    };
    const npoptkpRaw = d.nilaiPerolehanObjekPajakTidakKenaPajak;
    let npoptkpStr = "";
    if (npoptkpRaw != null && String(npoptkpRaw).trim() !== "") {
      const n = typeof npoptkpRaw === "number" ? Math.round(npoptkpRaw) : parseRupiah(String(npoptkpRaw));
      npoptkpStr = n >= 0 ? String(n) : "";
    }
    if (!npoptkpStr && jp) {
      npoptkpStr = String(npoptkpFromJenisPerolehan(jp));
    }

    setKecamatanSearch("");
    setForm({
      namawajibpajak: str("namawajibpajak"),
      alamatwajibpajak: str("alamatwajibpajak"),
      namapemilikobjekpajak: str("namapemilikobjekpajak"),
      alamatpemilikobjekpajak: str("alamatpemilikobjekpajak"),
      tahunajb: str("tahunajb") || String(today.getFullYear()),
      kabupatenkotawp: str("kabupatenkotawp"),
      kecamatanwp: str("kecamatanwp"),
      kelurahandesawp: str("kelurahandesawp"),
      rtrwwp: str("rtrwwp"),
      kodeposwp: str("kodeposwp"),
      kabupatenkotaop: str("kabupatenkotaop") || "Kabupaten Bogor",
      kecamatanop: str("kecamatanop"),
      kelurahandesaop: str("kelurahandesaop"),
      rtrwop: str("rtrwop"),
      kodeposop: str("kodeposop"),
      hargatransaksi: hargaStr,
      letaktanahdanbangunan: str("letaktanahdanbangunan"),
      rt_rwobjekpajak: str("rt_rwobjekpajak"),
      kecamatanlp: str("kecamatanlp"),
      kelurahandesalp: str("kelurahandesalp"),
      status_kepemilikan: statusDbToForm(str("status_kepemilikan")),
      jenisPerolehan: jp,
      keterangan: str("keterangan"),
      nomor_sertifikat: str("nomor_sertifikat"),
      npwpwp: isPerCb ? str("npwpwp") : "",
      npwpop: isPerCb ? str("npwpop") : "",
      luas_tanah: nLuas(d.luas_tanah),
      luas_bangunan: nLuas(d.luas_bangunan),
      njop_tanah: nx(d.njop_tanah),
      njop_bangunan: nx(d.njop_bangunan),
      nilaiPerolehanObjekPajakTidakKenaPajak: npoptkpStr,
    });
    setOpenObjek(true);
    setError(null);
  }, []);

  const handleCallbackSelect = async (nobooking: string) => {
    setCallbackOpen(false);
    setCallbackApplyLoading(true);
    setCallbackNotice(null);
    try {
      const base = getBackendBaseUrl();
      const url = `${base ? base : ""}/api/ppat/booking/${encodeURIComponent(nobooking)}/callback`;
      const res = await fetch(url, { credentials: "include" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.success || !json?.data) {
        setError(typeof json?.message === "string" ? json.message : "Gagal memuat data riwayat.");
        return;
      }
      applyCallbackFromData(json.data as Record<string, unknown>);
      const nopShow = String((json.data as Record<string, unknown>).noppbb ?? "").trim();
      setCallbackNotice(`Data berhasil dimuat dari riwayat NOP ${nopShow || nobooking}`);
      window.setTimeout(() => setCallbackNotice(null), 6000);
    } catch {
      setError("Gagal memuat data riwayat.");
    } finally {
      setCallbackApplyLoading(false);
    }
  };

  const handleJenisPerolehanChange = useCallback((val: string) => {
    setJenisPerolehan(val);
    updateForm("jenisPerolehan", val);
  }, [updateForm]);

  const njopPreview = useMemo(() => {
    const lt = parseDecimalInput(String(form.luas_tanah ?? ""));
    const nt = parseRupiah(String(form.njop_tanah ?? ""));
    const lb = parseDecimalInput(String(form.luas_bangunan ?? ""));
    const njb = parseRupiah(String(form.njop_bangunan ?? ""));
    const totalTanah = (Number.isFinite(lt) ? lt : 0) * nt;
    const totalBangunan = (Number.isFinite(lb) ? lb : 0) * njb;
    const sumNjop = totalTanah + totalBangunan;
    const harga = parseRupiah(String(form.hargatransaksi ?? ""));
    const dasarP1 = Math.max(sumNjop, harga);
    return { totalTanah, totalBangunan, sumNjop, harga, dasarP1 };
  }, [form.luas_tanah, form.njop_tanah, form.luas_bangunan, form.njop_bangunan, form.hargatransaksi]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const noppbb = buildNopPbb(nopDigits);
    const npwpwpBadan = buildNpwp(npwpWpDigits);
    const npwpopBadan = buildNpwp(npwpOpDigits);
    const npwpwp =
      entityKind === "badan"
        ? npwpwpBadan
        : String(form.npwpwp ?? "").replace(/\D/g, "").slice(0, 16);
    const npwpop =
      entityKind === "badan"
        ? npwpopBadan
        : String(form.npwpop ?? "").replace(/\D/g, "").slice(0, 16);

    const noppbbClean = noppbb.replace(/\./g, "").replace(/-/g, "");
    if (!noppbbClean || /^0+$/.test(noppbbClean)) {
      setError("NOP PBB wajib diisi dengan lengkap.");
      return;
    }
    if (!form.namawajibpajak?.toString().trim()) {
      setError("Nama Wajib Pajak wajib diisi.");
      return;
    }
    if (!form.namapemilikobjekpajak?.toString().trim()) {
      setError("Nama Pemilik Objek Pajak wajib diisi.");
      return;
    }

    const idErr = validateIdentityForEntity(
      entityKind,
      npwpwpBadan.replace(/\D/g, ""),
      npwpopBadan.replace(/\D/g, ""),
      String(form.npwpwp ?? ""),
      String(form.npwpop ?? "")
    );
    if (idErr) {
      setError(idErr);
      return;
    }

    const lt = parseDecimalInput(String(form.luas_tanah ?? ""));
    const nt = parseRupiah(String(form.njop_tanah ?? ""));
    const lb = parseDecimalInput(String(form.luas_bangunan ?? ""));
    const njb = parseRupiah(String(form.njop_bangunan ?? ""));
    if (lt > 0 && nt <= 0) {
      setError("Jika luas tanah diisi, NJOP tanah wajib diisi (lebih dari nol).");
      return;
    }
    if (lb > 0 && njb <= 0) {
      setError("Jika luas bangunan diisi, NJOP bangunan wajib diisi (lebih dari nol).");
      return;
    }
    const totalNjopBase = (Number.isFinite(lt) ? lt : 0) * nt + (Number.isFinite(lb) ? lb : 0) * njb;
    if (totalNjopBase <= 0) {
      setError("Data NJOP belum valid. Isi luas & NJOP tanah/bangunan sampai total NJOP lebih dari 0.");
      return;
    }
    if (!String(form.letaktanahdanbangunan ?? "").trim()) {
      setError("Letak Tanah dan/atau Bangunan wajib diisi.");
      return;
    }
    if (!String(form.rt_rwobjekpajak ?? "").trim()) {
      setError("RT/RW Objek Pajak wajib diisi.");
      return;
    }
    if (!String(form.kelurahandesalp ?? "").trim() || !String(form.kecamatanlp ?? "").trim()) {
      setError("Kelurahan/Desa dan Kecamatan lokasi objek pajak wajib diisi.");
      return;
    }
    if (!String(form.nomor_sertifikat ?? "").trim()) {
      setError("Nomor sertifikat tanah wajib diisi.");
      return;
    }
    if (!String(form.jenisPerolehan ?? "").trim()) {
      setError("Jenis perolehan hak wajib dipilih.");
      return;
    }
    const npoptkpRaw = String(form.nilaiPerolehanObjekPajakTidakKenaPajak ?? "").trim();
    const npoptkpNum = parseRupiah(npoptkpRaw);

    const payload: CreatePayload = {
      jenis_wajib_pajak: entityKind === "badan" ? "Badan Usaha" : "Perorangan",
      noppbb,
      namawajibpajak: String(form.namawajibpajak ?? ""),
      alamatwajibpajak: String(form.alamatwajibpajak ?? ""),
      namapemilikobjekpajak: String(form.namapemilikobjekpajak ?? ""),
      alamatpemilikobjekpajak: String(form.alamatpemilikobjekpajak ?? ""),
      tanggal,
      tahunajb: String(form.tahunajb ?? ""),
      kabupatenkotawp: String(form.kabupatenkotawp ?? ""),
      kecamatanwp: String(form.kecamatanwp ?? ""),
      kelurahandesawp: String(form.kelurahandesawp ?? ""),
      rtrwwp: String(form.rtrwwp ?? ""),
      npwpwp,
      kodeposwp: String(form.kodeposwp ?? ""),
      kabupatenkotaop: String(form.kabupatenkotaop ?? ""),
      kecamatanop: String(form.kecamatanop ?? ""),
      kelurahandesaop: String(form.kelurahandesaop ?? ""),
      rtrwop: String(form.rtrwop ?? ""),
      npwpop,
      kodeposop: String(form.kodeposop ?? ""),
      trackstatus: "Terbuat",
      hargatransaksi: form.hargatransaksi?.toString(),
      letaktanahdanbangunan: form.letaktanahdanbangunan?.toString(),
      rt_rwobjekpajak: form.rt_rwobjekpajak?.toString(),
      kecamatanlp: form.kecamatanlp?.toString(),
      kelurahandesalp: form.kelurahandesalp?.toString(),
      status_kepemilikan: form.status_kepemilikan?.toString(),
      jenisPerolehan: form.jenisPerolehan?.toString(),
      keterangan: form.keterangan?.toString(),
      nomor_sertifikat: form.nomor_sertifikat?.toString(),
      // Step-1 must avoid null-ish numeric payloads to prevent backend nil/fallback issues.
      nilaiPerolehanObjekPajakTidakKenaPajak: npoptkpRaw !== "" ? npoptkpNum : 0,
      luas_tanah: Number.isFinite(lt) && lt > 0 ? lt : 0,
      njop_tanah: nt > 0 ? nt : 0,
      luas_bangunan: Number.isFinite(lb) && lb > 0 ? lb : 0,
      njop_bangunan: njb > 0 ? njb : 0,
      bphtb_yangtelah_dibayar: 0,
    };

    setLoading(true);
    try {
      const base = getBackendBaseUrl();
      const url = isEditMode && nobookingValue
        ? (base ? `${base}/api/ppat/update-booking/${encodeURIComponent(nobookingValue)}` : `/api/ppat/update-booking/${encodeURIComponent(nobookingValue)}`)
        : (base
          ? `${base}${entityKind === "badan" ? "/api/ppat_create-booking-and-bphtb" : "/api/ppat_create-booking-and-bphtb-perorangan"}`
          : (entityKind === "badan" ? "/api/ppat_create-booking-and-bphtb" : "/api/ppat_create-booking-and-bphtb-perorangan"));
      const res = await fetch(url, {
        method: isEditMode ? "PUT" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.message || "Gagal menyimpan booking.");
        return;
      }
      if (isEditMode) {
        if (data?.success) {
          setSuccess("Data Booking berhasil diperbarui!");
          setTimeout(() => router.push(listPath), 1200);
          return;
        }
        setError(data?.message || "Gagal memperbarui booking.");
        return;
      }
      if (data?.success && data?.nobooking) {
        setSuccess(`Booking berhasil dibuat. No. Booking: ${data.nobooking} (status: Terbuat)`);
        setNobookingValue(String(data.nobooking));
        setTimeout(() => router.push(listPath), 1500);
        return;
      }
      setError(data?.message || "Gagal menyimpan booking.");
    } catch {
      setError("Network error. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ margin: "0 0 0.5rem", color: "var(--color_font_main)" }}>
        Tambah Booking SSPD — {entityKind === "badan" ? "Badan Usaha" : "Perorangan"}
      </h1>
      <p style={{ margin: 0, color: "var(--color_font_muted)", marginBottom: 24 }}>
        Satu form untuk badan &amp; perorangan. Pilih jenis wajib pajak di bawah; submit mengikuti{" "}
        <code>{entityKind === "badan" ? "/api/ppat_create-booking-and-bphtb" : "/api/ppat_create-booking-and-bphtb-perorangan"}</code>.
      </p>

      {isEditMode && (
        <div style={{ padding: 12, marginBottom: 16, background: "#fff7ed", color: "#9a3412", borderRadius: 8, border: "1px solid #fed7aa" }}>
          Anda sedang dalam mode edit. Nomor booking tetap dan tidak dapat diubah.
        </div>
      )}
      {objekFieldsLocked && (
        <div style={{ padding: 12, marginBottom: 16, background: "#eff6ff", color: "#1e40af", borderRadius: 8, border: "1px solid #bfdbfe" }}>
          Billing/pembayaran sudah aktif. Anda masih bisa mengedit data subjek (WP/pemilik), tetapi data objek pajak dan komponen perhitungan dikunci.
        </div>
      )}

      {error && (
        <div style={{ padding: 12, marginBottom: 16, background: "#fef2f2", color: "#b91c1c", borderRadius: 8 }}>{error}</div>
      )}
      {success && (
        <div style={{ padding: 12, marginBottom: 16, background: "#f0fdf4", color: "#166534", borderRadius: 8 }}>{success}</div>
      )}
      {callbackNotice && (
        <div style={{ padding: 10, marginBottom: 16, background: "#ecfdf5", color: "#047857", borderRadius: 8, fontSize: 14 }}>
          {callbackNotice}
        </div>
      )}

      <div
        ref={callbackDropdownRef}
        style={{
          marginBottom: 20,
          padding: 16,
          background: "var(--card_bg)",
          border: "1px solid var(--border_color)",
          borderRadius: 12,
          position: "relative",
        }}
      >
        <label style={{ ...labelStyle, marginBottom: 8 }}>Callback dari riwayat booking (NOP PBB — Nama Wajib Pajak)</label>
        <p style={{ ...hintStyle, marginBottom: 10 }}>
          Pilih booking lama untuk mengisi form otomatis. Tanggal pengajuan hari ini dan nomor bukti pembayaran dikosongkan agar Anda mengisi yang baru.
        </p>
        <div style={{ position: "relative" }}>
          <input
            style={{ ...inputStyle, marginTop: 0 }}
            placeholder="Ketik NOP, nama WP, atau no. booking — tunggu sebentar saat mengetik"
            value={callbackSearch}
            onChange={(e) => {
              setCallbackSearch(e.target.value);
              if (!callbackOpen) setCallbackOpen(true);
            }}
            onFocus={() => setCallbackOpen(true)}
            disabled={callbackApplyLoading}
          />
          {callbackOpen && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                marginTop: 4,
                maxHeight: 260,
                overflowY: "auto",
                background: "var(--card_bg)",
                border: "1px solid var(--border_color)",
                borderRadius: 8,
                boxShadow: "var(--card_shadow)",
                zIndex: 60,
              }}
            >
              {callbackListLoading ? (
                <div style={{ padding: 12, color: "var(--color_font_main_muted)", fontSize: 14 }}>Mencari...</div>
              ) : callbackItems.length === 0 ? (
                <div style={{ padding: 12, color: "var(--color_font_main_muted)", fontSize: 14 }}>Tidak ada data</div>
              ) : (
                callbackItems.map((row) => (
                  <button
                    key={row.nobooking}
                    type="button"
                    disabled={callbackApplyLoading}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "10px 12px",
                      textAlign: "left",
                      border: "none",
                      background: "transparent",
                      color: "var(--color_font_main)",
                      cursor: callbackApplyLoading ? "not-allowed" : "pointer",
                      fontSize: 14,
                    }}
                    onClick={() => handleCallbackSelect(row.nobooking)}
                  >
                    {row.label || `${row.noppbb} — ${row.namawajibpajak}`}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
        {callbackApplyLoading && (
          <p style={{ ...hintStyle, marginTop: 8, marginBottom: 0 }}>Memuat data ke form...</p>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        style={{ background: "var(--card_bg)", border: "1px solid var(--border_color)", borderRadius: 12, padding: 24 }}
      >
        {/* Tanggal & No Booking */}
        <div style={sectionStyle}>
          <div style={rowStyle}>
            <div>
              <label style={labelStyle}>Tanggal (DD-MM-YYYY)</label>
              <input
                style={inputStyle}
                type="text"
                value={tanggal}
                readOnly
                placeholder="Auto"
              />
            </div>
            <div>
              <label style={labelStyle}>No Booking</label>
              <input
                style={{ ...inputStyle, background: "var(--card_bg_grey)" }}
                type="text"
                placeholder="Akan tergenerate otomatis"
                value={nobookingValue}
                readOnly
                disabled
              />
            </div>
          </div>
        </div>

        {/* Jenis wajib pajak — satu jalur form */}
        <div
          style={{
            ...sectionStyle,
            padding: 16,
            background: "var(--card_bg_grey)",
            borderRadius: 8,
            border: "1px solid var(--border_color)",
          }}
        >
          <label style={labelStyle}>Jenis wajib pajak</label>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: editLoading ? "not-allowed" : "pointer", fontWeight: 600 }}>
              <input
                type="radio"
                name="jenisWajibPajakForm"
                checked={entityKind === "badan"}
                onChange={() => handleEntityKindChange("badan")}
                disabled={editLoading}
              />
              Badan Usaha
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: editLoading ? "not-allowed" : "pointer", fontWeight: 600 }}>
              <input
                type="radio"
                name="jenisWajibPajakForm"
                checked={entityKind === "perorangan"}
                onChange={() => handleEntityKindChange("perorangan")}
                disabled={editLoading}
              />
              Perorangan
            </label>
          </div>
          <p style={hintStyle}>Memilih badan atau perorangan mengubah format identitas (NPWP vs NIK) tanpa mengubah endpoint backend — payload mengikuti pilihan ini.</p>
        </div>

        {/* Pembayar Pajak BPHTB */}
        <h3 style={judulStyle}>Pembayar Pajak BPHTB</h3>
        <div style={{ ...sectionStyle, padding: 16, background: "var(--card_bg_grey)", borderRadius: 8, border: "1px solid var(--border_color)" }}>
          <p style={{ ...hintStyle, marginTop: 0, marginBottom: 12, fontWeight: 600, color: "var(--color_font_main)" }}>
            Langkah 1 — Data subjek (wajib pajak): isi {entityKind === "badan" ? "NPWP" : "NIK"} untuk pencarian, lalu Langkah 2 — NOP PBB untuk data objek.
          </p>
          <label style={labelStyle}>{entityKind === "badan" ? "NPWP Wajib Pajak" : "NIK Wajib Pajak"} (pencarian)</label>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
            <div style={{ position: "relative", flex: "1 1 220px", maxWidth: 400 }}>
              {wpLookupLoading && (
                <span
                  title="Mencari data…"
                  style={{
                    position: "absolute",
                    left: 10,
                    top: "50%",
                    transform: "translateY(-40%)",
                    fontSize: 14,
                    lineHeight: 1,
                    pointerEvents: "none",
                  }}
                >
                  ⏳
                </span>
              )}
              <input
                style={{ ...inputStyle, marginTop: 0, paddingRight: 40, paddingLeft: wpLookupLoading ? 36 : 12 }}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder={entityKind === "badan" ? "15 digit NPWP (boleh dengan tanda pemisah)" : "16 digit NIK"}
                value={wpIdentityInput}
                onChange={(e) => setWpIdentityInput(e.target.value)}
                onBlur={() => {
                  if (wpIdentityInput.trim()) void fetchWPData();
                }}
                disabled={wpLookupLoading || editLoading}
              />
              <span
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-30%)",
                  fontSize: 18,
                  opacity: 0.55,
                  pointerEvents: "none",
                }}
                aria-hidden
              >
                🔍
              </span>
            </div>
            <button
              type="button"
              disabled={wpLookupLoading || editLoading}
              onClick={() => void fetchWPData()}
              style={{
                padding: "10px 16px",
                borderRadius: 8,
                border: "1px solid var(--border_color)",
                background: "var(--accent)",
                color: "#fff",
                fontWeight: 600,
                cursor: wpLookupLoading ? "not-allowed" : "pointer",
                fontSize: 14,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {wpLookupLoading ? "Mengecek…" : "Cek Data WP"}
            </button>
          </div>
          <p style={hintStyle}>
            Data diambil dari pengguna terdaftar E-BPHTB. Setelah ini, gunakan NOP PBB untuk objek pajak (luas/NJOP).
          </p>
          {wpTeleponHint && (
            <p style={{ ...hintStyle, color: "#0369a1", fontWeight: 600 }}>{wpTeleponHint}</p>
          )}
        </div>

        <div style={sectionStyle}>
          <label style={labelStyle}>NOP PBB</label>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 4 }}>
            {([2, 2, 3, 3, 3, 4, 1] as const).map((len, i) => (
              <span key={i} style={{ display: "flex", alignItems: "center", gap: 2 }}>
                <input
                  ref={(el) => { nopRefs.current[i] = el; }}
                  style={{ ...inputStyle, width: len === 1 ? 36 : len <= 2 ? 44 : 56, marginTop: 0, textAlign: "center" }}
                  type="text"
                  inputMode="numeric"
                  maxLength={len}
                  value={nopDigits[i] ?? ""}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "").slice(0, len);
                    setNopDigits((prev) => {
                      const n = [...prev];
                      n[i] = v;
                      return n;
                    });
                    if (v.length === len && i < 6) {
                      nopRefs.current[i + 1]?.focus();
                    }
                  }}
                  onBlur={() => {
                    if (i === 6) void fetchLookupNop();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !nopDigits[i] && i > 0) {
                      nopRefs.current[i - 1]?.focus();
                    }
                  }}
                  placeholder={"x".repeat(len)}
                />
                {i < 6 && <span style={{ color: "var(--color_font_main_muted)" }}>.</span>}
              </span>
            ))}
            </div>
            <button
              type="button"
              disabled={nopLookupLoading || editLoading}
              onClick={() => void fetchLookupNop()}
              style={{
                padding: "10px 16px",
                borderRadius: 8,
                border: "1px solid var(--border_color)",
                background: "var(--accent)",
                color: "#fff",
                fontWeight: 600,
                cursor: nopLookupLoading ? "not-allowed" : "pointer",
                fontSize: 14,
                whiteSpace: "nowrap",
              }}
            >
              {nopLookupLoading ? "Mencari…" : "Cek NOP"}
            </button>
          </div>
          <p style={hintStyle}>Format: 32.01.001.001.001.0001.1 — isi lengkap lalu klik &quot;Cek NOP&quot; atau tab keluar dari kolom terakhir untuk tarik data referensi PBB.</p>
          {nopLookupNotice && (
            <p style={{ ...hintStyle, color: "#047857", fontWeight: 600 }}>{nopLookupNotice}</p>
          )}
        </div>

        <div style={sectionStyle}>
          <label style={labelStyle}>Nama Wajib Pajak</label>
          <input
            style={inputStyle}
            value={form.namawajibpajak ?? ""}
            onChange={(e) => updateForm("namawajibpajak", e.target.value)}
            placeholder="Nama wajib pajak"
            required
          />
        </div>
        <div style={sectionStyle}>
          <label style={labelStyle}>Alamat Wajib Pajak</label>
          <textarea
            style={{ ...inputStyle, minHeight: 60 }}
            value={form.alamatwajibpajak ?? ""}
            onChange={(e) => updateForm("alamatwajibpajak", e.target.value)}
            placeholder="Jl. Contoh No. 123"
            required
          />
        </div>
        <div style={rowStyle}>
          <div>
            <label style={labelStyle}>Kabupaten/Kota WP</label>
            <input style={inputStyle} value={form.kabupatenkotawp ?? ""} onChange={(e) => updateForm("kabupatenkotawp", e.target.value)} placeholder="Kabupaten Bogor" required />
          </div>
          <div>
            <label style={labelStyle}>Kecamatan WP</label>
            <input style={inputStyle} value={form.kecamatanwp ?? ""} onChange={(e) => updateForm("kecamatanwp", e.target.value)} required />
          </div>
          <div>
            <label style={labelStyle}>Kelurahan/Desa WP</label>
            <input style={inputStyle} value={form.kelurahandesawp ?? ""} onChange={(e) => updateForm("kelurahandesawp", e.target.value)} required />
          </div>
        </div>
        <div style={rowStyle}>
          <div>
            <label style={labelStyle}>RT/RW WP</label>
            <input style={inputStyle} value={form.rtrwwp ?? ""} onChange={(e) => updateForm("rtrwwp", e.target.value)} placeholder="001/001" required />
          </div>
          <div>
            <label style={labelStyle}>Tahun AJB</label>
            <input
              style={inputStyle}
              type="number"
              value={form.tahunajb ?? ""}
              onChange={(e) => updateForm("tahunajb", e.target.value)}
              placeholder="2025"
              maxLength={4}
              required
            />
          </div>
          <div>
            <label style={labelStyle}>Kode Pos WP</label>
            <input style={inputStyle} value={form.kodeposwp ?? ""} onChange={(e) => updateForm("kodeposwp", e.target.value)} placeholder="16100" required />
          </div>
        </div>
        <div style={sectionStyle}>
          <label style={labelStyle}>{entityKind === "badan" ? "NPWP Wajib Pajak (tersimpan)" : "NIK Wajib Pajak (tersimpan)"}</label>
          {entityKind === "badan" ? (
            <>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2 }}>
                {([2, 3, 3, 1, 3, 3] as const).map((len, i) => (
                  <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
                    <input
                      ref={(el) => { npwpWpRefs.current[i] = el; }}
                      style={{ ...inputStyle, width: len === 1 ? 36 : 48, marginTop: 0, textAlign: "center" }}
                      type="text"
                      inputMode="numeric"
                      maxLength={len}
                      value={npwpWpDigits[i] ?? ""}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, "").slice(0, len);
                        setNpwpWpDigits((prev) => {
                          const n = [...prev];
                          n[i] = v;
                          return n;
                        });
                        if (v.length === len && i < 5) npwpWpRefs.current[i + 1]?.focus();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Backspace" && !npwpWpDigits[i] && i > 0) npwpWpRefs.current[i - 1]?.focus();
                      }}
                      placeholder={"x".repeat(len)}
                    />
                    {i < 3 && <span style={{ color: "var(--color_font_main_muted)" }}>.</span>}
                    {i === 3 && <span style={{ color: "var(--color_font_main_muted)" }}>-</span>}
                    {i === 4 && <span style={{ color: "var(--color_font_main_muted)" }}>.</span>}
                  </span>
                ))}
              </div>
              <p style={hintStyle}>Format: 00.000.000.0-000.000</p>
            </>
          ) : (
            <>
              <input
                style={inputStyle}
                type="text"
                inputMode="numeric"
                maxLength={16}
                value={form.npwpwp ?? ""}
                onChange={(e) => updateForm("npwpwp", e.target.value.replace(/\D/g, "").slice(0, 16))}
                placeholder="NIK 16 digit"
                required
              />
              <p style={hintStyle}>Untuk perorangan, isi NIK (tanpa format NPWP)</p>
            </>
          )}
        </div>

        {/* Pemilik Objek Pajak BPHTB */}
        <h3 style={judulStyle}>Pemilik Objek Pajak BPHTB</h3>
        <div style={sectionStyle}>
          <label style={labelStyle}>Nama Pemilik Objek Pajak</label>
          <input
            style={inputStyle}
            value={form.namapemilikobjekpajak ?? ""}
            onChange={(e) => updateForm("namapemilikobjekpajak", e.target.value)}
            placeholder="Nama pemilik objek"
            required
          />
        </div>
        <div style={sectionStyle}>
          <label style={labelStyle}>Alamat Pemilik Objek Pajak</label>
          <textarea
            style={{ ...inputStyle, minHeight: 60 }}
            value={form.alamatpemilikobjekpajak ?? ""}
            onChange={(e) => updateForm("alamatpemilikobjekpajak", e.target.value)}
            placeholder="Jl. Contoh No. 456"
            required
          />
        </div>
        <div style={rowStyle}>
          <div>
            <label style={labelStyle}>Kabupaten/Kota Objek</label>
            <input
              style={{ ...inputStyle, background: "var(--card_bg_grey)", cursor: "default" }}
              value="Kabupaten Bogor"
              readOnly
            />
          </div>
          <div ref={kecamatanDropdownRef} style={{ position: "relative" }}>
            <label style={labelStyle}>Kecamatan Objek</label>
            <input
              style={inputStyle}
              value={kecamatanDropdownOpen ? kecamatanSearch : (form.kecamatanop ?? "")}
              onChange={(e) => {
                setKecamatanSearch(e.target.value);
                if (!kecamatanDropdownOpen) setKecamatanDropdownOpen(true);
              }}
              onFocus={() => setKecamatanDropdownOpen(true)}
              placeholder="Ketik untuk cari (40 kecamatan)"
              required
            />
            {kecamatanDropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  marginTop: 4,
                  maxHeight: 220,
                  overflowY: "auto",
                  background: "var(--card_bg)",
                  border: "1px solid var(--border_color)",
                  borderRadius: 8,
                  boxShadow: "var(--card_shadow)",
                  zIndex: 50,
                }}
              >
                {filteredKecamatan.length === 0 ? (
                  <div style={{ padding: 12, color: "var(--color_font_main_muted)", fontSize: 14 }}>Tidak ada kecamatan</div>
                ) : (
                  filteredKecamatan.map((k) => (
                    <button
                      key={k}
                      type="button"
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "10px 12px",
                        textAlign: "left",
                        border: "none",
                        background: form.kecamatanop === k ? "var(--accent)" : "transparent",
                        color: form.kecamatanop === k ? "#fff" : "var(--color_font_main)",
                        cursor: "pointer",
                        fontSize: 14,
                      }}
                      onClick={() => {
                        updateForm("kecamatanop", k);
                        setKecamatanSearch("");
                        setKecamatanDropdownOpen(false);
                      }}
                    >
                      {k}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          <div ref={kelurahanDropdownRef} style={{ position: "relative" }}>
            <label style={labelStyle}>Kelurahan/Desa Objek</label>
            {hasKelurahanData ? (
              <>
                <input
                  style={inputStyle}
                  value={selectedKelurahanLabel}
                  onFocus={() => setKelurahanDropdownOpen(true)}
                  readOnly
                  placeholder="Pilih kecamatan dulu, lalu pilih kelurahan/desa"
                  required
                />
                {kelurahanDropdownOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      marginTop: 4,
                      maxHeight: 220,
                      overflowY: "auto",
                      background: "var(--card_bg)",
                      border: "1px solid var(--border_color)",
                      borderRadius: 8,
                      boxShadow: "var(--card_shadow)",
                      zIndex: 50,
                    }}
                  >
                    {kelurahanOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        style={{
                          display: "block",
                          width: "100%",
                          padding: "10px 12px",
                          textAlign: "left",
                          border: "none",
                          background: form.kelurahandesaop === opt.value ? "var(--accent)" : "transparent",
                          color: form.kelurahandesaop === opt.value ? "#fff" : "var(--color_font_main)",
                          cursor: "pointer",
                          fontSize: 14,
                        }}
                        onClick={() => {
                          updateForm("kelurahandesaop", opt.value);
                          setKelurahanDropdownOpen(false);
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <input
                style={inputStyle}
                value={form.kelurahandesaop ?? ""}
                onChange={(e) => updateForm("kelurahandesaop", e.target.value)}
                placeholder={form.kecamatanop ? "Isi kelurahan/desa (data denah belum tersedia)" : "Pilih kecamatan dulu"}
                required
              />
            )}
          </div>
        </div>
        <div style={rowStyle}>
          <div>
            <label style={labelStyle}>{entityKind === "badan" ? "NPWP Objek" : "NIK Pemilik Objek Pajak"}</label>
            {entityKind === "badan" ? (
              <>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2 }}>
                  {([2, 3, 3, 1, 3, 3] as const).map((len, i) => (
                    <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
                      <input
                        ref={(el) => { npwpOpRefs.current[i] = el; }}
                        style={{ ...inputStyle, width: len === 1 ? 36 : 48, marginTop: 0, textAlign: "center" }}
                        type="text"
                        inputMode="numeric"
                        maxLength={len}
                        value={npwpOpDigits[i] ?? ""}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, "").slice(0, len);
                          setNpwpOpDigits((prev) => {
                            const n = [...prev];
                            n[i] = v;
                            return n;
                          });
                          if (v.length === len && i < 5) npwpOpRefs.current[i + 1]?.focus();
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Backspace" && !npwpOpDigits[i] && i > 0) npwpOpRefs.current[i - 1]?.focus();
                        }}
                        placeholder={"x".repeat(len)}
                      />
                      {i < 3 && <span style={{ color: "var(--color_font_main_muted)" }}>.</span>}
                      {i === 3 && <span style={{ color: "var(--color_font_main_muted)" }}>-</span>}
                      {i === 4 && <span style={{ color: "var(--color_font_main_muted)" }}>.</span>}
                    </span>
                  ))}
                </div>
                <p style={hintStyle}>Otomatis pindah ke kolom berikutnya</p>
              </>
            ) : (
              <>
                <input
                  style={inputStyle}
                  type="text"
                  inputMode="numeric"
                  maxLength={16}
                  value={form.npwpop ?? ""}
                  onChange={(e) => updateForm("npwpop", e.target.value.replace(/\D/g, "").slice(0, 16))}
                  placeholder="NIK 16 digit"
                  required
                />
                <p style={hintStyle}>Untuk perorangan, isi dengan NIK</p>
              </>
            )}
          </div>
          <div>
            <label style={labelStyle}>RT/RW Objek</label>
            <input style={inputStyle} value={form.rtrwop ?? ""} onChange={(e) => updateForm("rtrwop", e.target.value)} placeholder="001/001" required />
          </div>
          <div>
            <label style={labelStyle}>Kode Pos Objek</label>
            <input style={inputStyle} value={form.kodeposop ?? ""} onChange={(e) => updateForm("kodeposop", e.target.value)} required />
          </div>
        </div>

        {/* Objek Pajak BPHTB - Collapsible */}
        <div style={{ marginBottom: 24, border: "1px solid var(--border_color)", borderRadius: 8, overflow: "hidden" }}>
          <button
            type="button"
            onClick={() => setOpenObjek(!openObjek)}
            style={{
              width: "100%",
              padding: "12px 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "var(--card_bg_grey)",
              border: "none",
              cursor: "pointer",
              fontSize: 16,
              fontWeight: 600,
            }}
          >
            <span>Objek Pajak BPHTB</span>
            <span>{openObjek ? "−" : "+"}</span>
          </button>
          {openObjek && (
            <div style={{ padding: 16, borderTop: "1px solid var(--border_color)" }}>
              <fieldset disabled={objekFieldsLocked} style={{ border: "none", padding: 0, margin: 0, minWidth: 0 }}>
              <div
                style={{
                  padding: 12,
                  borderRadius: 8,
                  background: "rgba(245, 158, 11, 0.12)",
                  border: "1px solid rgba(245, 158, 11, 0.35)",
                  color: "#92400e",
                  fontWeight: 700,
                  fontSize: 13,
                  marginBottom: 16,
                  lineHeight: 1.45,
                }}
              >
                Isi ini dengan data asli, karena semuanya terbaca dari sistem!
              </div>
              <div style={sectionStyle}>
                <label style={labelStyle}>Harga Transaksi/Nilai Pasar</label>
                <input
                  style={inputStyle}
                  type="text"
                  inputMode="numeric"
                  value={form.hargatransaksi ? formatRupiah(parseRupiah(String(form.hargatransaksi))) : ""}
                  onChange={(e) => {
                    const num = parseRupiah(e.target.value);
                    updateForm("hargatransaksi", num ? String(num) : "");
                  }}
                  placeholder="contoh: 100.000.000"
                  required
                />
                <p style={hintStyle}>otomatis format ribuan (titik)</p>
              </div>
              <div style={sectionStyle}>
                <label style={labelStyle}>Letak Tanah dan/atau Bangunan</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 60 }}
                  value={form.letaktanahdanbangunan ?? ""}
                  onChange={(e) => updateForm("letaktanahdanbangunan", e.target.value)}
                  placeholder="Masukkan Alamat Lengkap"
                  required
                />
              </div>
              <div style={sectionStyle}>
                <label style={labelStyle}>Jenis Perolehan Hak</label>
                <select
                  style={inputStyle}
                  value={form.jenisPerolehan ?? ""}
                  onChange={(e) => handleJenisPerolehanChange(e.target.value)}
                  required
                >
                  {JENIS_PEROLEHAN.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div style={sectionStyle}>
                <label style={labelStyle}>NPOPTKP (nilai perolehan tidak kena pajak)</label>
                <input
                  style={inputStyle}
                  type="text"
                  inputMode="numeric"
                  value={
                    form.nilaiPerolehanObjekPajakTidakKenaPajak
                      ? formatRupiah(parseRupiah(String(form.nilaiPerolehanObjekPajakTidakKenaPajak)))
                      : ""
                  }
                  onChange={(e) => {
                    const num = parseRupiah(e.target.value);
                    updateForm("nilaiPerolehanObjekPajakTidakKenaPajak", num ? String(num) : "");
                  }}
                  placeholder="terisi otomatis dari jenis perolehan; boleh disesuaikan"
                />
                <p style={hintStyle}>Nilai pengurang mengikuti ketentuan (mis. 300 jt / 80 jt sesuai kode); berubah saat Anda mengganti jenis perolehan.</p>
              </div>

              <div
                style={{
                  ...sectionStyle,
                  padding: 14,
                  background: "var(--card_bg_grey)",
                  borderRadius: 8,
                  border: "1px solid var(--border_color)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <span aria-hidden style={{ fontSize: 18 }}>🌱</span>
                  <span style={{ fontWeight: 700, fontSize: 15, color: "var(--color_font_main)" }}>Data tanah</span>
                </div>
                <div style={{ ...rowStyle, gridTemplateColumns: "repeat(2, minmax(160px, 1fr))" }}>
                  <div>
                    <label style={labelStyle}>Luas tanah (m²)</label>
                    <input
                      style={inputStyle}
                      type="text"
                      inputMode="decimal"
                      value={form.luas_tanah ?? ""}
                      onChange={(e) => updateForm("luas_tanah", e.target.value.replace(/[^\d.,]/g, ""))}
                      placeholder="contoh: 120 atau 120,5"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>NJOP tanah (Rp per m²)</label>
                    <input
                      style={inputStyle}
                      type="text"
                      inputMode="numeric"
                      value={form.njop_tanah ? formatRupiah(parseRupiah(String(form.njop_tanah))) : ""}
                      onChange={(e) => {
                        const num = parseRupiah(e.target.value);
                        updateForm("njop_tanah", num ? String(num) : "");
                      }}
                      placeholder="contoh: 1.500.000"
                    />
                  </div>
                </div>
              </div>

              <div
                style={{
                  ...sectionStyle,
                  padding: 14,
                  background: "var(--card_bg_grey)",
                  borderRadius: 8,
                  border: "1px solid var(--border_color)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <span aria-hidden style={{ fontSize: 18 }}>🏠</span>
                  <span style={{ fontWeight: 700, fontSize: 15, color: "var(--color_font_main)" }}>Data bangunan</span>
                </div>
                <div style={{ ...rowStyle, gridTemplateColumns: "repeat(2, minmax(160px, 1fr))" }}>
                  <div>
                    <label style={labelStyle}>Luas bangunan (m²)</label>
                    <input
                      style={inputStyle}
                      type="text"
                      inputMode="decimal"
                      value={form.luas_bangunan ?? ""}
                      onChange={(e) => updateForm("luas_bangunan", e.target.value.replace(/[^\d.,]/g, ""))}
                      placeholder="contoh: 0 jika tidak ada bangunan"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>NJOP bangunan (Rp per m²)</label>
                    <input
                      style={inputStyle}
                      type="text"
                      inputMode="numeric"
                      value={form.njop_bangunan ? formatRupiah(parseRupiah(String(form.njop_bangunan))) : ""}
                      onChange={(e) => {
                        const num = parseRupiah(e.target.value);
                        updateForm("njop_bangunan", num ? String(num) : "");
                      }}
                      placeholder="contoh: 1.200.000"
                    />
                  </div>
                </div>
              </div>

              <div
                style={{
                  ...sectionStyle,
                  padding: 14,
                  borderRadius: 8,
                  background: "#f0f9ff",
                  border: "1px solid #bae6fd",
                  fontSize: 14,
                  color: "#0c4a6e",
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Pentotalan nilai NJOP (transparan)</div>
                <div>Total nilai tanah (luas × NJOP): <strong>Rp {formatRupiah(Math.round(njopPreview.totalTanah))}</strong></div>
                <div style={{ marginTop: 6 }}>Total nilai bangunan (luas × NJOP): <strong>Rp {formatRupiah(Math.round(njopPreview.totalBangunan))}</strong></div>
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #bae6fd" }}>
                  Jumlah NJOP PBB: <strong>Rp {formatRupiah(Math.round(njopPreview.sumNjop))}</strong>
                  {" · "}
                  Harga transaksi: <strong>Rp {formatRupiah(Math.round(njopPreview.harga))}</strong>
                </div>
                <div style={{ marginTop: 8, fontWeight: 700 }}>
                  Dasar NPOP untuk perhitungan Poin 1 (nilai yang dipakai = yang lebih besar):{" "}
                  <strong>Rp {formatRupiah(Math.round(njopPreview.dasarP1))}</strong>
                </div>
              </div>

              <div style={rowStyle}>
                <div>
                  <label style={labelStyle}>Status Kepemilikan</label>
                  <select
                    style={inputStyle}
                    value={form.status_kepemilikan ?? "milik_pribadi"}
                    onChange={(e) => updateForm("status_kepemilikan", e.target.value)}
                  >
                    <option value="milik_pribadi">Milik Pribadi</option>
                    <option value="milik_bersama">Milik Bersama</option>
                    <option value="sewa">Sewa</option>
                    <option value="hgb">Hak Guna Bangunan (HGB)</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>RT/RW Objek Pajak</label>
                  <input
                    style={inputStyle}
                    value={form.rt_rwobjekpajak ?? ""}
                    onChange={(e) => updateForm("rt_rwobjekpajak", e.target.value)}
                    placeholder="001/001"
                    required
                  />
                </div>
                <div>
                  <label style={labelStyle}>Nomor Sertifikat Tanah</label>
                  <input
                    style={inputStyle}
                    value={form.nomor_sertifikat ?? ""}
                    onChange={(e) => updateForm("nomor_sertifikat", e.target.value)}
                    placeholder="Nomor sertifikat"
                    required
                  />
                </div>
              </div>
              <div style={rowStyle}>
                <div>
                  <label style={labelStyle}>Kelurahan/Desa</label>
                  <input
                    style={inputStyle}
                    value={form.kelurahandesalp ?? ""}
                    onChange={(e) => updateForm("kelurahandesalp", e.target.value)}
                    placeholder="Kelurahan/Desa"
                    required
                  />
                </div>
                <div>
                  <label style={labelStyle}>Kecamatan</label>
                  <input
                    style={inputStyle}
                    value={form.kecamatanlp ?? ""}
                    onChange={(e) => updateForm("kecamatanlp", e.target.value)}
                    placeholder="Kecamatan"
                    required
                  />
                </div>
              </div>
              <div style={sectionStyle}>
                <label style={labelStyle}>Keterangan (opsional)</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 50 }}
                  value={form.keterangan ?? ""}
                  onChange={(e) => updateForm("keterangan", e.target.value)}
                  placeholder="Keterangan tambahan"
                />
              </div>
              </fieldset>
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <button
            type="submit"
            disabled={loading || editLoading}
            style={{
              padding: "12px 24px",
              borderRadius: 8,
              border: "none",
              background: "var(--accent)",
              color: "#fff",
              fontWeight: 600,
              cursor: loading || editLoading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Menyimpan..." : (isEditMode ? "Simpan Perubahan" : "Simpan (Terbuat)")}
          </button>
          <Link
            href={listPath}
            prefetch={false}
            style={{ padding: "12px 24px", borderRadius: 8, border: "1px solid var(--border_color)", color: "var(--color_font_main)", fontWeight: 600, textDecoration: "none" }}
          >
            Batal
          </Link>
        </div>
      </form>

      <p style={{ marginTop: 16 }}>
        <Link href={listPath} prefetch={false} style={{ color: "var(--accent)", fontWeight: 600 }}>
          ← Kembali ke daftar booking
        </Link>
      </p>

      {wpToast && (
        <div
          role="status"
          style={{
            position: "fixed",
            bottom: 28,
            left: "50%",
            transform: "translateX(-50%)",
            maxWidth: "min(420px, calc(100vw - 32px))",
            padding: "12px 18px",
            borderRadius: 10,
            background: "#1e293b",
            color: "#f8fafc",
            fontSize: 14,
            fontWeight: 600,
            boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
            zIndex: 100,
            textAlign: "center",
          }}
        >
          {wpToast}
        </div>
      )}

      {/* Billing modal dipindahkan ke dropdown dashboard (flow baru). Tetap disediakan untuk reuse. */}
      {billingModal && (
        <BillingShareCard
          data={{ billingId: billingModal.billing_id, amount: billingModal.amount, expiresAtISO: billingModal.expires_at }}
          onClose={() => setBillingModal(null)}
        />
      )}
    </div>
  );
}
